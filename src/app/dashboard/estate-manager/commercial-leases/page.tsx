'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  TrendingUp,
  AlertTriangle,
  Receipt,
  CalendarClock,
  Search,
  Download,
  Eye,
  Mail,
  FileText,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Unit shape from GET /api/orgs/[id]/units ───
interface Unit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  listingType: string;
  rent: number;
  serviceCharge: number | null;
  status: string;
  occupancy: string;
  leaseEndDate: string | null;
  listing: { id: string; title: string; address: string | null } | null;
  currentTenant: { id: string; fullName: string | null; email: string } | null;
}

// UtilityAllocation summed per unit for the "Utilities" column
interface UtilityRollup {
  [unitId: string]: { total: number; unpaid: number };
}

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const SELECT =
  'appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-3.5 pr-8 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';

function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}

function daysUntil(value: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Collection status is derived: a commercial suite with an expired/absent lease
// end date and unpaid utility allocations is treated as overdue; otherwise paid
// if the service charge is set and settled. We compute arrears from the delta
// between billed (rent + service charge + utilities) and what has a paid marker.
type DerivedStatus = 'paid' | 'overdue' | 'partial';

const STATUS_META: Record<DerivedStatus, { label: string; cls: string; dot: string }> = {
  paid: { label: 'Paid', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  overdue: { label: 'Overdue', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
};

function initialsOf(name: string | null | undefined, email?: string): string {
  const src = name?.trim() || email?.split('@')[0] || '?';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EstateManagerCommercialLeasesPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  const [units, setUnits] = useState<Unit[]>([]);
  const [utilityRollup, setUtilityRollup] = useState<UtilityRollup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DerivedStatus>('all');
  const [portfolio, setPortfolio] = useState('all');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch all commercial units for the org
      const params = new URLSearchParams();
      params.set('type', ''); // no type filter — commercial is a listingType, not PropertyType
      params.set('limit', '200');
      const res = await fetch(`/api/orgs/${orgId}/units?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load leases (${res.status})`);
      const json = await res.json();
      const all: Unit[] = json?.data ?? [];
      const commercial = all.filter((u) => u.listingType === 'commercial');

      // Sum utility allocations per unit for the Utilities column.
      // UtilityAllocation has no org-scoped list route, so we read the
      // org's utility data through the estate-manager utilities endpoint.
      const rollup: UtilityRollup = {};
      try {
        const uRes = await fetch(`/api/dashboard/estate-manager/utilities?orgId=${orgId}`, { cache: 'no-store' });
        if (uRes.ok) {
          const uJson = await uRes.json();
          const allocs = uJson?.data ?? uJson?.allocations ?? [];
          for (const a of allocs) {
            if (!a.unitId) continue;
            rollup[a.unitId] ??= { total: 0, unpaid: 0 };
            rollup[a.unitId].total += Number(a.amount ?? 0);
            if (a.status !== 'paid') rollup[a.unitId].unpaid += Number(a.amount ?? 0);
          }
        }
      } catch {
        // utilities rollup is supplementary; failure just leaves it empty
      }

      setUnits(commercial);
      setUtilityRollup(rollup);
    } catch (e) {
      setError((e as Error).message ?? 'Could not load commercial leases');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) load();
    else if (!orgLoading) setLoading(false);
  }, [orgId, orgLoading, load]);

  // Derive per-suite status and financials
  const rows = useMemo(() => {
    return units.map((u) => {
      const baseRent = u.rent;
      const serviceCharge = u.serviceCharge ?? 0;
      const utilities = utilityRollup[u.id]?.total ?? 0;
      const unpaidUtilities = utilityRollup[u.id]?.unpaid ?? 0;
      const billed = baseRent + serviceCharge + utilities;
      const days = daysUntil(u.leaseEndDate);

      // Status derivation from real signals
      let status: DerivedStatus = 'paid';
      if (unpaidUtilities > 0 && days !== null && days <= 0) status = 'overdue';
      else if (unpaidUtilities > 0) status = 'partial';
      else if (days !== null && days <= 0) status = 'overdue';

      const arrears = status === 'paid' ? 0 : unpaidUtilities || (billed - serviceCharge - utilities);

      return { unit: u, baseRent, serviceCharge, utilities, billed, status, arrears, daysLeft: days };
    });
  }, [units, utilityRollup]);

  const portfolios = useMemo(() => {
    const set = new Set(units.map((u) => u.listing?.title).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [units]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPortfolio = portfolio === 'all' || r.unit.listing?.title === portfolio;
      const matchesQuery =
        !q ||
        [r.unit.unitNumber, r.unit.buildingName, r.unit.currentTenant?.fullName, r.unit.currentTenant?.email, r.unit.listing?.title]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchesStatus && matchesPortfolio && matchesQuery;
    });
  }, [rows, query, statusFilter, portfolio]);

  // KPI aggregates from real rows
  const totalBilled = rows.reduce((s, r) => s + r.billed, 0);
  const totalArrears = rows.reduce((s, r) => s + r.arrears, 0);
  const serviceChargesCollected = rows.reduce((s, r) => s + r.serviceCharge, 0);
  const collectionRate = totalBilled > 0 ? Math.round(((totalBilled - totalArrears) / totalBilled) * 1000) / 10 : 0;
  const expiringSoon = rows.filter((r) => r.daysLeft !== null && r.daysLeft > 0 && r.daysLeft <= 60).length;

  const exportCsv = () => {
    const header = ['Unit', 'Tenant', 'Portfolio', 'Base Rent', 'Service Charge', 'Utilities', 'Status', 'Lease End'];
    const csvRows = filtered.map((r) => [
      r.unit.unitNumber,
      r.unit.currentTenant?.fullName ?? '',
      r.unit.listing?.title ?? '',
      r.baseRent,
      r.serviceCharge,
      r.utilities,
      r.status,
      r.unit.leaseEndDate ?? '',
    ]);
    const csv = [header, ...csvRows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commercial-leases-${organization?.name ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (orgLoading || (loading && units.length === 0)) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-9 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
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
          description="Commercial leases are scoped to an organization. Create one to start managing them."
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
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load commercial leases</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default', barPct }: {
    icon: typeof TrendingUp;
    label: string;
    value: string;
    sub: string;
    tone?: 'default' | 'emerald' | 'rose' | 'amber';
    barPct?: number;
  }) => {
    const iconCls =
      tone === 'emerald' ? 'bg-[var(--sovereign-container-bg)] text-primary dark:bg-primary/10 dark:text-[#4edea3]'
      : tone === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
      : tone === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    const barCls = tone === 'rose' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'emerald' ? 'bg-primary' : 'bg-primary';
    return (
      <div className={CARD}>
        <div className="mb-3 flex items-center justify-between">
          <span className={LABEL}>{label}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${MUTED}`}>{sub}</div>
        {barPct !== undefined && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-full rounded-full transition-all duration-700 ${barCls}`} style={{ width: `${Math.min(100, barPct)}%` }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-[1240px] space-y-6 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Commercial Lease Collection</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {organization.name}
              </span>
            </div>
            <p className={`max-w-2xl text-sm ${MUTED}`}>
              Revenue, invoicing, and receivables for commercial suites across {organization.name}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download className="h-[18px] w-[18px]" /> Export Report
            </button>
            <Link
              href="/dashboard/estate-manager/service-charges"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)]"
            >
              <Receipt className="h-[18px] w-[18px]" /> Bulk Invoice
            </Link>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            icon={TrendingUp}
            label="Collection Rate"
            value={`${collectionRate}%`}
            sub={`${compactNgn(totalBilled - totalArrears)} of ${compactNgn(totalBilled)} billed`}
            tone="emerald"
            barPct={collectionRate}
          />
          <Kpi
            icon={AlertTriangle}
            label="Total Arrears"
            value={compactNgn(totalArrears)}
            sub={`${rows.filter((r) => r.arrears > 0).length} suite${rows.filter((r) => r.arrears > 0).length === 1 ? '' : 's'} in arrears`}
            tone="rose"
            barPct={totalBilled > 0 ? (totalArrears / totalBilled) * 100 : 0}
          />
          <Kpi
            icon={Receipt}
            label="Service Charges"
            value={compactNgn(serviceChargesCollected)}
            sub="Billed this cycle"
            barPct={totalBilled > 0 ? (serviceChargesCollected / totalBilled) * 100 : 0}
          />
          <Kpi
            icon={CalendarClock}
            label="Expiring Leases"
            value={`${expiringSoon} Units`}
            sub="Ending within 60 days"
            tone="amber"
            barPct={rows.length > 0 ? (expiringSoon / rows.length) * 100 : 0}
          />
        </div>

        {/* Search & filters */}
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search corporate tenant, suite, or unit code..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {portfolios.length > 1 && (
              <div className="relative">
                <select value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className={SELECT}>
                  <option value="all">All Portfolios</option>
                  {portfolios.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(['all', 'paid', 'overdue', 'partial'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    statusFilter === s
                      ? 'bg-white text-primary shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <Store className="h-9 w-9 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No commercial leases</h3>
              <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
                Commercial suites appear here once units with a commercial listing type are added under{' '}
                {organization.name}.
              </p>
              <Link
                href="/dashboard/estate-manager/units"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)]"
              >
                Add a unit
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <th className={TH}>Unit / Tenant</th>
                      <th className={`${TH} text-right`}>Base Rent</th>
                      <th className={`${TH} text-right`}>Service Charge</th>
                      <th className={`${TH} text-right`}>Utilities</th>
                      <th className={`${TH} text-center`}>Status</th>
                      <th className={TH}>Lease Expiry</th>
                      <th className={`${TH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                          No leases match these filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const meta = STATUS_META[r.status];
                        return (
                          <tr key={r.unit.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary shadow-xs dark:text-[#4edea3]">
                                  {initialsOf(r.unit.currentTenant?.fullName, r.unit.currentTenant?.email)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                                    {r.unit.currentTenant?.fullName ?? 'Vacant commercial suite'}
                                  </p>
                                  <p className={`truncate ${MUTED}`}>
                                    Unit {r.unit.unitNumber}
                                    {r.unit.listing?.title ? ` — ${r.unit.listing.title}` : ''}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-zinc-900 dark:text-white">
                              {ngn(r.baseRent)} <span className={MUTED}>/ yr</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-zinc-900 dark:text-white">
                              {r.serviceCharge > 0 ? ngn(r.serviceCharge) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-zinc-900 dark:text-white">
                              {r.utilities > 0 ? ngn(r.utilities) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                              </span>
                              {r.arrears > 0 && (
                                <p className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                                  {compactNgn(r.arrears)} arrears
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <p className="font-mono text-sm text-zinc-900 dark:text-white">{formatDate(r.unit.leaseEndDate)}</p>
                              {r.daysLeft !== null && (
                                <p className={MUTED}>
                                  {r.daysLeft > 0 ? `${r.daysLeft} days remaining` : 'Expired'}
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/dashboard/estate-manager/units/${r.unit.id}`}
                                  title="Preview lease dossier"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                </Link>
                                {r.unit.currentTenant?.email && (
                                  <a
                                    href={`mailto:${r.unit.currentTenant.email}`}
                                    title="Send invoice reminder"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                  >
                                    <Mail className="h-[18px] w-[18px]" />
                                  </a>
                                )}
                                <Link
                                  href="/dashboard/estate-manager/service-charges"
                                  title="Service charges"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
                                >
                                  <FileText className="h-[18px] w-[18px]" />
                                </Link>
                              </div>
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
                  <span className="font-semibold text-zinc-900 dark:text-white">{rows.length}</span> commercial suites
                </span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
