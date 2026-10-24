'use client';

import { useMemo, useState } from 'react';
import { Receipt, Download, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard, StatusBadge } from '@/components/ui';
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

function shortRef(ref: string) {
  return ref.slice(-8).toUpperCase();
}

export default function TenantReceiptsClient({ initialReceipts }: { initialReceipts: ReceiptRow[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'released' | 'pending' | 'failed'>('all');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return initialReceipts.filter((r) => {
      const byStatus = filter === 'all' ? true : r.status === filter;
      if (!byStatus) return false;
      if (!term) return true;
      const hay = [r.ref, shortRef(r.ref), r.title, r.method].join(' ').toLowerCase();
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

      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-3">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = filtered.map((r) => [shortRef(r.ref), `"${r.title.replace(/"/g, '""')}"`, String(r.amount / 100), r.status, r.date].join(','));
                const csv = ['Ref,Title,Amount (NGN),Status,Date', ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'receipts.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Receipt className="mx-auto h-10 w-10 text-zinc-400" />
            <p className="mt-3 font-semibold text-zinc-900 dark:text-white">No receipts yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              {q || filter !== 'all' ? 'No receipts match your filters. Try clearing search or switching tabs.' : 'Settled transactions appear here as downloadable vouchers. Pay rent via Rent & Payments to generate your first receipt.'}
            </p>
            {(q || filter !== 'all') && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQ(''); setFilter('all'); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] font-semibold tracking-widest text-zinc-500">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-zinc-900 dark:text-white">{shortRef(r.ref)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-white">{r.title}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.method}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">{formatNairaFull(r.amount / 100)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={r.status === 'released' ? 'Paid' : r.status === 'pending' ? 'Pending' : r.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <a href={`/api/receipts/${r.id}`} target="_blank" rel="noreferrer" aria-label="Download receipt">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row">
          <span>
            Showing {filtered.length} of {initialReceipts.length} vouchers • Total {formatNairaFull(totalKobo / 100)}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">FIRS Stamp Duty • PropatiBox Escrow</span>
        </div>
      </div>
    </div>
  );
}
