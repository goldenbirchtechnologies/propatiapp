'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Table2,
  Download,
  Plus,
  Package,
  Wallet,
  History,
  BadgeCheck,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  Wallet as WalletIcon,
  Landmark,
  MapPin,
  Inbox,
  ChevronDown,
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
  SecondaryAction,
  ToneBadge,
  ToolbarSearch,
  ToolbarSelect,
} from '../_lib/agent-ui';
import {
  formatDate,
  formatNairaCompact,
  formatNairaValue,
  humanise,
  statusMeta,
  statusPillClass,
  typeMeta,
} from '../_lib/agent-deal-format';
import type { DealRecord, DealStats } from '../_lib/agent-deal-types';

type BuyDeal = DealRecord & { consideration: number };

const STATUS_PILL_ORDER = [
  'draft',
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
] as const;

export default function AgentBuyClient({
  initialDeals,
  stats,
  agentRef,
}: {
  initialDeals: BuyDeal[];
  stats: DealStats;
  agentRef: string;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('value_desc');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    STATUS_PILL_ORDER.forEach((s) => {
      map.set(s, initialDeals.filter((d) => d.status === s).length);
    });
    return map;
  }, [initialDeals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = initialDeals.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (!q) return true;
      return (
        (d.property?.title ?? '').toLowerCase().includes(q) ||
        (d.property?.address ?? '').toLowerCase().includes(q) ||
        (d.tenant?.fullName ?? '').toLowerCase().includes(q) ||
        (d.landlord?.fullName ?? '').toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q)
      );
    });
    return [...rows].sort((a, b) => {
      if (sort === 'value_desc') return b.consideration - a.consideration;
      if (sort === 'value_asc') return a.consideration - b.consideration;
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });
  }, [initialDeals, search, statusFilter, typeFilter, sort]);

  const exportLedger = () => {
    const header = [
      'Reference',
      'Property',
      'Address',
      'Seller',
      'Buyer',
      'Tenure',
      'Status',
      'Consideration',
      'Fee (10%)',
      'Created',
    ];
    const rows = filtered.map((d) => [
      d.reference,
      d.property?.title ?? '—',
      d.property?.address ?? '—',
      d.landlord?.fullName ?? '—',
      d.tenant?.fullName ?? '—',
      d.property?.listingType ?? d.type,
      statusMeta(d.status).label,
      String(d.consideration),
      String(Math.round(d.consideration * 0.1)),
      formatDate(d.createdAt),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propati-agent-buy-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <AgentBreadcrumb
            items={[
              { label: 'Sales & CRM', href: '/dashboard/agent' },
              { label: 'Pipelines' },
              { label: 'Buy Pipeline (Sale Conveyancing)', current: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Buy Pipeline — Property Acquisitions &amp; Sales
            </h1>
            <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono-numeric text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              agentId: {agentRef.slice(0, 12).toUpperCase()}
            </span>
          </div>
          <p className="max-w-4xl text-sm text-zinc-600 dark:text-zinc-400">
            Institutional conveyancing mandates, outright freehold transactions, and deed
            executions where <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono-numeric text-xs dark:bg-zinc-800">type = &apos;sale&apos;</code>.
            Real-time Lands Bureau compliance tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SecondaryAction icon={<Table2 className="h-4 w-4" />} onClick={exportLedger}>
            Export Sales Ledger
          </SecondaryAction>
          <Link
            href="/dashboard/agent/agreements/new?type=sale"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)] dark:bg-primary dark:text-zinc-900 dark:hover:bg-[#4edea3]"
          >
            <Plus className="h-4 w-4" />
            <span>New Sale Agreement</span>
          </Link>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AgentStatCard
          label="Total Deals"
          value={String(stats.total)}
          icon={<Package className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {stats.active} in progress
            </span>
          }
        />
        <AgentStatCard
          label="Total Pipeline Value"
          value={formatNairaCompact(stats.grossValue)}
          icon={<Wallet className="h-5 w-5" />}
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span>Gross capital transactions</span>
              <span className="font-mono-numeric text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {formatNairaCompact(stats.commissionValue)} Comm. Pool
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="Active Pending"
          value={String(stats.pending)}
          icon={<History className="h-5 w-5" />}
          accent="amber"
          sublabel={
            <span className="truncate">
              {stats.pending > 0
                ? 'Awaiting signature &amp; statutory clearance'
                : 'No matters awaiting signature'}
            </span>
          }
        />
        <AgentStatCard
          label="Closed &amp; Executed"
          value={String(stats.closed)}
          icon={<BadgeCheck className="h-5 w-5" />}
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Escrow settled
              </span>
              <span className="font-mono-numeric text-[11px] text-zinc-500">
                {stats.closed === stats.total && stats.total > 0 ? '100% Cleared' : '—'}
              </span>
            </div>
          }
        />
      </div>

      {/* ── Filter / query bar ──────────────────────────────────────────── */}
      <AgentCard className="space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xl lg:flex-1">
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by property title, buyer/seller name, or agreement ID…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarSelect
              ariaLabel="Tenure filter"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-56"
              options={[
                { value: 'all', label: 'All Types (Freehold & Land)' },
                { value: 'sale', label: 'Outright Sale' },
                { value: 'rental', label: 'Registered Sublease' },
                { value: 'short_let', label: 'Short-Let' },
                { value: 'share', label: 'Share Tenancy' },
              ]}
            />
            <ToolbarSelect
              ariaLabel="Sort order"
              value={sort}
              onChange={setSort}
              className="w-56"
              options={[
                { value: 'value_desc', label: 'Sort: Highest Value' },
                { value: 'value_asc', label: 'Sort: Lowest Value' },
                { value: 'newest', label: 'Sort: Date Created (Newest)' },
                { value: 'oldest', label: 'Sort: Date Created (Oldest)' },
              ]}
            />
            <SecondaryAction
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearch('');
              }}
            >
              Advanced
            </SecondaryAction>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} count={initialDeals.length}>
            All Statuses
          </FilterPill>
          {STATUS_PILL_ORDER.map((s) => (
            <FilterPill
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              count={counts.get(s) ?? 0}
            >
              {statusMeta(s).label}
            </FilterPill>
          ))}
        </div>
      </AgentCard>

      {/* ── Sale conveyancing ledger ────────────────────────────────────── */}
      <AgentTableWrap>
        <AgentCardHeader
          title="Sale Conveyancing Ledger"
          subtitle={`${filtered.length} acquisition file${filtered.length === 1 ? '' : 's'} under mandate`}
          icon={<Landmark className="h-5 w-5" />}
        />
        {initialDeals.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No buy-side acquisitions yet"
            description="Sale agreements where you are the assigned agent will appear here with their Lands Bureau clearance status."
          />
        ) : filtered.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No acquisitions match these filters"
            description="Adjust the status, tenure or search filters to widen the ledger."
          />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <tr>
                <AgentTh>Property &amp; Cadastral Reference</AgentTh>
                <AgentTh>Contract Parties</AgentTh>
                <AgentTh>Acquisition Tenure</AgentTh>
                <AgentTh>Conveyancing Status</AgentTh>
                <AgentTh className="text-right">Consideration &amp; Fee</AgentTh>
                <AgentTh>Timeline</AgentTh>
                <AgentTh className="text-center">Actions</AgentTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.map((d) => {
                const status = statusMeta(d.status);
                const fee = Math.round(d.consideration * 0.1);
                return (
                  <tr
                    key={d.id}
                    className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <AgentTd>
                      <div className="flex items-center gap-3">
                        {d.property?.imageUrl ? (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <img
                              src={d.property.imageUrl}
                              alt={d.property.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                            <MapPin className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={`/dashboard/agent/deals/${d.id}`}
                            className="truncate font-semibold text-zinc-900 hover:text-[var(--sovereign-hover)] dark:text-white dark:hover:text-[#4edea3]"
                          >
                            {d.property?.title ?? 'Untitled listing'}
                          </Link>
                          <span className="truncate text-xs text-zinc-500">
                            {d.property?.address ?? '—'}
                          </span>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="rounded bg-zinc-100 px-1 font-mono-numeric text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {d.reference}
                            </span>
                            {d.property?.area ? (
                              <span className="text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                {d.property.area}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 text-[11px] uppercase text-zinc-500">S:</span>
                          <span className="truncate text-[13px] font-medium text-zinc-900 dark:text-white">
                            {d.landlord?.fullName ?? '—'}
                          </span>
                          {d.landlord?.email ? (
                            <span
                              title={`CAC verified: ${d.landlord.email}`}
                              className="text-primary dark:text-[#4edea3]"
                            >
                              <BadgeCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 text-[11px] uppercase text-zinc-500">B:</span>
                          <span className="truncate text-[13px] text-zinc-600 dark:text-zinc-400">
                            {d.tenant?.fullName ?? '—'}
                          </span>
                          {d.tenant?.email ? (
                            <span
                              title={`CAC verified: ${d.tenant.email}`}
                              className="text-primary dark:text-[#4edea3]"
                            >
                              <BadgeCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-zinc-900 dark:text-white">
                          {typeMeta(d.type).label}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {d.property?.listingType === 'sale'
                            ? 'Unencumbered Deed of Assignment'
                            : d.property?.listingType === 'commercial'
                              ? 'Registered Sublease'
                              : 'Deed of Tenancy'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="inline-flex flex-col items-start gap-1">
                        <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                          {status.label}
                        </ToneBadge>
                        <span className="pl-1 text-[11px] text-zinc-500">
                          {d.stampDutyCertificateUrl
                            ? 'E-stamped & registered'
                            : d.stampDutyAmount
                              ? 'E-stamping in progress'
                              : d.jurisdictionState
                                ? `${d.jurisdictionState} registry`
                                : 'Legal vetting underway'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono-numeric text-sm font-semibold text-zinc-900 dark:text-white">
                          {formatNairaValue(d.consideration)}
                        </span>
                        <span className="mt-0.5 inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.2 font-mono-numeric text-[11px] font-medium text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-[#4edea3]">
                          {formatNairaValue(fee)} Fee (10%)
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-zinc-900 dark:text-white">
                          {d.endDate
                            ? `Target: ${formatDate(d.endDate)}`
                            : `Created: ${formatDate(d.createdAt)}`}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {d.tenantSignedAt
                            ? 'Buyer signed'
                            : d.landlordSignedAt
                              ? 'Seller signed'
                              : 'Awaiting first signature'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/agent/deals/${d.id}`}
                          className="inline-flex h-8 items-center gap-1 rounded bg-zinc-100 px-2.5 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-primary hover:text-white dark:bg-zinc-800 dark:text-white dark:hover:bg-primary dark:hover:text-zinc-900"
                        >
                          File
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        {d.pdfUrl ? (
                          <a
                            href={d.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Download contract"
                            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : (
                          <span
                            title="Escrow not yet funded"
                            className="rounded p-1.5 text-zinc-400 dark:text-zinc-600"
                          >
                            <WalletIcon className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </AgentTd>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AgentTableWrap>

      {/* ── Footer banner ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-[#4edea3]">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Governor&apos;s Consent &amp; Stamp Duty Protocol Active
            </h3>
            <p className="max-w-2xl text-xs text-zinc-600 dark:text-zinc-400">
              Agreements marked Fully Signed initiate electronic e-stamping and Deed of
              Assignment lodgement via the Lagos State Lands Bureau Registry (Alausa, Ikeja).
              Escrow releases are held until certificate clearance.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded bg-zinc-100 px-2.5 py-1 font-mono-numeric text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Lands Bureau Gateway Connected
        </span>
      </div>
    </div>
  );
}
