import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/admin/stats-card';
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  UserPlus,
  PlusCircle,
  Wallet,
  ShieldAlert,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get current month start date
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  // Fetch admin stats
  const [
    totalUsers,
    totalListings,
    totalTransactions,
    totalRevenue,
    newUsersThisMonth,
    newListingsThisMonth,
    revenueThisMonth,
    pendingVerifications,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { status: 'released' },
      _sum: { platformFee: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    prisma.listing.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    prisma.transaction.aggregate({
      where: {
        status: 'released',
        createdAt: { gte: currentMonthStart },
      },
      _sum: { platformFee: true },
    }),
    prisma.verification.count({ where: { overallStatus: 'in_progress' } }),
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Admin Console
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Platform overview and management tools.
          </p>
        </div>

        {/* Platform Stats - 8 cards in 4x2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            change={`+${newUsersThisMonth} this month`}
            trendPositive={true}
          />
          <StatsCard
            title="Total Listings"
            value={totalListings}
            icon={Building2}
            change={`+${newListingsThisMonth} this month`}
            trendPositive={true}
          />
          <StatsCard
            title="Total Transactions"
            value={totalTransactions}
            icon={DollarSign}
            trendPositive={true}
          />
          <StatsCard
            title="Total Revenue"
            value={`₦${(Number(totalRevenue._sum.platformFee || 0) / 100).toLocaleString()}`}
            icon={TrendingUp}
            trendPositive={true}
          />
          <StatsCard
            title="New Users (Month)"
            value={newUsersThisMonth}
            icon={UserPlus}
            trendPositive={true}
          />
          <StatsCard
            title="New Listings (Month)"
            value={newListingsThisMonth}
            icon={PlusCircle}
            trendPositive={true}
          />
          <StatsCard
            title="Revenue (Month)"
            value={`₦${(Number(revenueThisMonth._sum.platformFee || 0) / 100).toLocaleString()}`}
            icon={Wallet}
            trendPositive={true}
          />
          <StatsCard
            title="Pending Verifications"
            value={pendingVerifications}
            icon={ShieldAlert}
            change={pendingVerifications > 0 ? 'Needs review' : 'All clear'}
            trendPositive={pendingVerifications === 0}
          />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="/admin/verification"
              className="card p-6 hover:border-[var(--accent)] transition-colors"
            >
              <ShieldAlert className="h-8 w-8 mb-3" style={{ color: 'var(--accent)' }} />
              <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>
                Review Verifications
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {pendingVerifications} pending
              </p>
            </a>
            <a
              href="/admin/flagged-listings"
              className="card p-6 hover:border-[var(--accent)] transition-colors"
            >
              <FlagIcon className="h-8 w-8 mb-3" style={{ color: 'var(--accent)' }} />
              <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>
                Check Flags
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Review flagged content
              </p>
            </a>
            <a
              href="/admin/users"
              className="card p-6 hover:border-[var(--accent)] transition-colors"
            >
              <Users className="h-8 w-8 mb-3" style={{ color: 'var(--accent)' }} />
              <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>
                View Users
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Manage {totalUsers} users
              </p>
            </a>
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold" style={{ color: 'var(--text)' }}>
              Recent Activity
            </h2>
            <a
              href="/admin/audit-logs"
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              View All →
            </a>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      User
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                          >
                            {activity.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: 'var(--text)' }}>{activity.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="tag tag-gold">{activity.role}</span>
                      </td>
                      <td className="p-4" style={{ color: 'var(--muted)' }}>
                        {activity.email}
                      </td>
                      <td className="p-4" style={{ color: 'var(--muted)' }}>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

// Icons
function FlagIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}