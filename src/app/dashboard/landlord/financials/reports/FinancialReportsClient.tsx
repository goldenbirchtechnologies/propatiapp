'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download,
  FileText,
  Loader2,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const REPORT_TYPES = [
  { value: 'all', label: 'All Reports' },
  { value: 'pnl', label: 'P&L Statement' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'cash_flow', label: 'Cash Flow' },
  { value: 'tax_summary', label: 'Tax Summary' },
  { value: 'rent_roll', label: 'Rent Roll Register' },
  { value: 'service_charge', label: 'Service Charge Recovery' },
] as const;

const FORMAT_OPTIONS = ['csv', 'pdf'] as const;

const PERIOD_OPTIONS = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const;

function getPeriodDates(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: string;
  if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  } else if (period === 'quarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3;
    from = new Date(now.getFullYear(), qStart, 1).toISOString().slice(0, 10);
  } else {
    from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  }
  return { from, to };
}

function mapTypeForApi(t: string): 'pl' | 'balance-sheet' | 'cashflow' {
  if (t === 'balance_sheet' || t === 'balance-sheet') return 'balance-sheet';
  if (t === 'cash_flow' || t === 'cashflow') return 'cashflow';
  return 'pl';
}

interface OverviewData {
  metrics?: { totalIncome?: number; pendingCount?: number; transactionCount?: number };
  wallet?: { availableBalance?: number; pendingClearing?: number; recentTransactions?: any[] };
}

export default function FinancialReportsClient({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('all');
  const [format, setFormat] = useState<string>('csv');
  const [period, setPeriod] = useState<string>('year');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/landlord/financials/overview', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        if (!cancelled) setOverview(json.data ?? json);
      } catch {
        toast({ title: 'Could not load financial overview', variant: 'destructive' });
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const downloadReport = useCallback(async () => {
    const unsupported = ['tax_summary', 'rent_roll', 'service_charge'];
    if (unsupported.includes(reportType)) {
      toast({ title: 'Report export coming soon', description: `${REPORT_TYPES.find((r) => r.value === reportType)?.label} export is not yet wired — downloading P&L preview.` });
    }
    setLoading(true);
    try {
      const { from, to } = getPeriodDates(period);
      const apiType = mapTypeForApi(reportType);
      const params = new URLSearchParams({ type: apiType, format, from, to });
      // user scoping is via auth — no need to send userId
      const res = await fetch(`/api/reports/export?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${from}-to-${to}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Report downloaded' });
    } catch (err) {
      toast({ title: 'Download failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [reportType, format, period, toast]);

  const metrics = overview?.metrics;
  const wallet = overview?.wallet;

  const rows = useMemo(() => {
    const txs = (wallet?.recentTransactions ?? []) as any[];
    if (!search.trim()) return txs;
    const q = search.toLowerCase();
    return txs.filter(
      (tx) =>
        String(tx.description || tx.type || '').toLowerCase().includes(q) ||
        String(tx.providerRef || tx.id || '').toLowerCase().includes(q) ||
        String(tx.status || '').toLowerCase().includes(q),
    );
  }, [wallet?.recentTransactions, search]);

  const periodLabel = useMemo(() => {
    const { from, to } = getPeriodDates(period);
    return `${from} – ${to}`;
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Financials &amp; Payouts</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-primary font-semibold">Financial Reports</span>
          </nav>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Financial Reports</h1>
            <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">IFRS &amp; LASRERA Ready</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Generate, schedule, and export institutional financial statements, tax filings, and audited portfolio yield ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Recurring scheduling — coming soon' })}>
            <Calendar className="w-4 h-4 mr-1" /> Schedule Recurring
          </Button>
          <Button size="sm" className="bg-primary hover:bg-[var(--sovereign-hover)] text-white" onClick={downloadReport} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-white/[0.06] rounded w-24 mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-white/[0.06] rounded w-32 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-white/[0.06] rounded w-20" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Reports Archive</span>
                <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics?.transactionCount ?? 0}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">transactions in window</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Ready to Export</span>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{wallet?.recentTransactions?.length ?? 0}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">wallet ledger entries</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Pending</span>
                <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics?.pendingCount ?? 0}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">in-flight settlements</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Total Income</span>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
                {'₦' + Number(metrics?.totalIncome ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">released to wallet</div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setReportType(t.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                reportType === t.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex p-1 bg-zinc-100 dark:bg-white/[0.04] rounded-lg border border-zinc-200 dark:border-white/[0.08]">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p.value ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-white/[0.08]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.04] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-mono font-medium text-zinc-900 dark:text-white">{periodLabel}</span>
            </div>
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/[0.04] rounded-lg px-3 py-1.5 border border-zinc-200 dark:border-white/[0.08]">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by report title, CAC, ref..." className="pl-10" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-zinc-50 dark:bg-white/[0.04] border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
            <BarChart3 className="w-4 h-4 text-primary" />
            Ledger Snapshot — {periodLabel}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-bold text-zinc-900 dark:text-white">{rows.length}</span> entries
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white dark:bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/[0.08]">
                <th className="py-3 px-6 font-semibold">Report Statement / Type</th>
                <th className="py-3 px-4 font-semibold">Coverage Period</th>
                <th className="py-3 px-4 font-semibold">Timestamp (WAT)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Format &amp; Weight</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-6">
                      <div className="h-8 bg-zinc-100 dark:bg-white/[0.06] animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400 mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">No reports yet</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Generate your first report to populate the archive. Wallet ledger is empty for this window.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-primary/[0.04] transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{tx.description || tx.type}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{tx.providerRef || tx.id.slice(0, 12)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{periodLabel}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{tx.date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border bg-primary text-white border-primary capitalize">{String(tx.status).replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {tx.currency} {Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <Button variant="ghost" size="sm" onClick={downloadReport} disabled={loading} className="h-8">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-zinc-50 dark:bg-white/[0.04] border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg text-sm border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white">
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f.toUpperCase()}</option>
              ))}
            </select>
            <Button onClick={downloadReport} disabled={loading} size="sm" className="bg-primary hover:bg-[var(--sovereign-hover)] text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
              {loading ? 'Generating…' : `Download ${format.toUpperCase()}`}
            </Button>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">Exports via GET /api/reports/export — scoped to landlord listings</span>
        </div>
      </div>
    </div>
  );
}
