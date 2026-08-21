import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export async function notifyAgentInviteSent(params: {
  landlordId: string;
  agentEmail: string;
  inviteId: string;
  listingTitle?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.landlordId,
      type: 'agent_invite_sent',
      title: 'Agent Invite Sent',
      body: `Invite sent to ${params.agentEmail}${params.listingTitle ? ` for ${params.listingTitle}` : ''}`,
      data: { inviteId: params.inviteId },
    },
  });
}

export async function notifyAgentInviteAccepted(params: {
  landlordId: string;
  agentId: string;
  inviteId: string;
  listingIds: string[];
}) {
  await prisma.notification.create({
    data: {
      userId: params.landlordId,
      type: 'agent_invite_accepted',
      title: 'Agent Invite Accepted',
      body: `Agent has accepted your invite${params.listingIds.length ? ` and was assigned to ${params.listingIds.length} listing(s)` : ''}`,
      data: { inviteId: params.inviteId, agentId: params.agentId, listingIds: params.listingIds },
    },
  });

  await prisma.notification.create({
    data: {
      userId: params.agentId,
      type: 'agent_invite_accepted',
      title: 'Invite Accepted',
      body: `You have accepted the agent invite${params.listingIds.length ? ` for ${params.listingIds.length} listing(s)` : ''}`,
      data: { inviteId: params.inviteId, landlordId: params.landlordId, listingIds: params.listingIds },
    },
  });
}

export async function notifyAgentRevoked(params: {
  landlordId: string;
  agentId: string;
  inviteId: string;
  listingIds: string[];
}) {
  await prisma.notification.create({
    data: {
      userId: params.landlordId,
      type: 'agent_revoked',
      title: 'Agent Access Revoked',
      body: `Agent access revoked for ${params.listingIds.length} listing(s)`,
      data: { inviteId: params.inviteId, agentId: params.agentId, listingIds: params.listingIds },
    },
  });

  await prisma.notification.create({
    data: {
      userId: params.agentId,
      type: 'agent_revoked',
      title: 'Agent Access Revoked',
      body: `Your agent access has been revoked for ${params.listingIds.length} listing(s)`,
      data: { inviteId: params.inviteId, landlordId: params.landlordId, listingIds: params.listingIds },
    },
  });
}
