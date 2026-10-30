'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertTriangle,
  Wrench,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Radio,
  ShieldAlert,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import {
  useEstateCommand,
  useEstateCommandRefresh,
  formatRelativeAge,
  type EstateCommandUnit,
  type EstateCommandData,
} from '@/hooks/useEstateCommand';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

// ─── Design tokens ───────────────────────────────────────────────────────────
// Estate-manager theme: Sovereign (#006c49 / --accent), elevated surfaces.
const ACCENT = 'var(--accent)';
const SUCCESS = 'var(--sovereign)';
const WARN = '#f59e0b';
const DANGER = 'var(--destructive)';

const CARD = 'glass-card';
const PANEL = 'glass-card';

// ─── Formatting helpers ──────────────────────────────────────────────────────
function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  duplex: 'Duplex',
  land: 'Land',
  office: 'Office',
  shop: 'Shop',
  warehouse: 'Warehouse',
};

function titleize(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Loading / error primitives ──────────────────────────────────────────────
function PanelSkeleton({ rows = 3, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className={`${PANEL} p-6 space-y-4`} aria-busy="true" aria-live="polite">
      <Skeleton className="h-5 w-48" />
      <Skeleton className={tall ? 'h-44 w-full' : 'h-3 w-full'} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className={`${PANEL} p-6 space-y-4`} aria-busy="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={`${PANEL} p-8 text-center space-y-3`}>
      <ShieldAlert className="mx-auto h-8 w-8" style={{ color: DANGER }} />
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
        Could not load operations data
      </p>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {message}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description, action }: {
  icon: typeof Wrench;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="py-10 text-center space-y-2">
      <Icon className="mx-auto h-7 w-7 opacity-40" style={{ color: 'var(--muted-foreground)' }} />
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      {action && (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

// ─── Status pills ────────────────────────────────────────────────────────────
function Pill({ label, tone }: { label: string; tone: 'success' | 'warn' | 'danger' | 'primary' | 'muted' }) {
  const tones: Record<string, string> = {
    success: `bg-[${SUCCESS}]/15 text-[${SUCCESS}]`,
    warn: `bg-[${WARN}]/15 text-[${WARN}]`,
    danger: 'bg-destructive/15 text-destructive',
    primary: 'bg-accent/15 text-accent',
    muted: 'bg-surface-container-high text-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {label}
    </span>
  );
}

const TICKET_STATUS_TONE: Record<string, 'success' | 'warn' | 'danger' | 'primary' | 'muted'> = {
  open: 'warn',
  assigned: 'primary',
  in_progress: 'primary',
  resolved: 'success',
  closed: 'muted',
};

const CHARGE_STATUS_TONE: Record<string, 'success' | 'warn' | 'danger' | 'primary' | 'muted'> = {
  paid: 'success',
  draft: 'muted',
  sent: 'primary',
  partial: 'warn',
  overdue: 'danger',
  cancelled: 'muted',
};

// ─── KPI card ────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  badge,
  badgeTone = 'success',
  label,
  value,
  valueSuffix,
  footerLeft,
  footerRight,
  footerRightTone = 'primary',
}: {
  icon: typeof Building2;
  badge: string;
  badgeTone?: 'success' | 'warn' | 'danger' | 'primary' | 'muted';
  label: string;
  value: string;
  valueSuffix?: string;
  footerLeft: string;
  footerRight: string;
  footerRightTone?: 'success' | 'warn' | 'danger' | 'primary';
}) {
  return (
    <div className={`${CARD} p-6 transition-all hover:bg-surface-container-low/90`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15" style={{ color: ACCENT }}>
          <Icon className="h-5 w-5" />
        </div>
        <Pill label={badge} tone={badgeTone} />
      </div>
      <span className="block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>{value}</span>
        {valueSuffix && (
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{valueSuffix}</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-container-lowest/40 px-2.5 py-1.5">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{footerLeft}</span>
        <span className="text-xs font-bold" style={{ color: footerRightTone === 'success' ? SUCCESS : footerRightTone === 'warn' ? WARN : footerRightTone === 'danger' ? DANGER : ACCENT }}>
          {footerRight}
        </span>
      </div>
    </div>
  );
}

// ─── Escrow inflow chart ─────────────────────────────────────────────────────
function EscrowInflowChart({ months }: { months: EstateCommandData['months'] }) {
  const activeMonths = months.filter((m) => m.collections > 0 || m.opex > 0);
  if (activeMonths.length === 0) {
    return (
      <EmptyPanel
        icon={TrendingUp}
        title="No escrow activity yet"
        description="Collections and utility OpEx will chart here once service charge cycles are billed and paid."
        action={{ label: 'Set up service charges', href: '/dashboard/estate-manager/service-charges' }}
      />
    );
  }

  const maxValue = Math.max(...activeMonths.map((m) => Math.max(m.collections, m.opex)), 1);

  return (
    <div className="w-full rounded-xl bg-surface-container-lowest/50 p-4">
      <div className="flex items-end gap-2 pt-4 sm:gap-3" style={{ height: 180 }}>
        {activeMonths.map((m) => {
          const collectionsH = Math.max(2, (m.collections / maxValue) * 100);
          const opexH = Math.max(2, (m.opex / maxValue) * 100);
          return (
            <div key={m.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                <div
                  className={`w-1/2 rounded-t transition-all ${m.isCurrent ? 'bg-gradient-to-t from-primary-container to-primary shadow-md shadow-primary-container/30' : 'bg-primary-container/80 group-hover:bg-primary-container'}`}
                  style={{ height: `${collectionsH}%` }}
                  title={`${m.month} collections: ${ngn(m.collections)}`}
                />
                <div
                  className={`w-1/2 rounded-t transition-all ${m.isCurrent ? 'bg-gradient-to-t from-secondary-container to-secondary' : 'bg-secondary/60 group-hover:bg-secondary'}`}
                  style={{ height: `${opexH}%` }}
                  title={`${m.month} OpEx: ${ngn(m.opex)}`}
                />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: m.isCurrent ? ACCENT : 'var(--muted-foreground)' }}
              >
                {m.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Units table ─────────────────────────────────────────────────────────────
type UnitFilter = 'all' | 'overdue' | 'maintenance' | 'vacant';

const PAGE_SIZE = 10;

function UnitsTable({ units, overdueUnitIds }: { units: EstateCommandUnit[]; overdueUnitIds: Set<string> }) {
  const [filter, setFilter] = useState<UnitFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return units.filter((u) => {
      const matchesQuery =
        !q ||
        u.unitNumber.toLowerCase().includes(q) ||
        (u.buildingName ?? '').toLowerCase().includes(q) ||
        (u.listing?.title ?? '').toLowerCase().includes(q) ||
        (u.currentTenant?.fullName ?? '').toLowerCase().includes(q) ||
        (u.currentTenant?.email ?? '').toLowerCase().includes(q);

      const matchesFilter =
        filter === 'all' ? true
        : filter === 'maintenance' ? u.status === 'MAINTENANCE'
        : filter === 'vacant' ? u.occupancy === 'VACANT'
        : overdueUnitIds.has(u.id);

      return matchesQuery && matchesFilter;
    });
  }, [units, query, filter, overdueUnitIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      all: units.length,
      overdue: units.filter((u) => overdueUnitIds.has(u.id)).length,
      maintenance: units.filter((u) => u.status === 'MAINTENANCE').length,
      vacant: units.filter((u) => u.occupancy === 'VACANT').length,
    }),
    [units, overdueUnitIds]
  );

  const tabs: Array<{ key: UnitFilter; label: string }> = [
    { key: 'all', label: `All Units (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'maintenance', label: `Maintenance (${counts.maintenance})` },
    { key: 'vacant', label: `Vacant (${counts.vacant})` },
  ];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Estate Units, Service Charge Status &amp; Utility SLAs
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Occupancy, billing compliance and maintenance state across the managed portfolio.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-xl bg-surface-container-high/60 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setFilter(tab.key); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-surface-highlight'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={filter === tab.key ? { color: 'var(--text)' } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search unit, resident, estate…"
              className="h-9 w-full pl-9 text-xs sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {pageRows.length === 0 ? (
        <EmptyPanel
          icon={Building2}
          title={units.length === 0 ? 'No units registered yet' : 'No units match these filters'}
          description={
            units.length === 0
              ? 'Register units to track occupancy, service charges and maintenance from here.'
              : 'Try a different filter or clear your search.'
          }
          action={units.length === 0 ? { label: 'Add units', href: '/dashboard/estate-manager/units' } : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-elevated text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                <th className="px-4 py-3.5">Unit &amp; Resident</th>
                <th className="px-4 py-3.5">Estate &amp; Typology</th>
                <th className="px-4 py-3.5">Service Charge</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u, idx) => {
                const isOverdue = overdueUnitIds.has(u.id);
                const isMaintenance = u.status === 'MAINTENANCE';
                return (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-surface-container-high/40"
                    style={{
                      background: idx % 2 === 0 ? 'color-mix(in srgb, var(--surface) 85%, transparent)' : undefined,
                    }}
                  >
                    {/* Resident */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            background: u.occupancy === 'OCCUPIED' ? 'bg-accent/20' : 'bg-surface-highlight',
                            color: u.occupancy === 'OCCUPIED' ? ACCENT : 'var(--text)',
                          }}
                        >
                          {u.unitNumber.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {u.currentTenant?.fullName ?? 'Unassigned'}
                          </p>
                          <p className="truncate text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                            {u.occupancy === 'OCCUPIED'
                              ? u.currentTenant?.email ?? 'Resident'
                              : titleize(u.occupancy)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Estate & typology */}
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: 'var(--text)' }}>
                        {u.listing?.title ?? u.buildingName ?? 'Unassigned estate'}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        {u.bedrooms}-Bed {TYPE_LABELS[u.type] ?? titleize(u.type)} • Unit {u.unitNumber}
                      </p>
                    </td>

                    {/* Service charge */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text)' }}>
                        {u.serviceCharge ? ngn(u.serviceCharge) : ngn(u.rent)}
                        <span className="ml-1 text-[10px] font-normal" style={{ color: 'var(--muted-foreground)' }}>
                          /cycle
                        </span>
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        Rent {ngn(u.rent)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {isMaintenance ? (
                          <Pill label="Maintenance" tone="warn" />
                        ) : u.occupancy === 'VACANT' ? (
                          <Pill label="Vacant" tone="muted" />
                        ) : u.occupancy === 'NOTICE_GIVEN' ? (
                          <Pill label="Notice Given" tone="warn" />
                        ) : (
                          <Pill label="Occupied" tone="success" />
                        )}
                        {isOverdue && <Pill label="Escrow Overdue" tone="danger" />}
                        {u.nextMaintenanceDate && (
                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                            Next svc {formatDate(u.nextMaintenanceDate)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="View unit">
                          <Link href={`/dashboard/estate-manager/units/${u.id}`}>
                            <Building2 className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {isMaintenance || isOverdue ? (
                          <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Open maintenance">
                            <Link href="/dashboard/estate-manager/maintenance">
                              <Wrench className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/20 px-4 py-2.5 sm:flex-row">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length === 0
            ? 'No units to display'
            : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} units`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-highlight disabled:opacity-40"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span
            className="rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold text-white"
          >
            {safePage}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>of {totalPages}</span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-highlight disabled:opacity-40"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance dispatch panel ──────────────────────────────────────────────
function MaintenancePanel({ data }: { data: EstateCommandData }) {
  const { recentTickets, workOrders } = data;

  return (
    <div className={`${PANEL} flex flex-col justify-between p-6`}>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15" style={{ color: ACCENT }}>
              <Wrench className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Maintenance Dispatch</h3>
          </div>
          <Pill label={`${workOrders.open} Open`} tone={workOrders.open > 0 ? 'primary' : 'muted'} />
        </div>

        {recentTickets.length === 0 ? (
          <EmptyPanel
            icon={Wrench}
            title="No work orders open"
            description="Tenant and facility tickets will appear here for dispatch."
            action={{ label: 'Open maintenance desk', href: '/dashboard/estate-manager/maintenance' }}
          />
        ) : (
          <div className="space-y-2.5">
            {recentTickets.slice(0, 5).map((t) => (
              <div key={t.id} className="rounded-lg bg-surface-container/60 p-3 transition-colors hover:bg-surface-container">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.title}</p>
                    <p className="truncate text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {titleize(t.category)}
                      {t.listing?.title ? ` • ${t.listing.title}` : ''}
                      {t.raisedBy ? ` • Raised by ${t.raisedBy}` : ''}
                    </p>
                  </div>
                  <Pill label={titleize(t.status)} tone={TICKET_STATUS_TONE[t.status] ?? 'muted'} />
                </div>
                <div className="mt-2 flex items-center justify-between pt-1">
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    {titleize(t.priority)} priority
                    {t.assignedTo ? ` • ${t.assignedTo}` : ' • Unassigned'}
                  </span>
                  <Link
                    href={`/dashboard/estate-manager/maintenance/${t.id}`}
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: ACCENT }}
                  >
                    Dispatch
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button asChild variant="outline" size="sm" className="w-full gap-1">
          <Link href="/dashboard/estate-manager/maintenance">
            View all {workOrders.total} work orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Compliance / SLA panel (derived from live records) ──────────────────────
function CompliancePanel({ data }: { data: EstateCommandData }) {
  const { escrow, fleet, utilities, workOrders } = data;

  const checks: Array<{
    label: string;
    detail: string;
    tone: 'success' | 'warn' | 'danger' | 'muted';
  }> = [
    {
      label: 'Service charge collection',
      detail: `${escrow.collectionRate}% of ${compactNgn(escrow.billed)} billed this portfolio lifetime`,
      tone: escrow.collectionRate >= 90 ? 'success' : escrow.collectionRate >= 70 ? 'warn' : 'danger',
    },
    {
      label: 'Overdue escrow reconciliations',
      detail: escrow.overdueCount === 0
        ? 'No invoices past their due date'
        : `${escrow.overdueCount} invoice${escrow.overdueCount === 1 ? '' : 's'} outstanding (${compactNgn(escrow.pending)})`,
      tone: escrow.overdueCount === 0 ? 'success' : 'warn',
    },
    {
      label: 'Portfolio occupancy',
      detail: `${fleet.occupancyRate}% of ${fleet.totalUnits} units occupied • ${fleet.vacantUnits} vacant`,
      tone: fleet.occupancyRate >= 80 ? 'success' : fleet.occupancyRate >= 50 ? 'warn' : 'danger',
    },
    {
      label: 'Utility OpEx settlement',
      detail: utilities.totalOpex === 0
        ? 'No utility allocations billed yet'
        : `${compactNgn(utilities.paidOpex)} of ${compactNgn(utilities.totalOpex)} settled`,
      tone: utilities.totalOpex === 0 ? 'muted' : utilities.paidOpex >= utilities.totalOpex * 0.9 ? 'success' : 'warn',
    },
    {
      label: 'Open work orders',
      detail: workOrders.total === 0
        ? 'No maintenance tickets on record'
        : `${workOrders.open} open • ${workOrders.urgent} urgent • ${workOrders.inProgress} in progress`,
      tone: workOrders.urgent > 0 ? 'danger' : workOrders.open > 0 ? 'warn' : 'success',
    },
  ];

  const overallHealthy = checks.every((c) => c.tone === 'success' || c.tone === 'muted');

  return (
    <div className={`${PANEL} flex flex-col justify-between p-6`}>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15" style={{ color: ACCENT }}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Operations Compliance</h3>
          </div>
          <Pill
            label={overallHealthy ? 'Healthy' : 'Attention'}
            tone={overallHealthy ? 'success' : 'warn'}
          />
        </div>

        <div className="space-y-2.5">
          {checks.map((check) => (
            <div key={check.label} className="rounded-lg bg-surface-container/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{check.label}</span>
                <Pill
                  label={check.tone === 'success' ? 'OK' : check.tone === 'warn' ? 'Review' : check.tone === 'danger' ? 'Action' : 'N/A'}
                  tone={check.tone}
                />
              </div>
              <p className="mt-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{check.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Button asChild variant="outline" size="sm" className="w-full gap-1">
          <Link href="/dashboard/estate-manager/financials">
            Open finance ledger <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────
export default function EstateCommandClient({ userName }: { userName: string }) {
  const { organization, organizations, loading: orgLoading, setOrganization } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useEstateCommand(orgId);
  const { refresh, lastSyncedAt } = useEstateCommandRefresh(orgId);

  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const syncStamp = syncedAt ?? (dataUpdatedAt ? new Date(dataUpdatedAt) : null) ?? lastSyncedAt;

  if (orgLoading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={userName}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-2xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <PanelSkeleton tall />
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={userName}>
        <NoOrgState
          title="No Organization"
          description="You need an organization before the operations command centre can surface live data."
          actionLabel="Create Organization"
          actionHref="/dashboard/estate-manager/organizations/new"
          secondaryLabel="Link Organization"
          secondaryHref="/dashboard/estate-manager/invite-property-manager"
        />
      </DashboardShell>
    );
  }

  const handleRefresh = () => {
    refresh();
    refetch();
    setSyncedAt(new Date());
  };

  // Overdue service charges hang off Listing, not Unit — so key the overdue set
  // by listing id and match units through their listing relation.
  const overdueListingIds = new Set(
    (data?.overdueCharges ?? [])
      .map((c) => c.listing?.id)
      .filter((id): id is string => !!id)
  );

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={userName}>
      <div className="space-y-8">
        {/* ── Live telemetry ribbon ── */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-surface-container-high/60 p-4 backdrop-blur-xl md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isFetching ? 'animate-ping' : ''}`} style={{ background: SUCCESS, opacity: 0.75 }} />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full" style={{ background: SUCCESS }} />
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Pill label="Operations Live" tone="success" />
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                {data && data.hasData
                  ? `${data.org.name} — ${data.fleet.totalUnits} units across ${data.fleet.estateCount} estate${data.fleet.estateCount === 1 ? '' : 's'}, ${data.workOrders.open} open work order${data.workOrders.open === 1 ? '' : 's'}.`
                  : `${data?.org.name ?? organization.name} is connected. Add units or service charges to populate operations.`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              Last sync: {formatRelativeAge(syncStamp)}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
              className="h-7 gap-1.5 text-[11px]"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* ── Command header ── */}
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
                <Radio className="h-3.5 w-3.5" />
                Estate Operations Protocol • {organization.name}
              </span>
              {organizations.length > 1 && (
                <select
                  value={orgId}
                  onChange={(e) => {
                    const next = organizations.find((o) => o.id === e.target.value);
                    if (next) setOrganization(next);
                  }}
                  className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-medium outline-none"
                  style={{ color: 'var(--text)' }}
                >
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              )}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              Estate Operations &amp; Facility Command
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Service charge escrow reconciliation, work orders, occupancy and maintenance state across
              {' '}
              {(organization.address as string | null) || organization.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/dashboard/estate-manager/messages">
                <Megaphone className="h-4 w-4" /> Broadcast Resident Notice
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2 text-destructive">
              <Link href="/dashboard/estate-manager/maintenance">
                <AlertTriangle className="h-4 w-4" /> Log Urgent Incident
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 bg-gradient-to-r from-primary-container to-secondary-container text-white shadow-lg shadow-primary-container/25">
              <Link href="/dashboard/estate-manager/maintenance">
                <Plus className="h-4 w-4" /> Create Work Order
              </Link>
            </Button>
          </div>
        </header>

        {/* ── Error / loading states ── */}
        {error ? (
          <ErrorState
            message={(error as Error).message ?? 'Unknown error'}
            onRetry={() => refetch()}
          />
        ) : isLoading || !data ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
            </div>
            <PanelSkeleton tall />
          </>
        ) : (
          <>
            {/* ── KPI grid ── */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={Building2}
                badge={`${data.fleet.occupancyRate}% Occupied`}
                badgeTone={data.fleet.occupancyRate >= 80 ? 'success' : 'warn'}
                label="Managed Fleet Capacity"
                value={String(data.fleet.totalUnits)}
                valueSuffix={`Units / ${data.fleet.estateCount} Estate${data.fleet.estateCount === 1 ? '' : 's'}`}
                footerLeft="Vacant / notice given"
                footerRight={`${data.fleet.vacantUnits} / ${data.fleet.noticeUnits}`}
                footerRightTone="warn"
              />
              <KpiCard
                icon={Receipt}
                badge={`${data.escrow.collectionRate}% Collected`}
                badgeTone={data.escrow.collectionRate >= 90 ? 'success' : 'warn'}
                label="Service Charge Escrow Pool"
                value={compactNgn(data.escrow.collected)}
                valueSuffix={data.escrow.billed > 0 ? 'Collected' : 'No cycles billed'}
                footerLeft={data.escrow.overdueCount > 0 ? `${data.escrow.overdueCount} overdue invoice${data.escrow.overdueCount === 1 ? '' : 's'}` : 'No overdue invoices'}
                footerRight={compactNgn(data.escrow.pending)}
                footerRightTone={data.escrow.pending > 0 ? 'warn' : 'success'}
              />
              <KpiCard
                icon={TrendingUp}
                badge={data.utilities.totalOpex > 0 ? 'Utility OpEx' : 'No OpEx Billed'}
                badgeTone="primary"
                label="Facility Expenditure"
                value={compactNgn(data.utilities.totalOpex)}
                valueSuffix={data.utilities.totalOpex > 0 ? 'Allocated' : undefined}
                footerLeft="Settled"
                footerRight={compactNgn(data.utilities.paidOpex)}
                footerRightTone="success"
              />
              <KpiCard
                icon={Wrench}
                badge={data.workOrders.urgent > 0 ? `${data.workOrders.urgent} Urgent` : `${data.workOrders.inProgress} In Progress`}
                badgeTone={data.workOrders.urgent > 0 ? 'danger' : data.workOrders.open > 0 ? 'warn' : 'muted'}
                label="Open Facility Work Orders"
                value={String(data.workOrders.open)}
                valueSuffix="Tickets"
                footerLeft={`${data.workOrders.dispatched} assigned • ${data.workOrders.resolved} resolved`}
                footerRight={`${data.fleet.maintenanceUnits} Units Down`}
                footerRightTone={data.fleet.maintenanceUnits > 0 ? 'warn' : 'success'}
              />
            </section>

            {/* ── Escrow inflow + estate breakdown ── */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className={`${PANEL} flex flex-col justify-between p-6 lg:col-span-7`}>
                <div>
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                        Escrow Inflow Telemetry
                      </span>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                        Service Charge Inflow vs Facility Expenditure
                      </h2>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Paid service charges reconciled against allocated utility OpEx per month.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-container" /> Collections
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Operational OpEx
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-lowest/40 px-3 py-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span>
                      Collections YTD: <strong style={{ color: 'var(--text)' }}>{compactNgn(data.escrow.collectionsYtd)}</strong>
                    </span>
                    <span>
                      OpEx YTD: <strong style={{ color: 'var(--text)' }}>{compactNgn(data.escrow.opexYtd)}</strong>
                    </span>
                    <span>
                      Monthly rent roll: <strong style={{ color: 'var(--text)' }}>{compactNgn(data.fleet.monthlyRentRoll)}</strong>
                    </span>
                  </div>

                  <EscrowInflowChart months={data.months} />
                </div>

                {/* Per-estate breakdown */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl bg-surface-container-lowest/30 p-2.5 sm:grid-cols-2">
                  {data.estates.length === 0 ? (
                    <p className="col-span-2 py-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      No estates linked to this organization yet.
                    </p>
                  ) : (
                    data.estates.map((estate) => (
                      <div key={estate.id} className="flex items-start justify-between rounded-lg bg-surface-container/60 p-3 transition-colors hover:bg-surface-container">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-bold" style={{ color: 'var(--text)' }}>{estate.name}</span>
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: estate.openTickets > 0 ? WARN : SUCCESS }}
                            />
                          </div>
                          <span className="block text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                            {estate.address ?? '—'} • {estate.unitCount} unit{estate.unitCount === 1 ? '' : 's'} • {estate.occupiedCount} occupied
                          </span>
                          <span className="text-[11px] font-medium" style={{ color: ACCENT }}>
                            {compactNgn(estate.collected)} of {compactNgn(estate.billed)} billed
                          </span>
                        </div>
                        <Pill
                          label={`${estate.paidRate}% Paid`}
                          tone={estate.paidRate >= 90 ? 'success' : estate.paidRate >= 70 ? 'warn' : 'danger'}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Maintenance + compliance column */}
              <div className="space-y-6 lg:col-span-5">
                <MaintenancePanel data={data} />
                <CompliancePanel data={data} />
              </div>
            </section>

            {/* ── Units table ── */}
            <section className={`${PANEL} p-6`}>
              <UnitsTable
                units={data.units}
                overdueUnitIds={new Set(data.units.filter((u) => u.listing?.title && overdueListingIds.has(u.listing.title)).map((u) => u.id))}
              />
            </section>

            {/* ── Recent service charge cycles ── */}
            <section className={`${PANEL} p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Recent Service Charge Cycles</h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Latest billing periods issued across the portfolio.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link href="/dashboard/estate-manager/service-charges">
                    Billing dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {data.recentCharges.length === 0 ? (
                <EmptyPanel
                  icon={Receipt}
                  title="No service charge cycles yet"
                  description="Create a billing cycle to start reconciling escrow collections."
                  action={{ label: 'Set up cycles', href: '/dashboard/estate-manager/service-charges' }}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-elevated text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                        <th className="px-4 py-3">Cycle</th>
                        <th className="px-4 py-3">Estate</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentCharges.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-surface-container-high/40">
                          <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{c.period}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.listing?.title ?? '—'}</td>
                          <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{ngn(c.amount)}</td>
                          <td className="px-4 py-3">
                            <Pill label={titleize(c.status)} tone={CHARGE_STATUS_TONE[c.status] ?? 'muted'} />
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {formatDate(c.dueDate)}
                            {c.paidAt ? ` • Paid ${formatDate(c.paidAt)}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
