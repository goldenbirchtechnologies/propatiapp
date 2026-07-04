import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { action } = body;

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
    });

    if (!agreement) {
      return errorResponse('Agreement not found', 404);
    }

    switch (action) {
      case 'lock':
        await prisma.agreement.update({
          where: { id: params.id },
          data: { lockStatus: 'locked' },
        });
        await createAuditLog({
          adminId: user.id,
          action: 'lock_legal_agreement',
          targetType: 'agreement',
          targetId: params.id,
          details: { lockStatus: 'locked' },
        });
        return successResponse({ id: params.id, lockStatus: 'locked' }, 'Agreement locked');

      case 'unlock':
        await prisma.agreement.update({
          where: { id: params.id },
          data: { lockStatus: 'mutable' },
        });
        await createAuditLog({
          adminId: user.id,
          action: 'unlock_legal_agreement',
          targetType: 'agreement',
          targetId: params.id,
          details: { lockStatus: 'mutable' },
        });
        return successResponse({ id: params.id, lockStatus: 'mutable' }, 'Agreement unlocked');

      case 'assign':
        await createAuditLog({
          adminId: user.id,
          action: 'assign_legal_agreement',
          targetType: 'agreement',
          targetId: params.id,
          details: { assignedTo: user.id },
        });
        return successResponse({ id: params.id, assignedTo: user.id }, 'Agreement assigned');

      case 'escalate':
        await prisma.agreement.update({
          where: { id: params.id },
          data: { riskTier: 'review_required' },
        });
        await createAuditLog({
          adminId: user.id,
          action: 'escalate_legal_agreement',
          targetType: 'agreement',
          targetId: params.id,
          details: { riskTier: 'review_required' },
        });
        return successResponse({ id: params.id, riskTier: 'review_required' }, 'Agreement escalated');

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Legal agreement action error:', error);
    return errorResponse('Failed to process action', 500);
  }
}
