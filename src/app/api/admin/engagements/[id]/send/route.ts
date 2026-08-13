import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/engagements/[id]/send
 * Mark engagement as sent to client awaiting consent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const engagement = await prisma.engagement.findUnique({
      where: { id: id },
      include: {
        case: { select: { id: true, status: true } },
      },
    });

    if (!engagement) {
      return errorResponse('Engagement not found', 404);
    }

    if (engagement.status !== 'draft') {
      return errorResponse('Only draft engagements can be sent to client', 400);
    }

    const updated = await prisma.engagement.update({
      where: { id: id },
      data: { status: 'sent_to_client' },
      include: {
        case: { select: { id: true, status: true } },
        firm: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'send_engagement',
      targetType: 'engagement',
      targetId: id,
      details: { caseId: engagement.caseId, newStatus: 'sent_to_client' },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement: updated }, 'Engagement sent to client');
  } catch {
    return errorResponse('Failed to send engagement', 500);
  }
}
