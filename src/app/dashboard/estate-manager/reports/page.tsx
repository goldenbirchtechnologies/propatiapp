'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { BarChart3, Download, Loader2, TrendingUp, CheckCircle2, Hourglass, AlertCircle } from 'lucide-react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

type TxnStatus = 'completed' | 'paid' | 'released' | 'pending' | 'in_escrow' | 'failed' | 'cancelled' | 'refunded';

interface RecentTxn {
  id: string;
  description: string;
  reference: string | null;
  amount: number;
  status: TxnStatus;
  createdAt: string;
  type: string;
}

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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function EstateManagerReportsPage() {
  const { activeOrg, loading: orgLoading } = useActiveOrganization();
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState<string>('pl');
  const [format, setFormat] = useState<string>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pl, setPl] = useState<any>(null);
  const [plLoading, setPlLoading] = useState(false);
  const [txns, setTxns] = useState<RecentTxn[]>([]);
  const [txnsLoading, setTxnsLoading] = useState(false);

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);
  const [dateStart, dateEnd] = useMemo(() => {
    const d1 = new Date(from);
    const d2 = new Date(to);
    d2.setHours(23, 59, 59, 999);
    return [d1, d2];
  }, [from, to]);

  // Fetch financials (P&L breakdown from real invoices/transactions)
  useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;
    setPlLoading(true);
    fetch('/api/dashboard/estate-manager/financials', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setPl(json.pl || null);
      })
      .catch(() => { if (!cancelled) setError('Failed to load financial summary'); })
      .finally(() => { if (!cancelled) setPlLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrg]);

  // Fetch recent wallet transactions for the table
  useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;
    setTxnsLoading(true);
    fetch(`/api/wallet/transactions?orgId=${activeOrg.id}&limit=10`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json.items || json.data || [];
          setTxns(raw.map((t: any) => ({
            id: t.id,
            description: t.description || t.reference || 'Transaction',
            reference: t.reference || null,
            amount: Number(t.amount || 0),
            status: t.status as TxnStatus,
            createdAt: t.createdAt,
            type: t.type,
          })));
        }
      })
      .catch(() => { if (!cancelled) setTxns([]); })
      .finally(() => { if (!cancelled) setTxnsLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrg]);

  const downloadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, [reportType, format, from, to]);

  const revenueTrend = useMemo(() => {
    if (!pl?.monthlyTrend) return [];
    return pl.monthlyTrend.map((m: any) => ({ month: m.month, revenue: m.revenue, expenses: m.expenses, profit: m.profit }));
  }, [pl]);

  const pieData = useMemo(() => {
    if (!pl?.revenueBreakdown) return [];
    return pl.revenueBreakdown.map((r: { label: string; amount: number }) => ({ name: r.label, value: r.amount }));
  }, [pl]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusIcon = (s: TxnStatus) => {
    switch (s) {
      case 'completed': case 'paid': case 'released': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'pending': case 'in_escrow': return <Hourglass className="h-4 w-4 text-amber-500" />;
      case 'failed': case 'cancelled': case 'refunded': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default: return <AlertCircle className="h-4 w-4 text-zinc-400" />;
    }
  };

  if (orgLoading) return <NoOrgState label="Loading organization…" />;
  if (!activeOrg) return <NoOrgState label="No organization selected" hint="Select or create an organization to view reports." />;

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

          {/* Real Stats (bound to financials endpoint) */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {plLoading ? <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /> :
                <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Portfolio Value</p>}
              <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{pl ? `₦${Math.round(pl.totalRevenue).toLocaleString('en-NG')}` : '—'}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Collections</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{pl ? `₦${Math.round(pl.totalRevenue).toLocaleString('en-NG')}` : '—'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pl ? `${pl.unitCount || 0} units` : '—'}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Net Profit</p>
              <p className={`mt-1 text-2xl font-bold font-mono ${pl && pl.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {pl ? `${pl.netProfit >= 0 ? '+' : ''}₦${Math.round(pl.netProfit).toLocaleString('en-NG')}` : '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pl ? `${pl.margin ?? 0}% margin` : '—'}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Growth</p>
              <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {pl && pl.monthlyTrend && pl.monthlyTrend.length >= 2
                  ? (() => { const f = pl.monthlyTrend[0]?.revenue || 1; const l = pl.monthlyTrend[pl.monthlyTrend.length - 1]?.revenue || 0; return `+${Math.round(((l - f) / f) * 100)}%`; })()
                  : '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">month over month</p>
            </div>
          </div>

          {/* Charts bound to real data */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 flex items-center gap-2 font-heading font-bold text-zinc-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                Revenue Trend (6 months)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 flex items-center gap-2 font-heading font-bold text-zinc-900 dark:text-white">
                <PieChart className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                Revenue Composition
              </h2>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {pieData.map((_, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No revenue composition data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent transactions table bound to real txns */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-heading font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Recent Transactions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Transactions</th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Amount (₦)</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txnsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
                        <td className="p-4"><div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /></td>
                        <td className="p-4 text-right"><div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ml-auto" /></td>
                        <td className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /></td>
                      </tr>
                    ))
                  ) : txns.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">No recent transactions — transactions appear once collections or disbursements are processed.</td></tr>
                  ) : (
                    txns.map((r) => (
                      <tr key={r.id} className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-shrink-0">{statusIcon(r.status)}</div>
                            <div>
                              <span className="font-medium text-zinc-900 dark:text-white">{r.description}</span>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.reference || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-zinc-900 dark:text-white">₦{Number(r.amount).toLocaleString('en-NG')}</td>
                        <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</td>
                      </tr>
                    ))
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
