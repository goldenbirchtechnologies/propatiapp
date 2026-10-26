import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  getAgentFinanceSummary,
  getAgentWalletTransactions,
} from '@/lib/agent-finance-data';
import AgentCommissionLedgerClient from './AgentCommissionLedgerClient';

export const dynamic = 'force-dynamic';

export default async function AgentCommissionLedgerPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, walletTxns] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentWalletTransactions(user.id),
  ]);

  // The commission ledger focuses on escrow releases, adjustments and payouts.
  const adjustments = walletTxns.filter((t) =>
    ['adjustment', 'escrow_credit', 'deposit', 'withdrawal', 'transfer', 'refund'].includes(t.type),
  );

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentCommissionLedgerClient summary={summary} adjustments={adjustments} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
