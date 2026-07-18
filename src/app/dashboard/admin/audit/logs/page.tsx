import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AppIcon from '@/components/icons/app-icon';
export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPagePage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
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
      <AuditLogsClient
        logs={mapped}
        adminUsers={adminUsers}
        stats={{ todayCount, suspiciousCount, adminActionCount }}
      />
    </DashboardShell>
  );
}

function AuditLogsClient({
  logs,
  adminUsers,
  stats,
}: {
  logs: {
    id: string;
    admin: { id: string; fullName: string; email: string } | null;
    action: string;
    targetType: string;
    targetId: string;
    details: unknown;
    ipAddress: string | null;
    timestamp: Date;
  }[];
  adminUsers: { id: string; fullName: string }[];
  stats: { todayCount: number; suspiciousCount: number; adminActionCount: number };
}) {
  'use client';

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

  const severityColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('blocked') || lower.includes('ban') || lower.includes('suspend'))
      return 'text-error';
    if (lower.includes('approve') || lower.includes('verify')) return 'text-on-tertiary-container';
    return 'text-primary';
  };

  const dotColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('blocked') || lower.includes('ban') || lower.includes('suspend'))
      return 'bg-error';
    if (lower.includes('approve') || lower.includes('verify')) return 'bg-on-tertiary-container';
    return 'bg-secondary-container';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">System Audit Logs</h1>
        <p className="text-muted-foreground font-body-md mt-1">
          Comprehensive immutable records of all administrative and system-level activities.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Events (24h)',
            value: stats.todayCount.toLocaleString(),
            sub: 'Last 24 hours',
            icon: 'query_stats',
          },
          {
            label: 'Security Flags',
            value: String(stats.suspiciousCount),
            sub: 'High/critical actions',
            icon: 'gpp_maybe',
            danger: true,
          },
          {
            label: 'Admin Actions (30d)',
            value: stats.adminActionCount.toLocaleString(),
            sub: `${adminUsers.length} active admins`,
            icon: 'admin_panel_settings',
          },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">{m.label}</span>
              <AppIcon name={m.icon} className="lucide" size={20} />
            </div>
            <div
              className={`font-headline-lg text-headline-lg ${m.danger ? 'text-error' : 'text-primary'}`}
            >
              {m.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-outline-variant bg-surface p-4 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2 font-label-md text-label-md text-primary font-bold">
          <AppIcon name="filter_list" className="lucide" size={16} />
          Filters
        </span>
        <span className="h-6 w-px bg-outline-variant hidden sm:block" />
        <select className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm bg-surface focus:ring-2 focus:ring-primary/10 outline-none">
          <option value="">All Administrators</option>
          {adminUsers.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName}
            </option>
          ))}
        </select>
        <select className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm bg-surface focus:ring-2 focus:ring-primary/10 outline-none">
          <option value="">All Action Types</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="suspend">Suspend</option>
          <option value="verify">Verify</option>
          <option value="login">Login</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <p className="p-lg text-sm text-muted-foreground text-center">No audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  {['Timestamp', 'Administrator', 'Module', 'Action', 'Description', 'IP Address', 'Detail'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-lg py-md font-label-md text-label-sm text-muted-foreground font-bold uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md whitespace-nowrap">
                      <p className="font-label-md text-label-md text-primary">{formatDate(log.timestamp)}</p>
                      <p className="font-label-sm text-label-sm text-muted-foreground">{formatTime(log.timestamp)}</p>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[14px] text-white font-bold shrink-0">
                          {initials(log.admin?.fullName || 'System')}
                        </div>
                        <span className="font-label-md text-label-md text-primary font-semibold">
                          {log.admin?.fullName || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded bg-surface-container-high text-primary text-xs uppercase font-bold">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(log.action)}`} />
                        <span className={`font-label-md text-label-md ${severityColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <p className="text-body-sm text-muted-foreground max-w-xs truncate">
                        {typeof log.details === 'object' && log.details !== null
                          ? JSON.stringify(log.details).slice(0, 120)
                          : String(log.details ?? '')}
                      </p>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap font-label-sm text-label-sm text-muted-foreground">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="px-lg py-md text-center">
                      <AppIcon name="visibility" className="lucide" size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-outline-variant flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {logs.length > 0 ? '1' : 0} to {logs.length} of {stats.todayCount.toLocaleString()} entries
          </p>
          <span className="text-xs text-muted-foreground">
            Latest {logs.length} records fetched
          </span>
        </div>
      </div>
    </div>
  );
}
