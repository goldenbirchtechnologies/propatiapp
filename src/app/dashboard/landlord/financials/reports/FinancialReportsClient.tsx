'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Loader2 } from 'lucide-react';

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

export default function FinancialReportsClient({ userId }: { userId: string }) {
  const [reportType, setReportType] = useState<string>('pl');
  const [format, setFormat] = useState<string>('csv');
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getPeriodDates(period);
      const params = new URLSearchParams({
        type: reportType,
        format,
        from,
        to,
        userId,
      });
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
  }, [reportType, format, period, userId]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">No Organisation Linked</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">KYC REQUIREMENT: attach a verified legal entity before syndicate listings.</p>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-wider">KYC REQUIREMENT</Badge>
                <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/10 text-[10px] uppercase tracking-wider">3 Overdue</Badge>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Revenue Sources and Streams</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Total stable cash inflow: NGN 11,400,000 paid 30-day cycles.</p>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">NGN 11,400,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Operational Expense Allocations</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Quarterly maintenance pool: NGN 28,450,000 on hold.</p>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">NGN 28,450,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Delinquency and Arrears Recovery Desk</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">NGN 11,400,000</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Tenant flagged in LASRERA dispute escalation queue.</p>
            </div>
          </div>
        </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Export accountant-ready P&amp;L, balance sheet, and cash-flow reports.
          </p>
        </div>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={downloadReport} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {loading ? 'Generating…' : `Download ${format.toUpperCase()}`}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}