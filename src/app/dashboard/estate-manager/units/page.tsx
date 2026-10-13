'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Building2,
  PieChart,
  Wallet,
  BellRing,
  BedDouble,
  Bath,
  MapPin,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  FileUp,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Real enums from prisma/schema.prisma ───
const STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE'] as const;
const OCCUPANCIES = ['VACANT', 'OCCUPIED', 'NOTICE_GIVEN'] as const;
// PropertyType in the schema — note there is no 'Penthouse' or 'Serviced Suite'
const TYPES = ['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse'] as const;

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  duplex: 'Duplex',
  land: 'Land',
  office: 'Office',
  shop: 'Shop',
  warehouse: 'Warehouse',
};

interface UnitRow {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number | null;
  rent: number;
  status: string;
  occupancy: string;
  listing: { id: string; title: string; address: string | null } | null;
  currentTenant: { id: string; fullName: string | null; email: string } | null;
}

interface UnitsResponse {
  success: boolean;
  data: UnitRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const PAGE_SIZE = 20;

// ─── Formatting ───
function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const SELECT =
  'rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'p-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

const STATUS_PILL: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  RENTED: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  MAINTENANCE: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  UNAVAILABLE: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
};

const OCCUPANCY_PILL: Record<string, string> = {
  VACANT: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  OCCUPIED: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  NOTICE_GIVEN: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
};

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function EstateManagerUnitsPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<UnitRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (status) params.set('status', status);
      if (occupancy) params.set('occupancy', occupancy);
      if (type) params.set('type', type);

      const res = await fetch(`/api/orgs/${orgId}/units?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load units (${res.status})`);
      const json: UnitsResponse = await res.json();
      setRows(json?.data ?? []);
      setPagination(json?.pagination ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    } catch (e) {
      setError((e as Error).message ?? 'Could not load units');
    } finally {
      setLoading(false);
    }
  }, [orgId, page, status, occupancy, type]);

  useEffect(() => {
    if (orgId) load();
    else if (!orgLoading) setLoading(false);
  }, [orgId, orgLoading, load]);

  // Client-side text search across the fetched page — the route has no `search` param.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) =>
      [u.unitNumber, u.buildingName, u.listing?.title, u.listing?.address, u.currentTenant?.fullName, u.currentTenant?.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  // KPIs are computed from the true total set on this page plus live totals.
  const total = pagination.total;
  const occupied = rows.filter((u) => u.occupancy === 'OCCUPIED').length;
  const notice = rows.filter((u) => u.occupancy === 'NOTICE_GIVEN').length;
  const annualRunRate = rows.reduce((sum, u) => sum + (u.occupancy === 'OCCUPIED' ? u.rent : 0), 0) * 12;

  if (orgLoading || (loading && rows.length === 0)) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
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
          description="Units are scoped to an organization. Create one to start registering units."
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
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load units</p>
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

  const occupancyRate = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0;

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default' }: {
    icon: typeof Building2;
    label: string;
    value: string;
    sub?: string;
    tone?: 'default' | 'emerald' | 'amber';
  }) => (
    <div className={`${CARD} flex flex-col justify-between`}>
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        <span className={LABEL}>{label}</span>
        <Icon
          className={`h-5 w-5 ${
            tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-bold text-zinc-900 dark:text-white">{value}</span>
        {sub && <span className={`${MUTED} ${tone === 'amber' ? 'text-amber-700 dark:text-amber-400' : tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-[1240px] p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-center dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Units</h1>
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {organization.name}
              </span>
            </div>
            <p className={`mt-1 text-sm ${MUTED}`}>
              Manage residential units, occupancy status, rental rates, and specifications across your portfolio.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/dashboard/estate-manager/bulk-import"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <FileUp className="h-[18px] w-[18px]" /> Import
            </Link>
            <Link
              href={`/dashboard/landlord/properties/new?orgId=${orgId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Plus className="h-[18px] w-[18px]" /> Add Unit
            </Link>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          <Kpi icon={Building2} label="Total Capacity" value={String(total)} sub="Units" />
          <Kpi icon={PieChart} label="Occupancy Rate" value={`${occupancyRate}%`} sub={`${occupied} occupied`} tone="emerald" />
          <Kpi icon={Wallet} label="Annual Run Rate" value={compactNgn(annualRunRate)} sub="Gross billings" />
          <Kpi icon={BellRing} label="Pending Renewals" value={String(notice)} sub="Notice Given" tone="amber" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative min-w-[280px] flex-1">
            <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search unit number, building, or address..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={SELECT}>
              <option value="">Status: All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={SELECT}>
              <option value="">Type: All</option>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <select value={occupancy} onChange={(e) => { setOccupancy(e.target.value); setPage(1); }} className={SELECT}>
              <option value="">Occupancy: All</option>
              {OCCUPANCIES.map((o) => <option key={o} value={o}>{o.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
            <span className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              Showing {filtered.length} of {total}
            </span>
          </div>
        </div>

        {/* Table or empty state */}
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-20 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Building2 className="h-9 w-9 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No units registered</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              There are currently no residential or commercial units configured for {organization.name}. Add your first
              unit or import property records to get started.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href={`/dashboard/landlord/properties/new?orgId=${orgId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
              >
                <Plus className="h-[18px] w-[18px]" /> Add your first unit
              </Link>
              <Link
                href="/dashboard/estate-manager/bulk-import"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <FileUp className="h-[18px] w-[18px]" /> Import CSV / Excel
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>Unit &amp; Portfolio</th>
                    <th className={TH}>Type</th>
                    <th className={TH}>Specs</th>
                    <th className={TH}>Size</th>
                    <th className={`${TH} text-right`}>Rental Rate</th>
                    <th className={`${TH} text-center`}>Listing Status</th>
                    <th className={`${TH} text-center`}>Occupancy</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No units match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3">
                          <div className="flex items-start gap-2">
                            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                            <div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                Unit {u.unitNumber}
                                {u.buildingName ? ` · ${u.buildingName}` : ''}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <MapPin className="h-[13px] w-[13px]" />
                                {u.listing?.address ?? u.listing?.title ?? 'No address'}
                              </div>
                              {u.currentTenant && (
                                <div className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                                  {u.currentTenant.fullName ?? u.currentTenant.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            {TYPE_LABELS[u.type] ?? u.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap p-3 text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1"><BedDouble className="h-[15px] w-[15px] text-zinc-400" />{u.bedrooms}</span>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            <span className="flex items-center gap-1"><Bath className="h-[15px] w-[15px] text-zinc-400" />{u.bathrooms}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">
                          {u.sizeSqm ? `${Number(u.sizeSqm).toLocaleString('en-NG')} m²` : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">{ngn(u.rent)}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400">per annum</div>
                        </td>
                        <td className="p-3 text-center">
                          <Pill label={u.status} cls={STATUS_PILL[u.status] ?? STATUS_PILL.UNAVAILABLE} />
                        </td>
                        <td className="p-3 text-center">
                          <Pill label={u.occupancy.replace('_', ' ')} cls={OCCUPANCY_PILL[u.occupancy] ?? OCCUPANCY_PILL.VACANT} />
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/dashboard/estate-manager/units/${u.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                          >
                            View <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 p-4 text-sm sm:flex-row dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{Math.min(page * PAGE_SIZE, total)}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{total}</span> entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <span className="px-3 text-xs font-medium text-zinc-900 dark:text-white">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
