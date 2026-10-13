'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Download,
  UserPlus,
  UserCheck,
  Clock,
  Bell,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { useTenants } from '@/hooks/useTenants';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Real status values from the API route ───
// 'active' | 'pending' | 'notice_period'
const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'notice_period', label: 'Notice Period' },
] as const;

const STATUS_META: Record<string, { label: string; cls: string }> = {
  active: {
    label: 'Active',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  pending: {
    label: 'Pending',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  notice_period: {
    label: 'Notice Period',
    cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  },
};

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const SELECT =
  'w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3.5 pr-8 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';
const TH = 'px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

function formatLeaseEnd(value: string): string {
  if (!value || value === '-') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Lease ending within 60 days
function daysUntil(value: string): number | null {
  if (!value || value === '-') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export default function EstateManagerTenantsPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();
  const { data, isLoading, error, refetch, isFetching } = useTenants(orgId ?? '');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const tenants = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenants.filter((t) => {
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesQuery =
        !q ||
        [t.name, t.email, t.unit].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [tenants, query, statusFilter]);

  // Stats derived from real tenant records
  const activeCount = tenants.filter((t) => t.status === 'active').length;
  const pendingCount = tenants.filter((t) => t.status === 'pending').length;
  const noticeCount = tenants.filter((t) => t.status === 'notice_period').length;
  const expiringSoon = tenants.filter((t) => {
    const d = daysUntil(t.leaseEnd);
    return d !== null && d > 0 && d <= 60;
  }).length;

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Unit', 'Status', 'Lease End'];
    const rows = filtered.map((t) => [t.name, t.email, t.unit, t.status, t.leaseEnd]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants-${organization?.name ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (orgLoading || (isLoading && tenants.length === 0)) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <NoOrgState
          title="No Organization"
          description="Tenants are scoped to an organization. Create one to start managing tenancies."
          actionLabel="Create Organization"
          actionHref="/dashboard/estate-manager/organizations/new"
        />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load tenants</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  const Kpi = ({ icon: Icon, label, value, footer, tone = 'default' }: {
    icon: typeof Users;
    label: string;
    value: string | number;
    footer: string;
    tone?: 'default' | 'emerald' | 'amber' | 'sky';
  }) => {
    const toneCls =
      tone === 'emerald'
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : tone === 'amber'
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : tone === 'sky'
            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    return (
      <div className={`${CARD} relative flex flex-col justify-between overflow-hidden`}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL}>{label}</span>
            <span className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</span>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${toneCls}`}>
            <Icon className="h-[22px] w-[22px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <span className={MUTED}>{footer}</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-[1240px] space-y-6 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Tenancy Management
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {organization.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Tenants</h1>
            <p className={`text-sm ${MUTED}`}>
              Manage tenant operations, lease lifecycle milestones, and unit occupancy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download className="h-[18px] w-[18px] text-zinc-400" />
              Export Tenants
            </button>
            <Link
              href="/dashboard/estate-manager/units"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              <UserPlus className="h-[18px] w-[18px]" />
              + Add Tenant
            </Link>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={Users} label="Total Tenants" value={tenants.length} footer={`Across ${organization.name}`} />
          <Kpi icon={UserCheck} label="Active Leases" value={activeCount} footer="Currently in tenancy" tone="emerald" />
          <Kpi icon={Clock} label="Pending Sign-off" value={pendingCount} footer="Awaiting onboarding" tone="amber" />
          <Kpi icon={Bell} label="Notice Period" value={noticeCount} footer={`${expiringSoon} lease${expiringSoon === 1 ? '' : 's'} ending within 60 days`} tone="sky" />
        </div>

        {/* Filters */}
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative min-w-[280px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tenant name, unit, or email..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[150px]">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={SELECT}>
                {STATUS_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-zinc-400" />
            </div>
            {(query || statusFilter !== 'ALL') && (
              <button
                onClick={() => { setQuery(''); setStatusFilter('ALL'); }}
                title="Reset filters"
                className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <RefreshCw className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Table or empty state */}
        {tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-20 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Users className="h-9 w-9 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No tenants registered</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              Tenants appear here once they are assigned to a unit under {organization.name}. Add units and assign
              tenants to populate this directory.
            </p>
            <Link
              href="/dashboard/estate-manager/units"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              <UserPlus className="h-[18px] w-[18px]" /> Add your first tenant
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>Tenant Name</th>
                    <th className={TH}>Assigned Unit</th>
                    <th className={TH}>Contact Email</th>
                    <th className={TH}>Occupancy Status</th>
                    <th className={TH}>Lease End</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No tenants match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const meta = STATUS_META[t.status] ?? STATUS_META.pending;
                      const days = daysUntil(t.leaseEnd);
                      const expiring = days !== null && days > 0 && days <= 60;
                      return (
                        <tr key={t.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                {initialsOf(t.name)}
                              </div>
                              <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {t.unit === '-' ? (
                              <span className={MUTED}>Unassigned</span>
                            ) : (
                              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.unit}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`mailto:${t.email}`}
                              className="truncate text-sm text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400"
                            >
                              {t.email}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{formatLeaseEnd(t.leaseEnd)}</span>
                            {expiring && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                {days}d
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/dashboard/estate-manager/units`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                            >
                              View <ArrowRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{tenants.length}</span> tenants
              </span>
              {isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
