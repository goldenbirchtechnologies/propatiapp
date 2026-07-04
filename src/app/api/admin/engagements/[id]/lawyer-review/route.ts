import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { lawyerReviewSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/engagements/[id]/lawyer-review
 * Submit a lawyer review decision (approve or reject)
 * Body: { lawyerReviewStatus: 'approved'|'rejected', lawyerReviewNotes?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = lawyerReviewSchema.parse(body);

    const engagement = await prisma.engagement.findUnique({
      where: { id: params.id },
      include: {
        case: { select: { id: true, status: true } },
      },
    });

    if (!engagement) {
      return errorResponse('Engagement not found', 404);
    }

    const newStatus =
      validated.status === 'approved' ? 'active' : 'withdrawn';

    const updated = await prisma.engagement.update({
      where: { id: params.id },
      data: {
        lawyerReviewStatus: validated.status,
        lawyerReviewNotes: validated.notes || null,
        lawyerReviewedAt: new Date(),
        status: newStatus,
      },
      include: {
        case: { select: { id: true, status: true } },
        firm: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: validated.status === 'approved' ? 'approve_engagement' : 'reject_engagement',
      targetType: 'engagement',
      targetId: params.id,
      details: { caseId: engagement.caseId, status: validated.status, notes: validated.notes },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement: updated }, `Engagement ${validated.status}`);
  } catch (error) {
    console.error('Lawyer review error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return errorResponse('Failed to submit review', 500);
  }
}
