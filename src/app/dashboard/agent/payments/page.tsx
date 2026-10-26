import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  getAgentFinanceSummary,
  getAgentProperties,
  getAgentTransactions,
  getAgentWalletTransactions,
} from '@/lib/agent-finance-data';
import AgentPaymentsClient from './AgentPaymentsClient';

export const dynamic = 'force-dynamic';

export default async function AgentPaymentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, platformTxns, walletTxns, properties] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentTransactions(user.id),
    getAgentWalletTransactions(user.id),
    getAgentProperties(user.id),
  ]);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentPaymentsClient
          summary={summary}
          platformTxns={platformTxns}
          walletTxns={walletTxns}
          properties={properties.map((p) => ({ id: p.id, title: p.title }))}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
