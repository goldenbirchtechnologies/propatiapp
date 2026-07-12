import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ComplianceClient, { type AuditCheck } from './ComplianceClient';

export default async function AdminCompliancePage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Fetch platform-wide compliance signals from existing entities
  const [
    totalUsers,
    totalAgreements,
    totalVerifications,
    totalAuditLogs,
    pendingVerifications,
    disputesOpen,
    conflictChecks,
    evidencePacks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agreement.count(),
    prisma.verification.count(),
    prisma.adminAuditLog.count(),
    prisma.verification.count({ where: { l1Status: 'pending' } }),
    prisma.dispute.count({ where: { status: { in: ['open', 'investigating'] } } }),
    prisma.conflictCheck.count(),
    prisma.evidencePack.count(),
  ]);

  // Audit checks — derived from live data
  const auditChecks = [
    {
      id: 'audit-1',
      label: 'Open disputes reviewed today',
      status: pendingVerifications === 0 ? ('pass' as AuditCheck['status']) : ('fail' as AuditCheck['status']),
      detail: pendingVerifications === 0
        ? 'All clear.'
        : `${pendingVerifications} open dispute(s) need review.`,
      action: disputesOpen > 0 ? `/admin/disputes` : null,
      actionLabel: disputesOpen > 0 ? 'Review Disputes' : null,
    },
    {
      id: 'audit-2',
      label: 'Pending verifications cleared',
      status: pendingVerifications === 0 ? ('pass' as AuditCheck['status']) : ('warn' as AuditCheck['status']),
      detail: `${pendingVerifications} verification(s) pending.`,
      action: pendingVerifications > 0 ? `/admin/verifications` : null,
      actionLabel: pendingVerifications > 0 ? 'Go to Verifications' : null,
    },
    {
      id: 'audit-3',
      label: 'Agreement coverage',
      status: totalAgreements >= totalUsers ? ('pass' as AuditCheck['status']) : ('warn' as AuditCheck['status']),
      detail: `${totalAgreements} agreement(s) for ${totalUsers} user(s).`,
      action: '/admin/agreements',
      actionLabel: 'View Agreements',
    },
    {
      id: 'audit-4',
      label: 'Audit log entries recorded',
      status: totalAuditLogs > 0 ? ('pass' as AuditCheck['status']) : ('warn' as AuditCheck['status']),
      detail: `${totalAuditLogs} audit log entry(ies) in system.`,
      action: '/admin/audit-logs',
      actionLabel: 'View Audit Logs',
    },
    {
      id: 'audit-5',
      label: 'Conflict checks submitted',
      status: conflictChecks > 0 ? ('pass' as AuditCheck['status']) : ('warn' as AuditCheck['status']),
      detail: `${conflictChecks} conflict check(s) on record.`,
      action: '/admin/conflict-checks',
      actionLabel: 'View Conflict Checks',
    },
    {
      id: 'audit-6',
      label: 'Evidence packs available',
      status: evidencePacks > 0 ? ('pass' as AuditCheck['status']) : ('warn' as AuditCheck['status']),
      detail: `${evidencePacks} evidence pack(s) filed.`,
      action: '/admin/evidence-packs',
      actionLabel: 'View Evidence Packs',
    },
  ];

  // Action items derived from the same data
  const actionItems = [
    ...(pendingVerifications > 0
      ? [
          {
            id: 'action-1',
            priority: 'high' as const,
            title: `${pendingVerifications} verification(s) awaiting action`,
            description: 'Review and approve or reject pending verifications.',
            href: '/admin/verifications',
          },
        ]
      : []),
    ...(disputesOpen > 0
      ? [
          {
            id: 'action-2',
            priority: 'high' as const,
            title: `${disputesOpen} open dispute(s)`,
            description: 'Disputes require adjudication.',
            href: '/admin/disputes',
          },
        ]
      : []),
    {
      id: 'action-3',
      priority: 'medium' as const,
      title: 'Run a full compliance sweep',
      description: 'Review all recently changed agreements for clause integrity.',
      href: '/admin/audit-logs',
    },
    {
      id: 'action-4',
      priority: 'medium' as const,
      title: 'Check conflict-of-interest registrations',
      description: 'Confirm all law-firm engagements have an up-to-date conflict check.',
      href: '/admin/conflict-checks',
    },
  ];

  const stats = {
    totalUsers,
    totalAgreements,
    totalVerifications,
    totalAuditLogs,
    pendingVerifications,
    disputesOpen,
    conflictChecks,
    evidencePacks,
  };

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ComplianceClient
        auditChecks={auditChecks}
        actionItems={actionItems}
        stats={stats}
      />
    </DashboardShell>
  );
}
