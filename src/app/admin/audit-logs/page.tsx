import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AuditLogsClient from './AuditLogsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const logs = await prisma.adminAuditLog.findMany({
    include: {
      admin: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const mapped = logs.map((log) => ({
    id: log.id,
    admin: log.admin.fullName,
    action: log.action,
    target: `${log.targetType}:${log.targetId}`,
    details: log.details,
    timestamp: log.createdAt,
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AuditLogsClient auditLogs={mapped} />
    </DashboardShell>
  );
}
