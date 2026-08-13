import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/engagements/[id]/reject
 * Admin rejects the lawyer review
 * Body: { notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const notes = typeof body.notes === 'string' ? body.notes : undefined;

    const engagement = await prisma.engagement.findUnique({
      where: { id: id },
      include: {
        case: { select: { id: true, status: true } },
      },
    });

    if (!engagement) {
      return errorResponse('Engagement not found', 404);
    }

    const updated = await prisma.engagement.update({
      where: { id: id },
      data: {
        status: 'withdrawn',
        lawyerReviewStatus: 'rejected',
        lawyerReviewNotes: notes || null,
        lawyerReviewedAt: new Date(),
      },
      include: {
        case: { select: { id: true, status: true } },
        firm: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'reject_engagement',
      targetType: 'engagement',
      targetId: id,
      details: { caseId: engagement.caseId, notes },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement: updated }, 'Engagement rejected');
  } catch {
    return errorResponse('Failed to reject engagement', 500);
  }
}
