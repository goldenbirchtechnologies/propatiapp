'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Download, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const mockPL = {
  totalRevenue: 185000000,
  totalExpenses: 122000000,
  netProfit: 63000000,
  margin: 34.1,
  revenueBreakdown: [
    { label: 'Rental Income', amount: 158000000 },
    { label: 'Service Charges', amount: 20000000 },
    { label: 'Other Income', amount: 7000000 },
  ],
  expenseBreakdown: [
    { label: 'Maintenance', amount: 45000000 },
    { label: 'Utilities', amount: 32000000 },
    { label: 'Salaries', amount: 28000000 },
    { label: 'Insurance', amount: 12000000 },
    { label: 'Other Expenses', amount: 5000000 },
  ],
  monthlyTrend: [
    { month: 'Jan', revenue: 28, expenses: 19, profit: 9 },
    { month: 'Feb', revenue: 29, expenses: 20, profit: 9 },
    { month: 'Mar', revenue: 30, expenses: 21, profit: 9 },
    { month: 'Apr', revenue: 31, expenses: 20, profit: 11 },
    { month: 'May', revenue: 33, expenses: 21, profit: 12 },
    { month: 'Jun', revenue: 34, expenses: 21, profit: 13 },
  ],
};

function StatCardSkeleton() {
  return (
    <div className="card p-4" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <div className="space-y-2">
        <div className="rounded" style={{ height: 11, width: '55%', background: 'var(--border)' }} />
        <div className="rounded" style={{ height: 28, width: '45%', background: 'var(--border)' }} />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)', animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'var(--border)' }} /></td>
    </tr>
  );
}

export default function EstateManagerFinancialsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState('month');

  useState(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  });

  const retry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 700);
  };

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
                Financials
              </h1>
              <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
                Profit and loss summary
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
            <p className="text-destructive font-medium mb-1">Unable to load financials</p>
            <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-sm) var(--space-lg)' }}>
              Retry
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              Financials
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Profit and loss summary
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="inp-field" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ maxWidth: '180px' }}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-outline inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-4 space-y-3">
                <div className="rounded" style={{ height: 18, width: 120, background: 'var(--border)' }} />
                {[1, 2, 3].map((i) => <RowSkeleton key={i} />)}
              </div>
              <div className="card p-4 space-y-3">
                <div className="rounded" style={{ height: 18, width: 120, background: 'var(--border)' }} />
                {[1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)}
              </div>
            </div>
            <div className="card p-6">
              <div className="rounded mb-4" style={{ height: 18, width: 140, background: 'var(--border)' }} />
              <div className="rounded-lg" style={{ height: 256, background: 'var(--border)', opacity: 0.3 }} />
            </div>
          </>
        ) : (
          <>
            {/* P&L Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Revenue</p>
                </div>
                <p className="text-2xl font-bold text-green-600">₦{(mockPL.totalRevenue / 1e6).toFixed(0)}M</p>
                <p className="text-xs text-green-600 mt-1">+5.3% vs last period</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Expenses</p>
                </div>
                <p className="text-2xl font-bold text-red-600">₦{(mockPL.totalExpenses / 1e6).toFixed(0)}M</p>
                <p className="text-xs text-red-600 mt-1">+2.1% vs last period</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Net Profit</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₦{(mockPL.netProfit / 1e6).toFixed(0)}M</p>
                <p className="text-xs text-green-600 mt-1">+12.4% vs last period</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Profit Margin</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockPL.margin}%</p>
                <p className="text-xs text-green-600 mt-1">+2.8pp vs last period</p>
              </div>
            </div>

            {/* Revenue & Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Revenue Breakdown</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Source</th>
                      <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                      <th className="text-right p-4 text-sm font-medium hidden sm:table-cell" style={{ color: 'var(--muted)' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPL.revenueBreakdown.map((row, i) => {
                      const share = ((row.amount / mockPL.totalRevenue) * 100).toFixed(1);
                      return (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{row.label}</td>
                          <td className="p-4 text-sm font-medium text-right text-green-600">₦{row.amount.toLocaleString()}</td>
                          <td className="p-4 text-sm text-right hidden sm:table-cell" style={{ color: 'var(--muted)' }}>{share}%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4 text-sm font-bold" style={{ color: 'var(--text)' }}>Total Revenue</td>
                      <td className="p-4 text-sm font-bold text-right text-green-600">₦{mockPL.totalRevenue.toLocaleString()}</td>
                      <td className="p-4 text-sm font-bold text-right hidden sm:table-cell" style={{ color: 'var(--muted)' }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Expense Breakdown</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Category</th>
                      <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                      <th className="text-right p-4 text-sm font-medium hidden sm:table-cell" style={{ color: 'var(--muted)' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPL.expenseBreakdown.map((row, i) => {
                      const share = ((row.amount / mockPL.totalExpenses) * 100).toFixed(1);
                      return (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{row.label}</td>
                          <td className="p-4 text-sm font-medium text-right text-red-600">₦{row.amount.toLocaleString()}</td>
                          <td className="p-4 text-sm text-right hidden sm:table-cell" style={{ color: 'var(--muted)' }}>{share}%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4 text-sm font-bold" style={{ color: 'var(--text)' }}>Total Expenses</td>
                      <td className="p-4 text-sm font-bold text-right text-red-600">₦{mockPL.totalExpenses.toLocaleString()}</td>
                      <td className="p-4 text-sm font-bold text-right hidden sm:table-cell" style={{ color: 'var(--muted)' }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trend Placeholder */}
            <div className="card p-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Profit Trend</h3>
              <div className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Monthly profit trend chart</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Hook chart library here</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-3">
                    {mockPL.monthlyTrend.map((m) => (
                      <span key={m.month} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                        {m.month}: ₦{m.profit}M
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
