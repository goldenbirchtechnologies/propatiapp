
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { buildCSV, buildPDFBuffer, type ReportSummary } from '@/lib/reports-service';

type ReportType = 'pl' | 'balance-sheet' | 'cashflow';
type ReportFormat = 'json' | 'csv' | 'pdf';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'pl', label: 'Profit & Loss' },
  { value: 'balance-sheet', label: 'Balance Sheet' },
  { value: 'cashflow', label: 'Cash Flow' },
];

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fmt(n: number) {
  if (Number.isNaN(n)) return '₦0.00';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₦${n < 0 ? `-${formatted}` : formatted}`;
}

function MiniBarChart({ data }: { data: { label: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => Math.abs(d.amount || 0)), 1);
  const chartData = data.slice(-8);
  if (!chartData.length) return <div className="h-40 w-full rounded-xl border border-dashed border-border bg-surface-container-lowest/50" />;

  const counts = [1, 2, 4].map((n) => (chartData.length / n));
  const barWidth = 18;
  const gap = chartData.length > 1 ? Math.min(28, 300 / chartData.length) : 24;
  const width = chartData.length * (barWidth + gap);
  const height = 180;

  return (
    <div className="relative ml-2 rounded-xl border border-border bg-surface-container-lowest p-4 shadow-card">
      <p className="mb-3 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Recent trend</p>
      <svg width={width} height={height} className="overflow-visible">
        <line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke="currentColor" className="text-border" strokeWidth="1" />
        {chartData.map((d, idx) => {
          const h = Math.max(2, (Math.abs(d.amount) / max) * (height - 40));
          const x = idx * (barWidth + gap);
          const y = height - 20 - h;
          return (
            <g key={d.label} className="group">
              <rect x={x} y={y} width={barWidth} height={h} rx={6} className="fill-primary/90 transition-all duration-150 group-hover:fill-primary" />
              <title>{`${d.label}: ${fmt(d.amount)}`}</title>
              {chartData.length <= 8 && (
                <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('pl');
  const [format, setFormat] = useState<ReportFormat>('json');
  const [days, setDays] = useState(30);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = useMemo(() => (customFrom ? customFrom : toISODate(new Date(Date.now() - days * 24 * 60 * 60 * 1000))), [customFrom, customTo, days]);
  const to = useMemo(() => (customTo || toISODate(new Date())), [customTo, customTo]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, from, to, format: 'json' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to load report');
      setReport(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportType, from, to, format]);

  useEffect(() => {
    loadReport();
  }, [reportType, days, customFrom, customTo]);

  const totals = report?.totals || {};
  const lines = report?.lines || [];
  const recentTrend = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const line of lines) {
      const key = line.date;
      byDate[key] = (byDate[key] || 0) + (line.amount || 0);
    }
    return Object.entries(byDate)
      .slice(-8)
      .map(([date, amount]) => ({ label: date.slice(5), amount }));
  }, [lines]);

  const download = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, from, to, format }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to download');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${from}-${to}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  }, [reportType, from, to, format]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION}>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Reports</h1>
            <p className="text-muted-foreground mt-1">Accounting reports, revenue trends, and exports for the platform.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-sm text-foreground"
            >
              {REPORT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ReportFormat)}
              className="rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-sm text-foreground"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={loadReport}
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={download}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-container-low disabled:opacity-50"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-container-lowest p-2">
          {RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => { setDays(range.days); setCustomFrom(''); setCustomTo(''); }}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                days === range.days && !customFrom ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
          <div className="flex items-center gap-2 px-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="rounded-lg border border-border bg-surface-container-lowest px-3 py-1.5 text-sm text-foreground"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="rounded-lg border border-border bg-surface-container-lowest px-3 py-1.5 text-sm text-foreground"
            />
            {(customFrom || customTo) && (
              <button onClick={() => { setCustomFrom(''); setCustomTo(''); }} className="text-xs text-red-500 hover:text-red-600">
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {report && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(totals).slice(0, 4).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border bg-surface-container-lowest p-4 shadow-card">
                  <p className="text-xs font-label-md uppercase tracking-wider text-muted-foreground">{key}</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{fmt(Number(value))}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MiniBarChart data={recentTrend} />
              </div>
              <div className="rounded-xl border border-border bg-surface-container-lowest p-4 shadow-card">
                <p className="text-xs font-label-md uppercase tracking-wider text-muted-foreground">Period summary</p>
                <div className="mt-2 space-y-1 text-sm text-foreground">
                  <p>Type: <span className="font-medium capitalize">{report.type.replace('-', ' ')}</span></p>
                  <p>From: <span className="font-medium">{toISODate(new Date(report.periodFrom))}</span></p>
                  <p>To: <span className="font-medium">{toISODate(new Date(report.periodTo))}</span></p>
                  <p>Generated: <span className="font-medium">{new Date(report.generatedAt).toLocaleString('en-NG')}</span></p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface-container-lowest shadow-card">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[720px] table-auto text-left text-sm">
                  <thead className="sticky top-0 bg-inherit">
                    <tr>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Property</th>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Category</th>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Reference</th>
                      <th className="px-4 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lines.slice(0, 200).map((line, idx) => (
                      <tr key={idx} className="hover:bg-surface-container/60">
                        <td className="px-4 py-2 text-foreground">{line.label}</td>
                        <td className="px-4 py-2 text-muted-foreground">{line.category}</td>
                        <td className="px-4 py-2 text-right font-medium text-foreground">{fmt(line.amount)}</td>
                        <td className="px-4 py-2 text-muted-foreground">{line.date}</td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{line.reference}</td>
                        <td className="px-4 py-2 text-muted-foreground">{line.status || '—'}</td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          No report lines for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!report && !loading && !error && (
          <div className="rounded-xl border border-border bg-surface-container-lowest p-12 text-center shadow-card">
            <p className="text-lg font-medium text-primary">No reports yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Download a report to populate this section.</p>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
