import { redirect } from 'next/navigation';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MfaEnrolmentClient from './MfaEnrolmentClient';

export default async function AdminMfaSettingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard');

  const mfa = await prisma.userMfa.findUnique({
    where: { userId: user.id },
    select: { totpVerified: true, enabledAt: true, recoveryCodeHashes: true },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={user.fullName || 'Admin'}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <MfaEnrolmentClient
          enrolled={Boolean(mfa?.totpVerified)}
          enabledAt={mfa?.enabledAt?.toISOString() ?? null}
          recoveryCodesRemaining={Array.isArray(mfa?.recoveryCodeHashes) ? mfa.recoveryCodeHashes.length : 0}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
