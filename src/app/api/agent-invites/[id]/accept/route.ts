import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { notifyAgentInviteAccepted } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invite = await prisma.agentInvite.findUnique({
      where: { id },
      include: { sender: true, assignments: true },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or already processed' }, { status: 404 });
    }

    if (!invite.email || invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'FORBIDDEN: Invite email does not match your account' }, { status: 403 });
    }

    let listingIds: string[] = Array.isArray(invite.listingIds)
      ? invite.listingIds.filter((lid): lid is string => typeof lid === 'string')
      : [];

    if ((invite.scope || 'specific') === 'all') {
      const allListings = await prisma.listing.findMany({
        where: { ownerId: invite.landlordId },
        select: { id: true },
      });
      listingIds = allListings.map((l) => l.id);
    }

    const assignmentPromises: Promise<any>[] = [];
    const listingUpdatePromises: Promise<any>[] = [];

    for (const listingId of listingIds) {
      assignmentPromises.push(
        prisma.agentAssignment.create({
          data: {
            inviteId: invite.id,
            agentId: user.id,
            listingId,
            permissions: (invite.permissions as string[]) || [],
            scope: invite.scope || 'specific',
            status: 'active',
          },
          include: { listing: true },
        })
      );

      listingUpdatePromises.push(
        prisma.listing.update({
          where: { id: listingId },
          data: { agentId: user.id },
        })
      );
    }

    await Promise.all([...assignmentPromises, ...listingUpdatePromises]);

    if (listingIds.length > 0) {
      await prisma.conversation.updateMany({
        where: {
          listingId: { in: listingIds },
          agentId: null,
        },
        data: { agentId: user.id },
      });
    }

    const org = await prisma.organisation.findFirst({
      where: { ownerId: invite.landlordId },
      select: { id: true },
    });

    if (org?.id) {
      await prisma.orgMember.upsert({
        where: {
          orgId_userId: {
            orgId: org.id,
            userId: user.id,
          },
        },
        create: {
          orgId: org.id,
          userId: user.id,
          email: user.email,
          role: 'agent',
          status: 'active',
          joinedAt: new Date(),
        },
        update: {
          status: 'active',
          joinedAt: new Date(),
        },
      });
    }

    const updated = await prisma.agentInvite.update({
      where: { id },
      data: {
        status: 'accepted',
        agentId: user.id,
        acceptedAt: new Date(),
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        recipient: { select: { id: true, fullName: true, email: true } },
      },
    });

    const assignedListings = await prisma.listing.findMany({
      where: {
        OR: [
          { agentId: user.id },
          {
            assignments: {
              some: {
                agentId: user.id,
                status: 'active',
              },
            },
          },
        ],
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        owner: { select: { id: true, fullName: true, email: true } },
      },
    });

    await notifyAgentInviteAccepted({
      landlordId: invite.landlordId,
      agentId: user.id,
      inviteId: invite.id,
      listingIds,
    });

    return NextResponse.json({ success: true, data: updated, assignedListings });
  } catch (error) {
    console.error('Agent invite accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
