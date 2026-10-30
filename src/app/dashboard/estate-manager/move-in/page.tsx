'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  FileText,
  Wallet,
  AlertCircle,
  ChevronRight,
  Check,
  Clock,
  Printer,
  Building2,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Real shapes ───
interface Unit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  status: string;
  occupancy: string;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  currentTenant: { id: string; fullName: string | null } | null;
}

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] disabled:opacity-50 active:scale-[0.98]';
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EstateManagerMoveInPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      // Agreements scoped to this org's listings are not served by a dedicated
      // route; the estate-manager agreements page fetches via Prisma. Here we
      // read the org's units (which carry tenant + lease) and pair them with the
      // unit detail for agreement linkage.
      const params = new URLSearchParams();
      params.set('limit', '200');
      const res = await fetch(`/api/orgs/${orgId}/units?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load move-in data (${res.status})`);
      const json = await res.json();
      const all: Unit[] = json?.data ?? [];
      // A move-in candidate is an occupied unit with an active lease window.
      const now = Date.now();
      const candidates = all.filter((u) => {
        const active =
          u.occupancy === 'OCCUPIED' &&
          u.currentTenant &&
          u.leaseEndDate &&
          new Date(u.leaseEndDate).getTime() >= now;
        return active;
      });
      setUnits(candidates);
    } catch (e) {
      setError((e as Error).message ?? 'Could not load move-in data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) load();
    else if (!orgLoading) setLoading(false);
  }, [orgId, orgLoading, load]);

  if (orgLoading || loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-9 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-72 animate-pulse rounded-xl bg-zinc-200 lg:col-span-4 dark:bg-zinc-800" />
            <div className="h-72 animate-pulse rounded-xl bg-zinc-200 lg:col-span-8 dark:bg-zinc-800" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <NoOrgState
          title="No Organization"
          description="Move-in coordination is scoped to an organization's occupied units."
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
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load move-in data</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  // Empty state — no occupied units with active leases under this org
  if (units.length === 0) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <main className="mx-auto w-full max-w-2xl p-6 lg:p-10">
          <div className={`${CARD} flex flex-col items-center py-16 text-center`}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <KeyRound className="h-9 w-9 opacity-50" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Move-in Coordination Hub</h1>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              There are no active tenancies under {organization.name} to coordinate a handover for. Once a unit is
              leased and a tenant is assigned with a live lease window, move-in onboarding appears here.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/dashboard/estate-manager/units" className={BTN_GHOST}>
                <Building2 className="h-4 w-4" /> Go to Units
              </Link>
              <Link href="/dashboard/estate-manager/agreements" className={BTN_PRIMARY}>
                View Agreements <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  // Pick the active move-in (first candidate; could be a selector in future)
  const active = units[0];
  const selected = units.find((u) => u.id === selectedId) ?? active;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-[1240px] space-y-8 p-6 lg:p-10">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${MUTED}`}>
            <Link href="/dashboard/estate-manager" className="transition-colors hover:text-primary">Home</Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <Link href="/dashboard/estate-manager/units" className="transition-colors hover:text-primary">Onboarding</Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-white">Move-in Coordination</span>
          </nav>
          {units.length > 1 && (
            <select
              value={selected.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber} — {u.currentTenant?.fullName ?? 'Tenant'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Move-in Coordination Hub
            </h1>
            <p className={`mt-1 text-sm ${MUTED}`}>
              Handover and onboarding workflow for tenants under {organization.name}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className={BTN_GHOST}
            >
              <Printer className="h-4 w-4" /> Export Handover Dossier
            </button>
            <Link href={`/dashboard/estate-manager/maintenance/${selected.id}`} className={BTN_PRIMARY}>
              <CalendarCheck className="h-4 w-4" /> Schedule Walkthrough
            </Link>
          </div>
        </div>

        {/* Hero banner — real tenant + unit + lease data */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-teal-500 p-6 shadow-sm lg:p-8 dark:from-[var(--sovereign-hover)] dark:via-primary dark:to-teal-600">
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                <ClipboardList className="h-3.5 w-3.5" /> Handover Ready
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Welcome to your new space
              </h2>
              <p className="text-sm leading-relaxed text-white/90">
                Tenancy onboarding active for{' '}
                <span className="font-semibold underline decoration-white/40 underline-offset-4">
                  Unit {selected.unitNumber}
                  {selected.buildingName ? `, ${selected.buildingName}` : ''}
                </span>
                . Tenant access, lease window, and facility handover are tracked here.
              </p>
            </div>
            <div className="shrink-0 rounded-lg bg-black/10 p-4 text-xs text-white backdrop-blur-sm lg:text-right">
              <p className="text-sm font-semibold uppercase tracking-wider">{selected.currentTenant?.fullName ?? 'Tenant'}</p>
              <div className="mt-2 inline-block rounded bg-black/10 px-2.5 py-1">
                <span className="text-white/75">Lease Commencement:</span>{' '}
                <span className="ml-1 font-bold text-white">{formatDate(selected.leaseStartDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT: Lease & Handover Status */}
          <div className={`${CARD} flex flex-col gap-5 lg:col-span-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Lease &amp; Handover Status</h3>
                  <p className={MUTED}>Live unit + tenancy records</p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-primary dark:text-[#4edea3]">
                Active
              </span>
            </div>

            {/* Occupancy */}
            <div className="space-y-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/40">
              <div className="flex items-center justify-between text-xs">
                <span className={MUTED}>Occupancy</span>
                <span className="font-bold text-primary dark:text-[#4edea3]">{selected.occupancy}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={MUTED}>Unit Status</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{selected.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={MUTED}>Lease Window</span>
                <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                  {formatDate(selected.leaseStartDate)} — {formatDate(selected.leaseEndDate)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <Link
                href={`/dashboard/estate-manager/units/${selected.id}`}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-zinc-400" /> View Unit Dossier</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/dashboard/estate-manager/agreements"
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-400" /> Tenancy Agreement</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* RIGHT: Readiness checklist derived from real data */}
          <div className={`${CARD} flex flex-col gap-5 lg:col-span-8`}>
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Handover Readiness Checklist</h3>
                  <p className={MUTED}>Derived from live unit &amp; tenancy records</p>
                </div>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {units.length} Active Tenanc{units.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {[
                { icon: Check, label: 'Tenant Assigned to Unit', detail: `${selected.currentTenant?.fullName ?? 'Tenant'} is the current occupant`, state: 'done' as const },
                { icon: CalendarCheck, label: 'Lease Window Active', detail: `Commencing ${formatDate(selected.leaseStartDate)} through ${formatDate(selected.leaseEndDate)}`, state: 'done' as const },
                { icon: Building2, label: 'Unit Marked Occupied', detail: `Occupancy status: ${selected.occupancy}`, state: 'done' as const },
                { icon: KeyRound, label: 'Facility Handover Walkthrough', detail: 'On-site inspection and key issuance — schedule via the button above', state: 'pending' as const },
              ].map((item, i) => {
                const stateCls =
                  item.state === 'done'
                    ? 'bg-primary text-white'
                    : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400';
                const badge =
                  item.state === 'done'
                    ? 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${stateCls}`}>
                        {item.state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</p>
                        <p className={MUTED}>{item.detail}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${badge}`}>
                      {item.state === 'done' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-4 sm:flex-row dark:border-zinc-800">
              <p className={MUTED}>
                Items marked <span className="font-semibold text-amber-600 dark:text-amber-400">Pending</span> require an on-site action before handover completes.
              </p>
              <Link href={`/dashboard/estate-manager/units/${selected.id}`} className={BTN_PRIMARY}>
                Open Unit Handover <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
