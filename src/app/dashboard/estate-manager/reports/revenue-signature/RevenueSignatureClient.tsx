'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, BarChart3, Calendar, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthSummary {
  month: string;
  totalRevenue: number;
  serviceCharges: number;
  rentTransactions: number;
  net: number;
}

interface RevenueSignatureClientProps {
  months: MonthSummary[];
  totalRevenue: number;
  totalServiceCharges: number;
  totalRent: number;
  totalNet: number;
  hasRealData: boolean;
  orgName?: string | null;
  avgTransactionAmount?: number;
  transactionCount?: number;
  pendingSettlement?: number;
}

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => `${2020 + i}-${String(1 + i).padStart(2, '0')}`);

function ngn(n: number): string {
  return `₦${Math.abs(Math.round(n)).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function RevenueSignatureClient({
  months,
  totalRevenue,
  totalServiceCharges,
  totalRent,
  totalNet,
  hasRealData,
  orgName,
  avgTransactionAmount = 0,
  transactionCount = 0,
  pendingSettlement = 0,
}: RevenueSignatureClientProps) {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const filtered = useMemo(() => months.filter((m) => m.month.includes(year)), [months, year]);

  const maxBar = useMemo(() => Math.max(...filtered.map((m) => m.totalRevenue), 0), [filtered]);
  const maxComponent = useMemo(() => Math.max(...filtered.map((m) => Math.max(m.rentTransactions, m.serviceCharges)), 0), [filtered]);

  const exportSummary = () => {
    const header = 'Month,Total Revenue,Service Charges,Rent Transactions,Net\n';
    const rows = filtered
      .map((m) => `${m.month},${m.totalRevenue},${m.serviceCharges},${m.rentTransactions},${m.net}`)
      .join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-signature-${year}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold text-zinc-900 dark:text-white">Revenue Signature</h1>
          <p className="mt-1 text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            {hasRealData ? `Monthly revenue summary for ${orgName || 'your organization'}` : 'No revenue data — connect a populated organization to generate a signature'}
          </p>
        </div>
        {transactionCount > 0 && (
          <Badge className="bg-primary/10 text-[var(--sovereign-hover)] border-primary dark:border-primary/30 px-3 py-1 text-[10px]">
            {transactionCount} transactions
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
        <button onClick={exportSummary} disabled={filtered.length === 0 || filtered.every((m) => m.totalRevenue === 0)}
          className="btn btn-outline inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {!hasRealData || filtered.every((m) => m.totalRevenue === 0) ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-800/30">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h3 className="font-semibold text-zinc-900 dark:text-white">No revenue data for {year}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Revenue signature appears once rent transactions or service charges exist for the selected year.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary dark:text-[#4edea3]" />
            <h3 className="font-headline-sm font-bold text-zinc-900 dark:text-white">12-Month Revenue Signature</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Stacked composition: Rent transactions vs. service charges. Net shown when revenue &gt; 0.</p>
          <div className="space-y-3">
            {filtered.map((m) => {
              const barW = maxBar ? (m.totalRevenue / maxBar) * 100 : 0;
              const rentH = maxComponent ? (m.rentTransactions / maxComponent) * 100 : 0;
              const scH = maxComponent ? (m.serviceCharges / maxComponent) * 100 : 0;
              const netPositive = m.net >= 0;
              return (
                <div key={m.month} className="flex items-end gap-3">
                  <div className="w-10 text-right text-xs font-mono text-zinc-500 dark:text-zinc-400">{m.month.slice(0, 3)}</div>
                  <div className="relative flex-1">
                    <div className="mb-1 flex h-3 items-end gap-px overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800">
                      <div className="bg-primary transition-all duration-300" style={{ width: `${rentH}%`, height: rentH > 0 ? '100%' : '2%' }} title={`Rent: ${ngn(m.rentTransactions)}`} />
                      <div className="bg-sky-500 transition-all duration-300" style={{ width: `${scH}%`, height: scH > 0 ? '100%' : '2%' }} title={`Service Charges: ${ngn(m.serviceCharges)}`} />
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800">
                      <div className="bg-zinc-300 dark:bg-zinc-700 transition-all duration-300" style={{ width: `${barW}%` }} />
                    </div>
                  </div>
                  <div className={`w-28 text-right font-mono text-sm font-bold ${netPositive ? 'text-primary dark:text-[#4edea3]' : 'text-rose-600 dark:text-rose-400'}`}>
                    {netPositive ? '+' : ''} {ngn(m.totalRevenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Revenue</p>
          <p className="text-2xl font-bold text-[#006c49] font-mono">{ngn(totalRevenue)}</p>
        </div>
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Service Charges</p>
          <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400 font-mono">{ngn(totalServiceCharges)}</p>
        </div>
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Rent Transactions</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{ngn(totalRent)}</p>
        </div>
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Net Signature</p>
          <p className={`text-2xl font-bold font-mono ${totalNet >= 0 ? 'text-[#006c49]' : 'text-red-500'}`}>
            {totalNet >= 0 ? '+' : ''} {ngn(totalNet)}
          </p>
        </div>
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Avg Transaction</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{ngn(avgTransactionAmount || 0)}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{transactionCount || 0} transactions</p>
        </div>
        <div className="glass-card p-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950/50">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Pending Settlement</p>
          <p className="text-2xl font-bold text-red-500 font-mono">{ngn(pendingSettlement || 0)}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Awaiting clearance</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card border-zinc-200 dark:border-white/[0.08]">
        <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <h3 className="font-headline-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            Monthly Revenue Signature
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200 dark:border-white/[0.08] hover:bg-transparent">
                <TableHead className="text-zinc-600 dark:text-zinc-400">Month</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400">Total Revenue</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400">Service Charges</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400">Rent Transactions</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 || filtered.every((m) => m.totalRevenue === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-600 dark:text-zinc-400 text-sm py-8">
                    No revenue data found for this year
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.month} className="border-zinc-200 dark:border-white/[0.08] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <TableCell className="text-sm text-zinc-900 dark:text-white">{m.month}</TableCell>
                    <TableCell className="text-right text-[#006c49] font-mono text-sm">{ngn(m.totalRevenue)}</TableCell>
                    <TableCell className="text-right text-zinc-600 dark:text-zinc-400 font-mono text-sm">-{ngn(m.serviceCharges)}</TableCell>
                    <TableCell className="text-right text-zinc-900 dark:text-white font-mono text-sm">{ngn(m.rentTransactions)}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${m.net >= 0 ? 'text-[#006c49]' : 'text-red-500'}`}>
                      {m.net >= 0 ? '+' : ''} {ngn(m.net)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
