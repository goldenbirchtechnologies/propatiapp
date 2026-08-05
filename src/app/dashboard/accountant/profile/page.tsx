import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import AccountantProfileClient from './AccountantProfileClient';

export default async function AccountantProfilePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');

  const profile = await prisma.user.findUnique({
    where: { clerkId: user.clerkId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      fullName: true,
      avatarUrl: true,
      createdAt: true,
      ninVerified: true,
      phoneVerified: true,
      idVerified: true,
      profileBio: true,
    },
  });

  if (!profile) redirect('/sign-in');

  return (
    <DashboardShell
      navigation={ACCOUNTANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AccountantProfileClient user={profile} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
