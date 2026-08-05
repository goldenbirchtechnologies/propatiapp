import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import TenantReceiptsClient from '@/app/dashboard/tenant/receipts/TenantReceiptsClient';

export default async function LandlordReceiptsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TenantReceiptsClient initialReceipts={[]} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
