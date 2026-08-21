import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { notifyAgentRevoked } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invite = await prisma.agentInvite.findUnique({
      where: { id },
      include: {
        recipient: true,
        assignments: true,
      },
    });

    if (!invite || invite.landlordId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN: Not the inviting landlord' }, { status: 403 });
    }

    if (invite.status !== 'pending' && invite.status !== 'accepted') {
      return NextResponse.json({ error: 'Invite cannot be revoked' }, { status: 400 });
    }

    const listingIds = invite.assignments.map((a) => a.listingId);

    await prisma.agentAssignment.deleteMany({
      where: { inviteId: invite.id },
    });

    if (listingIds.length > 0) {
      await prisma.listing.updateMany({
        where: {
          id: { in: listingIds },
          agentId: invite.agentId,
        },
        data: { agentId: null },
      });
    }

    const updated = await prisma.agentInvite.update({
      where: { id },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        recipient: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (invite.agentId) {
      await notifyAgentRevoked({
        landlordId: invite.landlordId,
        agentId: invite.agentId,
        inviteId: invite.id,
        listingIds,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Agent invite revoke error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
