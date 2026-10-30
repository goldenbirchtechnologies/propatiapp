'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Building2,
  TrendingUp,
  BadgeCheck,
  Shield,
  AlertTriangle,
  CheckSquare,
  FileDown,
  Bookmark,
} from 'lucide-react';
import {
  CARD,
  CARD_SOFT,
  LABEL_SM,
  TITLE_MD,
  TITLE_SM,
  HEADLINE_LG,
  BODY_SM,
  MONO_NUMERIC,
  MUTED,
  PRIMARY_TEXT,
  PRIMARY_CONTAINER_BG,
  PRIMARY_CONTAINER_TEXT,
  SECONDARY_CONTAINER_BG,
  SECONDARY_CONTAINER_TEXT,
  TERTIARY_TEXT,
  ON_SURFACE,
  DIVIDER,
  naira,
  humanise,
  listingStatusPill,
  verificationTierPill,
  pct,
} from '../agent-stitch';

export interface AgentListingRow {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  status: string;
  verificationTier: string;
  viewsCount: number;
  price: number;
  pricePeriod: string | null;
  coverImage: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  /** 'direct' when agentId === user.id, 'cobrokered' when assigned via AgentAssignment. */
  mandateType: 'direct' | 'cobrokered';
  unitCount: number;
  vacantUnitCount: number;
  createdAt: string;
}

export interface AgentListingsClientProps {
  initialListings: AgentListingRow[];
  totalCount: number;
  agentName: string;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Listing Type: All Types' },
  { value: 'rent', label: 'Annual Lease (Residential)' },
  { value: 'commercial', label: 'Commercial Lease (Grade A)' },
  { value: 'sale', label: 'Outright Sale (Freehold)' },
  { value: 'short_let', label: 'Short-Let Luxury' },
  { value: 'share', label: 'Shared / Co-Ownership' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status: All Statuses' },
  { value: 'active', label: 'Active / Public' },
  { value: 'draft', label: 'Under Review' },
  { value: 'suspended', label: 'Suspended / Flagged' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'Verification: All Tiers' },
  { value: 'certified', label: 'Tier 4 — Certified' },
  { value: 'inspected', label: 'Tier 3 — Inspected' },
  { value: 'verified', label: 'Tier 2 — Verified' },
  { value: 'basic', label: 'Tier 1 — Basic' },
];

const SORT_OPTIONS = [
  { value: 'traction', label: 'Sort: Most Traction' },
  { value: 'recent', label: 'Sort: Recently Mandated' },
  { value: 'price-desc', label: 'Sort: Highest Valuation' },
  { value: 'price-asc', label: 'Sort: Lowest Valuation' },
];

const selectClass =
  'h-10 appearance-none rounded-lg bg-zinc-50 pl-3 pr-8 text-[13px] leading-[18px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:ring-primary';

export default function AgentListingsClient({
  initialListings,
  totalCount,
  agentName,
}: AgentListingsClientProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sort, setSort] = useState('traction');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const active = initialListings.filter((l) => l.status === 'active');
    const review = initialListings.filter((l) => l.status === 'draft');
    const flagged = initialListings.filter((l) => l.status === 'suspended');
    const direct = initialListings.filter((l) => l.mandateType === 'direct');
    const cobrokered = initialListings.filter((l) => l.mandateType === 'cobrokered');
    return {
      total: initialListings.length,
      active: active.length,
      review: review.length,
      flagged: flagged.length,
      direct: direct.length,
      cobrokered: cobrokered.length,
      livePct: pct(active.length, initialListings.length),
      views: initialListings.reduce((sum, l) => sum + l.viewsCount, 0),
    };
  }, [initialListings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = initialListings.filter((l) => {
      if (typeFilter !== 'all' && l.listingType !== typeFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (tierFilter !== 'all' && l.verificationTier !== tierFilter) return false;
      if (!q) return true;
      return [l.title, l.address, l.area, l.state, l.id]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    return rows.sort((a, b) => {
      switch (sort) {
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return b.viewsCount - a.viewsCount;
      }
    });
  }, [initialListings, query, typeFilter, statusFilter, tierFilter, sort]);

  const hasFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    tierFilter !== 'all' ||
    sort !== 'traction';

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setTierFilter('all');
    setSort('traction');
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((l) => l.id))
    );
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="space-y-6">
      {/* ============ TOP COMMAND BAR ============ */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb & Status Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-500">
            <span className={`${LABEL_SM} uppercase`}>Sales &amp; CRM</span>
            <ChevronRight size={14} />
            <span className={`${LABEL_SM} uppercase font-semibold ${PRIMARY_TEXT}`}>Listings</span>
            <span className="mx-1 h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className={`${MONO_NUMERIC} ${BODY_SM} font-medium ${MUTED}`}>
              Mandated &amp; Brokered Ledger
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`hidden items-center gap-1.5 rounded px-2 py-1 sm:flex ${CARD_SOFT} ${BODY_SM} ${MUTED}`}
            >
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className={`${MONO_NUMERIC}`}>Lands Bureau Sync: Synchronized</span>
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[13px] leading-[18px] text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              <FileDown size={18} className="text-zinc-500 dark:text-zinc-500" />
              <span>Export Listings Ledger</span>
            </button>
            <Link
              href="/dashboard/agent/listings/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] dark:bg-[#4edea3] dark:text-primary dark:hover:bg-primary"
            >
              <Plus size={18} />
              <span>Create New Listing</span>
            </Link>
          </div>
        </div>

        {/* Page Descriptor Header */}
        <div className="flex max-w-4xl flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className={`${HEADLINE_LG} ${ON_SURFACE} tracking-tight`}>
              Assigned Property Listings
            </h1>
            <span
              className={`rounded bg-zinc-200 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`}
            >
              Scope: Mandate Ledger
            </span>
          </div>
          <p className={`text-[14px] leading-5 ${MUTED} leading-relaxed`}>
            Active portfolio listings assigned via Direct Mandate or Co-Brokering Protocol (
            <span className={`${MONO_NUMERIC} ${BODY_SM} ${ON_SURFACE}`}>
              agentId = user.id | assignment = &apos;active&apos;
            </span>
            ). Real-time Lands Bureau cadastral records &amp; CAC registration validation sync
            enabled.
          </p>
        </div>
      </div>

      {/* ============ 4-COLUMN STAT SUMMARY BENTO GRID ============ */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Assigned Assets */}
        <div
          className={`${CARD} relative flex flex-col justify-between overflow-hidden p-6 transition-shadow hover:shadow-md`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-x-3 -translate-y-3 rounded-full bg-zinc-100 opacity-60 dark:bg-zinc-800/60"
          />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
                Total Assigned Assets
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`${HEADLINE_LG} ${ON_SURFACE} font-semibold`}>
                  {stats.total}
                </span>
                <span
                  className={`rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
                >
                  Allocated
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-100 p-2.5 text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-[#4edea3]">
              <Building2 size={24} />
            </div>
          </div>
          <div
            className={`mt-4 flex items-center justify-between border-t pt-3 ${DIVIDER} ${MUTED}`}
          >
            <span className={`${BODY_SM}`}>{stats.direct} Direct Mandates</span>
            <span className={`${MONO_NUMERIC} ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
              {stats.cobrokered} Co-brokered
            </span>
          </div>
        </div>

        {/* Active Live Listings */}
        <div
          className={`${CARD} relative flex flex-col justify-between overflow-hidden p-6 transition-shadow hover:shadow-md`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-x-3 -translate-y-3 rounded-full bg-primary/40 opacity-60 dark:bg-primary/10"
          />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span
                className={`${LABEL_SM} uppercase text-[var(--sovereign-hover)] dark:text-[#6ffbbe]`}
              >
                Syndicated Real-Time
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`${HEADLINE_LG} ${ON_SURFACE} font-semibold`}>
                  {stats.active}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${SECONDARY_CONTAINER_BG} ${SECONDARY_CONTAINER_TEXT}`}
                >
                  {stats.livePct}% Live
                </span>
              </div>
            </div>
            <div
              className={`rounded-lg p-2.5 ${SECONDARY_CONTAINER_BG} text-[var(--sovereign-hover)] dark:text-[#6ffbbe]`}
            >
              <TrendingUp size={24} />
            </div>
          </div>
          <div
            className={`mt-4 flex items-center justify-between border-t pt-3 ${DIVIDER} ${MUTED}`}
          >
            <span className={`${BODY_SM} truncate`}>Public Sovereign Portal &amp; MLS</span>
            <BadgeCheck size={16} className={PRIMARY_TEXT} />
          </div>
        </div>

        {/* Draft & Review */}
        <div
          className={`${CARD} relative flex flex-col justify-between overflow-hidden p-6 transition-shadow hover:shadow-md`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-x-3 -translate-y-3 rounded-full bg-zinc-100 opacity-60 dark:bg-zinc-800/60"
          />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
                Under Due Diligence
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`${HEADLINE_LG} ${ON_SURFACE} font-semibold`}>
                  {stats.review}
                </span>
                <span
                  className={`rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300`}
                >
                  Pending Approval
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-200 p-2.5 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
              <CheckSquare size={24} />
            </div>
          </div>
          <div
            className={`mt-4 flex items-center justify-between border-t pt-3 ${DIVIDER} ${MUTED}`}
          >
            <span className={`${BODY_SM} truncate`}>Title deed verification &amp; photos</span>
            <span className={`${MONO_NUMERIC} ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
              {stats.views.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Suspended / Flagged */}
        <div
          className={`${CARD} relative flex flex-col justify-between overflow-hidden p-6 transition-shadow hover:shadow-md`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-x-3 -translate-y-3 rounded-full bg-red-100 opacity-60 dark:bg-red-500/10"
          />
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className={`${LABEL_SM} uppercase text-red-700 dark:text-red-400`}>
                Compliance Flagged
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className={`${HEADLINE_LG} font-semibold text-red-700 dark:text-red-400`}
                >
                  {stats.flagged}
                </span>
                <span
                  className={`rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-800 dark:bg-red-500/20 dark:text-red-300`}
                >
                  Action Required
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-red-100 p-2.5 text-red-700 dark:bg-red-500/20 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div
            className={`mt-4 flex items-center justify-between border-t pt-3 ${DIVIDER} ${MUTED}`}
          >
            <span className={`${BODY_SM} truncate`}>Suspended from public MLS</span>
            <AlertTriangle size={16} className="text-red-700 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* ============ FILTRATION MATRIX & VIEW MODIFIERS ============ */}
      <div>
        <div
          className={`${CARD} flex flex-col items-stretch justify-between gap-4 p-4 lg:flex-row lg:items-center`}
        >
          {/* Search Input */}
          <div className="relative min-w-[280px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, cadastral street address, LGA, or listing ID..."
              className="h-10 w-full rounded-lg bg-zinc-50 pl-9 pr-4 text-[12px] leading-4 text-zinc-900 shadow-inner placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:ring-primary"
            />
          </div>

          {/* Select Groups */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by listing type"
              className={selectClass}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className={selectClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filter by verification tier"
              className={selectClass}
            >
              {TIER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort listings"
              className={selectClass}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-10 px-3 text-[13px] leading-[18px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-lg bg-zinc-100 px-3 text-[13px] leading-[18px] text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                <Bookmark size={16} />
                <span className="hidden sm:inline">Save Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ PRIMARY LEDGER TABLE VIEW ============ */}
      <div className={`${CARD} flex flex-col overflow-hidden`}>
        {/* Ledger Head Action Strip */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 px-6 py-2 dark:bg-zinc-800/50`}
        >
          <div className="flex items-center gap-4">
            <span className={`${TITLE_SM} ${ON_SURFACE}`}>Institutional Portfolio Records</span>
            <span className={`${MONO_NUMERIC} ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
              Viewing 1–{filtered.length} of {totalCount} Assets
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
              Bulk Action:
            </span>
            <button
              type="button"
              disabled={selected.size === 0}
              className="rounded bg-zinc-100 px-2.5 py-1 text-[13px] leading-[18px] text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Syndicate Selected
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              className="rounded bg-zinc-100 px-2.5 py-1 text-[13px] leading-[18px] text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Download Factsheet
            </button>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className={`${LABEL_SM} bg-zinc-50 text-zinc-500 dark:text-zinc-500 dark:bg-zinc-800/50`}
              >
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all listings"
                    className="h-4 w-4 cursor-pointer rounded accent-primary focus:ring-primary"
                  />
                </th>
                <th className="min-w-[280px] px-4 py-3">Property Asset</th>
                <th className="min-w-[150px] px-4 py-3">Listing Modality</th>
                <th className="min-w-[130px] px-4 py-3">Live Status</th>
                <th className="min-w-[140px] px-4 py-3">Traction &amp; Inquiries</th>
                <th className="min-w-[150px] px-4 py-3">Title Verification</th>
                <th className="min-w-[160px] px-4 py-3 text-right">Mandate Valuation</th>
                <th className="min-w-[180px] px-4 py-3">Landlord / Entity</th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${DIVIDER} ${BODY_SM} ${ON_SURFACE}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Building2
                      size={40}
                      className="mx-auto mb-3 text-zinc-500 dark:text-zinc-400"
                      style={{ opacity: 0.5 }}
                    />
                    <p className={`${TITLE_SM} ${ON_SURFACE}`}>No listings found</p>
                    <p className={`mt-1 ${BODY_SM} ${MUTED}`}>
                      {initialListings.length === 0
                        ? 'Accepted mandates will appear here once a landlord assigns you.'
                        : 'No listings match the current filters.'}
                    </p>
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className={`mt-3 text-[13px] font-semibold ${PRIMARY_TEXT} hover:underline`}
                      >
                        Clear all filters
                      </button>
                    ) : null}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const pill = listingStatusPill(l.status);
                  const tier = verificationTierPill(l.verificationTier);
                  const TierIcon = tier.icon === 'verified' ? BadgeCheck : Shield;
                  const isFlagged = l.status === 'suspended';
                  return (
                    <tr
                      key={l.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(l.id)}
                          onChange={() => toggleOne(l.id)}
                          aria-label={`Select ${l.title}`}
                          className="h-4 w-4 cursor-pointer accent-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            {l.coverImage ? (
                              <img
                                src={l.coverImage}
                                alt={l.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Building2
                                  size={20}
                                  className="text-zinc-500 dark:text-zinc-400"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <Link
                              href={`/dashboard/agent/listings/${l.id}`}
                              className={`${TITLE_SM} truncate transition-colors hover:text-[var(--sovereign-hover)] dark:hover:text-[#4edea3]`}
                            >
                              {l.title}
                            </Link>
                            <span className={`${BODY_SM} truncate ${MUTED}`}>
                              {l.address || [l.area, l.state].filter(Boolean).join(', ')}
                            </span>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span
                                className={`rounded bg-zinc-100 px-1.5 py-0.2 font-mono text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}
                              >
                                {l.id.slice(-12).toUpperCase()}
                              </span>
                              <span
                                className={`text-[11px] font-medium ${
                                  isFlagged
                                    ? TERTIARY_TEXT
                                    : 'text-[var(--sovereign-hover)] dark:text-[#4edea3]'
                                }`}
                              >
                                · {l.mandateType === 'direct' ? 'Direct Exclusive' : 'Co-brokered'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className={`text-[13px] leading-[18px] font-medium ${ON_SURFACE}`}>
                            {humanise(l.listingType)}
                          </span>
                          <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
                            {humanise(l.propertyType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${pill.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${pill.dot} ${
                              l.status === 'active' ? 'animate-pulse' : ''
                            }`}
                          />
                          {pill.label}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <div
                            className={`flex items-center gap-1 ${MONO_NUMERIC} ${TITLE_SM} font-semibold ${ON_SURFACE}`}
                          >
                            <span>{l.viewsCount.toLocaleString()}</span>
                            {l.viewsCount > 0 ? (
                              <TrendingUp size={16} className="text-[var(--sovereign-hover)] dark:text-[#4edea3]" />
                            ) : null}
                          </div>
                          <div
                            className={`flex items-center gap-1 text-[11px] ${
                              l.viewsCount > 0
                                ? 'font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]'
                                : 'text-zinc-500 dark:text-zinc-500'
                            }`}
                          >
                            {l.viewsCount > 0 ? (
                              <>
                                <span>Active interest</span>
                                <span className="text-zinc-500 dark:text-zinc-500">
                                  · {l.unitCount} units
                                </span>
                              </>
                            ) : (
                              <span>No traction yet</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 ${
                            tier.icon === 'verified'
                              ? 'bg-primary/60 text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe]'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          <TierIcon size={16} />
                          <span className={`${LABEL_SM} font-semibold`}>{tier.label}</span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-500">
                          {l.vacantUnitCount > 0
                            ? `${l.vacantUnitCount} units vacant`
                            : 'Fully allocated'}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`${MONO_NUMERIC} text-[16px] font-bold ${ON_SURFACE}`}>
                            {naira(l.price)}
                          </span>
                          <span
                            className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}
                          >
                            {l.pricePeriod === 'year'
                              ? 'Per Annum'
                              : l.pricePeriod === 'month'
                                ? 'Monthly'
                                : l.pricePeriod
                                  ? humanise(l.pricePeriod)
                                  : 'As Listed'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className={`text-[13px] leading-[18px] font-semibold ${ON_SURFACE}`}>
                            {l.ownerName || '—'}
                          </span>
                          <span className={`${BODY_SM} truncate text-zinc-500 dark:text-zinc-500`}>
                            {l.ownerEmail || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/agent/listings/${l.id}`}
                            className={`inline-flex h-8 items-center justify-center rounded px-2.5 text-[11px] font-semibold transition-colors ${
                              isFlagged
                                ? 'bg-red-100 text-red-800 hover:bg-red-700 hover:text-white dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500'
                                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
                            }`}
                          >
                            {isFlagged ? 'Resolve' : l.status === 'draft' ? 'Review' : 'Manage'}
                          </Link>
                          <button
                            type="button"
                            aria-label={`More actions for ${l.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Ledger Footer */}
        <div
          className={`flex flex-col items-center justify-between gap-4 border-t bg-zinc-50 px-6 py-4 sm:flex-row dark:bg-zinc-800/50 ${DIVIDER}`}
        >
          <div className="flex items-center gap-2">
            <span className={`${BODY_SM} ${MUTED}`}>
              Showing{' '}
              <span className={`font-semibold ${ON_SURFACE}`}>{filtered.length}</span> of{' '}
              <span className={`font-semibold ${ON_SURFACE}`}>{totalCount}</span> assigned
              listings
            </span>
            <span className="text-zinc-500 dark:text-zinc-500">·</span>
            <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
              Lead Agent: {agentName}
            </span>
          </div>
          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${PRIMARY_CONTAINER_BG} ${PRIMARY_CONTAINER_TEXT} font-mono text-[14px] font-semibold`}
            >
              1
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              2
            </button>
            <span className="px-1 font-mono text-zinc-500 dark:text-zinc-500">...</span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              3
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[13px] leading-[18px] text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Security & Institutional Protocol Audit Notice */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-4 py-2 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500`}
      >
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className={PRIMARY_TEXT} />
          <span className={`${BODY_SM}`}>
            Prisma Real-Time Sync Active · Lands Bureau C of O validation webhook healthy.
          </span>
        </div>
        <div className={`flex items-center gap-4 font-mono text-[11px]`}>
          <span>API: v2.4-LAG-PROD</span>
          <span className="font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            SSL ENCRYPTED (EAL6+)
          </span>
        </div>
      </div>
    </div>
  );
}
