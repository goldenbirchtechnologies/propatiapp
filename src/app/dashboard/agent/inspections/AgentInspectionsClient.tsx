'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  CalendarPlus,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MapPin,
  MoreVertical,
  Scale,
  Search,
  ShieldCheck,
  Timer,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  OpsBadge,
  OpsBreadcrumb,
  OpsButton,
  OpsCard,
  OpsEmptyState,
  OpsLabel,
  OpsPage,
  OpsStatCard,
  OpsSelect,
  formatDate,
  type OpsTone,
} from '../_ops-ui';

/* ------------------------------------------------------------------ */
/* Data shape                                                          */
/* ------------------------------------------------------------------ */

export type InspectionRow = {
  id: string;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  listingId: string | null;
  listingTitle: string | null;
  listingAddress: string | null;
  listingArea: string | null;
  listingState: string | null;
  listingType: string | null;
  coverImage: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  reportUrl: string | null;
  notes: string | null;
  currentLayer: number;
  ownerName: string | null;
};

const STATUS_META: Record<InspectionRow['status'], { label: string; tone: OpsTone }> = {
  pending: { label: 'Scheduled', tone: 'neutral' },
  approved: { label: 'Completed', tone: 'success' },
  rejected: { label: 'Cancelled', tone: 'danger' },
};

const TYPE_LABEL: Record<string, string> = {
  sale: 'Outright Sale',
  rent: 'Residential Lease',
  lease: 'Commercial Lease',
  shortlet: 'Short-Let',
  roomshare: 'Room Share',
};

export default function AgentInspectionsClient({ initialInspections }: { initialInspections: InspectionRow[] }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const counts = useMemo(() => {
    const by = (pred: (i: InspectionRow) => boolean) => initialInspections.filter(pred).length;
    return {
      total: initialInspections.length,
      scheduled: by((i) => i.status === 'pending'),
      completed: by((i) => i.status === 'approved'),
      cancelled: by((i) => i.status === 'rejected'),
    };
  }, [initialInspections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return initialInspections.filter((i) => {
      if (filter !== 'all' && i.status !== filter) return false;
      if (dateRange !== 'all') {
        const ts = i.scheduledAt ? new Date(i.scheduledAt).getTime() : null;
        if (ts === null) return false;
        const days =
          dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : dateRange === 'upcoming' ? 0 : null;
        if (days === null) return true;
        if (dateRange === 'upcoming') return ts >= now && ts <= now + 14 * 86400000;
        return ts >= now - days * 86400000;
      }
      if (!q) return true;
      return [i.reference, i.listingTitle ?? '', i.listingAddress ?? '', i.id, i.ownerName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [initialInspections, filter, query, dateRange]);

  const tabs = [
    { key: 'all', label: 'All Inspections', count: counts.total },
    { key: 'pending', label: 'Scheduled', count: counts.scheduled },
    { key: 'approved', label: 'Completed', count: counts.completed },
    { key: 'rejected', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <OpsPage>
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <OpsBreadcrumb
              items={[
                { label: 'Agent Dashboard' },
                { label: 'Verifications & Compliance' },
                { label: 'On-Site Physical Inspections' },
              ]}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Property Inspections &amp; Physical Verifications
              </h1>
              <OpsBadge tone="primary" icon={<Scale className="h-3 w-3" />}>
                Statutory Audit Mode
              </OpsBadge>
            </div>
            <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Cadastral ground truth verifications, statutory physical property audits and LASRERA/ESVARBON
              boundary compliance inspections for your mandated portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Link
              href="/dashboard/agent/inspections/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-[13px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-zinc-500" />
              Latest Report
            </Link>
            <Link
              href="/dashboard/agent/inspections/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-sm transition-colors"
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule Inspection
            </Link>
          </div>
        </div>
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OpsStatCard
          label="Total Inspections"
          value={counts.total}
          tone="neutral"
          icon={<ShieldCheck className="h-4 w-4" />}
          sub="Across your mandated residential &amp; commercial assets"
          badge={{ label: 'Ledger', tone: 'neutral' }}
        />
        <OpsStatCard
          label="Scheduled Field Visits"
          value={counts.scheduled}
          tone="primary"
          icon={<Clock className="h-4 w-4" />}
          sub={nextVisitLabel(initialInspections)}
          badge={{ label: 'Active Queue', tone: 'primary' }}
        />
        <OpsStatCard
          label="Completed &amp; Signed"
          value={counts.completed}
          tone="success"
          icon={<BadgeCheck className="h-4 w-4" />}
          sub={
            counts.total
              ? `${((counts.completed / counts.total) * 100).toFixed(1)}% completion rate`
              : 'No inspections yet'
          }
          badge={{ label: 'Dossiers', tone: 'success' }}
        />
        <OpsStatCard
          label="Cancelled / Blocked"
          value={counts.cancelled}
          tone="danger"
          icon={<XCircle className="h-4 w-4" />}
          sub="Rescheduled due to access lock or weather"
          badge={{ label: 'Review', tone: 'danger' }}
        />
      </div>

      {/* Filters */}
      <OpsCard className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={
                  filter === tab.key
                    ? 'px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm transition-all whitespace-nowrap'
                    : 'px-3.5 py-1.5 rounded-md text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all whitespace-nowrap'
                }
              >
                {tab.label}{' '}
                <span className="font-mono text-xs opacity-75">{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="min-w-[170px]">
              <OpsSelect
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                aria-label="Filter by date range"
              >
                <option value="all">All Time (Last 12 Months)</option>
                <option value="90d">Past 90 Days</option>
                <option value="30d">Past 30 Days</option>
                <option value="upcoming">Upcoming (Next 14 Days)</option>
              </OpsSelect>
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by property title, cadastral plot, address, or inspection ID..."
            className="w-full h-10 pl-11 pr-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/25"
          />
        </div>
      </OpsCard>

      {/* Inspections table */}
      <OpsCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <OpsEmptyState
            icon={<Camera className="h-6 w-6" />}
            title="No inspections"
            description={
              initialInspections.length === 0
                ? 'No physical property inspections are scheduled or recorded yet for this agent account. Schedule a verified cadastral site inspection to begin.'
                : 'No inspections match the selected filters. Adjust the status tab, date range or search term.'
            }
            action={
              <Link
                href="/dashboard/agent/inspections/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-sm transition-colors"
              >
                <CalendarPlus className="h-4 w-4" />
                Schedule Inspection
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Inspection ID &amp; Property</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Inspection Dossier</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                {filtered.map((i) => {
                  const sm = STATUS_META[i.status];
                  const isCancelled = i.status === 'rejected';
                  return (
                    <tr
                      key={i.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 min-w-[260px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                              {i.reference}
                            </span>
                            {i.listingType ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                {TYPE_LABEL[i.listingType] ?? i.listingType}
                              </span>
                            ) : null}
                          </div>
                          <div className="font-medium text-zinc-900 dark:text-white pt-0.5">
                            {i.listingTitle ?? 'Unlinked inspection'}
                          </div>
                          {i.listingAddress ? (
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {i.listingAddress}
                                {i.listingArea ? `, ${i.listingArea}` : ''}
                                {i.listingState ? `, ${i.listingState}` : ''}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 min-w-[180px]">
                          <div
                            className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${
                              isCancelled
                                ? 'text-zinc-500 dark:text-zinc-400 line-through'
                                : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {i.scheduledAt ? formatDate(i.scheduledAt) : 'Not scheduled'}
                          </div>
                          {i.completedAt ? (
                            <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Completed {formatDate(i.completedAt)}
                            </div>
                          ) : null}
                          {i.ownerName ? (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              Principal: {i.ownerName}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <OpsBadge tone={sm.tone}>{sm.label}</OpsBadge>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          {i.reportUrl ? (
                            <>
                              <a
                                href={i.reportUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors self-start"
                              >
                                <FileText className="h-4 w-4" />
                                View Verified Report (PDF)
                              </a>
                              {i.completedAt ? (
                                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                                  Filed {formatDate(i.completedAt)}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                              <Timer className="h-4 w-4" />
                              {isCancelled
                                ? 'No Report Generated'
                                : 'Report Pending — Field Visit Incomplete'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        {i.reportUrl ? (
                          <Link
                            href="/dashboard/agent/inspections/report"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[13px] font-medium transition-colors"
                          >
                            Inspect Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/agent/inspections/new?verificationId=${i.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[13px] font-medium transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                            Actions
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </OpsCard>

      {/* Photographic evidence gallery — derived from completed dossiers */}
      <OpsCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Photographic Cadastral Evidence
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Field assets captured during your verified inspection dossiers
            </p>
          </div>
          <OpsBadge tone="neutral" icon={<Camera className="h-3 w-3" />}>
            {filtered.filter((i) => i.coverImage).length} Geotagged Records
          </OpsBadge>
        </div>
        {filtered.some((i) => i.coverImage) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            {filtered
              .filter((i) => i.coverImage)
              .slice(0, 8)
              .map((i) => (
                <div
                  key={i.id}
                  className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden flex flex-col group"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.coverImage as string}
                      alt={i.listingTitle ?? 'Inspection evidence'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur text-[11px] font-mono font-semibold text-zinc-900">
                      {i.reference}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <div className="flex items-center gap-1 font-mono text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="truncate">
                          {i.listingArea ?? '—'}
                          {i.listingState ? `, ${i.listingState}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <OpsLabel>Elevation Facade</OpsLabel>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                          {i.status === 'approved' ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <h3 className="mt-1 font-medium text-zinc-900 dark:text-white truncate">
                        {i.listingTitle ?? 'Unlinked inspection'}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {i.notes?.trim() ||
                          'Physical survey evidence captured during the on-site cadastral verification.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{i.completedAt ? `Verified ${formatDate(i.completedAt)}` : 'Field visit pending'}</span>
                      {i.ownerName ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[50%]">
                          {i.ownerName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <OpsEmptyState
            icon={<Camera className="h-6 w-6" />}
            title="No photographic evidence logged"
            description="Geotagged field imagery appears here once an inspection dossier carries a completed report and property photography."
          />
        )}
      </OpsCard>

      {/* Technical audit footer */}
      <OpsCard className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white block">
              prisma.verification.findMany({`{ where: { l4AgentId: "${'…'}" }, include: { listing: true } }`}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              LASRERA Reg. Portal Compliant · ESVARBON &amp; NIESV Certified Audits
            </span>
          </div>
        </div>
        <OpsButton variant="secondary" className="px-2.5 py-1.5 text-[11px]">
          <Download className="h-3.5 w-3.5" />
          Download Log (CSV)
        </OpsButton>
      </OpsCard>
    </OpsPage>
  );
}

function nextVisitLabel(inspections: InspectionRow[]): string {
  const upcoming = inspections
    .filter((i) => i.status === 'pending' && i.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime());
  if (upcoming.length === 0) return 'No field visits in the queue';
  const next = upcoming[0];
  return `Next: ${formatDate(next.scheduledAt)} · ${next.listingTitle ?? 'Mandate visit'}`;
}
