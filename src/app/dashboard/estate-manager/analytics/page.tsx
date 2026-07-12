'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockMonthlyData = [
  { month: 'Jan', occupancy: 82, collection: 38 },
  { month: 'Feb', occupancy: 85, collection: 40 },
  { month: 'Mar', occupancy: 78, collection: 36 },
  { month: 'Apr', occupancy: 88, collection: 42 },
  { month: 'May', occupancy: 87, collection: 41 },
  { month: 'Jun', occupancy: 90, collection: 44 },
];

const mockUnitDistribution = [
  { label: '1BR', count: 24 },
  { label: '2BR', count: 36 },
  { label: '3BR', count: 18 },
  { label: '4BR+', count: 12 },
];

const recentTransactions = [
  { id: '1', unit: 'Block A - 101', tenant: 'Mr. Adebayo Okon', amount: 1800000, date: '2026-06-20' },
  { id: '2', unit: 'Block B - 204', tenant: 'Mrs. Chioma Nwankwo', amount: 2200000, date: '2026-06-19' },
  { id: '3', unit: 'Block C - 301', tenant: 'Dr. Emeka Obi', amount: 3500000, date: '2026-06-18' },
  { id: '4', unit: 'Block A - 105', tenant: 'Ms. Aisha Bello', amount: 1600000, date: '2026-06-17' },
  { id: '5', unit: 'Block D - 402', tenant: 'Mr. Tunde Bakare', amount: 2100000, date: '2026-06-16' },
];

export default function EstateManagerAnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
              <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Analytics</h1>
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>Portfolio performance and financial insights</p>
            </div>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
            <p className="text-destructive font-medium mb-1">Unable to load analytics</p>
            <p className="text-sm text-on-surface-variant mb-3">{error.message}</p>
            <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: 'p-4 p-6' }}>Retry</button>
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
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Analytics</h1>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>Portfolio performance and financial insights</p>
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-4" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
                  <div className="space-y-2">
                    <div className="rounded" style={{ height: 11, width: '55%', background: 'border-outline-variant' }} />
                    <div className="rounded" style={{ height: 28, width: '45%', background: 'border-outline-variant' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="rounded mb-4" style={{ height: 18, width: 140, background: 'border-outline-variant' }} />
                <div className="rounded-lg" style={{ height: 256, background: 'border-outline-variant', opacity: 0.3 }} />
              </div>
              <div className="card p-6">
                <div className="rounded mb-4" style={{ height: 18, width: 140, background: 'border-outline-variant' }} />
                <div className="rounded-lg" style={{ height: 256, background: 'border-outline-variant', opacity: 0.3 }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Portfolio Value</p>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>₦1.2B</p>
                <p className="text-xs text-success mt-1">+4.2% vs last month</p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Active Units</p>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>90</p>
                <p className="text-xs text-success mt-1">78% occupancy</p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Monthly Collections</p>
                <p className="text-2xl font-bold text-success">₦42M</p>
                <p className="text-xs text-success mt-1">+7.1% vs last month</p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Avg Rent / Unit</p>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>₦1.8M</p>
                <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-on-surface-variant' }}>Gross rental yield</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Collection Trend</h3>
                <div className="h-64 flex items-center justify-center border border-outline-variant border-dashed rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-on-surface-variant' }} />
                    <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Monthly collection trend</p>
                    <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-on-surface-variant' }}>Hook chart library here</p>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Occupancy Trend</h3>
                <div className="h-64 flex items-center justify-center border border-outline-variant border-dashed rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-on-surface-variant' }} />
                    <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Occupancy rate trend</p>
                    <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-on-surface-variant' }}>Hook chart library here</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Unit Distribution</h3>
                <div className="h-64 flex items-center justify-center border border-outline-variant border-dashed rounded-lg">
                  <div className="text-center">
                    <PieChartIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-on-surface-variant' }} />
                    <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Unit type breakdown</p>
                    <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-on-surface-variant' }}>Hook chart library here</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-3">
                      {mockUnitDistribution.map((u) => (
                        <span key={u.label} className="inline-flex items-center gap-1 text-xs font-label-md uppercase tracking-wider px-2 py-1 rounded-full bg-muted" style={{ color: 'text-primary' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: 'text-primary' }} />
                          {u.label}: {u.count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Revenue vs Expenses</h3>
                <div className="h-64 flex items-center justify-center border border-outline-variant border-dashed rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-on-surface-variant' }} />
                    <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Revenue vs expenses chart</p>
                    <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-on-surface-variant' }}>Hook chart library here</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'border-outline-variant' }}>
                <h3 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Recent Transactions</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'border-outline-variant' }}>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Unit</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Tenant</th>
                    <th className="text-right p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Amount</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((r) => (
                    <tr key={r.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'border-outline-variant' }}>
                      <td className="p-4 text-sm" style={{ color: 'text-primary' }}>{r.unit}</td>
                      <td className="p-4 text-sm" style={{ color: 'text-on-surface-variant' }}>{r.tenant}</td>
                      <td className="p-4 text-sm font-medium text-right" style={{ color: 'text-primary' }}>₦{r.amount.toLocaleString()}</td>
                      <td className="p-4 text-sm" style={{ color: 'text-primary' }}>
                        {new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
