import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import TenantInvoicesClient from '@/app/dashboard/tenant/invoices/TenantInvoicesClient';

export default async function AdminInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'admin') redirect('/dashboard');
  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TenantInvoicesClient />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
