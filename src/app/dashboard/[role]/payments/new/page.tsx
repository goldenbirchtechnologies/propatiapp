import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import PaymentInitiationClient from './PaymentInitiationClient';

export default async function PaymentInitiationPage() {
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
      <PaymentInitiationClient user={user} />
    </DashboardShell>
  );
}
