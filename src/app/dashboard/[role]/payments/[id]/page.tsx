import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import TransactionDetailClient from './TransactionDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/dashboard');
  }

  const { id } = await params;
  const navigation = getNavigationForRole(user.role);

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TransactionDetailClient transactionId={id} user={user} />
    </DashboardShell>
  );
}
