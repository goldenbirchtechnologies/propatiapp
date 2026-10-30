'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Handshake,
  ChevronRight,
  ChevronLeft,
  Building2,
  Wallet,
  Table2,
  PieChart,
  TrendingUp,
  BadgeCheck,
  MoreVertical,
  Scale,
  Radio,
  MapPin,
  RefreshCw,
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
  nairaCompact,
  humanise,
  listingStatusPill,
  pct,
} from '../agent-stitch';

export interface AgentMarketListing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  status: string;
  price: number;
  pricePeriod: string | null;
  sizeSqm: number | null;
  bedrooms: number | null;
  coverImage: string | null;
  ownerName: string | null;
  verificationTier: string;
  viewsCount: number;
  createdAt: string;
}

export interface AgentMarketClientProps {
  initialListings: AgentMarketListing[];
  totalActive: number;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'rent', label: 'Residential Lease' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'sale', label: 'Outright Sale' },
  { value: 'short_let', label: 'Short-Let' },
];

const MARKET_OPTIONS = [
  { value: 'all', label: 'All Markets' },
  { value: 'lagos', label: 'Lagos State' },
  { value: 'abuja', label: 'Abuja FCT' },
  { value: 'phc', label: 'Port Harcourt' },
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'Any Price' },
  { value: 'lt100', label: 'Under ₦100M' },
  { value: '100-500', label: '₦100M - ₦500M' },
  { value: '500-1000', label: '₦500M - ₦1B' },
  { value: 'gt1000', label: '₦1B+' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Sort: Most Recent' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'price-asc', label: 'Price: Low to High' },
];

const selectClass =
  'h-10 w-full appearance-none rounded-lg bg-zinc-50 pl-3 pr-8 text-[13px] leading-[18px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:ring-primary';

/** Segment a listing into a market segment key for the composition bar. */
function segmentFor(listing: AgentMarketListing): {
  key: string;
  label: string;
  colorClass: string;
  barClass: string;
} {
  const pt = listing.propertyType;
  const lt = listing.listingType;
  if (lt === 'commercial' || pt === 'office' || pt === 'shop') {
    return {
      key: 'commercial',
      label: 'Commercial',
      colorClass: 'bg-[var(--sovereign-hover)] dark:bg-primary',
      barClass: 'bg-[var(--sovereign-hover)] dark:bg-primary',
    };
  }
  if (lt === 'sale' && pt === 'land') {
    return {
      key: 'land',
      label: 'Freehold Land',
      colorClass: 'bg-[#4edea3] dark:bg-[var(--sovereign-container-bg)]',
      barClass: 'bg-[#4edea3] dark:bg-[var(--sovereign-container-bg)]',
    };
  }
  if (lt === 'sale') {
    return {
      key: 'residential',
      label: 'Luxury Residential',
      colorClass: 'bg-primary dark:bg-[#4edea3]',
      barClass: 'bg-primary dark:bg-[#4edea3]',
    };
  }
  if (pt === 'warehouse' || pt === 'land') {
    return {
      key: 'industrial',
      label: 'Industrial',
      colorClass: 'bg-zinc-400 dark:bg-zinc-500',
      barClass: 'bg-zinc-400 dark:bg-zinc-500',
    };
  }
  return {
    key: 'lease',
    label: 'Residential Lease',
    colorClass: 'bg-[var(--sovereign-container-bg)] dark:bg-primary',
    barClass: 'bg-[var(--sovereign-container-bg)] dark:bg-primary',
  };
}

export default function AgentMarketClient({
  initialListings,
  totalActive,
}: AgentMarketClientProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const stats = useMemo(() => {
    const active = initialListings.filter((l) => l.status === 'active');
    const avgPrice =
      active.length > 0 ? active.reduce((sum, l) => sum + l.price, 0) / active.length : 0;

    const byState = new Map<string, number>();
    for (const l of initialListings) {
      const key = l.state || 'Other';
      byState.set(key, (byState.get(key) ?? 0) + 1);
    }
    const stateSummary = Array.from(byState.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => `${count} ${state}`)
      .join(' · ');

    const segCounts = new Map<string, number>();
    for (const l of initialListings) {
      const seg = segmentFor(l);
      segCounts.set(seg.label, (segCounts.get(seg.label) ?? 0) + 1);
    }
    const segments = Array.from(segCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const commercialAvg =
      active.filter((l) => l.listingType === 'commercial' || l.propertyType === 'office')
        .reduce((sum, l) => sum + l.price, 0) /
        Math.max(
          1,
          active.filter((l) => l.listingType === 'commercial' || l.propertyType === 'office').length
        );
    const residentialAvg =
      active.filter((l) => l.listingType !== 'commercial' && l.propertyType !== 'office')
        .reduce((sum, l) => sum + l.price, 0) /
        Math.max(
          1,
          active.filter((l) => l.listingType !== 'commercial' && l.propertyType !== 'office').length
        );

    return {
      avgPrice,
      stateSummary: stateSummary || 'No listings',
      segments,
      commercialAvg,
      residentialAvg,
    };
  }, [initialListings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = initialListings.filter((l) => {
      if (typeFilter !== 'all' && l.listingType !== typeFilter) return false;
      if (marketFilter !== 'all') {
        const state = `${l.state} ${l.area}`.toLowerCase();
        if (!state.includes(marketFilter)) return false;
      }
      if (priceFilter !== 'all') {
        const p = l.price;
        if (priceFilter === 'lt100' && p >= 100_000_000) return false;
        if (priceFilter === '100-500' && (p < 100_000_000 || p > 500_000_000)) return false;
        if (priceFilter === '500-1000' && (p < 500_000_000 || p > 1_000_000_000))
          return false;
        if (priceFilter === 'gt1000' && p <= 1_000_000_000) return false;
      }
      if (verifiedOnly && l.verificationTier === 'basic') return false;
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
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [initialListings, query, typeFilter, marketFilter, priceFilter, sort, verifiedOnly]);

  const hasFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    marketFilter !== 'all' ||
    priceFilter !== 'all' ||
    verifiedOnly;

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setMarketFilter('all');
    setPriceFilter('all');
    setVerifiedOnly(false);
    setSort('recent');
  };

  const segmentBars = stats.segments.map((seg) => {
    const meta = segmentFor({
      id: '',
      title: '',
      address: '',
      area: '',
      state: '',
      listingType: 'rent',
      propertyType: null,
      status: 'active',
      price: 0,
      pricePeriod: null,
      sizeSqm: null,
      bedrooms: null,
      coverImage: null,
      ownerName: null,
      verificationTier: 'basic',
      viewsCount: 0,
      createdAt: '',
      ...({} as Record<string, never>),
    });
    return { ...seg, colorClass: meta.colorClass, barClass: meta.barClass };
  });

  return (
    <div className="space-y-6">
      {/* ============ HEADER SECTION ============ */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-500 dark:text-zinc-500">
          <Link href="/dashboard/agent" className="transition-colors hover:text-[var(--sovereign-hover)] dark:hover:text-[#4edea3]">
            Market &amp; Leads
          </Link>
          <ChevronRight size={14} />
          <span>Marketplace</span>
          <ChevronRight size={14} />
          <span className={`font-semibold ${ON_SURFACE}`}>Nigerian Real Estate Market Overview</span>
        </nav>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={`${HEADLINE_LG} ${ON_SURFACE} tracking-tight`}>
                Market Overview &amp; Real-Time Listings
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--sovereign-container-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] shadow-sm dark:bg-primary/20 dark:text-[#6ffbbe]`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sovereign-hover)] dark:bg-[#4edea3]" />
                </span>
                Live Platform MLS Feed
              </span>
            </div>
            <p className={`max-w-4xl text-[14px] leading-5 ${MUTED}`}>
              Syndicated view of all {totalActive.toLocaleString()} active verified property
              mandates across Nigeria&apos;s institutional property markets. Showing current server
              batch ({initialListings.length} items).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] leading-[18px] text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              <Download size={18} className="text-zinc-500 dark:text-zinc-500" />
              <span>Export Market Intelligence</span>
            </button>
            <Link
              href="/dashboard/agent/invites"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] leading-[18px] text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)] dark:bg-[#4edea3] dark:text-primary dark:hover:bg-primary"
            >
              <Handshake size={18} />
              <span>Request Mandate Co-brokerage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============ 4 KEY ANALYTICS CARDS ============ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Listings */}
        <div className={`${CARD} flex flex-col justify-between gap-2 p-4 transition-shadow hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
              Active Listings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-[var(--sovereign-hover)] dark:bg-zinc-800/50 dark:text-[#4edea3]">
              <Building2 size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className={`${HEADLINE_LG} ${ON_SURFACE}`}>{totalActive.toLocaleString()}</span>
            <span
              className={`rounded bg-[var(--sovereign-container-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe]`}
            >
              {initialListings.length} in batch
            </span>
          </div>
          <p className={`flex items-center gap-1.5 pt-1 ${BODY_SM} ${MUTED}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {stats.stateSummary}
          </p>
        </div>

        {/* Avg Market Price */}
        <div className={`${CARD} flex flex-col justify-between gap-2 p-4 transition-shadow hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
              Avg Market Price
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-[var(--sovereign-hover)] dark:bg-zinc-800/50 dark:text-[#4edea3]">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className={`${HEADLINE_LG} ${ON_SURFACE} ${MONO_NUMERIC}`}>
              {nairaCompact(stats.avgPrice)}
            </span>
          </div>
          <p className={`truncate pt-1 ${BODY_SM} ${MUTED}`}>
            Commercial: {nairaCompact(stats.commercialAvg)} · Residential:{' '}
            {nairaCompact(stats.residentialAvg)}
          </p>
        </div>

        {/* Total Shown in Batch */}
        <div className={`${CARD} flex flex-col justify-between gap-2 p-4 transition-shadow hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
              Total Shown in Batch
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-[var(--sovereign-hover)] dark:bg-zinc-800/50 dark:text-[#4edea3]">
              <Table2 size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className={`${HEADLINE_LG} ${ON_SURFACE} ${MONO_NUMERIC}`}>
              {initialListings.length}
            </span>
            <span
              className={`rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white`}
            >
              Page 1 of 1
            </span>
          </div>
          <p className={`flex items-center gap-1 pt-1 ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
            <Radio size={14} />
            Prisma query limit: take {initialListings.length}, active status
          </p>
        </div>

        {/* Market Segments */}
        <div className={`${CARD} flex flex-col justify-between gap-2 p-4 transition-shadow hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
              Market Segments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-[var(--sovereign-hover)] dark:bg-zinc-800/50 dark:text-[#4edea3]">
              <PieChart size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className={`${HEADLINE_LG} ${ON_SURFACE}`}>{stats.segments.length} Segments</span>
          </div>
          {stats.segments.length > 0 ? (
            <div
              className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
              role="img"
              aria-label="Market segment composition"
            >
              {stats.segments.map((seg) => {
                const meta = segmentBars.find((s) => s.label === seg.label);
                return (
                  <div
                    key={seg.label}
                    className={`h-full ${meta?.barClass ?? 'bg-zinc-400'}`}
                    style={{ width: `${pct(seg.count, initialListings.length)}%` }}
                    title={`${seg.label} (${pct(seg.count, initialListings.length)}%)`}
                  />
                );
              })}
            </div>
          ) : null}
          <p className={`truncate ${BODY_SM} ${MUTED}`}>
            {stats.segments.length > 0
              ? stats.segments
                  .map((s) => `${s.label.split(' ')[0]} ${pct(s.count, initialListings.length)}%`)
                  .join(' · ')
              : 'No segment data'}
          </p>
        </div>
      </div>

      {/* ============ SEARCH & FILTER CONTROLS ============ */}
      <div className={`${CARD} flex flex-col gap-4 p-4`}>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          {/* Search */}
          <div className="relative w-full lg:flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search active marketplace by title, street address, LGA or cadastral ID..."
              className="h-10 w-full rounded-lg bg-zinc-50 pl-9 pr-4 text-[12px] leading-4 text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-800 dark:focus:ring-primary"
            />
          </div>
          {/* Filter Selects */}
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
            <div className="relative min-w-[150px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by type"
                className={selectClass}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[160px]">
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                aria-label="Filter by market"
                className={selectClass}
              >
                {MARKET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[150px]">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                aria-label="Filter by price band"
                className={selectClass}
              >
                {PRICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[160px]">
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
            </div>
          </div>
        </div>

        {/* Quick Filters / Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className={`${LABEL_SM} mr-1 uppercase text-zinc-500 dark:text-zinc-500`}>
            Quick Filters:
          </span>
          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            aria-pressed={verifiedOnly}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm transition-colors ${
              verifiedOnly
                ? 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe]'
                : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <BadgeCheck size={14} />
            Verified C of O Only
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800"
          >
            <Handshake size={14} />
            Co-brokering Open
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800"
          >
            <Building2 size={14} />
            Direct Institutional Mandate
          </button>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition-colors hover:text-red-700 disabled:opacity-40 dark:hover:text-red-400"
          >
            <RefreshCw size={14} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* ============ ACTIVE LISTINGS TABLE / LEDGER ============ */}
      <div className={`${CARD} flex flex-col overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className={`${LABEL_SM} bg-zinc-50 text-zinc-500 dark:text-zinc-500 dark:bg-zinc-800/50`}
              >
                <th className="px-4 py-3 font-semibold">Property &amp; Cadastral Reference</th>
                <th className="px-4 py-3 font-semibold">Mandate Category</th>
                <th className="px-4 py-3 text-right font-semibold">Verified Price / Rate</th>
                <th className="px-4 py-3 font-semibold">Mandate Principal</th>
                <th className="px-4 py-3 font-semibold">MLS Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className={`${BODY_SM} ${ON_SURFACE}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <TrendingUp
                      size={40}
                      className="mx-auto mb-3 text-zinc-500 dark:text-zinc-400"
                      style={{ opacity: 0.5 }}
                    />
                    <p className={`${TITLE_SM} ${ON_SURFACE}`}>No listings match this view</p>
                    <p className={`mt-1 ${BODY_SM} ${MUTED}`}>
                      {initialListings.length === 0
                        ? 'No active marketplace listings are available right now.'
                        : 'Adjust the filters to widen the search.'}
                    </p>
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className={`mt-3 text-[13px] font-semibold ${PRIMARY_TEXT} hover:underline`}
                      >
                        Reset filters
                      </button>
                    ) : null}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const pill = listingStatusPill(l.status);
                  const perSqm =
                    l.sizeSqm && l.sizeSqm > 0 ? l.price / Number(l.sizeSqm) : null;
                  return (
                    <tr
                      key={l.id}
                      className="group border-b border-zinc-200 transition-colors hover:bg-zinc-50/60 dark:border-white/[0.08] dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          {l.coverImage ? (
                            <img
                              src={l.coverImage}
                              alt={l.title}
                              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 shadow-sm dark:bg-zinc-800">
                              <Building2 size={20} className="text-zinc-500 dark:text-zinc-400" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-col">
                            <span
                              className={`${TITLE_SM} truncate transition-colors group-hover:text-[var(--sovereign-hover)] dark:group-hover:text-[#4edea3]`}
                            >
                              {l.title}
                            </span>
                            <span className={`${BODY_SM} truncate text-zinc-500 dark:text-zinc-500`}>
                              <MapPin size={12} className="mr-0.5 inline align-[-1px]" />
                              {l.address || [l.area, l.state].filter(Boolean).join(', ')}
                            </span>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300`}
                              >
                                CAD: {l.id.slice(-8).toUpperCase()}
                              </span>
                              {l.verificationTier !== 'basic' ? (
                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                  <BadgeCheck size={12} />
                                  {humanise(l.verificationTier)} Title
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className={`${TITLE_SM} ${ON_SURFACE}`}>
                            {humanise(l.propertyType ?? l.listingType)}
                          </span>
                          <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                            {humanise(l.listingType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`${MONO_NUMERIC} ${TITLE_SM} font-semibold ${ON_SURFACE}`}>
                            {naira(l.price)}
                            {l.pricePeriod ? (
                              <span className={`${BODY_SM} font-normal text-zinc-500 dark:text-zinc-500`}>
                                {' '}
                                / {l.pricePeriod === 'year' ? 'yr' : l.pricePeriod}
                              </span>
                            ) : null}
                          </span>
                          <span className={`font-mono text-[11px] text-zinc-500 dark:text-zinc-500`}>
                            {perSqm
                              ? `${naira(perSqm)} / m²`
                              : l.sizeSqm
                                ? `${Number(l.sizeSqm).toLocaleString()} m²`
                                : `${l.viewsCount} views`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] leading-[18px] ${ON_SURFACE}`}>
                              {l.ownerName || '—'}
                            </span>
                            {l.ownerName ? (
                              <BadgeCheck size={14} className={PRIMARY_TEXT} />
                            ) : null}
                          </div>
                          <span className={`text-[11px] text-zinc-500 dark:text-zinc-500`}>
                            {humanise(l.listingType)} Principal
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pill.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                          {pill.label}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/agent/listings/${l.id}`}
                            className={`rounded-lg bg-zinc-100 px-3 py-1.5 text-[13px] leading-[18px] text-zinc-900 transition-colors hover:bg-primary hover:text-white dark:bg-zinc-800 dark:text-white dark:hover:bg-primary`}
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            aria-label={`Co-brokerage options for ${l.title}`}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
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

        {/* Pagination & Metadata Footer */}
        <div
          className={`flex flex-col items-center justify-between gap-2 bg-zinc-50 p-4 md:flex-row dark:bg-zinc-800/50 ${DIVIDER}`}
        >
          <div className={`flex items-center gap-2 ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
            <Radio size={18} className={PRIMARY_TEXT} />
            <span>
              Showing <strong className={`font-semibold ${ON_SURFACE}`}>{filtered.length}</strong> of{' '}
              <strong className={`font-semibold ${ON_SURFACE}`}>
                {totalActive.toLocaleString()}
              </strong>{' '}
              active platform listings · Real-time sync with Lagos Lands Bureau &amp; Abuja FCT GIS
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-40 dark:hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1 font-mono text-[14px] font-semibold shadow-sm ${PRIMARY_CONTAINER_BG} ${PRIMARY_CONTAINER_TEXT}`}
            >
              1
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1 font-mono text-[14px] text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              2
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ============ INSTITUTIONAL COMPLIANCE BANNER ============ */}
      <div
        className={`${CARD_SOFT} flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center`}
      >
        <div className="flex max-w-4xl items-start gap-3">
          <Scale size={24} className={`mt-0.5 flex-shrink-0 ${PRIMARY_TEXT}`} />
          <div className="flex flex-col gap-0.5">
            <span className={`${TITLE_SM} ${ON_SURFACE} font-semibold`}>
              Sovereign MLS Syndication Standards
            </span>
            <p className={`${BODY_SM} leading-relaxed ${MUTED}`}>
              All active platform listings comply with NIESV, REDAN, and SCUML anti-money laundering
              disclosure requirements. Direct co-brokering splits default to statutory 50/50 fee
              protocol under NIESV Scale of Professional Charges.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/agent/agreements/new"
          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-white px-3 py-1.5 text-[13px] leading-[18px] font-semibold shadow-sm transition-colors hover:bg-[var(--sovereign-hover)] hover:text-white md:self-auto dark:bg-zinc-900 dark:text-[#4edea3] dark:hover:bg-primary dark:hover:text-primary`}
        >
          <span>Review Co-Brokerage Guidelines</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
