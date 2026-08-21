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
      <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-400">
              {label}
            </p>
            <p className="text-white">
              {value}
            </p>
          </div>
          <div className="bg-[#262626] text-white">
            {Icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium" className={trendPositive ? 'text-[#00ff66]' : 'text-red-500'}>
            {trendPositive ? '↑' : '↓'}
          </span>
          <span className="text-xs" className={trendPositive ? 'text-[#00ff66]' : 'text-red-500'}>
            {trend}
          </span>
        </div>
      </div>
    );
  }

  function TransactionStatusBadge({ status }: { status: string }) {
    const config: Record<string, { class: string; label: string }> = {
      released: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Released' },
      in_escrow: { class: 'bg-[#262626] text-white border-primary/20', label: 'In Escrow' },
      pending: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
      failed: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Failed' },
      refunded: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Refunded' },
    };
    const cfg = config[status] || { class: 'bg-muted/30 text-neutral-400 border-muted/50', label: status };
    return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
  }

  function RentTableSkeleton() {
    return (
      <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-[#262626]">
              <th className="text-neutral-400">
                Date
              </th>
              <th className="text-neutral-400">
                Property
              </th>
              <th className="text-neutral-400">
                Tenant
              </th>
              <th className="text-neutral-400">
                Type
              </th>
              <th className="text-neutral-400">
                Amount
              </th>
              <th className="text-neutral-400">
                Status
              </th>
              <th className="text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-[#262626]">
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
          >
            Rent Collection
          </h1>
          <p className="text-neutral-400">
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
      <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-4">
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
            <div className="bg-obsidian-800/30 rounded-xl border border-[#262626]-body text-center py-16">
              <CurrencyIcon className="w-5 h-5" />
              <h3 className="text-white">
                No transactions yet
              </h3>
              <p className="text-neutral-400">
                Rent payments will appear here once tenants start paying.
              </p>
            </div>
          ) : (
            <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-[#262626]">
                      <th className="text-neutral-400">
                        Date
                      </th>
                      <th className="text-neutral-400">
                        Property
                      </th>
                      <th className="text-neutral-400">
                        Tenant
                      </th>
                      <th className="text-neutral-400">
                        Type
                      </th>
                      <th className="text-neutral-400">
                        Amount
                      </th>
                      <th className="text-neutral-400">
                        Status
                      </th>
                      <th className="text-neutral-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-[#262626]">
                        <td className="text-neutral-400">
                          {new Date(tx.createdAt).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4">
                          <p className="text-white">
                            {tx.listing?.title || 'N/A'}
                          </p>
                          <p className="text-neutral-400">
                            {tx.listing?.area}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-white">
                            {tx.agreements?.[0]?.tenant?.fullName || tx.payer?.fullName || 'Unknown'}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-surface-container text-neutral-400 border border-[#262626]">{tx.type}</span>
                        </td>
                        <td className="text-white">
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
        <h2 className="text-white">
          Upcoming Rent Schedule
        </h2>
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-[#262626]">
                <th className="text-neutral-400">
                  Property
                </th>
                <th className="text-neutral-400">
                  Tenant
                </th>
                <th className="text-neutral-400">
                  Amount
                </th>
                <th className="text-neutral-400">
                  Due Date
                </th>
                <th className="text-neutral-400">
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
                <tr key={i} className="border-[#262626]">
                  <td className="text-white">
                    {item.property}
                  </td>
                  <td className="text-white">
                    {item.tenant}
                  </td>
                  <td className="text-white">
                    ₦{item.amount.toLocaleString()}
                  </td>
                  <td className="text-neutral-400">
                    {new Date(item.dueDate).toLocaleDateString('en-NG', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`tag ${item.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
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
