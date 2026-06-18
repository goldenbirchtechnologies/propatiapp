import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { auditLogFiltersSchema } from '@/lib/validators';
import { getAuditLogAction } from '@/lib/audit-log';

/**
 * GET /api/admin/audit-logs
 * Get admin action audit trail
 * Query: ?adminId=...&action=...&targetType=...&startDate=...&endDate=...&page=...&limit=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const validated = auditLogFiltersSchema.parse(params);

    const { page, limit, adminId, action, targetType, startDate, endDate } = validated;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (adminId) where.adminId = adminId;
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    // Format logs with human-readable action descriptions
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      admin: log.admin,
      action: log.action,
      actionDescription: getAuditLogAction(log.action),
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));

    return paginatedResponse(formattedLogs, page, limit, total);
  } catch (error) {
    console.error('Audit logs error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/audit-logs
 * Create audit log entry (used internally by other APIs)
 * Body: { action, targetType, targetId, details?, ipAddress?, userAgent? }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { action, targetType, targetId, details } = body;

    if (!action || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'action, targetType, and targetId are required' },
        { status: 400 }
      );
    }

    const log = await prisma.adminAuditLog.create({
      data: {
        adminId: user.id,
        action,
        targetType,
        targetId,
        details: details || null,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    return successResponse(log, 'Audit log created');
  } catch (error) {
    console.error('Create audit log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
