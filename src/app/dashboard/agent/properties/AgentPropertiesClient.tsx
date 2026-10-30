'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MapPin,
  BadgeCheck,
  Shield,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  CalendarClock,
  Mail,
  MoreVertical,
  KeyRound,
  DoorOpen,
  Wallet,
  RotateCcw,
  Tag,
} from 'lucide-react';
import {
  CARD,
  CARD_SOFT,
  INSET,
  LABEL_SM,
  TITLE_MD,
  TITLE_SM,
  HEADLINE_SM,
  HEADLINE_MD,
  BODY_SM,
  MONO_NUMERIC,
  MUTED,
  PRIMARY_TEXT,
  PRIMARY_CONTAINER_BG,
  PRIMARY_CONTAINER_TEXT,
  SECONDARY_CONTAINER_BG,
  SECONDARY_CONTAINER_TEXT,
  TERTIARY_BG,
  TERTIARY_TEXT,
  ON_SURFACE,
  naira,
  nairaCompact,
  humanise,
  listingStatusPill,
  verificationTierPill,
  pct,
  initials,
} from '../agent-stitch';

export interface AgentPropertyUnit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  listingType: string;
  pricePeriod: string | null;
  rent: number;
  status: string;
  occupancy: string;
  isListed: boolean;
  currentTenant: { id: string; fullName: string; email: string } | null;
}

export interface AgentPropertyListing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  price: number;
  pricePeriod: string | null;
  status: string;
  verificationTier: string;
  viewsCount: number;
  createdAt: string;
  coverImage: string | null;
  owner: { id: string; fullName: string; email: string; avatarUrl?: string } | null;
  mandateType: 'direct' | 'cobrokered';
  unitCount: number;
  vacantUnitCount: number;
  listedUnitCount: number;
  permissions: string[];
  units: AgentPropertyUnit[];
}

export interface AgentPropertiesClientProps {
  listings: AgentPropertyListing[];
}

const LISTING_TYPE_OPTIONS = [
  { value: 'all', label: 'Listing: All Types' },
  { value: 'rent', label: 'Residential Lease' },
  { value: 'commercial', label: 'Commercial Lease' },
  { value: 'sale', label: 'Outright Sale' },
  { value: 'short_let', label: 'Short-Let' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status: All Statuses' },
  { value: 'active', label: 'Active Management' },
  { value: 'draft', label: 'Maintenance & Snagging' },
  { value: 'suspended', label: 'Handover Pending' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'Verification: All Tiers' },
  { value: 'certified', label: 'Tier 4 Verified' },
  { value: 'inspected', label: 'Tier 3 Inspected' },
  { value: 'verified', label: 'Tier 2 Verified' },
  { value: 'basic', label: 'Tier 1 Basic' },
];

const JURISDICTION_OPTIONS = [
  { value: 'all', label: 'Jurisdiction: All Areas' },
  { value: 'lagos', label: 'Lagos State' },
  { value: 'abuja', label: 'Abuja FCT' },
  { value: 'phc', label: 'Port Harcourt' },
];

const selectClass =
  'h-8 appearance-none rounded-lg bg-zinc-50 pl-3 pr-8 text-[12px] font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:ring-primary';

export default function AgentPropertiesClient({ listings }: AgentPropertiesClientProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [view, setView] = useState<'hybrid' | 'grid'>('hybrid');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    const totalUnits = listings.reduce((sum, l) => sum + l.unitCount, 0);
    const vacant = listings.reduce((sum, l) => sum + l.vacantUnitCount, 0);
    const occupied = totalUnits - vacant;
    const activeInventory = listings.reduce((sum, l) => sum + l.listedUnitCount, 0);
    const capitalBase = listings.reduce((sum, l) => sum + l.price, 0);
    const exclusive = listings.filter((l) => l.mandateType === 'direct').length;
    const cobrokered = listings.length - exclusive;
    return {
      totalProperties: listings.length,
      totalUnits,
      vacant,
      occupied,
      activeInventory,
      capitalBase,
      exclusive,
      cobrokered,
      occupancyRate: pct(occupied, totalUnits),
      annualYield: capitalBase,
    };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (typeFilter !== 'all' && l.listingType !== typeFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (tierFilter !== 'all' && l.verificationTier !== tierFilter) return false;
      if (jurisdictionFilter !== 'all') {
        const state = `${l.state} ${l.area}`.toLowerCase();
        if (!state.includes(jurisdictionFilter)) return false;
      }
      if (!q) return true;
      return [l.title, l.address, l.area, l.state, l.propertyType ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [listings, query, typeFilter, statusFilter, tierFilter, jurisdictionFilter]);

  const hasFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    tierFilter !== 'all' ||
    jurisdictionFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setTierFilter('all');
    setJurisdictionFilter('all');
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      {/* ============ PAGE CONTEXT & COMMAND BAR ============ */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="mb-1 flex items-center gap-1 text-zinc-500 dark:text-zinc-500">
            <span className={`${LABEL_SM} uppercase`}>Institutional Asset Desk</span>
            <span className="text-[12px]">/</span>
            <span className={`${LABEL_SM} uppercase font-semibold ${PRIMARY_TEXT}`}>
              Mandated Portfolios
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={`${HEADLINE_LG} ${ON_SURFACE} tracking-tight`}>Managed Properties</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${LABEL_SM} ${SECONDARY_CONTAINER_BG} ${SECONDARY_CONTAINER_TEXT}`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--sovereign-hover)] dark:bg-[#4edea3]" />
              {stats.totalProperties} {stats.totalProperties === 1 ? 'Estate' : 'Estates'} Mandated
            </span>
          </div>
          <p className={`mt-0.5 max-w-2xl text-[14px] leading-5 ${MUTED}`}>
            Portfolio assigned via direct institutional mandate, registered power of attorney, and
            accredited corporate agency agreements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-[14px] font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <Download size={18} className="text-zinc-500 dark:text-zinc-500" />
            <span>Export Ledger</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] dark:bg-[#4edea3] dark:text-primary dark:hover:bg-primary"
          >
            <Plus size={18} />
            <span>+ Add Property Assignment</span>
          </button>
        </div>
      </div>

      {/* ============ 4 KEY INSTITUTIONAL STAT CARDS ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className={`${CARD} flex flex-col justify-between p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`${LABEL_SM} block uppercase text-zinc-500 dark:text-zinc-500`}>
                Total Properties
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`${HEADLINE_MD} ${ON_SURFACE} font-bold`}>
                  {stats.totalProperties}
                </span>
                <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                  Estates &amp; Complexes
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-[#4edea3]">
              <Building2 size={20} />
            </div>
          </div>
          <div
            className={`-mx-4 -mb-4 mt-3 flex items-center justify-between rounded-b-xl bg-zinc-50/60 px-4 py-2 dark:bg-zinc-800/50`}
          >
            <span className={`${BODY_SM} ${MUTED}`}>{stats.exclusive} Exclusive Mandates</span>
            <span className={`${MONO_NUMERIC} text-[12px] text-zinc-500 dark:text-zinc-500`}>
              {stats.cobrokered} Co-brokered
            </span>
          </div>
        </div>

        {/* Vacant Units */}
        <div className={`${CARD} flex flex-col justify-between p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`${LABEL_SM} block uppercase text-zinc-500 dark:text-zinc-500`}>
                Vacant Units
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`${HEADLINE_MD} ${ON_SURFACE} font-bold`}>
                  {stats.vacant} Units
                </span>
                {stats.vacant > 0 ? (
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[12px] font-semibold ${TERTIARY_BG} ${TERTIARY_TEXT}`}
                  >
                    Action Req.
                  </span>
                ) : null}
              </div>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${TERTIARY_BG} ${TERTIARY_TEXT}`}
            >
              <DoorOpen size={20} />
            </div>
          </div>
          <div
            className={`-mx-4 -mb-4 mt-3 flex items-center justify-between rounded-b-xl bg-zinc-50/60 px-4 py-2 dark:bg-zinc-800/50`}
          >
            <span className={`${BODY_SM} ${MUTED}`}>Portfolio Occupancy</span>
            <span className={`${MONO_NUMERIC} text-[12px] font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]`}>
              {stats.occupancyRate}%
            </span>
          </div>
        </div>

        {/* Listed Units */}
        <div className={`${CARD} flex flex-col justify-between p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`${LABEL_SM} block uppercase text-zinc-500 dark:text-zinc-500`}>
                Active Inventory
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`${HEADLINE_MD} ${ON_SURFACE} font-bold`}>
                  {stats.activeInventory} Units
                </span>
                <span className={`${BODY_SM} font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]`}>
                  Active
                </span>
              </div>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${SECONDARY_CONTAINER_BG} text-[var(--sovereign-hover)] dark:text-[#6ffbbe]`}
            >
              <Tag size={20} />
            </div>
          </div>
          <div
            className={`-mx-4 -mb-4 mt-3 flex items-center justify-between rounded-b-xl bg-zinc-50/60 px-4 py-2 dark:bg-zinc-800/50`}
          >
            <span className={`${BODY_SM} truncate ${MUTED}`}>
              {Array.from(new Set(listings.map((l) => l.area).filter(Boolean)))
                .slice(0, 4)
                .join(' • ') || 'No areas set'}
            </span>
            <MapPin size={16} className="text-zinc-500 dark:text-zinc-500" />
          </div>
        </div>

        {/* Total Managed Value */}
        <div className={`${CARD} flex flex-col justify-between p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`${LABEL_SM} block uppercase text-zinc-500 dark:text-zinc-500`}>
                Managed Capital Base
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`${HEADLINE_MD} ${ON_SURFACE} font-bold`}>
                  {nairaCompact(stats.capitalBase)}
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-[#4edea3]">
              <Wallet size={20} />
            </div>
          </div>
          <div
            className={`-mx-4 -mb-4 mt-3 flex items-center justify-between rounded-b-xl bg-zinc-50/60 px-4 py-2 dark:bg-zinc-800/50`}
          >
            <span className={`${BODY_SM} ${MUTED}`}>Annual Rental Yield</span>
            <span className={`${MONO_NUMERIC} text-[12px] font-semibold ${ON_SURFACE}`}>
              {nairaCompact(stats.annualYield)}
            </span>
          </div>
        </div>
      </div>

      {/* ============ FILTER & CONTROL TOOLBAR ============ */}
      <div className={`${CARD} space-y-4 p-4`}>
        <div className="flex flex-col items-stretch justify-between gap-2 lg:flex-row lg:items-center">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500"
            />
            <input
              id="property-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by estate name, street address, or Land Title / C of O reference..."
              className="h-10 w-full rounded-lg bg-zinc-50 pl-9 pr-4 text-[12px] leading-4 text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-800 dark:focus:ring-primary"
            />
          </div>
          {/* View Controls & Counter */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <div
              className={`flex items-center rounded-lg p-0.5 ${INSET}`}
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                onClick={() => setView('hybrid')}
                aria-pressed={view === 'hybrid'}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[14px] font-semibold transition-colors ${
                  view === 'hybrid'
                    ? 'bg-white text-[var(--sovereign-hover)] shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">Hybrid</span>
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[14px] font-semibold transition-colors ${
                  view === 'grid'
                    ? 'bg-white text-[var(--sovereign-hover)] shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-[13px] leading-[18px] text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <SlidersHorizontal size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills / Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-[12px] leading-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by listing type"
            className={selectClass}
          >
            {LISTING_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by management status"
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
            value={jurisdictionFilter}
            onChange={(e) => setJurisdictionFilter(e.target.value)}
            aria-label="Filter by jurisdiction"
            className={selectClass}
          >
            {JURISDICTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="ml-auto flex items-center gap-1 text-[12px] text-zinc-500 transition-colors hover:text-red-700 disabled:opacity-40 dark:hover:text-red-400"
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* ============ PROPERTIES ROSTER ============ */}
      {filtered.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center justify-center p-16 text-center`}>
          <Building2
            size={48}
            className="mb-3 text-zinc-500 dark:text-zinc-400"
            style={{ opacity: 0.5 }}
          />
          <h3 className={`${HEADLINE_SM} ${ON_SURFACE}`}>No managed properties found</h3>
          <p className={`mt-1 ${BODY_SM} ${MUTED}`}>
            {listings.length === 0
              ? 'Accepted landlord mandates will appear here as estates and complexes.'
              : 'No properties match the current filters.'}
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
        </div>
      ) : (
        <div
          id="properties-roster"
          className={
            view === 'grid'
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
              : 'space-y-4'
          }
        >
          {filtered.map((listing) => {
            const isOpen = expanded[listing.id] ?? false;
            const tier = verificationTierPill(listing.verificationTier);
            const TierIcon = tier.icon === 'verified' ? BadgeCheck : Shield;
            const occupied = listing.unitCount - listing.vacantUnitCount;
            const occupancyPct = pct(occupied, listing.unitCount);
            const statusPill = listingStatusPill(listing.status);
            const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT');
            const occupiedUnits = listing.units.filter((u) => u.occupancy === 'OCCUPIED');

            return (
              <article
                key={listing.id}
                className={`${CARD} overflow-hidden transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex flex-col gap-6 p-4 lg:flex-row lg:p-6">
                  {/* Property Cover Photo + Fast Badges */}
                  <div className="relative h-52 w-full flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 lg:h-auto lg:w-72">
                    {listing.coverImage ? (
                      <img
                        src={listing.coverImage}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 size={40} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${PRIMARY_TEXT}`}
                      >
                        <TierIcon size={14} />
                        <span>{tier.label}</span>
                      </span>
                      {listing.mandateType === 'cobrokered' ? (
                        <span className="inline-flex items-center rounded bg-red-100/90 px-2 py-0.5 font-mono text-[10px] font-medium text-red-800 backdrop-blur-sm dark:bg-red-500/20 dark:text-red-300">
                          Co-brokered
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between rounded bg-black/60 px-2.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
                      <span className="flex items-center gap-1">
                        <Building2 size={14} className="text-[#6ffbbe]" />
                        {humanise(listing.propertyType ?? listing.listingType)}
                      </span>
                      <span className="text-[11px] text-[#4edea3]">
                        {listing.mandateType === 'direct' ? 'Full Mandate' : 'Co-brokered'}
                      </span>
                    </div>
                  </div>

                  {/* Central Details & Information Hierarchy */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                        <div>
                          <h2 className={`${HEADLINE_SM} ${ON_SURFACE} truncate`}>
                            {listing.title}
                          </h2>
                          <div className={`mt-0.5 flex items-center gap-1 ${BODY_SM} ${MUTED}`}>
                            <MapPin size={16} className={PRIMARY_TEXT} />
                            <span className="truncate">
                              {listing.address || [listing.area, listing.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                        {/* Valuation / Price Tag */}
                        <div className="mt-1 flex-shrink-0 text-left sm:mt-0 sm:text-right">
                          <span
                            className={`${LABEL_SM} block uppercase text-zinc-500 dark:text-zinc-500`}
                          >
                            Mandated Valuation
                          </span>
                          <div
                            className={`${HEADLINE_SM} ${PRIMARY_TEXT} font-bold ${MONO_NUMERIC}`}
                          >
                            {naira(listing.price)}{' '}
                            <span className="text-[12px] font-normal text-zinc-600 dark:text-zinc-400">
                              {listing.pricePeriod === 'year'
                                ? '/ yr'
                                : listing.pricePeriod
                                  ? `/ ${listing.pricePeriod}`
                                  : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Owner Information & Mandate Pill */}
                      <div
                        className={`mt-4 flex flex-col items-start justify-between gap-2 rounded-lg p-3 sm:flex-row sm:items-center ${INSET}`}
                      >
                        <div className="flex items-center gap-2">
                          {listing.owner?.avatarUrl ? (
                            <img
                              src={listing.owner.avatarUrl}
                              alt={listing.owner.fullName}
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 font-bold text-[12px] text-[var(--sovereign-hover)] ring-2 ring-white dark:bg-zinc-700 dark:text-[#4edea3] dark:ring-zinc-900">
                              {initials(listing.owner?.fullName)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`${TITLE_SM} ${ON_SURFACE}`}>
                                {listing.owner?.fullName || 'Owner not set'}
                              </span>
                              {listing.owner?.email ? (
                                <BadgeCheck size={15} className={PRIMARY_TEXT} />
                              ) : null}
                            </div>
                            <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
                              {listing.mandateType === 'direct'
                                ? 'Direct Mandate • Full Scope Asset Management'
                                : 'Co-Brokered Mandate • Sourcing & Inspection'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${CARD_SOFT} ${MUTED}`}
                          >
                            <KeyRound size={13} className={PRIMARY_TEXT} />
                            {listing.permissions.length > 0
                              ? `${listing.permissions.length} Permission${listing.permissions.length === 1 ? '' : 's'}`
                              : 'Assignment Active'}
                          </span>
                        </div>
                      </div>

                      {/* Unit Matrix Statistics */}
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className={`flex flex-col rounded-lg p-2 ${INSET}`}>
                          <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
                            Total Units
                          </span>
                          <span className={`${TITLE_MD} ${ON_SURFACE} font-semibold`}>
                            {listing.unitCount} Units
                          </span>
                        </div>
                        <div
                          className={`flex flex-col rounded-lg p-2 ${SECONDARY_CONTAINER_BG}`}
                        >
                          <span
                            className={`${LABEL_SM} font-medium text-[var(--sovereign-hover)] dark:text-[#6ffbbe]`}
                          >
                            Occupied
                          </span>
                          <div className="flex items-center justify-between">
                            <span className={`${TITLE_MD} ${ON_SURFACE} font-semibold`}>
                              {occupied} Units
                            </span>
                            <span
                              className={`${MONO_NUMERIC} text-[12px] font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]`}
                            >
                              {occupancyPct}%
                            </span>
                          </div>
                        </div>
                        <div className={`flex flex-col rounded-lg p-2 ${TERTIARY_BG}`}>
                          <span className={`${LABEL_SM} font-medium ${TERTIARY_TEXT}`}>Vacant</span>
                          <div className="flex items-center justify-between">
                            <span className={`${TITLE_MD} font-bold ${TERTIARY_TEXT}`}>
                              {listing.vacantUnitCount} Units
                            </span>
                            {listing.vacantUnitCount > 0 ? (
                              <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400">
                                Immediate
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                Full
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex flex-col rounded-lg p-2 ${INSET}`}>
                          <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
                            Active Listings
                          </span>
                          <span className={`${TITLE_MD} ${ON_SURFACE} font-semibold`}>
                            {listing.listedUnitCount} Listed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar & Units Expander Trigger */}
                    <div className="mt-4 flex flex-col items-stretch justify-between gap-2 border-t pt-3 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(listing.id)}
                          aria-expanded={isOpen}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-[14px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                        >
                          <List size={18} className={PRIMARY_TEXT} />
                          <span>View Units ({listing.unitCount})</span>
                          {isOpen ? (
                            <ChevronUp size={16} className="text-zinc-500 dark:text-zinc-500" />
                          ) : (
                            <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-500" />
                          )}
                        </button>
                        <Link
                          href="/dashboard/agent/inspections/new"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--sovereign-hover)] px-3 py-1.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-primary dark:bg-primary dark:text-primary dark:hover:bg-[#4edea3]"
                        >
                          <CalendarClock size={16} />
                          <span>Schedule Inspection</span>
                        </Link>
                        {listing.owner?.email ? (
                          <a
                            href={`mailto:${listing.owner.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-1.5 text-[13px] leading-[18px] text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          >
                            <Mail size={16} className={PRIMARY_TEXT} />
                            <span>Contact Owner</span>
                          </a>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-[12px] ${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
                          {statusPill.label}
                        </span>
                        <button
                          type="button"
                          aria-label={`More actions for ${listing.title}`}
                          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Unit Drawer (Unit Matrix Drilldown) */}
                {isOpen ? (
                  <div className="bg-zinc-50 px-4 py-4 dark:bg-zinc-800/40 lg:px-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`${LABEL_SM} uppercase text-zinc-500 dark:text-zinc-500`}>
                        Unit Breakdown &amp; Tenancy Allocation
                      </span>
                      <span className={`${MONO_NUMERIC} text-[12px] font-medium ${PRIMARY_TEXT}`}>
                        {listing.unitCount} total units
                      </span>
                    </div>
                    {listing.units.length === 0 ? (
                      <p className={`${BODY_SM} ${MUTED}`}>
                        No units have been added to this listing yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {vacantUnits.slice(0, 2).map((unit) => (
                          <div
                            key={unit.id}
                            className={`flex flex-col items-start justify-between gap-2 rounded-lg p-3 shadow-sm sm:flex-row sm:items-center ${CARD}`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 font-mono text-[12px] font-bold text-red-700 dark:bg-red-500/20 dark:text-red-400`}
                              >
                                {unit.unitNumber.slice(-3)}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`${TITLE_SM} ${ON_SURFACE}`}>
                                    Unit {unit.unitNumber}
                                    {unit.buildingName ? ` • ${unit.buildingName}` : ''}
                                  </span>
                                  <span
                                    className={`rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-800 dark:bg-red-500/20 dark:text-red-300`}
                                  >
                                    VACANT
                                  </span>
                                </div>
                                <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                                  {unit.isListed
                                    ? 'Active Public Listing • Ready for tenant placement'
                                    : 'Unlisted • Off-market'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <span className={`${MONO_NUMERIC} font-bold ${PRIMARY_TEXT}`}>
                                {naira(unit.rent)}
                                {unit.pricePeriod ? ` / ${unit.pricePeriod}` : ''}
                              </span>
                              <Link
                                href={`/dashboard/agent/listings/${listing.id}`}
                                className={`rounded px-2.5 py-1 text-[12px] font-semibold ${PRIMARY_CONTAINER_BG} ${PRIMARY_CONTAINER_TEXT} transition-colors hover:bg-[var(--sovereign-hover)] hover:text-white`}
                              >
                                Generate Offer
                              </Link>
                            </div>
                          </div>
                        ))}

                        {occupiedUnits.length > 0 ? (
                          <div
                            className={`flex flex-col items-start justify-between gap-2 rounded-lg p-3 shadow-sm sm:flex-row sm:items-center ${CARD}`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary/60 font-mono text-[12px] font-bold text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe]`}
                              >
                                {occupiedUnits.length}U
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`${TITLE_SM} ${ON_SURFACE}`}>
                                    {occupiedUnits.length} occupied unit
                                    {occupiedUnits.length === 1 ? '' : 's'}
                                  </span>
                                  <span
                                    className={`rounded bg-primary/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe]`}
                                  >
                                    OCCUPIED
                                  </span>
                                </div>
                                <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                                  {occupiedUnits
                                    .slice(0, 3)
                                    .map(
                                      (u) =>
                                        u.currentTenant?.fullName ??
                                        `Unit ${u.unitNumber}`
                                    )
                                    .join(', ')}
                                  {occupiedUnits.length > 3
                                    ? ` +${occupiedUnits.length - 3} more`
                                    : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <span className={`${MONO_NUMERIC} text-[12px] font-medium text-zinc-500 dark:text-zinc-500`}>
                                Lease End: {occupiedUnits[0]?.id ? 'Active' : '—'}
                              </span>
                              <Link
                                href={`/dashboard/agent/properties/${listing.id}`}
                                className={`rounded bg-zinc-100 px-2.5 py-1 text-[12px] font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`}
                              >
                                Ledgers
                              </Link>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination & Audit Footer */}
      {filtered.length > 0 ? (
        <div
          className={`${CARD} flex flex-col items-center justify-between gap-4 p-4 sm:flex-row`}
        >
          <div className={`flex items-center gap-2 ${BODY_SM} ${MUTED}`}>
            <span className="h-2 w-2 rounded-full bg-[var(--sovereign-hover)] dark:bg-[#4edea3]" />
            <span>
              Showing <strong className={`font-semibold ${ON_SURFACE}`}>{filtered.length}</strong> of{' '}
              <strong className={`font-semibold ${ON_SURFACE}`}>{stats.totalProperties}</strong>{' '}
              assigned estates
            </span>
            <span className="text-zinc-500 dark:text-zinc-500">•</span>
            {stats.vacant > 0 ? (
              <span className={`font-medium ${TERTIARY_TEXT}`}>
                {stats.vacant} Total Vacant Units available for prospective client showing
              </span>
            ) : (
              <span className="font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                Fully allocated portfolio
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="rounded-lg bg-zinc-100 p-1.5 text-zinc-500 opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1 font-mono text-[12px] font-bold ${PRIMARY_CONTAINER_BG} ${PRIMARY_CONTAINER_TEXT}`}
            >
              1
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1 font-mono text-[12px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              2
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
