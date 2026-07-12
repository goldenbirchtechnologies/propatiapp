'use client';

import { useState } from 'react';

import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { FileText, Clock, AlertTriangle, Users, Plus } from 'lucide-react';

type LeaseStatus = 'active' | 'pending' | 'expiring_soon' | 'expired' | 'terminated';

interface LeaseRow {
  id: string;
  property: string;
  tenant: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  rent: string;
}

function StatusBadge({ status }: { status: LeaseStatus }) {
  const map: Record<LeaseStatus, string> = {
    active: 'bg-success-bright/10 text-success border-success-bright/20',
    pending: 'bg-primary/10 text-primary border-primary/20',
    expiring_soon: 'bg-warning/10 text-warning border-warning/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
    terminated: 'bg-surface-container text-on-surface-variant border-outline-variant',
  };
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={map[status] || 'bg-surface-container text-on-surface-variant border-outline-variant'}>{label}</span>;
}

export default function LandlordLeasesPage() {
  const [error, setError] = useState<string | null>(null);
  const [leases] = useState<LeaseRow[]>([
    {
      id: '1',
      property: 'Lekki Phase 1 Duplex',
      tenant: 'Adebayo Ogundimu',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      rent: '₦3,500,000/yr',
    },
    {
      id: '2',
      property: 'Victoria Island Apartment',
      tenant: 'Fatima Bello',
      status: 'expiring_soon',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      rent: '₦4,200,000/yr',
    },
    {
      id: '3',
      property: 'Ikeja GRA Flat',
      tenant: 'Chukwuemeka Nnamdi',
      status: 'pending',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      rent: '₦2,800,000/yr',
    },
  ]);

  if (error) {
    return (
      
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Leases</h1>
          <p className="text-muted-foreground">
            Overview of lease agreements, expiry dates, and tenant details.
          </p>
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">Unable to load page</p>
            <p className="text-destructive text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90"
            >
              Retry
            </button>
          </div>
        </section>
      
    );
  }

  const stats = {
    total: leases.length,
    active: leases.filter((l) => l.status === 'active').length,
    expiringSoon: leases.filter((l) => l.status === 'expiring_soon').length,
    expired: leases.filter((l) => l.status === 'expired').length,
  };

  return (
    
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leases</h1>
            <p className="text-muted-foreground mt-1">
              Overview of lease agreements, expiry dates, and tenant details.
            </p>
          </div>
          <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90">
            <Plus className="h-4 w-4 inline mr-2" />
            New Lease
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Active Leases" value={String(stats.active)} icon={<FileText className="h-5 w-5" />} trend="Currently signed" trendPositive />
          <StatCard label="Expiring Soon" value={String(stats.expiringSoon)} icon={<Clock className="h-5 w-5" />} trend="Within 30 days" trendPositive={false} />
          <StatCard label="Expired / Terminated" value={String(stats.expired)} icon={<AlertTriangle className="h-5 w-5" />} trend="Needs attention" trendPositive={false} />
        </div>

        {/* Leases Table Skeleton (shown during loading) */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Property</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Tenant</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Start Date</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">End Date</th>
                  <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Rent</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-outline-variant">
                    <td className="p-4"><div className="h-4 w-40 animate-pulse rounded bg-surface-container" /></td>
                    <td className="p-4"><div className="h-4 w-36 animate-pulse rounded bg-surface-container" /></td>
                    <td className="p-4"><div className="h-6 w-24 animate-pulse rounded-full bg-surface-container" /></td>
                    <td className="p-4"><div className="h-4 w-28 animate-pulse rounded bg-surface-container" /></td>
                    <td className="p-4"><div className="h-4 w-28 animate-pulse rounded bg-surface-container" /></td>
                    <td className="p-4 text-right"><div className="ml-auto h-4 w-28 animate-pulse rounded bg-surface-container" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State (hidden by default) */}
        <div className="hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-primary">No leases found</h3>
          <p className="mt-1 text-on-surface-variant">Lease agreements will appear here once created.</p>
        </div>

        {/* Actual Data Table (hidden when loading) */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Property</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Tenant</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Start Date</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">End Date</th>
                  <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Rent</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id} className="border-b border-outline-variant">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-primary">{lease.property}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gradient-to-br from-primary to-accent">
                          {lease.tenant.charAt(0)}
                        </div>
                        <p className="font-medium text-primary">{lease.tenant}</p>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={lease.status} /></td>
                    <td className="p-4 text-sm text-on-surface-variant">{new Date(lease.startDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{new Date(lease.endDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-right font-headline-sm text-headline-sm font-bold text-primary text-primary">{lease.rent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    
  );
}

function StatCard({ label, value, icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend: string; trendPositive?: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">{label}</p>
          <p className="font-headline-md text-headline-md text-primary">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className="text-xs font-medium text-success">
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className="text-xs text-success">
          {trend}
        </span>
      </div>
    </div>
  );
}
