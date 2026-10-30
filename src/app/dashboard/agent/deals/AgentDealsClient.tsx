'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Download,
  Plus,
  Building2,
  PenLine,
  BadgeCheck,
  Wallet,
  TrendingUp,
  MoreVertical,
  Calendar,
  Lock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Inbox,
} from 'lucide-react';
import {
  AgentBreadcrumb,
  AgentCard,
  AgentCardHeader,
  AgentEmptyState,
  AgentStatCard,
  AgentTableWrap,
  AgentTd,
  AgentTh,
  FilterPill,
  PrimaryAction,
  SecondaryAction,
  ToneBadge,
  ToolbarSearch,
  ToolbarSelect,
} from '../_lib/agent-ui';
import {
  formatDate,
  formatNairaCompact,
  formatNairaValue,
  statusMeta,
  statusPillClass,
  typeMeta,
} from '../_lib/agent-deal-format';
import type { DealRecord, DealStats } from '../_lib/agent-deal-types';

type DealItem = DealRecord & { consideration: number };

const STATUS_ORDER = [
  'draft',
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
] as const;

export default function AgentDealsClient({
  initialDeals,
  stats,
}: {
  initialDeals: DealItem[];
  stats: DealStats;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    STATUS_ORDER.forEach((s) => map.set(s, initialDeals.filter((d) => d.status === s).length));
    return map;
  }, [initialDeals]);

  const typeOptions = useMemo(() => {
    const set = new Map<string, string>();
    initialDeals.forEach((d) => set.set(d.type, typeMeta(d.type).label));
    return [
      { value: 'all', label: 'All Agreement Types' },
      ...Array.from(set).map(([value, label]) => ({ value, label })),
    ];
  }, [initialDeals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = initialDeals.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (!q) return true;
      return (
        d.reference.toLowerCase().includes(q) ||
        (d.property?.title ?? '').toLowerCase().includes(q) ||
        (d.tenant?.fullName ?? '').toLowerCase().includes(q) ||
        (d.landlord?.fullName ?? '').toLowerCase().includes(q)
      );
    });
    return [...rows].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'value_desc') return b.consideration - a.consideration;
      if (sort === 'closing_asc') {
        const at = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bt = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return at - bt;
      }
      return 0;
    });
  }, [initialDeals, search, statusFilter, typeFilter, sort]);

  const exportLedger = () => {
    const header = [
      'Deal Ref',
      'Property',
      'Jurisdiction',
      'Counterparty',
      'Type',
      'Execution Status',
      'Consideration',
      'Escrow Deposit',
      'Start Date',
      'End Date',
      'Created',
    ];
    const rows = filtered.map((d) => [
      d.reference,
      d.property?.title ?? '—',
      d.property?.address ?? '—',
      d.tenant?.fullName ?? '—',
      typeMeta(d.type).label,
      statusMeta(d.status).label,
      String(d.consideration),
      String(d.cautionDeposit),
      d.startDate ? formatDate(d.startDate) : '—',
      d.endDate ? formatDate(d.endDate) : '—',
      formatDate(d.createdAt),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propati-agent-deals-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <AgentBreadcrumb
            items={[
              { label: 'Agent Dashboard', href: '/dashboard/agent' },
              { label: 'Pipelines & Deals' },
              { label: 'All Deals & Conveyancing Agreements', current: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Deals &amp; Agreements Ledger
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 font-mono-numeric text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {stats.active} Active Matters
            </span>
          </div>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Institutional tracking for commercial tenancies, outright conveyancing, and
            short-let lease agreements across Lagos State jurisdictions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/agent/pipeline"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-500" />
            Pipelines Kanban View
          </Link>
          <SecondaryAction icon={<Download className="h-4 w-4" />} onClick={exportLedger}>
            Export Ledger
          </SecondaryAction>
          <Link
            href="/dashboard/agent/agreements/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] active:scale-[0.98] dark:bg-primary dark:text-zinc-900 dark:hover:bg-[#4edea3]"
          >
            <Plus className="h-4 w-4" />
            <span>New Agreement</span>
          </Link>
        </div>
      </div>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgentStatCard
          label="Total Active Pipeline"
          value={String(stats.total)}
          icon={<Building2 className="h-5 w-5" />}
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                <TrendingUp className="h-3.5 w-3.5" />
                {stats.active} live
              </span>
              <span className="font-mono-numeric font-semibold">
                {formatNairaCompact(stats.grossValue)} total
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="Execution In-Progress"
          value={String(stats.pending)}
          icon={<PenLine className="h-5 w-5" />}
          accent="amber"
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">Awaiting signatures</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                ESCROW QUEUE
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="Fully Executed Matters"
          value={String(stats.closed)}
          icon={<BadgeCheck className="h-5 w-5" />}
          accent="neutral"
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">Registry stamped</span>
              <span className="font-mono-numeric font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                100% Bound
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="Projected Agency Fees"
          value={formatNairaCompact(stats.commissionValue)}
          icon={<Wallet className="h-5 w-5" />}
          accent="neutral"
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-numeric">10% Agency &amp; Legal</span>
              <span className="font-mono-numeric font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {formatNairaCompact(stats.escrowValue)} in escrow
              </span>
            </div>
          }
        />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <AgentCard className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xl lg:flex-1">
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by agreement ID, property title, tenant, or landlord…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarSelect
              ariaLabel="Agreement type filter"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-56"
              options={typeOptions}
            />
            <ToolbarSelect
              ariaLabel="Execution status filter"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-56"
              options={[
                { value: 'all', label: `All Active Statuses (${initialDeals.length})` },
                ...STATUS_ORDER.map((s) => ({ value: s, label: statusMeta(s).label })),
              ]}
            />
            <ToolbarSelect
              ariaLabel="Sort order"
              value={sort}
              onChange={setSort}
              className="w-56"
              options={[
                { value: 'newest', label: 'Sort: Created (Newest First)' },
                { value: 'oldest', label: 'Sort: Created (Oldest First)' },
                { value: 'value_desc', label: 'Sort: Highest Consideration' },
                { value: 'closing_asc', label: 'Sort: Nearest Closing Date' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Active Criteria:
          </span>
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} count={initialDeals.length}>
            Status: Active Pipeline
          </FilterPill>
          {STATUS_ORDER.map((s) => (
            <FilterPill
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              count={statusCounts.get(s) ?? 0}
            >
              {statusMeta(s).label}
            </FilterPill>
          ))}
          {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearch('');
              }}
              className="ml-auto text-[11px] font-semibold text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </AgentCard>

      {/* ── Master ledger ───────────────────────────────────────────────── */}
      <AgentTableWrap>
        <AgentCardHeader
          title="Master Deals &amp; Conveyancing Agreements Ledger"
          subtitle={`${filtered.length} of ${initialDeals.length} records with compliance signatures and escrow clearance flags`}
          icon={<FileText className="h-5 w-5" />}
        />
        {initialDeals.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No deals in the ledger"
            description="Agreements where you are the assigned agent will appear here once drafted or signed."
          />
        ) : filtered.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No deals match these filters"
            description="Adjust the status, type or search filters to widen the ledger."
          />
        ) : (
          <table className="w-full min-w-[1200px] border-collapse text-left text-[13px]">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <tr>
                <AgentTh>Deal ID &amp; Ref</AgentTh>
                <AgentTh>Property &amp; Jurisdiction</AgentTh>
                <AgentTh>Counterparty / Tenant</AgentTh>
                <AgentTh>Type</AgentTh>
                <AgentTh>Execution Status</AgentTh>
                <AgentTh className="text-right">Consideration &amp; Escrow</AgentTh>
                <AgentTh>Dates &amp; Milestone</AgentTh>
                <AgentTh className="text-right">Actions</AgentTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.map((d) => {
                const status = statusMeta(d.status);
                const type = typeMeta(d.type);
                return (
                  <tr
                    key={d.id}
                    className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <AgentTd>
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/agent/deals/${d.id}`}
                          className="font-mono-numeric font-bold text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
                        >
                          {d.reference}
                        </Link>
                        <span className="text-[11px] uppercase text-zinc-500">
                          {d.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd className="max-w-xs">
                      <div className="flex items-center gap-3">
                        {d.property?.imageUrl ? (
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <img
                              src={d.property.imageUrl}
                              alt={d.property.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <span className="block truncate font-semibold text-zinc-900 dark:text-white">
                            {d.property?.title ?? 'Untitled listing'}
                          </span>
                          <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">
                            {d.property?.address ?? '—'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <BadgeCheck className="h-3 w-3 text-primary dark:text-[#4edea3]" />
                            {d.landlord?.fullName ?? 'Unassigned landlord'}
                          </span>
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {d.tenant?.fullName ?? '—'}
                        </span>
                        {d.tenant?.email ? (
                          <span className="truncate text-xs text-zinc-500">{d.tenant.email}</span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 font-mono-numeric text-[11px] text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {d.headTenantVerified ? 'Verified entity' : 'Verification pending'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <ToneBadge className={type.className}>{type.label}</ToneBadge>
                    </AgentTd>
                    <AgentTd>
                      <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                        {status.label}
                      </ToneBadge>
                    </AgentTd>
                    <AgentTd className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono-numeric font-bold text-zinc-900 dark:text-white">
                          {formatNairaValue(d.consideration)}
                          {d.type !== 'sale' ? (
                            <span className="text-[11px] font-normal text-zinc-500">/yr</span>
                          ) : null}
                        </span>
                        <span className="inline-flex items-center gap-0.5 font-mono-numeric text-[11px] text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                          {d.cautionDeposit > 0 ? (
                            <>
                              <Lock className="h-3 w-3" />
                              Deposit: {formatNairaValue(d.cautionDeposit)}
                            </>
                          ) : (
                            'No deposit recorded'
                          )}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="flex flex-col font-mono-numeric text-xs">
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {d.startDate
                            ? `${formatDate(d.startDate)} – ${d.endDate ? formatDate(d.endDate) : '—'}`
                            : 'Dates not set'}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {d.finalizedAt
                            ? 'Execution complete'
                            : d.tenantSignedAt && d.landlordSignedAt
                              ? 'Awaiting finalization'
                              : 'Signature pending'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/agent/deals/${d.id}`}
                          className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-[var(--sovereign-hover)] transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-[#4edea3] dark:hover:bg-zinc-700"
                        >
                          View Deal
                        </Link>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="More actions"
                            onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                            className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === d.id ? (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                className="fixed inset-0 z-10 cursor-default"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-zinc-900">
                                <Link
                                  href={`/dashboard/agent/deals/${d.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" /> Open dossier
                                </Link>
                                {d.pdfUrl ? (
                                  <a
                                    href={d.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                  >
                                    <FileText className="h-3.5 w-3.5" /> Download agreement
                                  </a>
                                ) : null}
                                {d.stampDutyCertificateUrl ? (
                                  <a
                                    href={d.stampDutyCertificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Stamp duty certificate
                                  </a>
                                ) : null}
                                <Link
                                  href="/dashboard/agent/inspections/new"
                                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  <Calendar className="h-3.5 w-3.5" /> Schedule inspection
                                </Link>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </AgentTd>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AgentTableWrap>

      {/* ── Footer summary ──────────────────────────────────────────────── */}
      {initialDeals.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 text-[13px] text-zinc-600 sm:flex-row dark:bg-zinc-800/50 dark:text-zinc-400">
          <span>
            Showing <strong className="font-medium text-zinc-900 dark:text-white">{filtered.length}</strong>{' '}
            of <strong className="font-medium text-zinc-900 dark:text-white">{initialDeals.length}</strong>{' '}
            matters •{' '}
            <span className="font-mono-numeric font-medium text-zinc-900 dark:text-white">
              {formatNairaValue(stats.grossValue)}
            </span>{' '}
            total pipeline under mandate
          </span>
          <span className="font-mono-numeric text-[11px]">
            Escrow protected: {formatNairaValue(stats.escrowValue)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
