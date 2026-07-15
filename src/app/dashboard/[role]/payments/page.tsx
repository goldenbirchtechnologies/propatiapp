import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { getNavigationForRole } from '@/lib/navigation';
import TransactionsListClient from './TransactionsListClient';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import TransactionsListClient from './TransactionsListClient';

interface PageProps {
  params: Promise<{ role: string }>;
}

export default async function PaymentsPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/dashboard');
  }

  const { role } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  const navigation = getNavigationForRole(user.role);

  return (
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TransactionsListClient user={user} />
  );
}