import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  getAgentFinanceSummary,
  getAgentPropertyCollections,
} from '@/lib/agent-finance-data';
import AgentRentsClient from './AgentRentsClient';

export const dynamic = 'force-dynamic';

export default async function AgentRentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, collections] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentPropertyCollections(user.id),
  ]);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentRentsClient summary={summary} collections={collections} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
