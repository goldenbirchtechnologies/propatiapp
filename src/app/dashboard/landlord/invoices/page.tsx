import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import TenantInvoicesClient from '@/app/dashboard/tenant/invoices/TenantInvoicesClient';

export default async function LandlordInvoicesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TenantInvoicesClient />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
