import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import TenantReceiptsClient from '@/app/dashboard/tenant/receipts/TenantReceiptsClient';

export default async function EstateManagerReceiptsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');
  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TenantReceiptsClient initialReceipts={[]} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
