'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  Building2,
  Wallet,
  History,
  BadgeCheck,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  MapPin,
  Inbox,
  CheckCircle2,
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
  statusMeta,
  statusPillClass,
} from '../_lib/agent-deal-format';
import type { DealRecord, DealStats } from '../_lib/agent-deal-types';

type SellDeal = DealRecord & { consideration: number };

const STATUS_PILL_ORDER = [
  'draft',
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
] as const;

/** Sell-side conveyancing milestones, mirroring the pipeline stages. */
const MILESTONES = [
  { key: 'enquiries', label: '1. Mandate Draft' },
  { key: 'viewings', label: '2. Title Search' },
  { key: 'offers', label: '3. Vendor Review' },
  { key: 'agreements', label: '4. In Escrow' },
  { key: 'gov-consent', label: '5. Gov Consent' },
  { key: 'closed', label: '6. Stamped & Paid' },
] as const;

export default function AgentSellClient({
  initialDeals,
  stats,
  agentRef,
}: {
  initialDeals: SellDeal[];
  stats: DealStats;
  agentRef: string;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
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
      if (assetFilter !== 'all') {
        const lt = d.property?.listingType ?? '';
        const pt = d.property?.propertyType ?? '';
        if (assetFilter === 'sale' && lt !== 'sale' && lt !== 'commercial') return false;
        if (assetFilter === 'rental' && lt !== 'rent' && lt !== 'short_let') return false;
        if (assetFilter === 'land' && pt !== 'land' && pt !== 'plot') return false;
      }
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
  }, [initialDeals, search, statusFilter, assetFilter, sort]);

  const milestoneStats = useMemo(() => {
    const map = new Map<string, { units: number; value: number }>();
    MILESTONES.forEach((m) => map.set(m.key, { units: 0, value: 0 }));
    initialDeals.forEach((d) => {
      const bucket = map.get(d.stage);
      if (!bucket) return;
      bucket.units += 1;
      bucket.value += d.consideration;
    });
    return map;
  }, [initialDeals]);

  const exportLedger = () => {
    const header = [
      'Reference',
      'Property',
      'Address',
      'Vendor',
      'Purchaser',
      'Status',
      'Value',
      'Commission (10%)',
      'Created',
    ];
    const rows = filtered.map((d) => [
      d.reference,
      d.property?.title ?? '—',
      d.property?.address ?? '—',
      d.landlord?.fullName ?? '—',
      d.tenant?.fullName ?? '—',
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
    a.download = `propati-agent-disposal-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
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
              { label: 'Sell Pipeline (Vendor Mandates & Disposals)', current: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Sell Pipeline — Property Disposals &amp; Vendor Representation
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              Institutional Sell-Side
            </span>
          </div>
          <p className="max-w-4xl text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-mono-numeric font-medium text-zinc-900 dark:text-white">
              agentId: {agentRef.slice(0, 12).toUpperCase()}
            </span>{' '}
            • Mandated vendor sales files, outright property alienations, and deed conveyancing
            where agent represents property owners and sellers (
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono-numeric text-xs dark:bg-zinc-800">
              type = &apos;sale&apos;
            </code>
            ).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SecondaryAction icon={<Download className="h-4 w-4" />} onClick={exportLedger}>
            Export Disposal Ledger
          </SecondaryAction>
          <Link
            href="/dashboard/agent/listings/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)] dark:bg-primary dark:text-zinc-900 dark:hover:bg-[#4edea3]"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Sale Mandate</span>
          </Link>
        </div>
      </div>

      {/* ── Bento KPI cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AgentStatCard
          label="Total Deals"
          value={String(stats.total)}
          icon={<Building2 className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Disposal mandates
            </span>
          }
        />
        <AgentStatCard
          label="Total Pipeline Value"
          value={formatNairaCompact(stats.grossValue)}
          icon={<Wallet className="h-5 w-5" />}
          accent="neutral"
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span>Gross listing</span>
              <span className="font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {formatNairaCompact(
                  Math.round(stats.grossValue * 0.05)
                )}{' '}
                Est. Fee (5%)
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="In Progress"
          value={String(stats.active)}
          icon={<History className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              In escrow &amp; vetting
            </span>
          }
        />
        <AgentStatCard
          label="Closed &amp; Executed"
          value={String(stats.closed)}
          icon={<BadgeCheck className="h-5 w-5" />}
          accent="neutral"
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
                Escrow disbursed
              </span>
              <span className="font-mono-numeric text-[11px] text-zinc-500">
                {formatNairaCompact(stats.commissionValue)}
              </span>
            </div>
          }
        />
      </div>

      {/* ── Milestone flow ──────────────────────────────────────────────── */}
      <AgentCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Sell Conveyancing Milestones
          </span>
          <span className="text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            Alausa Lands Registry Active Link
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {MILESTONES.map((m) => {
            const stat = milestoneStats.get(m.key) ?? { units: 0, value: 0 };
            const isLast = m.key === 'closed';
            return (
              <div
                key={m.key}
                className={`flex flex-col rounded-lg p-2 ${
                  isLast
                    ? 'bg-primary/10 ring-1 ring-primary/20'
                    : 'bg-zinc-50 dark:bg-zinc-800/50'
                }`}
              >
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{m.label}</span>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span
                    className={`font-mono-numeric text-sm font-semibold ${
                      isLast ? 'text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {stat.units} {stat.units === 1 ? 'Unit' : 'Units'}
                  </span>
                  <span className="font-mono-numeric text-[11px] text-zinc-500">
                    {formatNairaCompact(stat.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </AgentCard>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <AgentCard className="space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xl lg:flex-1">
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by property title, buyer or vendor…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarSelect
              ariaLabel="Asset type filter"
              value={assetFilter}
              onChange={setAssetFilter}
              className="w-60"
              options={[
                { value: 'all', label: 'All Asset Types' },
                { value: 'sale', label: 'Freehold & Commercial Sale' },
                { value: 'rental', label: 'Registered Lease' },
                { value: 'land', label: 'Cadastral Land Parcels' },
              ]}
            />
            <ToolbarSelect
              ariaLabel="Sort order"
              value={sort}
              onChange={setSort}
              className="w-52"
              options={[
                { value: 'value_desc', label: 'Sort: Highest Valuation' },
                { value: 'value_asc', label: 'Sort: Lowest Valuation' },
                { value: 'newest', label: 'Sort: Date Created (Newest)' },
                { value: 'oldest', label: 'Sort: Date Created (Oldest)' },
              ]}
            />
            <SecondaryAction
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setStatusFilter('all');
                setAssetFilter('all');
                setSearch('');
              }}
            >
              Filters
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

      {/* ── Conveyancing ledger (sell-side) ─────────────────────────────── */}
      <AgentTableWrap>
        <AgentCardHeader
          title="Conveyancing Ledger (Sell-side)"
          subtitle={`${filtered.length} of ${initialDeals.length} disposal mandate${initialDeals.length === 1 ? '' : 's'}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        {initialDeals.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No vendor mandates yet"
            description="Listings where you act as the seller's agent will appear here with their title-search, escrow and consent milestones."
          />
        ) : filtered.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No mandates match these filters"
            description="Adjust the status, asset type or search filters to widen the ledger."
          />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <tr>
                <AgentTh>Property &amp; Cadastral</AgentTh>
                <AgentTh>Purchaser / Buyer Entity</AgentTh>
                <AgentTh>Mandate Vendor (Seller)</AgentTh>
                <AgentTh>Status Stage</AgentTh>
                <AgentTh className="text-right">Value &amp; Commission</AgentTh>
                <AgentTh>Created</AgentTh>
                <AgentTh className="text-right">Actions</AgentTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-[13px] dark:divide-white/[0.06]">
              {filtered.map((d) => {
                const status = statusMeta(d.status);
                const fee = Math.round(d.consideration * 0.05);
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
                          <span className="truncate text-zinc-500">
                            {d.property?.address ?? '—'}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                            <BadgeCheck className="h-3 w-3 text-primary dark:text-[#4edea3]" />
                            {d.reference}
                            {d.property?.area ? ` • ${d.property.area}` : ''}
                          </span>
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      {d.tenant ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {d.tenant.fullName}
                          </span>
                          <div className="mt-0.5 flex items-center gap-1">
                            {d.tenant.email ? (
                              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.2 text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                <CheckCircle2 className="h-3 w-3" />
                                {d.tenant.email.split('@')[1] ?? 'Verified'}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500">Awaiting purchaser</span>
                      )}
                    </AgentTd>
                    <AgentTd>
                      <div className="flex flex-col">
                        <span className="truncate font-medium text-zinc-900 dark:text-white">
                          {d.landlord?.fullName ?? '—'}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {d.status === 'draft'
                            ? 'Sole Mandate • awaiting title search'
                            : 'Power of Attorney filed'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <div className="inline-flex flex-col gap-0.5">
                        <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                          {status.label}
                        </ToneBadge>
                        <span className="text-[11px] text-zinc-500">
                          {d.stampDutyCertificateUrl
                            ? "Gov's Consent at Alausa"
                            : d.status === 'fully_signed'
                              ? 'Stamped & registered'
                              : d.jurisdictionState
                                ? `${d.jurisdictionState} registry`
                                : 'In progress'}
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono-numeric text-sm font-bold text-zinc-900 dark:text-white">
                          {formatNairaValue(d.consideration)}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                          {formatNairaValue(fee)} Fee (5%)
                        </span>
                      </div>
                    </AgentTd>
                    <AgentTd>
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
                        {formatDate(d.createdAt)}
                      </span>
                    </AgentTd>
                    <AgentTd className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        ) : null}
                      </div>
                    </AgentTd>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AgentTableWrap>
    </div>
  );
}
