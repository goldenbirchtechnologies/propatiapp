'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Download, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface PLData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  revenueBreakdown: { label: string; amount: number }[];
  expenseBreakdown: { label: string; amount: number }[];
  monthlyTrend: { month: string; revenue: number; expenses: number; profit: number }[];
  unitCount: number;
  occupiedUnits: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  hasData: boolean;
}

function StatCardSkeleton() {
  return (
    <div className="card p-4" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <div className="space-y-2">
        <div className="rounded" style={{ height: 11, width: '55%', background: 'border-border' }} />
        <div className="rounded" style={{ height: 28, width: '45%', background: 'border-border' }} />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'border-border', animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'border-border' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'border-border' }} /></td>
    </tr>
  );
}

function formatNaira(amount: number) {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}K`;
  return `₦${amount.toLocaleString()}`;
}

function formatNairaFull(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export default function EstateManagerFinancialsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState('month');
  const [pl, setPL] = useState<PLData | null>(null);
  const [noOrg, setNoOrg] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard/estate-manager/financials');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (cancelled) return;

        if (json.noOrg) {
          setNoOrg(true);
          setPL(null);
        } else {
          setNoOrg(false);
          setPL(json.pl);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to load financials'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const retry = () => {
    setError(null);
    setLoading(true);
  };

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Financials</h1>
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Profit and loss summary</p>
              </div>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
              <p className="text-destructive font-medium mb-1">Unable to load financials</p>
              <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
              <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: 'p-4 p-6' }}>Retry</button>
            </div>
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  const isEmpty = !loading && !error && !noOrg && pl && !pl.hasData;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Financials</h1>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Profit and loss summary</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="inp-field" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ maxWidth: '180px' }}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-outline inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-4 space-y-3">
                <div className="rounded" style={{ height: 18, width: 120, background: 'border-border' }} />
                {[1, 2, 3].map((i) => <RowSkeleton key={i} />)}
              </div>
              <div className="card p-4 space-y-3">
                <div className="rounded" style={{ height: 18, width: 120, background: 'border-border' }} />
                {[1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)}
              </div>
            </div>
            <div className="card p-6">
              <div className="rounded mb-4" style={{ height: 18, width: 140, background: 'border-border' }} />
              <div className="rounded-lg" style={{ height: 256, background: 'border-border', opacity: 0.3 }} />
            </div>
          </>
        ) : noOrg ? (
          <div className="rounded-lg border border-border bg-muted/5 p-8 text-center">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium" style={{ color: 'text-primary' }}>No organisation linked</p>
            <p className="text-xs text-muted-foreground mt-1">Create or join an organisation to see financial summaries.</p>
          </div>
        ) : isEmpty ? (
          <div className="rounded-lg border border-border bg-muted/5 p-8 text-center">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium" style={{ color: 'text-primary' }}>No financial data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add units, generate service charges, and record allocations to see your P&L.</p>
          </div>
        ) : pl ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-success" />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Total Revenue</p>
                </div>
                <p className="text-2xl font-bold text-success">{formatNaira(pl.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pl.pendingPayments > 0 ? `${pl.pendingPayments} pending · ${formatNaira(pl.pendingPaymentsAmount)}` : 'All collections settled'}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Total Expenses</p>
                </div>
                <p className="text-2xl font-bold text-destructive">{formatNaira(pl.totalExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pl.unitCount > 0 ? `${pl.unitCount} units managed` : 'Based on allocations'}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" style={{ color: 'text-info' }} />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Net Profit</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{formatNaira(pl.netProfit)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pl.occupiedUnits} occupied units</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4" style={{ color: 'text-muted-foreground' }} />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Profit Margin</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{pl.margin}%</p>
                <p className="text-xs text-muted-foreground mt-1">Based on billed revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'border-border' }}>
                  <h3 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Revenue Breakdown</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'border-border' }}>
                      <th className="text-left p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Source</th>
                      <th className="text-right p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Amount</th>
                      <th className="text-right p-4 text-xs font-label-md uppercase tracking-wider hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pl.revenueBreakdown.map((row, i) => {
                      const total = pl.totalRevenue || 1;
                      const share = ((row.amount / total) * 100).toFixed(1);
                      return (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'border-border' }}>
                          <td className="p-4 text-sm" style={{ color: 'text-primary' }}>{row.label}</td>
                          <td className="p-4 text-sm font-medium text-right text-success">{formatNairaFull(row.amount)}</td>
                          <td className="p-4 text-sm text-right hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>{share}%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b" style={{ borderColor: 'border-border' }}>
                      <td className="p-4 text-sm font-bold" style={{ color: 'text-primary' }}>Total Revenue</td>
                      <td className="p-4 text-sm font-bold text-right text-success">{formatNairaFull(pl.totalRevenue)}</td>
                      <td className="p-4 text-sm font-bold text-right hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'border-border' }}>
                  <h3 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Expense Breakdown</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'border-border' }}>
                      <th className="text-left p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Category</th>
                      <th className="text-right p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Amount</th>
                      <th className="text-right p-4 text-xs font-label-md uppercase tracking-wider hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pl.expenseBreakdown.map((row, i) => {
                      const total = pl.totalExpenses || 1;
                      const share = ((row.amount / total) * 100).toFixed(1);
                      return (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'border-border' }}>
                          <td className="p-4 text-sm" style={{ color: 'text-primary' }}>{row.label}</td>
                          <td className="p-4 text-sm font-medium text-right text-destructive">{formatNairaFull(row.amount)}</td>
                          <td className="p-4 text-sm text-right hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>{share}%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b" style={{ borderColor: 'border-border' }}>
                      <td className="p-4 text-sm font-bold" style={{ color: 'text-primary' }}>Total Expenses</td>
                      <td className="p-4 text-sm font-bold text-right text-destructive">{formatNairaFull(pl.totalExpenses)}</td>
                      <td className="p-4 text-sm font-bold text-right hidden sm:table-cell" style={{ color: 'text-muted-foreground' }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Profit Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2 border border-border rounded-lg p-4">
                {pl.monthlyTrend.map((m) => {
                  const maxVal = Math.max(...pl.monthlyTrend.map(t => Math.max(t.revenue, t.expenses, 1)), 1);
                  const revenueHeight = Math.max(8, (m.revenue / maxVal) * 100);
                  const expenseHeight = Math.max(8, (m.expenses / maxVal) * 100);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-1 justify-center" style={{ height: 200 }}>
                        <div
                          className="w-2 rounded-t bg-success/80"
                          style={{ height: `${revenueHeight}%` }}
                          title={`Revenue: ${formatNaira(m.revenue)}`}
                        />
                        <div
                          className="w-2 rounded-t bg-destructive/80"
                          style={{ height: `${expenseHeight}%` }}
                          title={`Expenses: ${formatNaira(m.expenses)}`}
                        />
                      </div>
                      <span className="text-[10px] font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-success/80" />
                  <span className="text-xs text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-destructive/80" />
                  <span className="text-xs text-muted-foreground">Expenses</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
