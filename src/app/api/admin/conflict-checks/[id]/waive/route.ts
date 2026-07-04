import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit-log';

const waiveSchema = z.object({
  waiverApproved: z.boolean(),
  rationale: z.string().optional(),
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/conflict-checks/[id]/waive
 * Waive or deny a conflict (final admin action).
 * Body: { waiverApproved: boolean, rationale?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const waiverApproved = typeof body.waiverApproved === 'boolean'
      ? body.waiverApproved
      : false;
    const rationale = typeof body.rationale === 'string' ? body.rationale : undefined;

    const check = await prisma.conflictCheck.findUnique({
      where: { id: params.id },
      include: {
        case: { select: { id: true, status: true } },
        lawFirm: { select: { id: true, name: true } },
      },
    });

    if (!check) {
      return errorResponse('Conflict check not found', 404);
    }

    if (check.status !== 'conflict') {
      return errorResponse('Only checks with status "conflict" can be waived', 400);
    }

    const updated = await prisma.conflictCheck.update({
      where: { id: params.id },
      data: {
        status: waiverApproved ? 'waived' : 'clear',
        waiverApproved,
        conflictRationale: rationale || null,
        reviewedByAdminId: user.id,
        reviewedAt: new Date(),
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
          select: { id: true, fullName: true },
        },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: waiverApproved ? 'waive_conflict' : 'deny_conflict',
      targetType: 'conflict_check',
      targetId: params.id,
      details: {
        caseId: check.caseId,
        waiverApproved,
        rationale,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(
      { check: updated },
      waiverApproved ? 'Conflict waived successfully' : 'Conflict denied'
    );
  } catch (error) {
    console.error('Waive conflict check error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return errorResponse('Failed to process conflict waiver', 500);
  }
}
