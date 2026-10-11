import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AppIcon from '@/components/icons/app-icon';
import { PageHeader, StatCard, StatusBadge, DataTable, Avatar } from '@/components/ui';
import { Users, UserCheck, Wallet, Flag } from 'lucide-react';
import Link from 'next/link';
import RecentUsersTable from './RecentUsersTable';
export const dynamic = 'force-dynamic';

function formatCurrency(value: number, currency = 'NGN') {
  if (!value && value !== 0) return currency === 'NGN' ? '₦0' : `${currency} 0`;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminOverviewPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Pull real KPIs
  const [
    totalUsers,
    activeUsers,
    pendingVerifications,
    totalListings,
    activeListings,
    totalTransactions,
    escrowedTransactions,
    totalDisputes,
    totalRevenue,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.verification.count({ where: { overallStatus: 'in_progress' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'in_escrow' } }),
    prisma.dispute.count(),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['released', 'in_escrow'] } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const gtv = totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0;
  const disputeCount = totalDisputes;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await prisma.user.count({
    where: { createdAt: { gte: today } },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          <PageHeader
            title="Platform Overview"
            description="Monitor platform health, user growth, and key metrics"
          />

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={totalUsers.toLocaleString()} sub={`${activeUsers.toLocaleString()} active · ${newToday} new today`} icon={Users} />
            <StatCard label="Pending Verifications" value={String(pendingVerifications)} sub="Awaiting review" icon={UserCheck} />
            <StatCard label="Platform Revenue (GTV)" value={formatCurrency(gtv / 100)} sub={`${totalTransactions.toLocaleString()} transactions`} icon={Wallet} />
            <StatCard label="Active Disputes" value={String(disputeCount)} sub={`${escrowedTransactions} in escrow`} icon={Flag} />
          </div>

          {/* Recent Users + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users Table */}
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
                <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm">Newest Users</h3>
                <span className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Last 5 signups</span>
              </div>
              {recentUsers.length === 0 ? (
                <p className="p-6 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 text-center">No users registered yet.</p>
              ) : (
                <RecentUsersTable users={recentUsers} />
              )}
            </div>

            {/* Platform Health Sidebar */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm mb-3">Platform Health</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active Listings', value: `${activeListings.toLocaleString()} / ${totalListings.toLocaleString()}` },
                    { label: 'Transactions in Escrow', value: escrowedTransactions.toLocaleString() },
                    { label: 'Pending Verifications', value: pendingVerifications.toLocaleString() },
                    { label: 'Total Listings', value: totalListings.toLocaleString() },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">{item.label}</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm mb-2">Trend Snapshot</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 leading-relaxed">
                  Revenue tracked to date includes{' '}
                  <span className="font-semibold text-zinc-900 dark:text-white">released</span> and{' '}
                  <span className="font-semibold text-emerald-400">in-escrow</span> transactions.
                  {disputeCount > 0 && <> <span className="text-red-400 font-bold">{disputeCount}</span> open disputes require attention.</>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}