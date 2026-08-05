import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import ServiceChargesPage from '@/app/dashboard/estate-manager/service-charges/page';

export default async function EstateManagerInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');
  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <ServiceChargesPage />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
