import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentClientsClient from './AgentClientsClient';

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  // Surface users who have interacted with this agent as tenants or landlords
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ landlordId: user.id }, { tenantId: user.id }],
    },
    select: {
      id: true,
      landlordId: true,
      tenantId: true,
      listingId: true,
      unreadCounts: true,
    },
    take: 100,
  });

  const relatedUserIds = new Set<string>();
  for (const c of conversations) {
    if (c.landlordId && c.landlordId !== user.id) relatedUserIds.add(c.landlordId);
    if (c.tenantId && c.tenantId !== user.id) relatedUserIds.add(c.tenantId);
  }

  // Also surface landlords from accepted AgentInvites and AgentAssignments
  const acceptedInvites = await prisma.agentInvite.findMany({
    where: { agentId: user.id, status: 'accepted' },
    select: { landlordId: true },
  });

  const assignments = await prisma.agentAssignment.findMany({
    where: { agentId: user.id },
    select: { invite: { select: { landlordId: true } } },
  });

  for (const invite of acceptedInvites) {
    if (invite.landlordId) relatedUserIds.add(invite.landlordId);
  }
  for (const assignment of assignments) {
    if (assignment.invite.landlordId) relatedUserIds.add(assignment.invite.landlordId);
  }

  const relatedUsers = await prisma.user.findMany({
    where: { id: { in: Array.from(relatedUserIds) } },
    select: {
      id: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const now = new Date();
  const initialClients = relatedUsers.map((u) => {
    const monthsSince = (now.getFullYear() - new Date(u.createdAt).getFullYear()) * 12 + (now.getMonth() - new Date(u.createdAt).getMonth());
    return {
      id: u.id,
      name: u.fullName,
      phone: u.phone || 'N/A',
      type: u.role === 'landlord' ? 'Seller' : 'Buyer',
      minBudget: 0,
      maxBudget: 0,
      lastContact: new Date().toISOString(),
      createdAt: u.createdAt.toISOString(),
    };
  });

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentClientsClient initialClients={initialClients} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
