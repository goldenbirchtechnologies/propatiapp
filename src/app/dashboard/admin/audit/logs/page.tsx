import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AppIcon from '@/components/icons/app-icon';
import AuditLogsClient from './audit-logs-client';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPagePage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const [logs, adminUsers, todayCount, suspiciousCount] = await Promise.all([
    prisma.adminAuditLog.findMany({
      include: {
        admin: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    // Count logs from today
    prisma.adminAuditLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    // Count high-severity actions (suspension, ban, permission changes)
    prisma.adminAuditLog.count({
      where: {
        action: {
          in: ['suspend_user', 'ban_user', 'permission_update', 'role_change', 'login_attempt_blocked'],
        },
      },
    }),
  ]);

  const adminActionCount = await prisma.adminAuditLog.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const mapped = logs.map((log) => ({
    id: log.id,
    admin: log.admin,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    details: log.details,
    ipAddress: log.ipAddress,
    timestamp: log.createdAt,
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AuditLogsClient
          logs={mapped}
          adminUsers={adminUsers}
          stats={{ todayCount, suspiciousCount, adminActionCount }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}