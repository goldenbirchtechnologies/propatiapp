import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AdminVerificationClient from './AdminVerificationClient';

export default async function AdminVerificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch verification queue stats
  const [pendingCount, inProgressCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.verification.count({ where: { overallStatus: 'in_progress', currentLayer: 1 } }),
    prisma.verification.count({ where: { overallStatus: 'in_progress', currentLayer: { gt: 1 } } }),
    prisma.verification.count({ where: { overallStatus: 'certified' } }),
    prisma.verification.count({ where: { overallStatus: 'rejected' } }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AdminVerificationClient
        stats={{ pendingCount, inProgressCount, approvedCount, rejectedCount }}
      />
    </DashboardShell>
  );
}