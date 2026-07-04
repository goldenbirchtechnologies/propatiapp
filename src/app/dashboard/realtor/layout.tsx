import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { getNavigationForRole } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function RealtorLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const navigation = getNavigationForRole('realtor');

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName ?? ''}
      userAvatar={user.avatarUrl ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
