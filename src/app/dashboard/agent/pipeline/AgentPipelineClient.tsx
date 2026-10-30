'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Table2,
  Download,
  Plus,
  Building2,
  Wallet,
  Timer,
  BadgeCheck,
  TrendingUp,
  Eye,
  Mail,
  FileText,
  MoreVertical,
  ChevronRight,
  Calendar,
  Receipt,
  ShieldCheck,
  Handshake,
  GripVertical,
  MapPin,
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
  SegmentedControl,
  ToneBadge,
  ToolbarSearch,
  ToolbarSelect,
} from '../_lib/agent-ui';
import {
  PIPELINE_STAGES,
  daysSince,
  formatDate,
  formatNairaCompact,
  formatNairaValue,
  formatRelative,
  humanise,
  initials,
  stageMeta,
  statusMeta,
  statusPillClass,
  typeMeta,
  type StageId,
} from '../_lib/agent-deal-format';
import type { DealRecord, PipelinePayload } from '../_lib/agent-deal-types';

type View = 'kanban' | 'ledger';

const considerationOf = (d: DealRecord) =>
  (d as DealRecord & { consideration?: number }).consideration ?? d.rentAmount ?? 0;

export default function AgentPipelineClient({ initialData }: { initialData: PipelinePayload }) {
  const [view, setView] = useState<View>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('value_desc');

  const deals = initialData.deals;

  const typeOptions = useMemo(() => {
    const set = new Map<string, string>();
    deals.forEach((d) => set.set(d.type, typeMeta(d.type).label));
    return [{ value: 'all', label: 'All Deal Types' }, ...Array.from(set).map(([value, label]) => ({ value, label }))];
  }, [deals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = deals.filter((d) => {
      if (stageFilter !== 'all' && d.stage !== stageFilter) return false;
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

    rows = [...rows].sort((a, b) => {
      if (sort === 'value_desc') return considerationOf(b) - considerationOf(a);
      if (sort === 'value_asc') return considerationOf(a) - considerationOf(b);
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

    return rows;
  }, [deals, search, stageFilter, typeFilter, sort]);

  const byStage = useMemo(() => {
    const map = new Map<StageId, DealRecord[]>();
    PIPELINE_STAGES.forEach((s) => map.set(s.id, []));
    filtered.forEach((d) => map.get(d.stage)?.push(d));
    return map;
  }, [filtered]);

  const stageTotals = useMemo(() => {
    const map = new Map<StageId, number>();
    PIPELINE_STAGES.forEach((s) =>
      map.set(
        s.id,
        (byStage.get(s.id) ?? []).reduce((sum, d) => sum + considerationOf(d), 0)
      )
    );
    return map;
  }, [byStage]);

  const exportCsv = () => {
    const header = ['Reference', 'Property', 'Address', 'Client', 'Landlord', 'Type', 'Status', 'Stage', 'Consideration', 'Caution Deposit', 'Created'];
    const rows = filtered.map((d) => [
      d.reference,
      d.property?.title ?? '—',
      d.property?.address ?? '—',
      d.tenant?.fullName ?? '—',
      d.landlord?.fullName ?? '—',
      typeMeta(d.type).label,
      statusMeta(d.status).label,
      stageMeta(d.stage).title,
      String(considerationOf(d)),
      String(d.cautionDeposit),
      formatDate(d.createdAt),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propati-agent-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = initialData.stats;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb + header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <AgentBreadcrumb
            items={[
              { label: 'Sales & CRM', href: '/dashboard/agent' },
              { label: 'Mandated Conveyancing & Leasing' },
              { label: 'All Deals Pipeline', current: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Deals &amp; Conveyancing Pipeline
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[13px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              {stats.total} In-Flight Transactions
            </span>
          </div>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Real-time deal progression ledger mapping Prisma Agreement records, escrow
            conditions, title conveyance, and statutory compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<View>
            value={view}
            onChange={setView}
            options={[
              { value: 'kanban', label: 'Kanban', icon: <LayoutDashboard className="h-4 w-4" /> },
              { value: 'ledger', label: 'Ledger', icon: <Table2 className="h-4 w-4" /> },
            ]}
          />
          <SecondaryAction icon={<Download className="h-4 w-4" />} onClick={exportCsv}>
            Export CSV
          </SecondaryAction>
          <Link
            href="/dashboard/agent/agreements/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] active:scale-[0.98] dark:bg-primary dark:text-zinc-900 dark:hover:bg-[#4edea3]"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Deal Agreement</span>
          </Link>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgentStatCard
          label="Total Mandated Deals"
          value={`${stats.total} Deals`}
          icon={<Building2 className="h-5 w-5" />}
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium text-zinc-900 dark:text-white">
                  {stats.active} Active
                </span>
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono-numeric text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {stats.closed} Closed
              </span>
            </div>
          }
        />
        <AgentStatCard
          label="Active Pipeline Gross"
          value={formatNairaCompact(stats.grossValue)}
          icon={<Wallet className="h-5 w-5" />}
          accent="neutral"
          sublabel={
            <span className="inline-flex items-center gap-1 text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              <TrendingUp className="h-3.5 w-3.5" />
              Gross mandate value
            </span>
          }
        />
        <AgentStatCard
          label="In-Progress Velocity"
          value={`${stats.pending} In-Flight`}
          icon={<Timer className="h-5 w-5" />}
          accent="amber"
          sublabel={
            <span className="flex items-center gap-1">
              <span className="text-zinc-600 dark:text-zinc-400">Avg stage time:</span>
              <span className="font-mono-numeric font-semibold text-zinc-900 dark:text-white">
                {stats.averageStageDays !== null ? `${stats.averageStageDays} days` : '—'}
              </span>
            </span>
          }
        />
        <AgentStatCard
          label="Escrow & Closed Value"
          value={formatNairaCompact(stats.escrowValue)}
          icon={<BadgeCheck className="h-5 w-5" />}
          sublabel={
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
                <span className="font-mono-numeric font-medium text-zinc-900 dark:text-white">
                  {formatNairaCompact(stats.commissionValue)}
                </span>
                <span className="text-zinc-500">commission</span>
              </span>
              <span className="text-[11px] uppercase text-zinc-500">10% agency</span>
            </div>
          }
        />
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <AgentCard className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
          <div className="md:col-span-5">
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by property, client name, or agreement ID…"
            />
          </div>
          <div className="md:col-span-3">
            <ToolbarSelect
              ariaLabel="Deal type filter"
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
            />
          </div>
          <div className="md:col-span-2">
            <ToolbarSelect
              ariaLabel="Sort order"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'value_desc', label: 'Value (High → Low)' },
                { value: 'value_asc', label: 'Value (Low → High)' },
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
              ]}
            />
          </div>
          <div className="flex items-center md:col-span-2 md:justify-end">
            <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
              <span className="font-mono-numeric font-semibold text-zinc-900 dark:text-white">
                {filtered.length}
              </span>{' '}
              of {deals.length} records
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Fast Filters:
          </span>
          <FilterPill active={stageFilter === 'all'} onClick={() => setStageFilter('all')} count={deals.length}>
            All Stages
          </FilterPill>
          {PIPELINE_STAGES.map((stage) => (
            <FilterPill
              key={stage.id}
              active={stageFilter === stage.id}
              onClick={() => setStageFilter(stageFilter === stage.id ? 'all' : stage.id)}
              count={deals.filter((d) => d.stage === stage.id).length}
            >
              {stage.shortTitle}
            </FilterPill>
          ))}
          {(stageFilter !== 'all' || typeFilter !== 'all' || search) && (
            <button
              type="button"
              onClick={() => {
                setStageFilter('all');
                setTypeFilter('all');
                setSearch('');
              }}
              className="ml-1 text-[13px] font-medium text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </AgentCard>

      {/* ── Main view ────────────────────────────────────────────────────── */}
      {view === 'kanban' ? (
        <KanbanView
          byStage={byStage}
          stageTotals={stageTotals}
          totalDeals={deals.length}
          emptyAll={deals.length === 0}
        />
      ) : (
        <LedgerView deals={filtered} total={deals.length} emptyAll={deals.length === 0} />
      )}
    </div>
  );
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

function KanbanView({
  byStage,
  stageTotals,
  totalDeals,
  emptyAll,
}: {
  byStage: Map<StageId, DealRecord[]>;
  stageTotals: Map<StageId, number>;
  totalDeals: number;
  emptyAll: boolean;
}) {
  if (emptyAll) {
    return (
      <AgentCard>
        <AgentEmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="No deals in the pipeline yet"
          description="Once a mandate, viewing or agreement is created against your listings, it will appear here across the five conveyancing stages."
        />
      </AgentCard>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-6">
      {PIPELINE_STAGES.map((stage) => {
        const stageDeals = byStage.get(stage.id) ?? [];
        const total = stageTotals.get(stage.id) ?? 0;
        return (
          <section
            key={stage.id}
            className="w-[340px] shrink-0 snap-start rounded-xl bg-zinc-100 p-2 shadow-sm dark:bg-zinc-800/50"
            aria-label={stage.title}
          >
            <header className="flex flex-col gap-1.5 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.accent}`} />
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {stage.title}
                  </h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {stageDeals.length} {stageDeals.length === 1 ? 'Deal' : 'Deals'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Stage Pipeline:</span>
                <span className="font-mono-numeric font-bold text-zinc-900 dark:text-white">
                  {formatNairaCompact(total)}
                </span>
              </div>
            </header>

            <div className="mt-2 flex flex-col gap-2">
              {stageDeals.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-300 px-3 py-8 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
                  No deals in this stage
                </div>
              ) : (
                stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} stage={stage.id} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DealCard({ deal, stage }: { deal: DealRecord; stage: StageId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusMeta(deal.status);
  const type = typeMeta(deal.type);
  const consideration = considerationOf(deal);
  const age = daysSince(deal.createdAt);
  const counterparty = deal.tenant ?? deal.landlord;

  return (
    <article className="group flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-zinc-500">
          <GripVertical className="h-4 w-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
          <span className="truncate font-mono-numeric text-[11px] uppercase tracking-wider">
            {deal.reference}
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Deal actions"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded p-0.5 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-zinc-900">
                {deal.tenant?.phone ? (
                  <a
                    href={`tel:${deal.tenant.phone}`}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Handshake className="h-3.5 w-3.5" /> Call client
                  </a>
                ) : null}
                {deal.tenant?.email ? (
                  <a
                    href={`mailto:${deal.tenant.email}`}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email client
                  </a>
                ) : null}
                {deal.property ? (
                  <Link
                    href={`/dashboard/agent/listings`}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <MapPin className="h-3.5 w-3.5" /> View listing
                  </Link>
                ) : null}
                {deal.pdfUrl ? (
                  <a
                    href={deal.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <FileText className="h-3.5 w-3.5" /> Download agreement
                  </a>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[var(--sovereign-hover)] dark:text-white dark:group-hover:text-[#4edea3]">
          {deal.property?.title ?? 'Untitled listing'}
        </h3>
        {deal.property?.address ? (
          <span className="mt-0.5 block truncate text-[13px] text-zinc-500 dark:text-zinc-400">
            {deal.property.address}
          </span>
        ) : null}
      </div>

      {counterparty ? (
        <div className="flex items-center justify-between gap-2 rounded bg-zinc-50 p-2 dark:bg-zinc-800/60">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              {initials(counterparty.fullName)}
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-zinc-900 dark:text-white">
                {counterparty.fullName}
              </span>
              <span className="block truncate text-[10px] text-zinc-500">
                {deal.tenant ? 'Tenant / Buyer' : 'Landlord / Vendor'}
              </span>
            </div>
          </div>
          {deal.headTenantVerified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
            {deal.type === 'sale' ? 'Transaction Price' : 'Annual Value'}
          </span>
          <span className="font-mono-numeric text-base font-bold text-zinc-900 dark:text-white">
            {formatNairaCompact(consideration)}
            {deal.type !== 'sale' ? (
              <span className="text-[11px] font-normal text-zinc-500">/yr</span>
            ) : null}
          </span>
        </div>
        {deal.cautionDeposit > 0 ? (
          <div className="text-right">
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Caution</span>
            <span className="font-mono-numeric text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              {formatNairaValue(deal.cautionDeposit)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
          {status.label}
        </ToneBadge>
        <ToneBadge className={type.className}>{type.label}</ToneBadge>
        {stage === 'agreements' && deal.stampDutyAmount ? (
          <ToneBadge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Receipt className="h-3 w-3" /> Stamp duty
          </ToneBadge>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2 text-[11px] text-zinc-500 dark:border-white/[0.08] dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
          {age !== null ? `${age}d in stage` : formatRelative(deal.createdAt)}
        </span>
        {deal.landlord ? (
          <span className="max-w-[120px] truncate" title={`Landlord: ${deal.landlord.fullName}`}>
            Landlord: {deal.landlord.fullName.split(' ')[0]}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/dashboard/agent/deals/${deal.id}`}
          className="flex-1 rounded bg-zinc-100 py-1.5 text-center text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        >
          Open Deal
        </Link>
        {deal.pdfUrl ? (
          <a
            href={deal.pdfUrl}
            target="_blank"
            rel="noreferrer"
            title="Preview agreement"
            className="rounded bg-zinc-100 px-2 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Eye className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

function LedgerView({
  deals,
  total,
  emptyAll,
}: {
  deals: DealRecord[];
  total: number;
  emptyAll: boolean;
}) {
  if (emptyAll) {
    return (
      <AgentCard>
        <AgentEmptyState
          icon={<Table2 className="h-12 w-12" />}
          title="No ledger records"
          description="Your agent-scoped agreements will be listed here with their compliance and escrow flags."
        />
      </AgentCard>
    );
  }

  return (
    <AgentTableWrap>
      <AgentCardHeader
        title="Transaction Ledger &amp; Legal Audit View"
        subtitle={`Displaying ${deals.length} of ${total} mandated records with compliance signatures and escrow clearance flags.`}
        icon={<Table2 className="h-5 w-5" />}
      />
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
          <tr>
            <AgentTh>Deal ID &amp; Property</AgentTh>
            <AgentTh>Client / Counterparty</AgentTh>
            <AgentTh>Deal Type</AgentTh>
            <AgentTh className="text-right">Value (₦)</AgentTh>
            <AgentTh className="text-right">Caution / EOI</AgentTh>
            <AgentTh>Stage</AgentTh>
            <AgentTh>Statutory &amp; Escrow</AgentTh>
            <AgentTh className="text-right">Actions</AgentTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
          {deals.map((deal) => {
            const status = statusMeta(deal.status);
            const type = typeMeta(deal.type);
            const stage = stageMeta(deal.stage);
            return (
              <tr
                key={deal.id}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <AgentTd>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {deal.property?.title ?? 'Untitled listing'}
                    </span>
                    <span className="font-mono-numeric text-xs text-zinc-500">
                      {deal.reference}
                      {deal.property?.area ? ` · ${deal.property.area}` : ''}
                    </span>
                  </div>
                </AgentTd>
                <AgentTd>
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {deal.tenant?.fullName ?? deal.landlord?.fullName ?? '—'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {deal.tenant ? 'Tenant / Buyer' : 'Landlord / Vendor'}
                    </span>
                  </div>
                </AgentTd>
                <AgentTd>
                  <ToneBadge className={type.className}>{type.label}</ToneBadge>
                </AgentTd>
                <AgentTd className="text-right font-mono-numeric font-bold">
                  {formatNairaValue(considerationOf(deal))}
                  {deal.type !== 'sale' ? (
                    <span className="text-[11px] font-normal text-zinc-500">/yr</span>
                  ) : null}
                </AgentTd>
                <AgentTd className="text-right font-mono-numeric text-zinc-600 dark:text-zinc-400">
                  {deal.cautionDeposit > 0 ? formatNairaValue(deal.cautionDeposit) : '—'}
                </AgentTd>
                <AgentTd>
                  <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                    {stage.shortTitle}
                  </ToneBadge>
                </AgentTd>
                <AgentTd>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                    {deal.headTenantVerified ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Counterparty verified
                      </>
                    ) : deal.stampDutyCertificateUrl ? (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5" /> Stamp duty certified
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> {status.label}
                      </>
                    )}
                  </span>
                </AgentTd>
                <AgentTd className="text-right">
                  <Link
                    href={`/dashboard/agent/deals/${deal.id}`}
                    className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
                  >
                    Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </AgentTd>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AgentTableWrap>
  );
}
