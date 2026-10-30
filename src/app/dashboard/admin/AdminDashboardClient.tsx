'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';
import { PageHeader, StatCard, StatusBadge, DataTable, Avatar } from '@/components/ui';
import { ArrowRight, Users, Building2, Shield, DollarSign, AlertTriangle, TrendingUp, Flag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UserActivityProps {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  status: 'pending' | 'verified' | 'active';
}

const UserActivityRow = ({ user: userItem }: { user: UserActivityProps }) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    verified: 'bg-primary/10 text-[#4edea3]',
    active: 'bg-primary/10 text-[#4edea3]',
  };

  const roleColors: Record<string, string> = {
    tenant: 'bg-primary/10 text-[#4edea3]',
    landlord: 'bg-amber-500/10 text-amber-400',
    agent: 'bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    'estate-manager': 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025] transition-colors">
      <Avatar name={userItem.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-zinc-900 dark:text-white text-sm font-medium">{userItem.name}</div>
        <div className="text-zinc-600 text-xs">{userItem.email}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role] || 'bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
          {userItem.role}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[userItem.status]}`}>
          {userItem.status}
        </span>
      </div>
      <div className="text-xs text-zinc-600">{userItem.registeredAt}</div>
    </div>
  );
};

interface AlertBannerProps {
  type: 'warning' | 'info' | 'success';
  message: string;
  count?: number;
}

const AlertBanner = ({ type, message, count }: AlertBannerProps) => {
  const styles: Record<string, string> = {
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-primary/10 border-primary/20 text-[#4edea3]',
  };

  return (
    <div className={`glass-card p-4 flex items-center gap-3 ${styles[type]}`}>
      <AlertTriangle size={16} />
      <p className="flex-1 text-sm font-medium">
        {message}
        {count !== undefined && <span className="ml-2 font-bold">({count})</span>}
      </p>
    </div>
  );
};

export default function AdminDashboardClient({ userName, userAvatar }: { userName: string; userAvatar?: string }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    monthlyRevenue: 0,
    activeListings: 0,
    totalTransactions: 0,
    disputesCases: 0,
    platformFees: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserActivityProps[]>([]);

  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; amount: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    { id: string; type: string; amount: string; from: string; to: string; date: string; status: string }[]
  >([]);
  const [verificationQueue, setVerificationQueue] = useState<
    { id: string; property: string; owner: string; type: string; status: string; submitted: string }[]
  >([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((payload) => {
        if (cancelled) return;
        const d = payload?.data ?? payload;
        const o = d?.overview ?? {};
        setStats({
          totalUsers: o.totalUsers ?? 0,
          totalProperties: o.totalListings ?? 0,
          pendingVerifications:
            (d?.verificationsByStatus ?? [])
              .filter((v: { status: string }) => v.status === 'in_progress' || v.status === 'not_started')
              .reduce((sum: number, v: { count: number }) => sum + v.count, 0),
          monthlyRevenue: o.revenueThisMonth ?? 0,
          activeListings:
            (d?.listingsByStatus ?? [])
              .filter((l: { status: string }) => l.status === 'active')
              .reduce((sum: number, l: { count: number }) => sum + l.count, 0),
          totalTransactions: o.totalTransactions ?? 0,
          disputesCases: 0,
          platformFees: 0,
        });
        setRevenueByMonth(
          Array.isArray(d?.revenueByMonth)
            ? d.revenueByMonth.map((m: { month: string; revenue?: number; amount?: number }) => ({
                month: m.month,
                amount: m.revenue ?? m.amount ?? 0,
              }))
            : []
        );
        setRecentTransactions(Array.isArray(d?.recentTransactions) ? d.recentTransactions : []);
        setVerificationQueue(Array.isArray(d?.verificationQueue) ? d.verificationQueue : []);
        setRecentUsers(Array.isArray(d?.recentUsers) ? d.recentUsers : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const transactionColumns = [
    { key: 'id', label: 'Ref' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge status={String(row.status ?? '')} /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description={`Platform overview · ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <div className="flex gap-2">
            <a href="/dashboard/admin/reports" className="inline-flex items-center px-4 py-2 text-sm border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 rounded-lg hover:text-zinc-900 dark:text-white hover:border-zinc-600 transition-colors">
              Export Report
            </a>
            <a href="/dashboard/admin/settings" className="inline-flex items-center px-4 py-2 text-sm bg-primary text-zinc-900 dark:text-white rounded-lg hover:bg-primary transition-colors">
              Settings
            </a>
          </div>
        }
      />

      {/* KPIs — every figure is fetched from /api/admin/stats; no trend deltas
          are shown because month-over-month history is not tracked yet. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Active Listings" value={stats.activeListings.toLocaleString()} icon={Building2} />
        <StatCard label="Verification Queue" value={String(stats.pendingVerifications)} sub="Pending review" icon={Shield} />
        <StatCard label="Platform Revenue" value={formatCurrency(stats.monthlyRevenue)} sub="This month" icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* User growth */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-zinc-900 dark:text-white font-semibold text-sm">User Growth</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">Platform revenue · last 12 months</p>
            </div>
            <a href="/dashboard/admin/users" className="text-xs text-[#4edea3] flex items-center gap-1">
              View users <ArrowRight size={11} />
            </a>
          </div>
          {revenueByMonth.length === 0 || revenueByMonth.every((m) => !m.amount) ? (
            <div className="h-32 flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.06] bg-white/[0.02]">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No revenue recorded yet</p>
              <p className="text-xs text-zinc-600">
                {loadError ? 'Could not load platform stats.' : 'Completed transactions will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-32">
                {revenueByMonth.map((m, i) => {
                  const max = Math.max(...revenueByMonth.map((x) => x.amount), 1);
                  const pct = (m.amount / max) * 100;
                  const isLast = i === revenueByMonth.length - 1;
                  return (
                    <div key={`${m.month}-${i}`} className="flex-1">
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height: `${pct}%`,
                          background: isLast ? '#006c49' : 'rgba(255,255,255,0.06)',
                          minHeight: 4,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-zinc-700">
                {revenueByMonth.map((m, i) => (
                  <span key={`${m.month}-label-${i}`}>{m.month}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Alerts */}
        <div className="glass-card p-5">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm mb-4">System Alerts</h3>
          <div className="space-y-2.5">
            {/* Derived from real counts only. The previous list included
                infrastructure telemetry (backups, API latency) that this app
                does not monitor — it was static text presented as live status. */}
            {[
              stats.pendingVerifications > 0 && {
                severity: 'warning',
                msg: `${stats.pendingVerifications} verification${stats.pendingVerifications === 1 ? '' : 's'} pending review`,
                path: '/dashboard/admin/verification',
              },
              stats.disputesCases > 0 && {
                severity: 'critical',
                msg: `${stats.disputesCases} open dispute${stats.disputesCases === 1 ? '' : 's'}`,
                path: '/dashboard/admin/disputes',
              },
              stats.totalUsers === 0 && {
                severity: 'info',
                msg: 'No users registered yet',
                path: '/dashboard/admin/users',
              },
            ]
              .filter(Boolean)
              .map((raw, i) => {
                const a = raw as { severity: string; msg: string; path: string };
                return (
                  <a key={i} href={a.path} className="flex items-start gap-2.5 hover:bg-white/[0.03] p-2 rounded-lg transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      a.severity === 'critical' ? 'bg-red-400' : a.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{a.msg}</span>
                  </a>
                );
              })}
            {stats.pendingVerifications === 0 && stats.disputesCases === 0 && stats.totalUsers > 0 && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center py-4">No alerts. Platform is healthy.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent users + verification queue */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-900 dark:text-white font-semibold text-sm">Recent Users</h3>
            <a href="/dashboard/admin/users" className="text-xs text-[#4edea3] flex items-center gap-1">
              All users <ArrowRight size={11} />
            </a>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-4">No users yet</p>
            ) : (
              recentUsers.map((u) => (
                <UserActivityRow key={u.id} user={u} />
              ))
            )}
          </div>
        </div>

        {/* Verification queue */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-900 dark:text-white font-semibold text-sm flex items-center gap-2">
              <Shield size={14} className="text-[#4edea3]" />
              Verification Queue
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full">
                {stats.pendingVerifications}
              </span>
            </h3>
            <a href="/dashboard/admin/verification" className="text-xs text-[#4edea3] flex items-center gap-1">
              View all <ArrowRight size={11} />
            </a>
          </div>
          <div className="space-y-2">
            {verificationQueue.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-4">Nothing awaiting review.</p>
            ) : (
              verificationQueue.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-zinc-950/60">
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-900 dark:text-white text-xs font-medium">{v.property}</div>
                    <div className="text-zinc-600 text-xs">{v.owner} · {v.type}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={v.status} />
                    <div className="text-zinc-700 text-[10px] mt-0.5">{v.submitted}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm">Recent Transactions</h3>
          <a href="/dashboard/admin/transactions" className="text-xs text-[#4edea3] flex items-center gap-1">
            All transactions <ArrowRight size={11} />
          </a>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-4">No transactions recorded yet.</p>
        ) : (
          <DataTable columns={transactionColumns} data={recentTransactions} />
        )}
      </div>
    </div>
  );
}