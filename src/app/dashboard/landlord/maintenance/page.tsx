'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Wrench, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function LandlordMaintenancePage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground">Track and manage maintenance requests across your properties.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground mt-1">Track and manage maintenance requests across your properties.</p>
          </div>
          <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success">
            New Request
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Open Requests"
            value="12"
            icon={<AlertCircle className="h-5 w-5" />}
            trend="4 urgent"
            trendPositive={false}
          />
          <StatCard
            label="In Progress"
            value="8"
            icon={<Clock className="h-5 w-5" />}
            trend="2 scheduled for today"
            trendPositive
          />
          <StatCard
            label="Completed"
            value="45"
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend="+3 this week"
            trendPositive
          />
        </div>

        {/* Loading / List Skeleton */}
        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="$1 $2">
                  <th className="$1 $2">Property</th>
                  <th className="$1 $2">Issue</th>
                  <th className="$1 $2">Status</th>
                  <th className="$1 $2">Date</th>
                  <th className="$1 $2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((i) => (
                  <tr key={i} className="$1 $2">
                    <td className="p-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted/30" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted/30" />
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-muted/30" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="ml-auto h-8 w-16 animate-pulse rounded bg-muted/30" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State (placeholder below skeleton when data loads) */}
        <div className="hidden rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
            <Wrench className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-primary">No maintenance requests</h3>
          <p className="mt-1 text-on-surface-variant">Maintenance requests will appear here once tenants submit them.</p>
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
          <p className="$1 $2">{label}</p>
          <p className="$1 $2">{value}</p>
        </div>
        <div className="$1 $2">
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
