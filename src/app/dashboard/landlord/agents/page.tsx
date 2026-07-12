import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import AgentInviteManagementClient from './AgentInviteManagementClient';

export default async function LandlordAgentsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-heading text-headline-lg text-primary">Agent Invites</h3>
            <p className="text-on-surface-variant">Invite agents to manage your listings. Agents can register directly; invites are optional.</p>
          </div>
        </div>
        <AgentInviteManagementClient />
      </div>
    </DashboardShell>
  );
}
