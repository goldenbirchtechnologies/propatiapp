import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AgentDashboardClient from './AgentDashboardClient';

export default async function AgentDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'agent') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'User';

  const [managedProperties, activeListings, pendingInvites, totalUnits, vacantUnits, enquiries] = await Promise.all([
    prisma.listing.count({
      where: {
        OR: [
          { agentId: user.id },
          { assignments: { some: { agentId: user.id, status: 'active' } } },
        ],
      },
    }),
    prisma.listing.count({
      where: {
        OR: [
          { agentId: user.id },
          { assignments: { some: { agentId: user.id, status: 'active' } } },
        ],
        status: 'active',
      },
    }),
    prisma.agentInvite.count({
      where: { email: user.email, status: 'pending' },
    }),
    prisma.unit.count({
      where: {
        listing: {
          OR: [
            { agentId: user.id },
            { assignments: { some: { agentId: user.id, status: 'active' } } },
          ],
        },
      },
    }),
    prisma.unit.count({
      where: {
        listing: {
          OR: [
            { agentId: user.id },
            { assignments: { some: { agentId: user.id, status: 'active' } } },
          ],
        },
        occupancy: 'VACANT',
      },
    }),
    prisma.conversation.count({
      where: {
        agentId: user.id,
        messages: { some: {} },
      },
    }),
  ]);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <AgentDashboardClient
        userName={displayName}
        managedProperties={managedProperties}
        activeListings={activeListings}
        pendingInvites={pendingInvites}
        totalUnits={totalUnits}
        vacantUnits={vacantUnits}
        enquiries={enquiries}
      />

      </ErrorBoundary>
</DashboardShell>
  );
}
