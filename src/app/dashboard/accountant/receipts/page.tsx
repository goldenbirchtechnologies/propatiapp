import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import TenantReceiptsClient from '@/app/dashboard/tenant/receipts/TenantReceiptsClient';

export default async function AccountantReceiptsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');
  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TenantReceiptsClient initialReceipts={[]} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
