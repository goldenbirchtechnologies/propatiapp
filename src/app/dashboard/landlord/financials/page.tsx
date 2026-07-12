'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function LandlordFinancialsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Financials</h1>
          <p className="text-muted-foreground">Overview of income, expenses, and payout history.</p>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">Unable to load page</p>
            <p className="text-destructive text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive"
            >
              Retry
            </button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financials</h1>
            <p className="text-muted-foreground mt-1">Overview of income, expenses, and payout history.</p>
          </div>
          <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success">
            Export Report
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Income"
            value="₦2,450,000"
            icon={<DollarSign className="h-5 w-5" />}
            trend="+12.5% vs last month"
            trendPositive
          />
          <StatCard
            label="Expenses"
            value="₦320,000"
            icon={<TrendingUp className="h-5 w-5" />}
            trend="-3.2% vs last month"
            trendPositive
          />
          <StatCard
            label="Pending Payouts"
            value="₦180,000"
            icon={<AlertCircle className="h-5 w-5" />}
            trend="Settlement in 2 days"
            trendPositive={false}
          />
        </div>

        {/* List Skeleton */}
        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" className="border-border">
                <th className="text-left p-4 text-sm font-medium" className="text-muted-foreground">Description</th>
                <th className="text-left p-4 text-sm font-medium" className="text-muted-foreground">Category</th>
                <th className="text-right p-4 text-sm font-medium" className="text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium" className="text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium" className="text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b" className="border-border">
                  <td className="p-4">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted/30" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted/30" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted/30" />
                  </td>
                  <td className="p-4">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted/30" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        <div className="hidden rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-primary">No financial records yet</h3>
          <p className="mt-1 text-on-surface-variant">Transactions and payouts will appear here as they occur.</p>
        </div>
      </section>
    </DashboardShell>
  );
}

function StatCard({ label, value, icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend: string; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" className="text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading font-bold" className="text-primary">{value}</p>
        </div>
        <div className="rounded-xl p-3" className="bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trend}
        </span>
      </div>
    </div>
  );
}
