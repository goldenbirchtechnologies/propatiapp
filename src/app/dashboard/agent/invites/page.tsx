import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentInvitationCard from '@/components/agent-invites/AgentInvitationCard';

export default async function AgentInvitesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={user.fullName}>

      <ErrorBoundary>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h3 className="font-heading text-headline-lg text-white">Invitations</h3>
          <p className="text-neutral-400">Landlords can optionally invite you to manage their listings.</p>
        </div>
        <AgentInvitationCard email={user.email ?? ''} />
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
