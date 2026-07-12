import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentInvitationCard from '@/components/agent-invites/AgentInvitationCard';

export default async function AgentInvitesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={user.fullName}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h3 className="font-heading text-headline-lg text-primary">Invitations</h3>
          <p className="text-on-surface-variant">Landlords can optionally invite you to manage their listings.</p>
        </div>
        <AgentInvitationCard email={user.email ?? ''} />
      </div>
    </DashboardShell>
  );
}
