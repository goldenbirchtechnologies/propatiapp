'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardSection } from '@/components/layout/DashboardShell';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign as CurrencyIcon,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Eye as EyeIcon,
  FileText as FileIcon,
} from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  listing?: { title: string; area?: string };
  payer?: { fullName: string };
  payeeId: string;
  agreements?: { tenant?: { fullName: string } }[];
};

export default function LandlordRentClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/transactions?userId=${userId}&page=1&limit=50`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load transactions');
      const json = await res.json();
      const data: Transaction[] = (json?.data || []).filter((t) => t.payeeId === userId);
      setTransactions(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  // Stats
  const totalRevenue = transactions
    .filter((t) => t.status === 'released')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const inEscrow = transactions
    .filter((t) => t.status === 'in_escrow')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const thisMonthRevenue = transactions
    .filter((t) => t.status === 'released' && new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const trendPositive = totalRevenue > 0;
  const monthPercent =
    totalRevenue - thisMonthRevenue > 0
      ? ((thisMonthRevenue / (totalRevenue - thisMonthRevenue)) * 100).toFixed(0)
      : '0';

  function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendPositive = true,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    trendPositive?: boolean;
  }) {
    return (
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
              {label}
            </p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
              {value}
            </p>
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

  function RentTableSkeleton() {
    return (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Date
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Property
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Tenant
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Type
              </th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Amount
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <td className="p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4 text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-20 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
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
          trend={trendPositive ? `+${monthPercent}% this month` : 'No revenue'}
          trendPositive={trendPositive}
        />
        <StatCard
          label="In Escrow"
          value={`₦${(inEscrow / 100).toLocaleString()}`}
          icon={<ShieldIcon />}
          trend={transactions.filter((t) => t.status === 'in_escrow').length > 0 ? 'Awaiting release' : 'None'}
          trendPositive={transactions.filter((t) => t.status === 'in_escrow').length === 0}
        />
        <StatCard
          label="Pending Payments"
          value={String(pendingCount)}
          icon={<ClockIcon />}
          trend={pendingCount > 0 ? 'Action required' : 'All caught up'}
          trendPositive={pendingCount === 0}
        />
        <StatCard
          label="This Month"
          value={`₦${(thisMonthRevenue / 100).toLocaleString()}`}
          icon={<CalendarIcon />}
          trend=""
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
        <DashboardSection loading={loading} error={error} onRetry={load} skeleton={<RentTableSkeleton />}>
          {transactions.length === 0 ? (
            <div className="card-body text-center py-16">
              <CurrencyIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
              <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>
                No transactions yet
              </h3>
              <p style={{ color: 'var(--muted)' }}>
                Rent payments will appear here once tenants start paying.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Date
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Property
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Tenant
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Type
                      </th>
                      <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Amount
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4" style={{ color: 'var(--muted)' }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>
                            {tx.listing?.title || 'N/A'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {tx.listing?.area}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>
                            {tx.agreements?.[0]?.tenant?.fullName || tx.payer?.fullName || 'Unknown'}
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
            </div>
          )}
        </DashboardSection>
      </section>

      {/* Upcoming Rent Schedule */}
      <section>
        <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>
          Upcoming Rent Schedule
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Property
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Tenant
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Amount
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Due Date
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { property: 'Sunrise Apartments Block A', tenant: 'John Doe', amount: 1500000, dueDate: '2026-07-01', status: 'upcoming' },
                { property: 'Greenview Estate Unit 3', tenant: 'Jane Smith', amount: 2200000, dueDate: '2026-07-05', status: 'upcoming' },
                { property: 'Lekki Heights Penthouse', tenant: 'Mike Johnson', amount: 5000000, dueDate: '2026-06-30', status: 'overdue' },
              ].map((item, i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4" style={{ color: 'var(--text)' }}>
                    {item.property}
                  </td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>
                    {item.tenant}
                  </td>
                  <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>
                    ₦{item.amount.toLocaleString()}
                  </td>
                  <td className="p-4" style={{ color: 'var(--muted)' }}>
                    {new Date(item.dueDate).toLocaleDateString('en-NG', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
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
  );
}
