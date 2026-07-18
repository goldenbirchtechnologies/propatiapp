'use client';

import { useState, useMemo } from 'react';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const filtered = useMemo(() => {
    return months.filter(m => m.month.includes(year));
  }, [months, year]);

  const exportSummary = () => {
    const header = 'Month,Total Revenue,Service Charges,Rent Transactions,Net\n';
    const rows = filtered.map(m => `${m.month},${m.totalRevenue},${m.serviceCharges},${m.rentTransactions},${m.net}`).join('\n');
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
          <h1 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Revenue Signature</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>
            {hasRealData ? `Monthly revenue summary for ${orgName || 'your organization'}` : 'Monthly revenue summary (no organization data available)'}
          </p>
        </div>
        {!hasRealData && (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-[10px]">
            Demo Mode
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
            {YEAR_OPTIONS.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={v => setFormat(v as 'csv' | 'json')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={exportSummary}
          className="btn btn-outline inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Total Revenue</p>
          <p className="text-2xl font-bold text-success font-mono">₦{(totalRevenue / 1e6).toFixed(2)}M</p>
        </Card>
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Service Charges</p>
          <p className="text-2xl font-bold text-blue-400 font-mono">₦{(totalServiceCharges / 1e6).toFixed(2)}M</p>
        </Card>
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Rent Transactions</p>
          <p className="text-2xl font-bold text-white font-mono">₦{(totalRent / 1e6).toFixed(2)}M</p>
        </Card>
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Net Signature</p>
          <p className={`text-2xl font-bold font-mono ${totalNet >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalNet >= 0 ? '+' : ''}₦{(totalNet / 1e6).toFixed(2)}M
          </p>
        </Card>
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Avg Transaction</p>
          <p className="text-2xl font-bold text-white font-mono">₦{(avgTransactionAmount / 1000).toFixed(0)}K</p>
          <p className="text-xs text-zinc-400 mt-1">{transactionCount} transactions</p>
        </Card>
        <Card className="p-4 border-white/5 bg-[#0e1726]">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Pending Settlement</p>
          <p className="text-2xl font-bold text-destructive font-mono">₦{(pendingSettlement / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-400 mt-1">Awaiting clearance</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-white/5 bg-[#0e1726]">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Monthly Revenue Signature
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-zinc-400">Month</TableHead>
                <TableHead className="text-right text-zinc-400">Total Revenue</TableHead>
                <TableHead className="text-right text-zinc-400">Service Charges</TableHead>
                <TableHead className="text-right text-zinc-400">Rent Transactions</TableHead>
                <TableHead className="text-right text-zinc-400">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 text-sm py-8">
                    No revenue data found for this year
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.month} className="border-white/5 transition-colors hover:bg-white/[0.02]">
                    <TableCell className="text-white text-sm">{m.month}</TableCell>
                    <TableCell className="text-right text-success font-mono text-sm">₦{m.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-blue-400 font-mono text-sm">₦{m.serviceCharges.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-white font-mono text-sm">₦{m.rentTransactions.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${m.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {m.net >= 0 ? '+' : ''}₦{m.net.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
