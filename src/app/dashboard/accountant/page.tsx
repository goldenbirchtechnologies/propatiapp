import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import AdminReportsPage from '@/app/dashboard/admin/reports/page';

export default async function AccountantDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');
  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <AdminReportsPage />
    </DashboardShell>
  );
}
