'use client';

import { useMemo, useState } from 'react';
import { Receipt, Download, Search, Filter, Verified, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/ui';
import { formatNairaFull } from '@/lib/utils';

type ReceiptRow = {
  id: string;
  ref: string;
  amount: number; // kobo
  title: string;
  date: string;
  status: string;
  method: string;
};

export default function TenantReceiptsClient({ initialReceipts }: { initialReceipts: ReceiptRow[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'released' | 'pending' | 'failed'>('all');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return initialReceipts.filter((r) => {
      const byStatus = filter === 'all' ? true : r.status === filter;
      if (!byStatus) return false;
      if (!term) return true;
      const hay = [r.ref, r.title, r.method].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [initialReceipts, q, filter]);

  const totalKobo = initialReceipts.reduce((sum, r) => sum + r.amount, 0);
  const paidKobo = initialReceipts.filter((r) => r.status === 'released').reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = initialReceipts.filter((r) => r.status === 'pending').length;
  const paidCount = initialReceipts.filter((r) => r.status === 'released').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
        <span>Dashboard</span>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span>Rent &amp; Payments</span>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-zinc-900 dark:text-white">Receipts</span>
      </div>

      <PageHeader
        title="Receipts"
        description="Download rental and transaction receipts — each receipt is a FIRS-stamped voucher for a settled transaction."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Paid" value={String(paidCount)} sub={`${formatNairaFull(paidKobo / 100)} settled`} icon={Receipt} accentColor="#10b981" />
        <StatCard label="Pending" value={String(pendingCount)} sub="Awaiting settlement" icon={Filter} accentColor="#f59e0b" />
        <StatCard label="Total" value={String(initialReceipts.length)} sub="Vouchers issued" icon={Receipt} />
        <StatCard label="Total Value" value={formatNairaFull(totalKobo / 100)} sub="All receipts" icon={Receipt} accentColor="#0ea5e9" />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ref, title, or method…" className="h-10 pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'released', 'pending', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'}`}
              >
                {f === 'released' ? 'Paid' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-semibold">Receipt</th>
                <th className="py-3 px-4 font-semibold">Property / Description</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-sm">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500 dark:text-zinc-400">No receipts found.</td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-zinc-900 dark:text-white">{r.ref}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Verified className="w-3 h-3 text-emerald-600" /> FIRS-stamped
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <span className="text-zinc-900 dark:text-white">{r.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-900 dark:text-white whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                    ₦ {(r.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === 'released' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : r.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                      {r.status === 'released' ? 'Paid' : r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/api/payments/transactions/${r.id}/receipt`} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-colors" title="View">
                        <Receipt className="w-4 h-4" />
                      </a>
                      <a href={`/api/payments/transactions/${r.id}/receipt`} download className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}