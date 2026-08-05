import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import AutomatedMonthlyStatementClient from '@/app/dashboard/tenant/payments/statements/AutomatedMonthlyStatementClient';

export default async function LandlordStatementsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <AutomatedMonthlyStatementClient />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
