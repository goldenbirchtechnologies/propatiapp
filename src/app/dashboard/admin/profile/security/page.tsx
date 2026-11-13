import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AdminProfileSecurityClient from './AdminProfileSecurityClient';

export default async function AdminProfileSecurityPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const displayName = user.fullName || 'Admin';

  const [mfa, auditEvents] = await Promise.all([
    prisma.userMfa.findUnique({
      where: { userId: user.id },
      select: { totpVerified: true, enabledAt: true },
    }),
    prisma.adminAuditLog.findMany({
      where: { adminId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        ipAddress: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AdminProfileSecurityClient
        displayName={displayName}
        email={user.email}
        phone={user.phone}
        mfaEnabled={Boolean(mfa?.totpVerified)}
        auditEvents={auditEvents.map((event) => ({
          id: event.id,
          action: event.action,
          targetType: event.targetType,
          ipAddress: event.ipAddress,
          createdAt: event.createdAt.toISOString(),
        }))}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}