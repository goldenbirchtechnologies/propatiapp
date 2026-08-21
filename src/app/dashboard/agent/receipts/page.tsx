import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import TenantReceiptsClient from '@/app/dashboard/tenant/receipts/TenantReceiptsClient';

export default async function AgentReceiptsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');
  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      <TenantReceiptsClient initialReceipts={[]} />
    
      </div></ErrorBoundary>
</DashboardShell>
  );
}
