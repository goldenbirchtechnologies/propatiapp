import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import TenantInvoicesClient from '@/app/dashboard/tenant/invoices/TenantInvoicesClient';

export default async function AgentInvoicesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');
  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      <TenantInvoicesClient />
    
      </div></ErrorBoundary>
</DashboardShell>
  );
}
