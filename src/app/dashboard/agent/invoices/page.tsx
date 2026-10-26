import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { getAgentFinanceSummary, getAgentInvoices } from '@/lib/agent-finance-data';
import AgentInvoicesClient from './AgentInvoicesClient';

export const dynamic = 'force-dynamic';

export default async function AgentInvoicesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [summary, invoices] = await Promise.all([
    getAgentFinanceSummary(user.id),
    getAgentInvoices(user.id),
  ]);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentInvoicesClient summary={summary} invoices={invoices} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
