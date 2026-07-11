'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
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

export default function LandlordForecastReportPage() {
  const { user } = useUser();
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
  }, [reportType, format, period]);

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Landlord'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground mt-1">
              Export accountant-ready P&amp;L, balance sheet, and cash-flow reports.
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Period</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={downloadReport}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {loading ? 'Generating…' : `Download ${format.toUpperCase()}`}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Recent reports table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 font-medium">Title</th>
                    <th className="py-3 font-medium">Type</th>
                    <th className="py-3 font-medium">Date</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { title: 'Revenue Forecast', date: '2026-07-05', status: 'Signed', type: 'Forecast' },
                    { title: 'Rent Roll', date: '2026-07-01', status: 'Draft', type: 'Report' },
                    { title: 'Annual Summary', date: '2026-06-30', status: 'Ready', type: 'Annual' },
                  ].map((row) => (
                    <tr key={row.title} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {row.title}
                        </span>
                      </td>
                      <td className="py-3">{row.type}</td>
                      <td className="py-3">{row.date}</td>
                      <td className="py-3">
                        <Badge variant={row.status === 'Signed' ? 'default' : 'secondary'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          className="gap-2 h-8"
                          onClick={downloadReport}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
