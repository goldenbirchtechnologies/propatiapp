import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import AdminReportsPage from '@/app/dashboard/admin/reports/page';

export default async function AccountantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');
  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <AdminReportsPage />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
