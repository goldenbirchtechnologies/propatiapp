import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { engagementSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/engagements
 * List all engagements (paginated)
 * Query: ?page=1&limit=20&status=...&caseId=...
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
    const firmId = searchParams.get('firmId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (caseId) where.caseId = caseId;
    if (firmId) where.firmId = firmId;

    const skip = (page - 1) * limit;

    const [engagements, total] = await Promise.all([
      prisma.engagement.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              status: true,
            },
          },
          firm: {
            select: { id: true, name: true, verified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.engagement.count({ where }),
    ]);

    return paginatedResponse(engagements, page, limit, total);
  } catch {
    return errorResponse('Failed to fetch engagements', 500);
  }
}

/**
 * POST /api/admin/engagements
 * Create a new engagement
 * Body: { caseId, type, scopeOfWork, feeModel, estimatedDuration?, advancePaymentRequired?, advancePaymentAmount?, clientConsentText }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = engagementSchema.parse(body);

    // Verify case exists
    const lawFirmCase = await prisma.lawFirmCase.findUnique({
      where: { id: validated.caseId },
      select: { id: true, firmId: true },
    });

    if (!lawFirmCase) {
      return errorResponse('Case not found', 404);
    }

    const engagement = await prisma.engagement.create({
      data: {
        caseId: validated.caseId,
        type: validated.type,
        scopeOfWork: validated.scopeOfWork,
        feeModel: validated.feeModel as EngagementFeeModel,
        disbursements: validated.disbursements as Record<string, unknown>,
        estimatedDuration: validated.estimatedDuration || null,
        advancePaymentRequired: validated.advancePaymentRequired,
        advancePaymentAmount: validated.advancePaymentAmount ? validated.advancePaymentAmount as number : null,
        clientConsentText: validated.clientConsentText,
        firmId: lawFirmCase.firmId,
      },
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        firm: {
          select: { id: true, name: true },
        },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'create_engagement',
      targetType: 'engagement',
      targetId: engagement.id,
      details: { caseId: engagement.caseId, type: engagement.type },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement }, 'Engagement created successfully');
  } catch (error) {
    console.error('Create engagement error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return errorResponse('Failed to create engagement', 500);
  }
}
