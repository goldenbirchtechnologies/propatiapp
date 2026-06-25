import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AuditLogsClient from './AuditLogsClient';

export default async function AuditLogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/realtor',
  };
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(rolePaths[user.role]);

  const auditLogs = await prisma.adminAuditLog.findMany({
    include: { admin: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const formattedLogs = auditLogs.map((log) => ({
    id: log.id,
    admin: log.admin.fullName,
    action: log.action,
    target: log.targetId,
    details: log.details || '—',
    timestamp: log.createdAt,
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AuditLogsClient auditLogs={formattedLogs} />
    </DashboardShell>
  );
}
