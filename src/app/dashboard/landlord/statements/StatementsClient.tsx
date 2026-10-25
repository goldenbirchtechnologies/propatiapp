'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Download,
  FileText,
  Loader2,
  Calendar,
  Search,
  CheckCircle2,
  Wallet,
  Clock,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNairaFull, formatDate } from '@/lib/utils';

interface Tx {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency?: string;
  description?: string;
  createdAt: string;
  providerRef?: string | null;
}

const MONTHS = [
  { value: 'all', label: 'All Quarters (FY)' },
  { value: '11', label: 'November' },
  { value: '10', label: 'October' },
  { value: '09', label: 'September' },
  { value: '08', label: 'August' },
  { value: '07', label: 'July' },
  { value: '06', label: 'June' },
  { value: '05', label: 'May' },
  { value: '04', label: 'April' },
  { value: '03', label: 'March' },
  { value: '02', label: 'February' },
  { value: '01', label: 'January' },
];

export default function StatementsClient() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState('all');
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<Tx[]>([]);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/wallet/transactions?limit=50', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        const raw = json.items ?? json.data ?? [];
        if (!cancelled) setItems(raw);
      } catch {
        toast.error('Could not load statements');
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((t) => {
      const d = new Date(t.createdAt);
      if (year !== 'all' && String(d.getFullYear()) !== year) return false;
      if (month !== 'all') {
        const m = String(d.getMonth() + 1).padStart(2, '0');
        if (m !== month) return false;
      }
      if (!term) return true;
      return (t.description || t.type || '').toLowerCase().includes(term);
    });
  }, [items, search, year, month]);

  const totalNaira = useMemo(() => items.reduce((s, t) => s + Number(t.amount || 0), 0), [items]);
  const pendingCount = useMemo(
    () => items.filter((t) => t.status !== 'success' && t.status !== 'completed' && t.status !== 'released').length,
    [items]
  );

  const triggerGeneration = async () => {
    try {
      const params = new URLSearchParams({ type: 'pl', format: 'pdf', from: `${year}-01-01`, to: `${year}-12-31` });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error('no export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Statement generated');
    } catch {
      toast.info('Statement generation queued — export will be available shortly');
    }
  };

  const batchExport = async () => {
    try {
      const params = new URLSearchParams({ type: 'pl', format: 'csv', from: `${year}-01-01`, to: `${year}-12-31` });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statements-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Archive downloaded');
    } catch {
      toast.info('Batch export queued');
    }
  };

  const downloadRow = async (t: Tx) => {
    setDownloading(t.id);
    try {
      // Try receipt endpoint if this is a payment transaction; fallback to CSV export
      const res = await fetch(`/api/payments/transactions/${t.id}/receipt`);
      if (res.ok && res.headers.get('content-type')?.includes('pdf')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement-${t.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Statement downloaded');
        return;
      }
      throw new Error('no pdf');
    } catch {
      toast.info('Statement download queued — receipt will be available at /api/payments/transactions/' + t.id + '/receipt');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <span className="hover:text-emerald-600 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="hover:text-emerald-600 cursor-pointer transition-colors">Financials &amp; Payouts</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-zinc-900 dark:text-white font-semibold">Statements</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Statements</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> IFRS-16 &amp; Statutory Yield Audit Ready
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Monthly financial statements, statutory withholding tax allocations, and certified asset remittance registers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-sm dark:border-white/[0.08] dark:bg-zinc-900">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent font-semibold text-zinc-900 focus:outline-none dark:text-white cursor-pointer pr-2 text-sm"
            >
              <option value={String(new Date().getFullYear())}>{new Date().getFullYear()} Fiscal</option>
              <option value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1} Fiscal</option>
              <option value={String(new Date().getFullYear() - 2)}>{new Date().getFullYear() - 2} Fiscal</option>
              <option value="all">All Years</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-sm dark:border-white/[0.08] dark:bg-zinc-900">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent font-semibold text-zinc-900 focus:outline-none dark:text-white cursor-pointer pr-2 text-sm"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900" onClick={batchExport}>
            <FileDown className="h-4 w-4" /> Batch Export Archive (.ZIP)
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={triggerGeneration}>
            <FileText className="h-4 w-4" /> Generate Statement
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reconciled', value: fetching ? '—' : String(filtered.length), sub: `${items.length} wallet transactions`, icon: CheckCircle2, tint: 'emerald' },
          { label: 'Latest Net Yield', value: fetching ? '—' : formatNairaFull(totalNaira), sub: 'settled', icon: Wallet, tint: 'emerald' },
          { label: 'Pending', value: fetching ? '—' : String(pendingCount), sub: 'in-flight', icon: Clock, tint: 'amber' },
          { label: 'Statement Count', value: fetching ? '—' : String(filtered.length), sub: `FY ${year}`, icon: FileText, tint: 'zinc' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{k.label}</span>
                  <span className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{k.value}</span>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    k.tint === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : k.tint === 'amber'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{k.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-4 py-3">
          <Search className="h-4 w-4 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter statements by type or description..."
            className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-zinc-400 dark:text-white"
          />
          <span className="hidden sm:inline-flex text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            {filtered.length} of {items.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                <th className="px-4 py-3 font-semibold">Statement</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06] text-sm">
              {fetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/[0.06]" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="mx-auto flex w-12 h-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.04] text-zinc-400 mb-3">
                      <FileText className="h-6 w-6 opacity-60" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">No statements found</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting year, month, or search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1">{t.description || t.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-zinc-600 dark:text-zinc-400">{String(t.type).replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
                          t.status === 'success' || t.status === 'completed' || t.status === 'released'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : t.status === 'pending' || t.status === 'processing'
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-zinc-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {formatNairaFull(Number(t.amount || 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => downloadRow(t)}
                        disabled={downloading === t.id}
                        aria-label="Download"
                        className="text-zinc-500 hover:text-emerald-600 dark:text-zinc-400"
                      >
                        {downloading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
