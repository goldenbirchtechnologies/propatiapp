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
import { PageHeader, StatCard, StatusBadge } from '@/components/ui';

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

  function TransactionStatusBadge({ status }: { status: string }) {
    const config: Record<string, { class: string; label: string }> = {
      released: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Released' },
      in_escrow: { class: 'bg-zinc-800 text-zinc-300 border-zinc-700', label: 'In Escrow' },
      pending: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
      failed: { class: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Failed' },
      refunded: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Refunded' },
    };
    const cfg = config[status] || { class: 'bg-zinc-900 text-zinc-500 border-white/[0.08]', label: status };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.class}`}>{cfg.label}</span>;
  }

  function RentTableSkeleton() {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {['Date', 'Property', 'Tenant', 'Type', 'Amount', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left p-4 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-white/[0.08]">
                {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="p-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rent Collection"
        description="Track rent payments, escrow releases, and revenue"
      />

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
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <select className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50" style={{ maxWidth: '200px' }}>
            <option value="all">All Status</option>
            <option value="released">Released</option>
            <option value="in_escrow">In Escrow</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50" style={{ maxWidth: '180px' }}>
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="caution">Caution Deposit</option>
            <option value="sale">Sale</option>
            <option value="short_let">Short Let</option>
            <option value="subscription">Subscription</option>
          </select>
          <input type="date" className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50" style={{ maxWidth: '180px' }} />
          <input type="date" className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50" style={{ maxWidth: '180px' }} />
        </div>
      </div>

      {/* Transactions Table */}
      <section>
        <DashboardSection loading={loading} error={error} onRetry={load} skeleton={<RentTableSkeleton />}>
          {transactions.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/[0.08] text-center py-16">
              <CurrencyIcon className="w-5 h-5 mx-auto text-zinc-500 mb-2" />
              <h3 className="text-white">No transactions yet</h3>
              <p className="text-zinc-400">Rent payments will appear here once tenants start paying.</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      {['Date', 'Property', 'Tenant', 'Type', 'Amount', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left p-4 text-xs text-zinc-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-sm text-zinc-400">
                          {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <p className="text-white text-sm">{tx.listing?.title || 'N/A'}</p>
                          <p className="text-xs text-zinc-500">{tx.listing?.area}</p>
                        </td>
                        <td className="p-4 text-sm text-white">
                          {tx.agreements?.[0]?.tenant?.fullName || tx.payer?.fullName || 'Unknown'}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-900 text-zinc-400 border border-white/[0.08] capitalize">{tx.type}</span>
                        </td>
                        <td className="p-4 text-sm text-white font-medium">
                          ₦{Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <TransactionStatusBadge status={tx.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {tx.status === 'in_escrow' && (
                              <button className="px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">Release</button>
                            )}
                            <Link href={`/dashboard/landlord/rent/${tx.id}`} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="View Details">
                              <EyeIcon className="w-4 h-4 text-zinc-400" />
                            </Link>
                            <Link href={`/dashboard/landlord/receipts/${tx.id}`} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Receipt">
                              <FileIcon className="w-4 h-4 text-zinc-400" />
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
        <h2 className="text-white font-semibold text-sm mb-4">Upcoming Rent Schedule</h2>
        <div className="glass-card rounded-xl border border-white/[0.08] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                {['Property', 'Tenant', 'Amount', 'Due Date', 'Status'].map((h) => (
                  <th key={h} className="text-left p-4 text-xs text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { property: 'Sunrise Apartments Block A', tenant: 'John Doe', amount: 1500000, dueDate: '2026-07-01', status: 'upcoming' },
                { property: 'Greenview Estate Unit 3', tenant: 'Jane Smith', amount: 2200000, dueDate: '2026-07-05', status: 'upcoming' },
                { property: 'Lekki Heights Penthouse', tenant: 'Mike Johnson', amount: 5000000, dueDate: '2026-06-30', status: 'overdue' },
              ].map((item, i) => (
                <tr key={i} className="border-b border-white/[0.08]">
                  <td className="p-4 text-sm text-white">{item.property}</td>
                  <td className="p-4 text-sm text-white">{item.tenant}</td>
                  <td className="p-4 text-sm text-white">₦{item.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm text-zinc-400">
                    {new Date(item.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
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
