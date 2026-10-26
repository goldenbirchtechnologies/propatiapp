import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  getAgentAgreements,
  getAgentFinanceSummary,
  getAgentTransactions,
} from '@/lib/agent-finance-data';
import AgentCommissionsClient from './AgentCommissionsClient';

export const dynamic = 'force-dynamic';

export default async function AgentCommissionsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, agreements, transactions] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentAgreements(user.id),
    getAgentTransactions(user.id),
  ]);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentCommissionsClient
          summary={summary}
          agreements={agreements}
          transactions={transactions}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
