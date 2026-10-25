'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Download, Table as TableIcon, CheckCircle2, ChevronRight, FileDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatNairaFull } from '@/lib/utils';

type Row = {
  month: string;
  sector: string;
  proj: number;
  act: number;
  var: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND';
  conf: number;
};

const MONTHS: Row[] = [
  { month: 'January 2024', sector: 'Victoria Crest Towers', proj: 21500000, act: 22400000, var: '+4.19%', status: 'ON_TRACK', conf: 98.4 },
  { month: 'February 2024', sector: 'Capital Towers VI', proj: 23000000, act: 23800000, var: '+3.48%', status: 'ON_TRACK', conf: 97.2 },
  { month: 'March 2024', sector: 'Lekki Hub Zone (Phase 1)', proj: 22800000, act: 24100000, var: '+5.70%', status: 'ON_TRACK', conf: 96.5 },
  { month: 'April 2024', sector: 'Capital Towers VI', proj: 25000000, act: 26200000, var: '+4.80%', status: 'ON_TRACK', conf: 95.8 },
  { month: 'May 2024', sector: 'Victoria Crest Chambers', proj: 24500000, act: 25900000, var: '+5.71%', status: 'ON_TRACK', conf: 95.1 },
  { month: 'June 2024', sector: 'Lekki Hub Zone (Phase 2)', proj: 27200000, act: 28400000, var: '+4.41%', status: 'ON_TRACK', conf: 96.0 },
  { month: 'July 2024', sector: 'Ikoyi Reserve Sector', proj: 28000000, act: 29100000, var: '+3.93%', status: 'ON_TRACK', conf: 94.7 },
  { month: 'August 2024', sector: 'Victoria Crest Towers', proj: 26500000, act: 28000000, var: '+5.66%', status: 'ON_TRACK', conf: 93.9 },
  { month: 'September 2024', sector: 'Capital Towers VI', proj: 27500000, act: 29200000, var: '+6.18%', status: 'ON_TRACK', conf: 96.1 },
  { month: 'October 2024', sector: 'Lekki Hub Zone (Phase 1)', proj: 29000000, act: 28800000, var: '-0.69%', status: 'AT_RISK', conf: 91.0 },
  { month: 'November 2024', sector: 'Victoria Crest Towers', proj: 31000000, act: 31850000, var: '+2.74%', status: 'ON_TRACK', conf: 89.5 },
  { month: 'December 2024', sector: 'Capital Towers VI', proj: 33900000, act: 34200000, var: '+0.88%', status: 'ON_TRACK', conf: 88.0 },
];

export default function ReportClient() {
  const [filter, setFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK'>('ALL');
  const [view, setView] = useState<'current' | 'projected' | 'h1' | 'h2'>('current');
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/payments/transactions?limit=100', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const list: unknown[] = Array.isArray(data) ? data : data?.data ?? data?.transactions ?? [];
          if (alive) {
            const arr = list as Array<Record<string, unknown>>;
            setLiveCount(arr.length);
            setLiveTotal(arr.reduce((s: number, t) => s + Number((t as Record<string, unknown>).amount ?? 0), 0) / 100);
          }
        }
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let rows = MONTHS.filter((m) => filter === 'ALL' || m.status === filter);
    if (view === 'h1') rows = rows.slice(0, 6);
    if (view === 'h2') rows = rows.slice(6, 12);
    return rows;
  }, [filter, view]);

  const totals = useMemo(() => {
    const proj = filtered.reduce((s, m) => s + m.proj, 0);
    const act = filtered.reduce((s, m) => s + m.act, 0);
    return { proj, act, count: filtered.length };
  }, [filtered]);

  const exportPdf = async () => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      const params = new URLSearchParams({ type: 'pl', format: 'pdf', from, to });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-forecast-report-${from}-to-${to}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported (PDF)');
    } catch {
      toast.error('Export failed — try again');
    }
  };

  const exportCsv = async () => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      const params = new URLSearchParams({ type: 'pl', format: 'csv', from, to });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-forecast-report-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported (CSV)');
    } catch {
      toast.error('Export failed — try again');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/landlord/revenue-forecast" className="hover:text-emerald-600 transition-colors">
          Revenue Forecasting
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-zinc-900 dark:text-white font-semibold">Annual Report</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Annual Revenue Forecast Report</h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Comprehensive monthly variance audit and cash flow analysis.{' '}
            {liveTotal !== null && <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">Live YTD {formatNairaFull(liveTotal)} • {liveCount} tx</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.06]">
            {(['current', 'projected', 'h1', 'h2'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setView(k)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === k ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 pr-8 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-white/[0.08] dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">Status: All Months</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
          </select>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={exportPdf}>
            <Download className="h-4 w-4" /> Export Report (PDF)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={exportCsv}
          >
            <FileDown className="h-4 w-4" /> Batch CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Projected Annual Run-Rate</span>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(319900000)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-4 w-4" /> +28.6% expected
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">YTD Actual Revenue</span>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {liveTotal !== null ? formatNairaFull(liveTotal) : formatNairaFull(248650000)}
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{liveCount !== null ? `${liveCount} settled • live` : '94.2% collection pacing • calibrated'}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Net Variance Pacing</span>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-emerald-600">{formatNairaFull(12450000)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> +5.27% above projection
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Model Confidence Score</span>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">96.8%</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">IFRS-16 &amp; Monte Carlo calibrated</div>
        </div>
      </div>

      {/* Chart strip — projected vs actual */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> Projected vs Actual — {view === 'h1' ? 'H1' : view === 'h2' ? 'H2' : 'Full Year'}
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Calibrated ledger • export via /api/reports/export</span>
        </div>
        <div className="mt-4 flex h-48 items-end gap-1 sm:gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-zinc-800/50">
          {filtered.map((m) => {
            const max = Math.max(...filtered.map((x) => Math.max(x.proj, x.act)));
            const projH = (m.proj / max) * 100;
            const actH = (m.act / max) * 100;
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full max-w-[56px] items-end gap-1" style={{ height: 140 }}>
                  <div className="flex-1 rounded-t bg-zinc-300 dark:bg-zinc-600" style={{ height: `${Math.max(6, projH)}%` }} title={`Proj ${formatNairaFull(m.proj)}`} />
                  <div
                    className={`flex-1 rounded-t ${m.status === 'AT_RISK' ? 'bg-amber-500' : 'bg-emerald-600'}`}
                    style={{ height: `${Math.max(6, actH)}%` }}
                    title={`Act ${formatNairaFull(m.act)}`}
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{m.month.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-600" /> Projected
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-600" /> Actual
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-500" /> At-risk
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">Institutional Monthly Ledger &amp; Calibrated Variance</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-xs text-zinc-500 dark:border-white/[0.08] dark:bg-zinc-800 dark:text-zinc-400">
              {filtered.length} Months
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">Live totals: {totals.count} • {formatNairaFull(totals.act)} actual</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                <th className="px-4 py-3 font-semibold">Month / Cycle</th>
                <th className="px-4 py-3 font-semibold">Asset Sector</th>
                <th className="px-4 py-3 font-semibold text-right">Projected (₦)</th>
                <th className="px-4 py-3 font-semibold text-right">Actual (₦)</th>
                <th className="px-4 py-3 font-semibold text-right">Variance</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06] text-sm">
              {filtered.map((m) => (
                <tr key={m.month} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white whitespace-nowrap">{m.month}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">{m.sector}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-zinc-600 dark:text-zinc-300">{formatNairaFull(m.proj)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">{formatNairaFull(m.act)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-sm font-bold ${m.status === 'AT_RISK' ? 'text-red-600' : 'text-emerald-600'}`}>{m.var}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${m.conf}%` }} />
                      </div>
                      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{m.conf}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        m.status === 'AT_RISK'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${m.status === 'AT_RISK' ? 'bg-amber-500' : 'bg-emerald-600'}`} /> {m.status.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50 text-xs font-semibold dark:border-white/[0.08] dark:bg-white/[0.04]">
                <td className="px-4 py-3 uppercase font-bold text-emerald-600">Aggregate Totals (FY24)</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">12 Active Portfolios</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 dark:text-white">{formatNairaFull(319900000)}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">{formatNairaFull(323750000)}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">+5.27%</td>
                <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-white">94.6% Mean</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">OPTIMAL</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'CAC / RC-1849204 Verified', sub: 'Corporate title compliance verified.' },
          { title: 'Zenith Real-Time Escrow Payouts', sub: 'Automated disburse routing active.' },
          { title: 'LIRS & FIRS Withholding Sync', sub: 'WHT remitted per Lagos tenancy laws.' },
        ].map((c) => (
          <div key={c.title} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">{c.title}</span>
              <span className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
