import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function LandlordRentPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'LANDLORD') {
    redirect('/dashboard');
  }

  // Fetch transactions for this landlord
  const transactions = await prisma.transaction.findMany({
    where: { payeeId: user.id },
    include: {
      listing: { select: { id: true, title: true, area: true } },
      agreement: { select: { id: true, tenantId: true, tenant: { select: { fullName: true } } } },
      payer: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Calculate stats
  const totalRevenue = transactions
    .filter(t => t.status === 'released')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const inEscrow = transactions
    .filter(t => t.status === 'in_escrow')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const thisMonthRevenue = transactions
    .filter(t => t.status === 'released' && new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              Rent Collection
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Track rent payments, escrow releases, and revenue
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={`₦${(totalRevenue / 100).toLocaleString()}`}
            icon={<CurrencyIcon />}
            trend={`+${((thisMonthRevenue / (totalRevenue - thisMonthRevenue || 1)) * 100).toFixed(0)}% this month`}
            trendPositive
          />
          <StatCard
            label="In Escrow"
            value={`₦${(inEscrow / 100).toLocaleString()}`}
            icon={<ShieldIcon />}
            trend={transactions.filter(t => t.status === 'in_escrow').length > 0 ? 'Awaiting release' : 'None'}
            trendPositive={transactions.filter(t => t.status === 'in_escrow').length === 0}
          />
          <StatCard
            label="Pending Payments"
            value={pendingCount}
            icon={<ClockIcon />}
            trend={pendingCount > 0 ? 'Action required' : 'All caught up'}
            trendPositive={pendingCount === 0}
          />
          <StatCard
            label="This Month"
            value={`₦${(thisMonthRevenue / 100).toLocaleString()}`}
            icon={<CalendarIcon />}
            trendPositive
          />
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-4">
            <select className="inp-field flex-1 min-w-[180px]" style={{ maxWidth: '200px' }}>
              <option value="all">All Status</option>
              <option value="released">Released</option>
              <option value="in_escrow">In Escrow</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select className="inp-field" style={{ maxWidth: '180px' }}>
              <option value="all">All Types</option>
              <option value="rent">Rent</option>
              <option value="caution">Caution Deposit</option>
              <option value="sale">Sale</option>
              <option value="short_let">Short Let</option>
              <option value="subscription">Subscription</option>
            </select>
            <input
              type="date"
              className="inp-field"
              style={{ maxWidth: '180px' }}
              placeholder="From date"
            />
            <input
              type="date"
              className="inp-field"
              style={{ maxWidth: '180px' }}
              placeholder="To date"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <section>
          <div className="card overflow-hidden">
            {transactions.length === 0 ? (
              <div className="card-body text-center py-16">
                <CurrencyIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No transactions yet</h3>
                <p style={{ color: 'var(--muted)' }}>Rent payments will appear here once tenants start paying.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                      <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4" style={{ color: 'var(--muted)' }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{tx.listing?.title || 'N/A'}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{tx.listing?.area}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>
                            {tx.agreement?.tenant?.fullName || tx.payer?.fullName || 'Unknown'}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="tag tag-blue">{tx.type}</span>
                        </td>
                        <td className="p-4 text-right font-heading font-bold" style={{ color: 'var(--text)' }}>
                          ₦{Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <TransactionStatusBadge status={tx.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {tx.status === 'in_escrow' && (
                              <button className="btn btn-primary btn-sm">Release</button>
                            )}
                            <Link
                              href={`/dashboard/landlord/rent/${tx.id}`}
                              className="btn btn-ghost btn-sm"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/dashboard/landlord/receipts/${tx.id}`}
                              className="btn btn-ghost btn-sm"
                              title="Receipt"
                            >
                              <FileIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Rent Schedule */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Upcoming Rent Schedule</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Due Date</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { property: 'Sunrise Apartments Block A', tenant: 'John Doe', amount: 1500000, dueDate: '2026-07-01', status: 'upcoming' },
                  { property: 'Greenview Estate Unit 3', tenant: 'Jane Smith', amount: 2200000, dueDate: '2026-07-05', status: 'upcoming' },
                  { property: 'Lekki Heights Penthouse', tenant: 'Mike Johnson', amount: 5000000, dueDate: '2026-06-30', status: 'overdue' },
                ].map((item, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4" style={{ color: 'var(--text)' }}>{item.property}</td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>{item.tenant}</td>
                    <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>₦{item.amount.toLocaleString()}</td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{new Date(item.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4">
                      <span className={`tag ${item.status === 'overdue' ? 'tag-red' : 'tag-amber'}`}>
                        {item.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                      </span>
                    </td>
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

function StatCard({ label, value, icon: Icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend: string; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {Icon}
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

function TransactionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    released: { class: 'tag-green', label: 'Released' },
    in_escrow: { class: 'tag-blue', label: 'In Escrow' },
    pending: { class: 'tag-amber', label: 'Pending' },
    failed: { class: 'tag-red', label: 'Failed' },
    refunded: { class: 'tag-orange', label: 'Refunded' },
  };
  const cfg = config[status] || { class: 'tag-gray', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

// Icons
function CurrencyIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function ShieldIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function ClockIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CalendarIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function EyeIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function FileIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}