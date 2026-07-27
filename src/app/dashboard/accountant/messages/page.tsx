import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

export default async function AccountantMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'accountant') redirect('/dashboard');

  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
