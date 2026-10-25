'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Download, FileText, Loader2, Search, Calendar, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface OverviewData {
  metrics?: { totalIncome?: number; pendingCount?: number; transactionCount?: number };
  wallet?: { availableBalance?: number; pendingClearing?: number; recentTransactions?: any[] };
}

export default function FinancialReportsClient({ userId }: { userId: string }) {
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
        const res = await fetch('/api/dashboard/landlord/financials/overview');
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        if (!cancelled) setOverview(json.data ?? json);
      } catch (e) {
        toast.error('Could not load financial overview');
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const downloadReport = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getPeriodDates(period);
      const params = new URLSearchParams({ type: reportType === 'all' ? 'pl' : reportType, format, from, to, userId });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
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
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  }, [reportType, format, period, userId]);

  const metrics = overview?.metrics;
  const wallet = overview?.wallet;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="px-space-xl pt-space-lg pb-space-md">
        <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-sm">
          <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">Home</span>
          <span className="material-symbols-outlined text-[14px]">›</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Financials &amp; Payouts</span>
          <span className="material-symbols-outlined text-[14px]">›</span>
          <span className="text-on-surface font-semibold">Financial Reports</span>
        </nav>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Financial Reports</h1>
              <span className="bg-primary-container/20 text-on-primary-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-bold">IFRS &amp; LASRERA Ready</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
              Generate, schedule, and export institutional financial statements, tax filings, and audited portfolio yield ledgers.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start lg:self-center">
            <Button variant="outline" className="gap-2" onClick={() => toast.info('Recurring scheduling coming soon')}>
              <Calendar className="w-4 h-4" /> Schedule Recurring
            </Button>
            <Button className="gap-2 bg-primary-container text-on-primary-container hover:opacity-95" onClick={() => toast.info('Open generate modal')} >
              <FileText className="w-4 h-4" /> Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="px-space-xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm h-32 animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Reports Archive</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary"><FileText className="w-4 h-4" /></div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-headline-md text-headline-md text-on-surface">{metrics?.transactionCount ?? 0}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">transactions</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container/40" />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Ready to Export</span>
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary"><CheckCircle2 className="w-4 h-4" /></div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-headline-md text-headline-md text-on-surface">{wallet?.recentTransactions?.length ?? 0}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">wallet txs</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Pending</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant"><Clock className="w-4 h-4" /></div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-headline-md text-headline-md text-on-surface">{metrics?.pendingCount ?? 0}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">in-flight</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container" />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Total Income</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary"><ShieldCheck className="w-4 h-4" /></div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono-numeric text-headline-md font-bold text-on-surface">₦{(metrics?.totalIncome ?? 0).toLocaleString()}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="px-space-xl mb-space-md space-y-space-sm">
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setReportType(t.value)}
              className={`px-space-md py-1.5 rounded-full font-title-sm text-title-sm whitespace-nowrap transition-all ${reportType === t.value ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto">
            {PERIOD_OPTIONS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-space-sm py-1.5 rounded-lg font-label-md text-label-md transition-all ${period === p.value ? 'bg-surface-container-high text-on-surface font-bold' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                {p.label}
              </button>
            ))}
            <div className="h-4 w-[1px] bg-outline-variant mx-1" />
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-lg text-body-sm text-on-surface-variant">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-mono-numeric font-medium text-on-surface">{getPeriodDates(period).from} - {getPeriodDates(period).to}</span>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-low pl-9 pr-space-md py-1.5 rounded-lg font-body-sm text-body-sm" placeholder="Filter by report title, CAC, ref..." />
          </div>
        </div>
      </div>

      {/* Table / Empty / Skeleton */}
      <div className="px-space-xl pb-24">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
                  <th className="py-space-sm px-space-md font-semibold">Report Statement / Type</th>
                  <th className="py-space-sm px-space-md font-semibold">Coverage Period</th>
                  <th className="py-space-sm px-space-md font-semibold">Timestamp (WAT)</th>
                  <th className="py-space-sm px-space-md font-semibold">Status</th>
                  <th className="py-space-sm px-space-md font-semibold">Format &amp; Weight</th>
                  <th className="py-space-sm px-space-md font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 text-on-surface">
                {fetching ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-space-sm px-space-md"><div className="h-8 bg-surface-container animate-pulse rounded" /></td></tr>
                  ))
                ) : (wallet?.recentTransactions?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-title-sm">No reports yet</p>
                      <p className="text-body-sm mt-1">Generate your first report to populate the archive.</p>
                    </td>
                  </tr>
                ) : (
                  (wallet?.recentTransactions ?? []).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors" data-type={reportType}>
                      <td className="py-space-sm px-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-title-sm text-title-sm text-on-surface">{tx.description || tx.type}</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">{tx.providerRef || tx.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-space-sm px-space-md font-mono-numeric text-body-sm">{tx.date}</td>
                      <td className="py-space-sm px-space-md font-mono-numeric text-body-sm">{tx.date}</td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sm uppercase">{tx.status}</span>
                      </td>
                      <td className="py-space-sm px-space-md font-mono-numeric text-body-sm">{tx.currency} {Number(tx.amount).toLocaleString()}</td>
                      <td className="py-space-sm px-space-md text-right">
                        <Button variant="ghost" size="sm" onClick={downloadReport} disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate action */}
        <div className="mt-6 flex items-center gap-3">
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-surface-container-low px-3 py-2 rounded-lg text-sm">
            {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
          <Button onClick={downloadReport} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? 'Generating…' : `Download ${format.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
