import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/engagements/[id]/approve
 * Admin approves the lawyer review (final step)
 * Body: { notes?: string }
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
    const notes = typeof body.notes === 'string' ? body.notes : undefined;

    const engagement = await prisma.engagement.findUnique({
      where: { id: params.id },
      include: {
        case: { select: { id: true, caseNumber: true } },
      },
    });

    if (!engagement) {
      return errorResponse('Engagement not found', 404);
    }

    const updated = await prisma.engagement.update({
      where: { id: params.id },
      data: {
        status: 'active',
        lawyerReviewStatus: 'approved',
        lawyerReviewNotes: notes || null,
        lawyerReviewedAt: new Date(),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        firm: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'approve_engagement',
      targetType: 'engagement',
      targetId: params.id,
      details: { caseId: engagement.caseId, notes },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement: updated }, 'Engagement approved');
  } catch {
    return errorResponse('Failed to approve engagement', 500);
  }
}
