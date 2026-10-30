'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Gauge,
  History,
  Plus,
  Search,
  ShieldCheck,
  Timer,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import {
  OpsBadge,
  OpsBreadcrumb,
  OpsButton,
  OpsCard,
  OpsCardHeader,
  OpsEmptyState,
  OpsField,
  OpsInput,
  OpsLabel,
  OpsPage,
  OpsSelect,
  OpsStatCard,
  OpsTextarea,
  formatDate,
  formatRelative,
  initialsOf,
  type OpsTone,
} from '../_ops-ui';

export type MaintenanceTicketRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  listing: { id: string; title: string; address: string; area: string } | null;
  raisedBy: { id: string; fullName: string; email: string; phone: string | null } | null;
  assignedTo: { id: string; fullName: string } | null;
  photoCount: number;
};

export type MaintenancePropertyOption = {
  id: string;
  title: string;
  address: string;
  area: string;
};

const PRIORITY_META: Record<
  MaintenanceTicketRow['priority'],
  { label: string; tone: OpsTone; slaHours: number }
> = {
  urgent: { label: 'Emergency', tone: 'danger', slaHours: 2 },
  high: { label: 'High', tone: 'warning', slaHours: 6 },
  medium: { label: 'Medium', tone: 'neutral', slaHours: 24 },
  low: { label: 'Routine', tone: 'neutral', slaHours: 72 },
};

const STATUS_META: Record<
  MaintenanceTicketRow['status'],
  { label: string; tone: OpsTone }
> = {
  open: { label: 'Open', tone: 'neutral' },
  assigned: { label: 'Assigned', tone: 'info' },
  in_progress: { label: 'In Progress', tone: 'primary' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

const CATEGORY_LABEL: Record<string, string> = {
  plumbing: 'Plumbing & Water',
  electrical: 'Electrical & Power',
  structural: 'Civil & Structural',
  security: 'Access Control & Security',
  cleaning: 'Cleaning & Sanitation',
  other: 'General Works',
};

const PAGE_SIZE = 8;

export default function AgentMaintenanceClient({
  initialTickets,
  properties,
}: {
  initialTickets: MaintenanceTicketRow[];
  properties: MaintenancePropertyOption[];
}) {
  const [query, setQuery] = useState('');
  const [propertyId, setPropertyId] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [statusTab, setStatusTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  );
  const [showNewTicket, setShowNewTicket] = useState(false);

  const counts = useMemo(() => {
    const by = (pred: (t: MaintenanceTicketRow) => boolean) =>
      initialTickets.filter(pred).length;
    return {
      all: initialTickets.length,
      open: by((t) => t.status === 'open' || t.status === 'assigned'),
      inProgress: by((t) => t.status === 'in_progress'),
      resolved: by((t) => t.status === 'resolved' || t.status === 'closed'),
      urgent: by((t) => t.priority === 'urgent'),
      unassigned: by((t) => !t.assignedTo && t.status !== 'closed' && t.status !== 'resolved'),
    };
  }, [initialTickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialTickets.filter((t) => {
      if (statusTab === 'open' && !(t.status === 'open' || t.status === 'assigned')) return false;
      if (statusTab === 'in_progress' && t.status !== 'in_progress') return false;
      if (statusTab === 'resolved' && !(t.status === 'resolved' || t.status === 'closed')) return false;
      if (propertyId !== 'all' && t.listing?.id !== propertyId) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return [
        t.id,
        t.title,
        t.description ?? '',
        t.listing?.title ?? '',
        t.listing?.address ?? '',
        t.raisedBy?.fullName ?? '',
        t.assignedTo?.fullName ?? '',
        CATEGORY_LABEL[t.category] ?? t.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [initialTickets, query, propertyId, priority, category, statusTab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selected = filtered.find((t) => t.id === selectedId) ?? null;

  const statusTabs = [
    { key: 'all', label: 'All Tickets', count: counts.all },
    { key: 'open', label: 'Open / Pending', count: counts.open },
    { key: 'in_progress', label: 'In Progress', count: counts.inProgress },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <OpsPage>
      {/* Breadcrumb + telemetry */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <OpsBreadcrumb
            items={[
              { label: 'Agent Portal' },
              { label: 'Operations' },
              { label: 'Maintenance & Facility Operations' },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <OpsBadge tone="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-primary" />}>
              FM-SLA Active
            </OpsBadge>
            <OpsBadge tone="neutral" icon={<Gauge className="h-3 w-3" />}>
              {counts.all} Ticket Records
            </OpsBadge>
          </div>
        </div>

        {/* Title + action bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Maintenance &amp; Facility Operations Desk
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Supervise corrective work orders, trade maintenance requests, vendor dispatches and SLA
              compliance across your managed Lagos &amp; Abuja mandates.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <OpsButton variant="secondary" icon={undefined}>
              <Download className="h-4 w-4" />
              Export Work Logs (CSV)
            </OpsButton>
            <OpsButton variant="primary" onClick={() => setShowNewTicket(true)}>
              <Plus className="h-4 w-4" />
              New Work Order
            </OpsButton>
          </div>
        </div>
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <OpsStatCard
          label="Open / Logged"
          value={counts.open}
          tone="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
          sub={`${counts.urgent} Critical Emergency (<2h SLA)`}
          badge={{ label: 'Requires Triage', tone: 'warning' }}
        />
        <OpsStatCard
          label="In Progress & Dispatched"
          value={counts.inProgress}
          tone="primary"
          icon={<Wrench className="h-4 w-4" />}
          sub={`${counts.unassigned} awaiting technician`}
          badge={{ label: 'Live Queue', tone: 'primary' }}
        />
        <OpsStatCard
          label="Resolved &amp; Closed"
          value={counts.resolved}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          sub={`${counts.all ? Math.round((counts.resolved / counts.all) * 100) : 0}% completion rate`}
          badge={{ label: 'Ledger', tone: 'neutral' }}
        />
        <OpsStatCard
          label="Managed Properties"
          value={properties.length}
          tone="neutral"
          icon={<Building2 className="h-4 w-4" />}
          sub="Mandated assets in scope"
          badge={{ label: 'Portfolio', tone: 'neutral' }}
        />
      </div>

      {/* Filter deck */}
      <OpsCard className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <OpsInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search ticket ref, property, unit, contractor, or issue description..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[200px]">
              <OpsSelect
                value={propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by property"
              >
                <option value="all">All Properties ({properties.length} Mandates)</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </OpsSelect>
            </div>
            <div className="min-w-[160px]">
              <OpsSelect
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Emergency (&lt; 2h SLA)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Routine / Low</option>
              </OpsSelect>
            </div>
            <div className="min-w-[170px]">
              <OpsSelect
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by trade"
              >
                <option value="all">All Trades</option>
                {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </OpsSelect>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusTab(tab.key);
                setPage(1);
              }}
              className={
                statusTab === tab.key
                  ? 'px-4 py-1.5 rounded-lg bg-primary text-white text-[13px] font-semibold whitespace-nowrap shadow-sm'
                  : 'px-4 py-1.5 rounded-lg text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors'
              }
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </OpsCard>

      {/* Split workspace: ticket ledger + live work-order docket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: tickets ledger */}
        <OpsCard className="lg:col-span-8 overflow-hidden">
          <OpsCardHeader
            eyebrow="Operational Ledger"
            title="Active Operational Tickets"
            icon={<Wrench className="h-4 w-4" />}
            action={
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {pageRows.length} of {filtered.length} shown
              </span>
            }
          />
          {pageRows.length === 0 ? (
            <OpsEmptyState
              icon={<Wrench className="h-6 w-6" />}
              title="No tickets match this view"
              description={
                initialTickets.length === 0
                  ? 'No maintenance work orders have been raised against your mandates yet. Log a new work order to start the dispatch trail.'
                  : 'Adjust the filters above to widen the search across your property portfolio.'
              }
              action={
                <OpsButton variant="primary" onClick={() => setShowNewTicket(true)}>
                  <Plus className="h-4 w-4" />
                  New Work Order
                </OpsButton>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Ticket Ref</th>
                    <th className="py-3 px-4 font-semibold">Property &amp; Unit</th>
                    <th className="py-3 px-4 font-semibold">Issue &amp; Trade</th>
                    <th className="py-3 px-4 font-semibold">Priority &amp; SLA</th>
                    <th className="py-3 px-4 font-semibold">Assigned</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-zinc-900 dark:text-white divide-y divide-zinc-200 dark:divide-white/[0.08]">
                  {pageRows.map((t) => {
                    const pm = PRIORITY_META[t.priority];
                    const sm = STATUS_META[t.status];
                    const isSelected = t.id === selectedId;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={
                          isSelected
                            ? 'bg-primary/70 dark:bg-primary/10 transition-colors cursor-pointer'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer'
                        }
                      >
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <span className="font-mono text-[12px] font-semibold text-primary dark:text-[#4edea3]">
                            #{t.id.slice(-12).toUpperCase()}
                          </span>
                          <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {formatDate(t.createdAt)} · {formatRelative(t.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {t.listing?.title ?? 'Unlinked request'}
                          </div>
                          <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            {t.listing?.area ?? 'No mandate area'}
                          </div>
                          {t.raisedBy ? (
                            <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {t.raisedBy.fullName}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3 px-4 align-top max-w-[260px]">
                          <div className="font-medium text-zinc-900 dark:text-white line-clamp-1">
                            {t.title}
                          </div>
                          <div className="text-[11px] uppercase tracking-wider text-primary dark:text-[#4edea3] font-medium">
                            {CATEGORY_LABEL[t.category] ?? t.category}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <OpsBadge tone={pm.tone}>{pm.label}</OpsBadge>
                          <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">
                            SLA {pm.slaHours}h
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          {t.assignedTo ? (
                            <>
                              <div className="font-medium text-zinc-900 dark:text-white">
                                {t.assignedTo.fullName}
                              </div>
                              <div className="text-[11px] uppercase tracking-wider text-primary dark:text-[#4edea3]">
                                On assignment
                              </div>
                            </>
                          ) : (
                            <OpsBadge tone="warning" icon={<UserRound className="h-3 w-3" />}>
                              Unassigned
                            </OpsBadge>
                          )}
                        </td>
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <OpsBadge tone={sm.tone}>{sm.label}</OpsBadge>
                        </td>
                        <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                          <OpsButton
                            variant="secondary"
                            className="px-2.5 py-1 text-[11px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(t.id);
                            }}
                          >
                            Details
                          </OpsButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pageRows.length > 0 ? (
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Showing <span className="font-semibold text-zinc-900 dark:text-white">
                  {(safePage - 1) * PAGE_SIZE + 1} - {Math.min(safePage * PAGE_SIZE, filtered.length)}
                </span>{' '}
                of {filtered.length} tickets
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-sm disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pageCount })
                  .slice(0, 5)
                  .map((_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={
                          n === safePage
                            ? 'w-8 h-8 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center'
                            : 'w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center'
                        }
                      >
                        {n}
                      </button>
                    );
                  })}
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-sm disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </OpsCard>

        {/* Right: live work-order docket */}
        <div className="lg:col-span-4 space-y-4">
          {selected ? (
            <OpsCard className="overflow-hidden flex flex-col">
              <OpsCardHeader
                eyebrow={
                  <span className="font-mono text-primary dark:text-[#4edea3]">
                    #{selected.id.slice(-12).toUpperCase()}
                  </span> as unknown as string
                }
                title="Work Order Docket"
                icon={<History className="h-4 w-4" />}
                action={
                  <OpsBadge tone={PRIORITY_META[selected.priority].tone}>
                    {PRIORITY_META[selected.priority].label} SLA
                  </OpsBadge>
                }
              />
              <div className="p-4 flex flex-col gap-4">
                {/* Asset context */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <OpsLabel>Asset Location</OpsLabel>
                      <h3 className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                        {selected.listing?.title ?? 'Unlinked request'}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {selected.listing?.address ?? 'No mandate address recorded'}
                      </p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 flex items-center justify-center text-primary dark:text-[#4edea3] shrink-0">
                      <Building2 className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 pt-3 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-600 dark:text-zinc-400">Reporting Party:</span>
                      <span className="font-semibold text-zinc-900 dark:text-white truncate">
                        {selected.raisedBy?.fullName ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-600 dark:text-zinc-400">Verified Contact:</span>
                      <span className="font-mono text-primary dark:text-[#4edea3] truncate">
                        {selected.raisedBy?.phone ?? selected.raisedBy?.email ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-600 dark:text-zinc-400">Mandate Area:</span>
                      <span className="font-medium text-zinc-900 dark:text-white truncate">
                        {selected.listing?.area ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical diagnosis */}
                <div>
                  <OpsLabel>Field Technical Diagnosis</OpsLabel>
                  <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg leading-relaxed">
                    {selected.description?.trim() ||
                      'No field diagnosis has been recorded against this work order yet.'}
                  </p>
                </div>

                {/* SLA gauge */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-1.5">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      Target {PRIORITY_META[selected.priority].slaHours}h Resolution
                    </span>
                    <span className="font-mono font-bold text-primary dark:text-[#4edea3]">
                      {selected.status === 'resolved' || selected.status === 'closed'
                        ? 'Closed'
                        : 'Active'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width:
                          selected.status === 'resolved' || selected.status === 'closed'
                            ? '100%'
                            : selected.status === 'in_progress'
                              ? '60%'
                              : '20%',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1.5">
                    <span>Logged: {formatDate(selected.createdAt)}</span>
                    <span>
                      {selected.resolvedAt
                        ? `Resolved: ${formatDate(selected.resolvedAt)}`
                        : `Last update: ${formatRelative(selected.updatedAt)}`}
                    </span>
                  </div>
                </div>

                {/* Contractor assignment */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <OpsLabel>Assigned Contractor</OpsLabel>
                      <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                        {selected.assignedTo?.fullName ?? 'Awaiting triage'}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {selected.assignedTo
                          ? 'Verified vendor dispatch'
                          : 'No technician assigned yet'}
                      </div>
                    </div>
                    <OpsBadge tone={selected.assignedTo ? 'success' : 'warning'}>
                      {selected.assignedTo ? 'Verified' : 'Unassigned'}
                    </OpsBadge>
                  </div>
                </div>

                {/* Dispatch actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <OpsSelect defaultValue={selected.status} aria-label="Update ticket status">
                        {Object.entries(STATUS_META).map(([key, meta]) => (
                          <option key={key} value={key}>
                            Status: {meta.label}
                          </option>
                        ))}
                      </OpsSelect>
                    </div>
                    <OpsButton variant="secondary" className="px-3">
                      <UserRound className="h-4 w-4" />
                      Reassign
                    </OpsButton>
                  </div>
                  <OpsButton variant="primary" className="w-full py-2.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Technical Sign-Off
                  </OpsButton>
                  <OpsButton variant="secondary" className="w-full">
                    <Timer className="h-4 w-4" />
                    Message Contractor / Resident
                  </OpsButton>
                </div>
              </div>
            </OpsCard>
          ) : (
            <OpsCard>
              <OpsEmptyState
                icon={<ClipboardCheck className="h-6 w-6" />}
                title="No work order selected"
                description="Select a ticket from the ledger to open its live work-order docket."
              />
            </OpsCard>
          )}

          {/* Regulatory footer */}
          <OpsCard className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-[#4edea3] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Statutory Facility &amp; Safety Compliance Protocol
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Operations governed by Lagos State Safety Commission regulations, the National Building
                  Code and NIOB maintenance charters.
                </p>
              </div>
            </div>
          </OpsCard>
        </div>
      </div>

      {showNewTicket ? (
        <NewWorkOrderModal
          properties={properties}
          onClose={() => setShowNewTicket(false)}
        />
      ) : null}
    </OpsPage>
  );
}

function NewWorkOrderModal({
  properties,
  onClose,
}: {
  properties: MaintenancePropertyOption[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingId, setListingId] = useState(properties[0]?.id ?? '');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('plumbing');
  const [priority, setPriority] = useState('medium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Log New Maintenance Work Order
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Rapid Response &amp; Trade Dispatch Hub
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OpsField label="Target Asset Mandate">
              <OpsSelect value={listingId} onChange={(e) => setListingId(e.target.value)}>
                <option value="">Select a property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </OpsSelect>
            </OpsField>
            <OpsField label="Specific Unit / Floor">
              <OpsInput
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Penthouse 1B, Suite 4A, or Common Lobby"
              />
            </OpsField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OpsField label="Trade Category">
              <OpsSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </OpsSelect>
            </OpsField>
            <OpsField label="Priority / SLA Target">
              <OpsSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="urgent">Emergency (&lt; 2h SLA Priority)</option>
                <option value="high">High Priority (&lt; 6h SLA)</option>
                <option value="medium">Medium (&lt; 24h SLA)</option>
                <option value="low">Routine Maintenance (&lt; 72h SLA)</option>
              </OpsSelect>
            </OpsField>
          </div>

          <OpsField label="Issue Description & Technical Symptoms">
            <OpsTextarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed operational symptoms, error codes, affected spaces, and emergency access constraints..."
            />
          </OpsField>

          <OpsField label="Work Order Title">
            <OpsInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the reported fault"
            />
          </OpsField>

          <div className="flex items-center justify-end gap-2 pt-2">
            <OpsButton variant="secondary" onClick={onClose}>
              Cancel
            </OpsButton>
            <OpsButton variant="primary" disabled={!title.trim() || !description.trim()}>
              <Check className="h-4 w-4" />
              Dispatch Work Order
            </OpsButton>
          </div>
        </div>
      </div>
    </div>
  );
}
