import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import AutomatedMonthlyStatementClient from '@/app/dashboard/tenant/payments/statements/AutomatedMonthlyStatementClient';

export default async function AdminStatementsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'admin') redirect('/dashboard');
  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <AutomatedMonthlyStatementClient />
    </DashboardShell>
  );
}
