import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  getAgentFinanceSummary,
  getAgentTransactions,
  getAgentWalletTransactions,
} from '@/lib/agent-finance-data';
import AgentStatementsClient from './AgentStatementsClient';

export const dynamic = 'force-dynamic';

export default async function AgentStatementsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, platformTxns, walletTxns] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentTransactions(user.id),
    getAgentWalletTransactions(user.id),
  ]);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentStatementsClient summary={summary} platformTxns={platformTxns} walletTxns={walletTxns} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
