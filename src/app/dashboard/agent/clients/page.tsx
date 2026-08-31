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
      updatedAt: true,
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
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get agreement/deal counts and last contact timestamps for related users
  const agreements = await prisma.agreement.findMany({
    where: {
      OR: [
        { tenantId: { in: Array.from(relatedUserIds) } },
        { landlordId: { in: Array.from(relatedUserIds) } },
      ],
      status: { not: 'draft' },
    },
    select: {
      tenantId: true,
      landlordId: true,
      updatedAt: true,
      listing: { select: { price: true, listingType: true } },
    },
    take: 500,
  });

  const userAgreementMap = new Map<string, { count: number; lastContact: string; value: number }>();
  for (const a of agreements) {
    const ids = [a.tenantId, a.landlordId].filter(Boolean) as string[];
    for (const id of ids) {
      const existing = userAgreementMap.get(id);
      const value = Number(a.listing?.price || 0);
      const updated = a.updatedAt.toISOString();
      if (!existing) {
        userAgreementMap.set(id, { count: 1, lastContact: updated, value });
      } else {
        userAgreementMap.set(id, {
          count: existing.count + 1,
          lastContact: updated > existing.lastContact ? updated : existing.lastContact,
          value: existing.value + value,
        });
      }
    }
  }

  const now = new Date();
  const initialClients = relatedUsers.map((u) => {
    const agreementData = userAgreementMap.get(u.id) || { count: 0, lastContact: u.updatedAt.toISOString(), value: 0 };
    const type = u.role === 'landlord' ? 'Landlord' : 'Renter';
    return {
      id: u.id,
      name: u.fullName,
      phone: u.phone || 'N/A',
      email: u.email,
      avatarUrl: u.avatarUrl,
      type,
      minBudget: 0,
      maxBudget: agreementData.value,
      lastContact: agreementData.lastContact,
      createdAt: u.createdAt.toISOString(),
      dealsCount: agreementData.count,
      managedValue: agreementData.value,
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
