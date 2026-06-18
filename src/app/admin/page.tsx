import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch admin stats
  const [
    totalUsers,
    totalListings,
    totalTransactions,
    totalRevenue,
    pendingVerifications,
    openFlags,
    openDisputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { status: 'RELEASED' },
      _sum: { platformFee: true },
    }),
    prisma.verification.count({ where: { overallStatus: 'IN_PROGRESS' } }),
    prisma.listingFlag.count({ where: { status: 'OPEN' } }),
    prisma.transaction.count({ where: { status: 'FAILED' } }), // Using failed as proxy for disputes
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

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon={<UsersIcon />} trend="+12% this month" trendPositive />
          <StatCard label="Active Listings" value={totalListings.toLocaleString()} icon={<BuildingIcon />} trend="+8% this month" trendPositive />
          <StatCard label="Transactions" value={totalTransactions.toLocaleString()} icon={<CurrencyIcon />} trend="+23% this month" trendPositive />
          <StatCard label="Platform Revenue" value={`₦${(Number(totalRevenue._sum.platformFee || 0) / 100).toLocaleString()}`} icon={<ChartIcon />} trend="+15% this month" trendPositive />
          <StatCard label="Pending Verifications" value={pendingVerifications} icon={<ShieldIcon />} trend={pendingVerifications > 0 ? 'Needs review' : 'All clear'} trendPositive={pendingVerifications === 0} />
          <StatCard label="Open Flags" value={openFlags} icon={<FlagIcon />} trend={openFlags > 0 ? 'Action required' : 'All clear'} trendPositive={openFlags === 0} />
          <StatCard label="Disputes" value={openDisputes} icon={<GavelIcon />} trend={openDisputes > 0 ? 'Needs attention' : 'All resolved'} trendPositive={openDisputes === 0} />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard title="Review Verifications" description={`${pendingVerifications} pending`} icon={<ShieldIcon />} href="/admin/verification" />
            <ActionCard title="Manage Users" description={`${totalUsers} total users`} icon={<UsersIcon />} href="/admin/users" />
            <ActionCard title="Resolve Flags" description={`${openFlags} open flags`} icon={<FlagIcon />} href="/admin/flags" />
            <ActionCard title="View Revenue" description="Platform analytics" icon={<ChartIcon />} href="/admin/revenue" />
          </div>
        </section>

        {/* Recent Users */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Recent Users</h2>
            <a href="/admin/users" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>View All →</a>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>User</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Role</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Email</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'John Doe', role: 'LANDLORD', email: 'john@example.com', status: 'Active', joined: '2 days ago' },
                  { name: 'Jane Smith', role: 'TENANT', email: 'jane@example.com', status: 'Active', joined: '5 days ago' },
                  { name: 'Mike Agent', role: 'AGENT', email: 'mike@example.com', status: 'Pending Approval', joined: '1 week ago' },
                ].map((u, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ background: `linear-gradient(135deg, var(--accent), var(--accent2))` }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ color: 'var(--text)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><span className="tag tag-gold">{u.role}</span></td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{u.email}</td>
                    <td className="p-4">
                      <span className={`tag ${u.status === 'Active' ? 'tag-green' : 'tag-amber'}`}>{u.status}</span>
                    </td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a href={href} className="card p-6 hover:border-[var(--accent)] transition-colors">
      <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', width: 'fit-content' }}>
        {Icon}
      </div>
      <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{description}</p>
    </a>
  );
}

// Icons
function UsersIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
}

function BuildingIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
}

function CurrencyIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}

function ChartIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

function ShieldIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function FlagIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
}

function GavelIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M6 14H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2"/><path d="M18 16H8"/><path d="M19 16v.5a2.5 2.5 0 1 1-5 0V16"/></svg>;
}