'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { BarChart3, TrendingUp, Download, Loader2, PieChart, FileText } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'pl', label: 'Profit & Loss (P&L)' },
  { value: 'balance-sheet', label: 'Balance Sheet' },
  { value: 'cashflow', label: 'Cash Flow' },
] as const;

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
] as const;

const PERIOD_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const;

function getPeriodDates(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: string;
  switch (period) {
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      from = weekStart.toISOString().slice(0, 10);
      break;
    }
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      break;
    case 'quarter': {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      from = new Date(now.getFullYear(), qStart, 1).toISOString().slice(0, 10);
      break;
    }
    default:
      from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  }
  return { from, to };
}

const LABEL = 'text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-sm text-zinc-600 dark:text-zinc-400';
const CARD = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';

function ngn(n: number): string {
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

export default function EstateManagerReportsPage() {
  const { organization: activeOrg, loading: orgLoading } = useActiveOrganization();
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState<string>('pl');
  const [format, setFormat] = useState<string>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pl, setPl] = useState<any>(null);
  const [plLoading, setPlLoading] = useState(false);

  useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;
    setPlLoading(true);
    fetch('/api/dashboard/estate-manager/financials', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setPl(json.pl || null); })
      .catch(() => { if (!cancelled) setError('Failed to load financials'); })
      .finally(() => { if (!cancelled) setPlLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrg]);

  const downloadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getPeriodDates(period);
      const params = new URLSearchParams({ type: reportType, format, from, to });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${from}-to-${to}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  }, [reportType, format, period]);

  const revenueTrend = useMemo(() => (pl?.monthlyTrend || []).map((m: any) => ({
    month: m.month,
    revenue: m.revenue || 0,
    expenses: m.expenses || 0,
    profit: m.profit || 0,
  })), [pl]);

  const maxBar = useMemo(() => Math.max(...revenueTrend.map((m) => m.revenue), 0), [revenueTrend]);
  const pieData = useMemo(() => (pl?.revenueBreakdown || []).map((r: any) => ({ name: r.label, value: r.amount })), [pl]);
  const expenseData = useMemo(() => (pl?.expenseBreakdown || []).map((r: any) => ({ label: r.label, amount: r.amount })), [pl]);
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!activeOrg) return <NoOrgState title="No Organization" description="Select or create an organization to view reports." />;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Reports</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Portfolio performance and financial insights for {activeOrg?.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                {PERIOD_OPTIONS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </select>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                {REPORT_TYPES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
              </select>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                {FORMAT_OPTIONS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
              </select>
              <button onClick={downloadReport} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {loading ? 'Generating…' : 'Export'}
              </button>
            </div>
            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          </div>

          {/* Summary Stats bound to real financials data */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className={CARD}>
              <p className={LABEL}>Total Revenue</p>
              <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{pl ? ngn(pl.totalRevenue) : '—'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pl ? `${pl.unitCount || 0} units` : '—'}</p>
            </div>
            <div className={CARD}>
              <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Net Profit</p>
              <p className={`mt-1 text-2xl font-bold font-mono ${pl && pl.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{pl ? `${pl.netProfit >= 0 ? '+' : ''}${ngn(pl.netProfit)}` : '—'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pl ? `${pl.margin ?? 0}% margin` : '—'}</p>
            </div>
            <div className={CARD}>
              <p className={LABEL}>Total Expenses</p>
              <p className="mt-1 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{pl ? ngn(pl.totalExpenses) : '—'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pl ? `${pl.occupiedUnits || 0}/${pl.unitCount || 0} units occupied` : '—'}</p>
            </div>
            <div className={CARD}>
              <p className={LABEL}>Growth</p>
              <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {pl && pl.monthlyTrend && pl.monthlyTrend.length >= 2
                  ? (() => { const arr = pl.monthlyTrend; const prev = arr[arr.length - 2]?.revenue || 1; const curr = arr[arr.length - 1]?.revenue || 0; return `+${Math.round(((curr - prev) / prev) * 100)}%`; })()
                  : '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">month over month</p>
            </div>
          </div>

          {/* Charts — CSS-based, no external deps */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={CARD}>
              <h2 className="mb-4 flex items-center gap-2 font-heading font-bold text-zinc-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" /> Rental Revenue Trend
              </h2>
              {plLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />))}
                </div>
              ) : revenueTrend.length === 0 ? (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                  <p className={MUTED}>No revenue trend data available for the selected period.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revenueTrend.map((m) => (
                    <div key={m.month} className="flex items-center gap-3">
                      <div className="w-16 text-xs font-medium text-zinc-500 dark:text-zinc-400">{m.month}</div>
                      <div className="relative flex-1 h-8">
                        <div
                          className="h-full rounded bg-emerald-500 transition-all duration-300"
                          style={{ width: `${maxBar ? (m.revenue / maxBar) * 100 : 2}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {m.revenue ? ngn(m.revenue) : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={CARD}>
              <h2 className="mb-4 flex items-center gap-2 font-heading font-bold text-zinc-900 dark:text-white">
                <PieChart className="h-5 w-5 text-zinc-600 dark:text-zinc-400" /> Expense Breakdown
              </h2>
              {plLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />))}
                </div>
              ) : expenseData.length === 0 ? (
                <div className="py-12 text-center">
                  <PieChart className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                  <p className={MUTED}>No expense breakdown data available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenseData.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-700 dark:text-zinc-300">{d.label}</span>
                          <span className="font-mono text-zinc-900 dark:text-white">{ngn(d.amount)}</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full" style={{ width: `${(d.amount / Math.max(expenseData.reduce((s, p) => s + p.amount, 0), 1)) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue composition table bound to real data */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-heading font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400" /> Revenue Composition
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Category</th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Amount (₦)</th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {plLoading ? (
                    <tr><td colSpan={3} className="p-8"><div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /></td></tr>
                  ) : pieData.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">No revenue composition data — appears once rent/service-charge collections are recorded.</td></tr>
                  ) : (
                    pieData.map((d: any) => {
                      const total = pieData.reduce((s: number, p: any) => s + p.value, 0);
                      return (
                        <tr key={d.name} className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                          <td className="p-4 text-sm text-zinc-700 dark:text-zinc-300">{d.name}</td>
                          <td className="p-4 text-right font-mono text-zinc-900 dark:text-white">{ngn(d.value)}</td>
                          <td className="p-4 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">{total > 0 ? `${Math.round((d.value / total) * 100)}%` : ''}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
