import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import TransactionsListClient from './TransactionsListClient';

export default async function PaymentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/dashboard');
  }

  const navigation = getNavigationForRole(user.role);

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TransactionsListClient user={user} />
    </DashboardShell>
  );
}
