import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentInviteManagementClient from './AgentInviteManagementClient';

export const dynamic = 'force-dynamic';

export default async function LandlordAgentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      title: true,
      address: true,
      area: true,
      state: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName}>
      <ErrorBoundary>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-heading text-headline-lg text-foreground">Agent Management</h3>
              <p className="text-sm text-muted-foreground">Invite agents to manage your listings. Agents can register directly; invites are optional.</p>
            </div>
          </div>
          <AgentInviteManagementClient properties={listings} />
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
