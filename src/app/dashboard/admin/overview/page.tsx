import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AppIcon from '@/components/icons/app-icon';
export const dynamic = 'force-dynamic';

function formatCurrency(value: number, currency = 'NGN') {
  if (!value && value !== 0) return currency === 'NGN' ? '₦0' : `${currency} 0`;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
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
    prisma.verification.count({ where: { status: 'in_progress' } }),
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

      <AdminOverviewClient
        kpi={{
          totalUsers,
          activeUsers,
          newToday,
          pendingVerifications,
          totalListings,
          activeListings,
          totalTransactions,
          escrowedTransactions,
          disputeCount,
          gtv,
        }}
        recentUsers={recentUsers}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function AdminOverviewClient({
  kpi,
  recentUsers,
}: {
  kpi: {
    totalUsers: number;
    activeUsers: number;
    newToday: number;
    pendingVerifications: number;
    totalListings: number;
    activeListings: number;
    totalTransactions: number;
    escrowedTransactions: number;
    disputeCount: number;
    gtv: number;
  };
  recentUsers: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: Date;
  }[];
}) {
  'use client';

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Users',
            value: kpi.totalUsers.toLocaleString(),
            sub: `${kpi.activeUsers.toLocaleString()} active · ${kpi.newToday} new today`,
            icon: 'groups',
          },
          {
            label: 'Pending Verifications',
            value: String(kpi.pendingVerifications),
            sub: 'Awaiting review',
            icon: 'pending_actions',
            accent: 'warning',
          },
          {
            label: 'Platform Revenue (GTV)',
            value: formatCurrency(kpi.gtv / 100),
            sub: `${kpi.totalTransactions.toLocaleString()} transactions`,
            icon: 'payments',
          },
          {
            label: 'Active Disputes',
            value: String(kpi.disputeCount),
            sub: `${kpi.escrowedTransactions} in escrow`,
            icon: 'report',
            accent: kpi.disputeCount > 0 ? 'error' : undefined,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              <AppIcon name={card.icon} className="lucide" size={20} />
            </div>
            <div className="text-headline-md font-bold text-primary">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Users + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
          <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <h3 className="font-headline-sm text-primary">Newest Users</h3>
            <span className="text-xs text-muted-foreground">Last 5 signups</span>
          </div>
          {recentUsers.length === 0 ? (
            <p className="p-lg text-sm text-muted-foreground text-center">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container text-muted-foreground border-b border-outline-variant">
                    <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">User</th>
                    <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Role</th>
                    <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold">
                            {initials(u.fullName || u.email)}
                          </div>
                          <div>
                            <div className="font-bold text-primary text-sm">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md text-body-sm capitalize">{u.role.replace('_', ' ')}</td>
                      <td className="px-lg py-md text-body-sm text-muted-foreground">
                        {u.createdAt.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Platform Health Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <h3 className="font-headline-sm text-primary mb-3">Platform Health</h3>
            <div className="space-y-3">
              {[
                { label: 'Active Listings', value: `${kpi.activeListings.toLocaleString()} / ${kpi.totalListings.toLocaleString()}` },
                { label: 'Transactions in Escrow', value: kpi.escrowedTransactions.toLocaleString() },
                { label: 'Pending Verifications', value: kpi.pendingVerifications.toLocaleString() },
                { label: 'Total Listings', value: kpi.totalListings.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <h3 className="font-headline-sm text-primary mb-2">Trend Snapshot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Revenue tracked to date includes{' '}
              <span className="font-bold text-primary">released</span> and{' '}
              <span className="font-bold text-secondary">in-escrow</span> transactions.
              {kpi.disputeCount > 0 && (
                <> <span className="text-error font-bold">{kpi.disputeCount}</span> open disputes require attention.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
