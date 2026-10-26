'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Handshake,
  Wallet,
  TrendingUp,
  BadgeCheck,
  ChevronRight,
  CalendarClock,
  Plus,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  CARD,
  CARD_SOFT,
  INSET,
  LABEL_SM,
  TITLE_MD,
  TITLE_SM,
  HEADLINE_MD,
  HEADLINE_LG,
  BODY_SM,
  MONO_NUMERIC,
  MUTED,
  PRIMARY_TEXT,
  PRIMARY_BG,
  PRIMARY_CONTAINER_BG,
  PRIMARY_CONTAINER_TEXT,
  SECONDARY_CONTAINER_BG,
  SECONDARY_CONTAINER_TEXT,
  TERTIARY_BG,
  TERTIARY_TEXT,
  ON_SURFACE,
  DIVIDER,
  naira,
  nairaCompact,
  humanise,
  timeAgo,
  agreementStatusPill,
  pct,
  initials,
} from './agent-stitch';

export interface AgentDealRow {
  id: string;
  listingId: string | null;
  propertyTitle: string;
  propertyAddress: string;
  coverImage: string | null;
  clientName: string;
  clientType: string;
  status: string;
  type: string;
  dealValue: number;
  rentPeriod: string | null;
  activityAt: string;
}

export interface AgentPipelineSegment {
  key: string;
  label: string;
  detail: string;
  value: number;
  count: number;
  colorClass: string;
  barClass: string;
}

export interface AgentScheduleItem {
  id: string;
  kind: string;
  listingTitle: string;
  location: string;
  scheduledAt: string;
  status: string;
  reference: string | null;
}

export interface AgentDashboardClientProps {
  userName: string;
  agentTier: string;
  agentApproved: boolean;
  agentAreas: string[];
  verificationTier: string;
  /** Managed properties (listings) count. */
  managedProperties: number;
  /** Total units across managed properties. */
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  /** Active (non-terminal) agreements. */
  activeDeals: number;
  activeDealsValue: number;
  /** Pending commission amount (naira) + count of releases pending. */
  pendingCommissionAmount: number;
  pendingCommissionCount: number;
  /** Commission cleared this calendar month (naira). */
  monthEarnings: number;
  previousMonthEarnings: number;
  /** Segmented pipeline composition. */
  pipelineSegments: AgentPipelineSegment[];
  pipelineTotalValue: number;
  /** Recent deals for the table. */
  recentDeals: AgentDealRow[];
  totalDeals: number;
  /** Upcoming L4 inspections. */
  schedule: AgentScheduleItem[];
  totalScheduled: number;
  /** Counts for the empty states. */
  enquiryCount: number;
  clientCount: number;
  pendingInvites: number;
  lastSyncedAt: string;
}

const DEAL_FILTERS = [
  { key: 'all', label: 'All Active' },
  { key: 'pending', label: 'Under Review' },
  { key: 'escrow', label: 'Awaiting Escrow' },
  { key: 'closed', label: 'Closed' },
] as const;

type DealFilterKey = (typeof DEAL_FILTERS)[number]['key'];

function filterMatches(status: string, filter: DealFilterKey): boolean {
  switch (filter) {
    case 'pending':
      return status === 'pending_landlord' || status === 'pending_tenant' || status === 'draft';
    case 'escrow':
      return status === 'landlord_signed' || status === 'tenant_signed';
    case 'closed':
      return status === 'fully_signed' || status === 'terminated' || status === 'expired';
    default:
      return true;
  }
}

function scheduleStatusPill(status: string): {
  label: string;
  className: string;
  dot: string;
} {
  switch (status) {
    case 'approved':
      return {
        label: 'Confirmed',
        className: SECONDARY_CONTAINER_TEXT,
        dot: 'bg-emerald-700 dark:bg-emerald-400',
      };
    case 'rejected':
      return {
        label: 'Declined',
        className: TERTIARY_TEXT,
        dot: 'bg-red-700 dark:bg-red-400',
      };
    case 'pending':
      return {
        label: 'Scheduled',
        className: MUTED,
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
    default:
      return {
        label: humanise(status),
        className: MUTED,
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
  }
}

export default function AgentDashboardClient({
  userName,
  agentTier,
  agentApproved,
  agentAreas,
  verificationTier,
  managedProperties,
  totalUnits,
  occupiedUnits,
  vacantUnits,
  occupancyRate,
  activeDeals,
  activeDealsValue,
  pendingCommissionAmount,
  pendingCommissionCount,
  monthEarnings,
  previousMonthEarnings,
  pipelineSegments,
  pipelineTotalValue,
  recentDeals,
  totalDeals,
  schedule,
  totalScheduled,
  enquiryCount,
  clientCount,
  pendingInvites,
  lastSyncedAt,
}: AgentDashboardClientProps) {
  const [dealFilter, setDealFilter] = useState<DealFilterKey>('all');

  const firstName = userName.split(' ')[0] || userName;

  const tierLabel =
    agentTier === 'senior' ? 'Senior' : agentTier === 'probation' ? 'Probationary' : 'Standard';
  const tierDisplay = `Verified ${tierLabel} Agent`;
  const areaDisplay = agentAreas.length > 0 ? agentAreas.join(', ') : 'Lagos Metropolitan Branch';

  const monthDelta = useMemo(() => {
    if (previousMonthEarnings <= 0) return null;
    const delta = ((monthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% MoM`;
  }, [monthEarnings, previousMonthEarnings]);

  const filteredDeals = useMemo(
    () => recentDeals.filter((d) => filterMatches(d.status, dealFilter)),
    [recentDeals, dealFilter],
  );

  const visibleSchedule = schedule.slice(0, 3);

  const pipelineBars = pipelineSegments.filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      {/* ============ PAGE HEADER & ACTIONS BANNER ============ */}
      <section
        className={`${CARD} relative overflow-hidden p-4 lg:p-6`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          {/* Agent Identity & Verification State */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`${HEADLINE_MD} ${ON_SURFACE} tracking-tight`}>
                Welcome back, {firstName}
              </h1>
              {agentApproved ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${LABEL_SM} ${SECONDARY_CONTAINER_BG} ${SECONDARY_CONTAINER_TEXT}`}
                >
                  <BadgeCheck size={15} className="text-emerald-700 dark:text-emerald-400" />
                  {tierDisplay} • {areaDisplay}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${LABEL_SM} ${TERTIARY_BG} ${TERTIARY_TEXT}`}
                >
                  <ShieldCheck size={15} />
                  Account Pending Approval
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 ${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
              <span
                className={`inline-block h-2 w-2 animate-pulse rounded-full ${
                  agentApproved ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>
                Prisma Sync: {timeAgo(lastSyncedAt)} • Verification tier{' '}
                {humanise(verificationTier)}
              </span>
            </div>
          </div>

          {/* High-Contrast Action Suite */}
          <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
            <Link
              href="/dashboard/agent/inspections/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3.5 py-2 text-[13px] leading-[18px] text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800"
            >
              <CalendarClock size={18} className="text-zinc-600 dark:text-zinc-400" />
              <span>Schedule Inspection</span>
            </Link>
            <Link
              href="/dashboard/agent/commissions"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3.5 py-2 text-[13px] leading-[18px] text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800"
            >
              <Wallet size={18} className="text-zinc-600 dark:text-zinc-400" />
              <span>View Commissions</span>
            </Link>
            <Link
              href="/dashboard/agent/agreements/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-[13px] leading-[18px] text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-500"
            >
              <Plus size={18} />
              <span>New Agreement</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 4-COLUMN KEY STATS GRID ============ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Managed Properties */}
        <div
          className={`${CARD} flex flex-col justify-between p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
              Managed Properties
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-emerald-700 transition-colors group-hover:bg-emerald-500 dark:bg-zinc-800/50 dark:text-emerald-400">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className={`${HEADLINE_LG} ${ON_SURFACE}`}>
              {totalUnits > 0 ? `${totalUnits} Units` : `${managedProperties} Assets`}
            </div>
            <div className={`mt-1 flex items-center gap-1.5 ${BODY_SM} ${MUTED}`}>
              <span
                className={`inline-flex items-center rounded bg-emerald-200/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300`}
              >
                {occupiedUnits}/{totalUnits} occupied
              </span>
              <span>• {occupancyRate}% occupancy</span>
            </div>
          </div>
        </div>

        {/* Active Deals */}
        <div
          className={`${CARD} flex flex-col justify-between p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>Active Deals</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-emerald-700 dark:bg-zinc-800/50 dark:text-emerald-400">
              <Handshake size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className={`${HEADLINE_LG} ${ON_SURFACE}`}>
              {activeDeals} {activeDeals === 1 ? 'In-Flight' : 'In-Flight'}
            </div>
            <div className={`mt-1 truncate ${BODY_SM} ${MUTED}`}>
              <span className={`${MONO_NUMERIC} ${ON_SURFACE}`}>
                {nairaCompact(activeDealsValue)}
              </span>{' '}
              gross pipeline
            </div>
          </div>
        </div>

        {/* Pending Commissions */}
        <div
          className={`${CARD} flex flex-col justify-between p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
              Pending Escrow
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-emerald-700 dark:bg-zinc-800/50 dark:text-emerald-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className={`${HEADLINE_LG} ${ON_SURFACE} ${MONO_NUMERIC}`}>
              {nairaCompact(pendingCommissionAmount)}
            </div>
            <div className={`mt-1 flex items-center gap-1.5 ${BODY_SM} ${MUTED}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />
              <span>
                {pendingCommissionCount} release{pendingCommissionCount === 1 ? '' : 's'} pending
                Paystack
              </span>
            </div>
          </div>
        </div>

        {/* Month Earnings */}
        <div
          className={`${CARD} flex flex-col justify-between p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>
              This Month Cleared
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-emerald-700 dark:bg-zinc-800/50 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className={`${HEADLINE_LG} ${ON_SURFACE} ${MONO_NUMERIC}`}>
              {nairaCompact(monthEarnings)}
            </div>
            <div className={`mt-1 flex items-center gap-1.5 ${BODY_SM} ${MUTED}`}>
              {monthDelta ? (
                <span
                  className={`inline-flex items-center rounded bg-emerald-200/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300`}
                >
                  {monthDelta}
                </span>
              ) : null}
              <span className="truncate">
                {previousMonthEarnings > 0 ? 'vs prior month' : 'No prior month'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 65/35 WORKSPACE LAYOUT ============ */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Recent Deals Table (8 cols) */}
        <section className="space-y-4 lg:col-span-8">
          <div className={`${CARD} overflow-hidden`}>
            {/* Table Controls Header */}
            <div
              className={`flex flex-col justify-between gap-2 border-b p-4 sm:flex-row sm:items-center ${DIVIDER}`}
            >
              <div>
                <h2 className={`${TITLE_MD} ${ON_SURFACE}`}>Recent Agreements &amp; Deals</h2>
                <p className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                  {activeDeals} active leasing and conveyancing records across your mandates
                </p>
              </div>
              {/* Segmented Filter Tabs */}
              <div
                className={`inline-flex max-w-full self-start overflow-x-auto rounded-lg border p-1 sm:self-auto ${INSET}`}
              >
                {DEAL_FILTERS.map((f) => {
                  const active = dealFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setDealFilter(f.key)}
                      aria-pressed={active}
                      className={`${LABEL_SM} whitespace-nowrap rounded-md px-2.5 py-1 transition-colors ${
                        active
                          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Container with Tabular Formats */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr
                    className={`${LABEL_SM} border-b text-zinc-500 dark:text-zinc-500 ${DIVIDER} bg-zinc-50/70 dark:bg-zinc-800/50`}
                  >
                    <th className="px-4 py-3 font-semibold">Property Asset</th>
                    <th className="px-4 py-3 font-semibold">Client Entity</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Deal Value</th>
                    <th className="px-4 py-3 font-semibold">Activity</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${DIVIDER} ${BODY_SM} ${ON_SURFACE}`}>
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <Handshake
                          size={40}
                          className="mx-auto mb-3 text-zinc-500 dark:text-zinc-400"
                          style={{ opacity: 0.5 }}
                        />
                        <p className={`${TITLE_SM} ${ON_SURFACE}`}>No agreements in this view</p>
                        <p className={`mt-1 ${BODY_SM} ${MUTED}`}>
                          {totalDeals === 0
                            ? 'Create your first agreement to start tracking deals.'
                            : 'No records match this filter.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => {
                      const pill = agreementStatusPill(deal.status);
                      return (
                        <tr
                          key={deal.id}
                          className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {deal.coverImage ? (
                                <img
                                  src={deal.coverImage}
                                  alt={deal.propertyTitle}
                                  className="h-10 w-10 flex-shrink-0 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
                                />
                              ) : (
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                  <Building2 size={16} className="text-zinc-500 dark:text-zinc-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div
                                  className={`${TITLE_SM} ${ON_SURFACE} truncate`}
                                >
                                  {deal.propertyTitle}
                                </div>
                                <div className="flex items-center gap-1 text-[12px] text-zinc-500 dark:text-zinc-500">
                                  <MapPin size={13} />
                                  <span className="truncate">{deal.propertyAddress}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-zinc-900 dark:text-white">
                              {deal.clientName}
                            </div>
                            <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                              {deal.clientType}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pill.className}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                              {pill.label}
                            </span>
                          </td>
                          <td className={`px-4 py-3.5 text-right font-mono font-semibold ${ON_SURFACE}`}>
                            {naira(deal.dealValue)}
                            {deal.rentPeriod ? (
                              <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-500">
                                /{deal.rentPeriod === 'year' ? 'yr' : deal.rentPeriod}
                              </span>
                            ) : null}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3.5 ${BODY_SM} text-zinc-500 dark:text-zinc-500`}
                          >
                            {timeAgo(deal.activityAt)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              href={
                                deal.listingId
                                  ? `/dashboard/agent/deals/${deal.listingId}`
                                  : '/dashboard/agent/deals'
                              }
                              className={`inline-flex items-center gap-1 text-[13px] font-semibold ${PRIMARY_TEXT} transition-colors hover:text-emerald-900 dark:hover:text-emerald-200`}
                            >
                              View
                              <ChevronRight size={16} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Navigation */}
            <div
              className={`flex items-center justify-between border-t px-4 py-3 ${DIVIDER} bg-zinc-50/40 dark:bg-zinc-800/40`}
            >
              <span className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                Showing {filteredDeals.length} of {totalDeals} agreement records
              </span>
              <Link
                href="/dashboard/agent/deals"
                className={`inline-flex items-center gap-1 text-[13px] font-semibold ${PRIMARY_TEXT} hover:underline`}
              >
                <span>View complete agreement ledger</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Side Rail Widgets (4 cols) */}
        <aside className="space-y-4 lg:col-span-4">
          {/* Pipeline Composition */}
          <div className={`${CARD} space-y-4 p-4`}>
            <div className={`flex items-center justify-between border-b pb-3 ${DIVIDER}`}>
              <div>
                <h3 className={`${TITLE_MD} ${ON_SURFACE}`}>Pipeline Composition</h3>
                <p className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                  By asset class volume &amp; tenure
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${SECONDARY_CONTAINER_BG} ${SECONDARY_CONTAINER_TEXT}`}
              >
                {totalDeals} deals
              </span>
            </div>

            {pipelineTotalValue > 0 && pipelineBars.length > 0 ? (
              <>
                {/* Stacked Bar Visual */}
                <div className="space-y-1">
                  <div
                    className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                    role="img"
                    aria-label="Pipeline composition by asset class"
                  >
                    {pipelineBars.map((seg) => (
                      <div
                        key={seg.key}
                        className={`h-full ${seg.barClass}`}
                        style={{ width: `${pct(seg.value, pipelineTotalValue)}%` }}
                        title={`${seg.label}: ${pct(seg.value, pipelineTotalValue)}%`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-500">
                    {pipelineBars.map((seg) => (
                      <span key={seg.key}>
                        {seg.label} ({pct(seg.value, pipelineTotalValue)}%)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detailed Asset Breakdown List */}
                <div className="space-y-2">
                  {pipelineBars.map((seg) => (
                    <div
                      key={seg.key}
                      className="flex items-center justify-between rounded-lg bg-zinc-50/60 p-2 dark:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-sm ${seg.colorClass}`} />
                        <div>
                          <div className={`${TITLE_SM} ${ON_SURFACE}`}>{seg.label}</div>
                          <div className="text-[12px] text-zinc-500 dark:text-zinc-500">
                            {seg.detail}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-mono text-[14px] font-semibold ${ON_SURFACE}`}>
                        {nairaCompact(seg.value)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`flex items-center justify-between border-t pt-1 text-[12px] text-zinc-500 dark:text-zinc-500 ${DIVIDER}`}
                >
                  <span>Overall Pipeline Value</span>
                  <span className={`font-medium ${ON_SURFACE}`}>
                    {nairaCompact(pipelineTotalValue)}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <TrendingUp
                  size={32}
                  className="mx-auto mb-2 text-zinc-500 dark:text-zinc-400"
                  style={{ opacity: 0.5 }}
                />
                <p className={`${BODY_SM} ${MUTED}`}>
                  No pipeline value yet. Signed agreements will populate this chart.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments & Verification Inspections */}
          <div className={`${CARD} space-y-4 p-4`}>
            <div className={`flex items-center justify-between border-b pb-3 ${DIVIDER}`}>
              <div>
                <h3 className={`${TITLE_MD} ${ON_SURFACE}`}>Field Schedule</h3>
                <p className={`${BODY_SM} text-zinc-500 dark:text-zinc-500`}>
                  L4 physical property verifications
                </p>
              </div>
              <Clock size={20} className="text-zinc-500 dark:text-zinc-500" />
            </div>

            {visibleSchedule.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarClock
                  size={32}
                  className="mx-auto mb-2 text-zinc-500 dark:text-zinc-400"
                  style={{ opacity: 0.5 }}
                />
                <p className={`${BODY_SM} ${MUTED}`}>
                  No inspections scheduled. Book a field verification to populate this timeline.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleSchedule.map((item) => {
                  const pill = scheduleStatusPill(item.status);
                  const scheduled = new Date(item.scheduledAt);
                  const when = Number.isNaN(scheduled.getTime())
                    ? 'Unscheduled'
                    : scheduled.toLocaleString('en-NG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                  return (
                    <div
                      key={item.id}
                      className={`space-y-1.5 rounded-lg border-l-2 bg-zinc-50/50 p-3 transition-colors hover:bg-zinc-50 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/60 ${
                        item.status === 'approved'
                          ? 'border-emerald-700 dark:border-emerald-400'
                          : item.status === 'pending'
                            ? 'border-emerald-500 dark:border-emerald-400/70'
                            : 'border-zinc-300 dark:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SECONDARY_CONTAINER_BG} ${SECONDARY_CONTAINER_TEXT}`}
                        >
                          {when}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${pill.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                          {pill.label}
                        </span>
                      </div>
                      <div className={`${TITLE_SM} ${ON_SURFACE} leading-snug`}>{item.kind}</div>
                      <div className="flex items-center gap-1 truncate text-[12px] text-zinc-500 dark:text-zinc-500">
                        <Building2 size={14} />
                        <span className="truncate">{item.location || item.listingTitle}</span>
                      </div>
                      <div className={`flex items-center justify-between pt-1 text-[12px] ${MUTED}`}>
                        <span className="truncate">{item.listingTitle}</span>
                        {item.reference ? (
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                            {item.reference}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/dashboard/agent/calendar"
              className="block w-full rounded-lg bg-zinc-50 py-2.5 text-center text-[13px] font-semibold text-zinc-900 shadow-xs transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-white dark:hover:bg-zinc-800"
            >
              Open Full Agent Schedule
            </Link>
          </div>

          {/* Quick Regulatory Compliance Note */}
          <div className={`${CARD_SOFT} space-y-1 p-4`}>
            <div className={`flex items-center gap-2 ${TITLE_SM} ${PRIMARY_TEXT} font-semibold`}>
              <ShieldCheck size={18} />
              <span>AML / CFT Compliance</span>
            </div>
            <p className={`${BODY_SM} leading-relaxed text-zinc-500 dark:text-zinc-500`}>
              SCUML &amp; CAC Anti-Money Laundering protocol active. All transactions above{' '}
              <strong className="font-mono text-zinc-900 dark:text-white">₦5,000,000</strong>{' '}
              require statutory CTR filing and valid BVN/NIN verified KYC.
            </p>
          </div>

          {/* Secondary KPI strip — enquiries / clients / invites */}
          <div className={`${CARD} grid grid-cols-3 divide-x p-0 ${DIVIDER}`}>
            <Link href="/dashboard/agent/clients" className="p-3 text-center transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className={`${TITLE_MD} ${ON_SURFACE}`}>{enquiryCount}</div>
              <div className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>Enquiries</div>
            </Link>
            <Link href="/dashboard/agent/clients" className="p-3 text-center transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className={`${TITLE_MD} ${ON_SURFACE}`}>{clientCount}</div>
              <div className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>Clients</div>
            </Link>
            <Link href="/dashboard/agent/invites" className="p-3 text-center transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className={`${TITLE_MD} ${ON_SURFACE}`}>{pendingInvites}</div>
              <div className={`${LABEL_SM} text-zinc-500 dark:text-zinc-500`}>Invites</div>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
