import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { conflictCheckSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/conflict-checks
 * List all conflict checks (paginated)
 * Query: ?page=1&limit=20&status=...&caseId=...&lawFirmId=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const caseId = searchParams.get('caseId');
    const lawFirmId = searchParams.get('lawFirmId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (caseId) where.caseId = caseId;
    if (lawFirmId) where.lawFirmId = lawFirmId;

    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      prisma.conflictCheck.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              status: true,
            },
          },
          lawFirm: {
            select: { id: true, name: true, cacNumber: true },
          },
          lawyerProfile: {
            select: { id: true, fullName: true, callToBarNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conflictCheck.count({ where }),
    ]);

    return paginatedResponse(checks, page, limit, total);
  } catch {
    return errorResponse('Failed to fetch conflict checks', 500);
  }
}

/**
 * POST /api/admin/conflict-checks
 * Create a new conflict check
 * Body: { caseId, lawFirmId, lawyerProfileId?, adversePartyType, adversePartyId, adversePartyName }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = conflictCheckSchema.parse(body);

    // Verify case exists and get its firm
    const lawFirmCase = await prisma.lawFirmCase.findUnique({
      where: { id: validated.caseId },
      select: { id: true, firmId: true },
    });

    if (!lawFirmCase) {
      return errorResponse('Case not found', 404);
    }

    // Verify law firm exists
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: validated.lawFirmId },
      select: { id: true, name: true },
    });

    if (!lawFirm) {
      return errorResponse('Law firm not found', 404);
    }

    const check = await prisma.conflictCheck.create({
      data: {
        caseId: validated.caseId,
        lawFirmId: validated.lawFirmId,
        lawyerProfileId: validated.lawyerProfileId || null,
        adversePartyType: validated.adversePartyType,
        adversePartyId: validated.adversePartyId,
        adversePartyName: validated.adversePartyName,
      },
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        lawFirm: {
          select: { id: true, name: true },
        },
        lawyerProfile: {
          select: { id: true, fullName: true, callToBarNumber: true },
        },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'create_conflict_check',
      targetType: 'conflict_check',
      targetId: check.id,
      details: { caseId: check.caseId, lawFirmId: check.lawFirmId, adversePartyType: check.adversePartyType },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ check }, 'Conflict check created');
  } catch (error) {
    console.error('Create conflict check error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return errorResponse('Failed to create conflict check', 500);
  }
}
