import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import VerificationOfficerClient from './verification-officer-client';

export const dynamic = 'force-dynamic';

export default async function VerificationOfficerRolePage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const verifierUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'admin' },
        { role: 'estate_manager' },
      ],
    },
    orderBy: { fullName: 'asc' },
    take: 50,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  const [pendingCount, inProgressCount, certifiedCount] = await Promise.all([
    prisma.verification.count({ where: { overallStatus: 'not_started' } }),
    prisma.verification.count({ where: { overallStatus: 'in_progress' } }),
    prisma.verification.count({ where: { overallStatus: 'certified' } }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <VerificationOfficerClient
          users={verifierUsers}
          counts={{ pendingCount, inProgressCount, certifiedCount }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
