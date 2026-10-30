'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  FileDown,
  Printer,
  Wallet,
  BadgeCheck,
  Info,
  CheckSquare,
  Receipt,
  Scale,
  LayoutDashboard,
  History,
  Zap,
  FolderOpen,
  Building2,
  Calendar,
  FileSignature,
  MessageSquare,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Lock,
  Key,
  Percent,
  Home,
  Landmark,
  Download,
  FileText,
  Inbox,
  CircleDollarSign,
  Handshake,
} from 'lucide-react';
import {
  AgentCard,
  AgentCardHeader,
  AgentEmptyState,
  AgentStatCard,
  ToneBadge,
} from '../../_lib/agent-ui';
import {
  estimateCommission,
  formatDate,
  formatDateTime,
  formatNairaCompact,
  formatNairaValue,
  formatRelative,
  humanise,
  statusMeta,
  statusPillClass,
  typeMeta,
  type StageId,
} from '../../_lib/agent-deal-format';
import type { DealRecord } from '../../_lib/agent-deal-types';

type DetailDeal = DealRecord & { consideration: number };

type Signature = {
  id: string;
  role: string;
  signedAt: string | null;
  checksum: string | null;
};

type Tab = 'overview' | 'timeline' | 'actions' | 'documents';

/** The five-stage conveyancing stepper. */
const STEPS: { key: StageId; label: string; caption: string }[] = [
  { key: 'enquiries', label: '1. Qualified', caption: 'Mandate verified' },
  { key: 'viewings', label: '2. Inspection', caption: 'Physical verification' },
  { key: 'offers', label: '3. Agreement', caption: 'Terms in drafting' },
  { key: 'agreements', label: '4. Execution', caption: 'Signatures & escrow' },
  { key: 'closed', label: '5. Handover', caption: 'Final closure' },
];

/** Order the pipeline stages run through — used to compute stepper progress. */
const STAGE_ORDER: StageId[] = ['enquiries', 'viewings', 'offers', 'agreements', 'closed'];

export default function AgentDealDetailClient({
  deal,
  signatures,
}: {
  deal: DetailDeal;
  signatures: Signature[];
}) {
  const [tab, setTab] = useState<Tab>('overview');

  const status = statusMeta(deal.status);
  const type = typeMeta(deal.type);
  const stageIndex = Math.max(0, STAGE_ORDER.indexOf(deal.stage));
  const progress = ((stageIndex + 1) / STEPS.length) * 100;

  const consideration = deal.consideration;
  const commission = estimateCommission(consideration);
  const stampDuty = deal.stampDutyAmount ?? 0;
  const escrowTotal = consideration + deal.cautionDeposit;

  const timeline = buildTimeline(deal, signatures);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb + actions ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[13px] text-zinc-600 dark:text-zinc-400"
        >
          <Link
            href="/dashboard/agent/deals"
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--sovereign-hover)] transition-colors hover:text-[var(--sovereign-hover)] dark:text-[#4edea3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deal Pipeline
          </Link>
          <span className="text-zinc-400">•</span>
          <Link
            href="/dashboard/agent/pipeline"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Pipelines &amp; Deals
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="rounded bg-zinc-200 px-2 py-0.5 font-mono-numeric text-[13px] font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-white">
            {deal.reference}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {deal.pdfUrl ? (
            <a
              href={deal.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4 text-zinc-500" />
              Share Dossier
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <FileDown className="h-4 w-4 text-zinc-500" />
            Export Audit PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print dossier"
            className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* ── Hero dossier header ────────────────────────────────────────── */}
      <AgentCard className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-4xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                {status.label}
              </span>
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {type.label}
              </span>
              {deal.cautionDeposit > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-2.5 py-1 font-mono-numeric text-[13px] font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <Wallet className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
                  {formatNairaCompact(deal.cautionDeposit)} caution
                </span>
              ) : null}
              {deal.lockStatus !== 'mutable' ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:bg-zinc-800 dark:text-[#4edea3]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Integrity locked
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {deal.reference}: {deal.property?.title ?? 'Untitled listing'}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {deal.property?.address ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  {deal.property.address}
                </span>
              ) : null}
              <span className="hidden text-zinc-300 sm:inline dark:text-zinc-700">•</span>
              <span className="inline-flex items-center gap-1.5 font-mono-numeric">
                <Clock className="h-4 w-4 text-zinc-500" />
                Updated: {formatDateTime(deal.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 rounded-xl bg-zinc-50 p-4 lg:items-end dark:bg-zinc-800/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Total Deal Value
            </span>
            <span className="font-mono-numeric text-3xl font-bold leading-none tracking-tight text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              {formatNairaValue(consideration)}
            </span>
            <span className="text-xs text-zinc-500">
              {deal.type === 'sale' ? 'Transaction consideration' : 'Annual rent'}
              {deal.rentPeriod ? ` · ${deal.rentPeriod}` : ''}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative space-y-3 pt-4">
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <span>Cadastral Transaction Progress</span>
            <span className="font-mono-numeric text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              Stage {stageIndex + 1} of {STEPS.length} (
              {Math.round((progress / 100) * 100)}% Complete)
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="absolute bottom-0 left-0 top-0 rounded-full bg-primary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 md:grid-cols-5">
            {STEPS.map((step, i) => {
              const done = i < stageIndex;
              const current = i === stageIndex;
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-2 ${current ? 'rounded-lg bg-zinc-50 p-1.5 dark:bg-zinc-800/50' : ''} ${!done && !current ? 'opacity-60' : ''}`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done
                        ? 'bg-primary text-white dark:bg-primary dark:text-zinc-900'
                        : current
                          ? 'bg-primary text-white animate-pulse dark:bg-primary dark:text-zinc-900'
                          : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                    }`}
                  >
                    {done ? (
                      <CheckSquare className="h-3.5 w-3.5" />
                    ) : current ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Key className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-semibold ${
                        current
                          ? 'text-[var(--sovereign-hover)] dark:text-[#4edea3]'
                          : 'text-zinc-900 dark:text-white'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {step.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AgentCard>

      {/* ── Escrow & settlement operations ─────────────────────────────── */}
      <AgentCard className="space-y-5 bg-gradient-to-r from-white via-zinc-50 to-white p-6 shadow-md dark:from-zinc-900 dark:via-zinc-800/60 dark:to-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm dark:text-[#4edea3]">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Escrow &amp; Settlement Operations (Paystack Clearing Hub)
                </h2>
                <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase text-white dark:bg-primary dark:text-zinc-900">
                  Statutory
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                Deal reference{' '}
                <span className="font-mono-numeric font-semibold text-zinc-900 dark:text-white">
                  {deal.reference}
                </span>{' '}
                • Regulated by LASRERA &amp; CBN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
            <div className="text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Escrow Vault Liquidity
              </span>
              <span className="font-mono-numeric text-lg font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {formatNairaValue(escrowTotal)}
              </span>
            </div>
            <BadgeCheck className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary dark:text-[#4edea3]" />
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {deal.cautionDeposit > 0 ? (
              <>
                Funds verified in Paystack escrow. Caution deposit of{' '}
                <strong className="font-mono-numeric text-zinc-900 dark:text-white">
                  {formatNairaValue(deal.cautionDeposit)}
                </strong>{' '}
                is locked pending final counterparty clearance and authorisation of broker
                disbursement under Lagos State Real Estate Regulatory Authority (LASRERA) standard
                escrow guidelines.
              </>
            ) : (
              <>
                No caution deposit is recorded against this matter yet. Escrow funding is
                required before title conveyance and handover can proceed under LASRERA standard
                escrow guidelines.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard/agent/agreements"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] dark:bg-primary dark:text-zinc-900 dark:hover:bg-[#4edea3]"
          >
            <CheckSquare className="h-4 w-4" />
            Manage Execution
          </Link>
          <Link
            href="/dashboard/agent/commission-ledger"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <CircleDollarSign className="h-5 w-5 text-primary dark:text-[#4edea3]" />
            Release Commission (
            <strong className="font-mono-numeric font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              {formatNairaValue(commission)}
            </strong>
            )
          </Link>
          <Link
            href="/dashboard/agent/payments"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <Receipt className="h-5 w-5 text-zinc-500" />
            Confirm Payment Sent / Received
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/agent/messages"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3.5 py-2.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-500/20 dark:text-red-400"
            >
              <Scale className="h-4 w-4" />
              File Dispute
            </Link>
            <span className="hidden text-[11px] text-zinc-500 xl:inline">
              Arbitration Protocol 24H SLA
            </span>
          </div>
        </div>
      </AgentCard>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-100 p-1.5 shadow-inner dark:bg-zinc-800/60">
        {(
          [
            { key: 'overview', label: 'Overview', icon: LayoutDashboard },
            { key: 'timeline', label: 'Timeline', icon: History, badge: timeline.length },
            { key: 'actions', label: 'Quick Actions', icon: Zap },
            {
              key: 'documents',
              label: 'Documents',
              icon: FolderOpen,
              badge: [deal.pdfUrl, deal.stampDutyCertificateUrl].filter(Boolean).length,
            },
          ] as { key: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[]
        ).map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-all sm:flex-none ${
                active
                  ? 'bg-white text-[var(--sovereign-hover)] shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 font-mono-numeric text-[11px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────── */}
      {tab === 'overview' ? (
        <OverviewTab deal={deal} consideration={consideration} commission={commission} stampDuty={stampDuty} />
      ) : null}
      {tab === 'timeline' ? <TimelineTab deal={deal} entries={timeline} /> : null}
      {tab === 'actions' ? <ActionsTab deal={deal} /> : null}
      {tab === 'documents' ? <DocumentsTab deal={deal} /> : null}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({
  deal,
  consideration,
  commission,
  stampDuty,
}: {
  deal: DetailDeal;
  consideration: number;
  commission: number;
  stampDuty: number;
}) {
  const legalFee = Math.round(consideration * 0.05);
  const agencyFee = Math.round(consideration * 0.05);

  return (
    <div className="space-y-6">
      {/* Quick action cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          icon={<Building2 className="h-5 w-5" />}
          title="View Listing"
          description="Inspect property specifications, floor plans, and vacant possession schedule."
          href="/dashboard/agent/listings"
          meta={deal.property?.id ?? '—'}
        />
        <ActionCard
          icon={<Calendar className="h-5 w-5" />}
          title="Schedule Inspection"
          description="Book cadastral re-verification or move-in inventory check with an authorised surveyor."
          href="/dashboard/agent/inspections/new"
          meta="Book Site Visit"
        />
        <ActionCard
          icon={<FileSignature className="h-5 w-5" />}
          title="Generate Agreement"
          description="Access the signed statutory deed or create a supplementary addendum template."
          href="/dashboard/agent/agreements/new"
          meta="Statutory Deed Portal"
        />
        <ActionCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="Contact Client"
          description="Initiate secure portal communications with the counterparty."
          href="/dashboard/agent/messages"
          meta={deal.tenant?.id ?? deal.landlord?.id ?? '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: transaction parameters */}
        <AgentCard className="space-y-6 p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary dark:text-[#4edea3]" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Transaction Parameters &amp; Counterparties
              </h3>
            </div>
            <span className="rounded bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {deal.jurisdictionState ?? 'Lagos'} registry ·{' '}
              {deal.governingStatute ?? 'Nigerian Tenancy Act'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoTile
              icon={<Home className="h-4 w-4" />}
              label="Registered Property"
              title={deal.property?.title ?? 'Untitled listing'}
              body={
                deal.property?.area
                  ? `${deal.property.area}${deal.property.city ? ` · ${deal.property.city}` : ''}`
                  : deal.property?.address
              }
              tags={[deal.property?.propertyType, deal.property?.listingType].filter(Boolean) as string[]}
            />
            <InfoTile
              icon={<Handshake className="h-4 w-4" />}
              label="Counterparty / Payer"
              title={deal.tenant?.fullName ?? deal.landlord?.fullName ?? 'Unassigned'}
              body={deal.tenant?.email ?? deal.landlord?.email ?? undefined}
              verified={deal.headTenantVerified}
              badge={deal.tenant?.fullName ?? 'KYC'}
            />
            <InfoTile
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Assigned Agent"
              title={deal.agent?.fullName ?? '—'}
              body={deal.agent?.email ?? undefined}
              tags={['Licensed Agent', deal.riskTier ?? 'review_required']}
            />
            <InfoTile
              icon={<Wallet className="h-4 w-4" />}
              label="Caution &amp; Commission Split"
              body={undefined}
              figures={[
                { label: 'Caution Deposit', value: deal.cautionDeposit, note: 'Escrow locked' },
                { label: 'Broker Fee (10%)', value: commission, note: '5% agency + 5% legal' },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Last Secure Activity:{' '}
              <strong className="font-medium text-zinc-900 dark:text-white">
                {formatDateTime(deal.updatedAt)} via Portal Encrypted Messaging
              </strong>
            </span>
            <Link
              href="/dashboard/agent/commission-ledger"
              className="font-semibold text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
            >
              View Audit Trail
            </Link>
          </div>

          {deal.property?.imageUrl ? (
            <div className="relative h-48 overflow-hidden rounded-xl shadow-sm">
              <img
                src={deal.property.imageUrl}
                alt={deal.property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 text-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6ffbbe]">
                  Listing Dossier Preview
                </span>
                <p className="text-sm font-semibold">{deal.property.title}</p>
                <p className="text-xs text-zinc-300">{deal.property.address}</p>
              </div>
            </div>
          ) : null}
        </AgentCard>

        {/* Right: escrow clearing ledger */}
        <AgentCard className="space-y-6 p-6 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary dark:text-[#4edea3]" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Escrow Clearing Ledger
              </h3>
            </div>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono-numeric text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
              {deal.stampDutyStatus ? `Stamp duty: ${humanise(deal.stampDutyStatus)}` : 'Paystack Verified'}
            </span>
          </div>

          <div className="space-y-3">
            <LedgerRow
              icon={<Home className="h-4 w-4" />}
              label={`Base Rent${deal.rentPeriod ? ` (${deal.rentPeriod})` : ''}`}
              value={consideration}
            />
            <LedgerRow
              icon={<Lock className="h-4 w-4" />}
              label="Refundable Caution Deposit"
              value={deal.cautionDeposit}
            />
            <LedgerRow
              icon={<Scale className="h-4 w-4" />}
              label="Statutory Legal Documentation (5%)"
              value={legalFee}
            />
            <LedgerRow
              icon={<Handshake className="h-4 w-4" />}
              label="Brokerage &amp; Agency Fee (5%)"
              value={agencyFee}
            />
            {stampDuty > 0 ? (
              <LedgerRow
                icon={<Percent className="h-4 w-4" />}
                label="Lagos State Stamp Duty (0.78%)"
                value={stampDuty}
              />
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Total Consideration Payable</span>
              <span className="font-mono-numeric">NGN Breakdown</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                Total Escrow Vault
              </span>
              <span className="font-mono-numeric text-xl font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {formatNairaValue(escrowTotalValue(consideration, deal.cautionDeposit, stampDuty))}
              </span>
            </div>
            <div className="h-px bg-zinc-200 dark:bg-white/[0.08]" />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Paystack Balance Verified:</span>
              <span className="font-mono-numeric font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {deal.cautionDeposit > 0
                  ? `${formatNairaValue(deal.cautionDeposit)} CLEARED`
                  : 'AWAITING FUNDING'}
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Settlement Bank:</span>
              <span className="font-medium text-zinc-900 dark:text-white">Paystack Escrow</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Agreement Reference:</span>
              <span className="font-mono-numeric text-zinc-900 dark:text-white">{deal.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Lock Status:</span>
              <span className="font-mono-numeric text-zinc-900 dark:text-white">
                {humanise(deal.lockStatus)}
              </span>
            </div>
          </div>

          {deal.pdfUrl ? (
            <a
              href={deal.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <Download className="h-4 w-4" />
              Download Executed Agreement
            </a>
          ) : null}
        </AgentCard>
      </div>
    </div>
  );
}

function escrowTotalValue(consideration: number, caution: number, stampDuty: number) {
  return consideration + caution + stampDuty;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

type TimelineEntry = {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: 'active' | 'complete' | 'muted';
  icon: 'payment' | 'signature' | 'check' | 'flag';
};

function buildTimeline(deal: DetailDeal, signatures: Signature[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  signatures.forEach((sig) => {
    entries.push({
      id: sig.id,
      title: `${humanise(sig.role)} Signature Captured`,
      detail: sig.checksum
        ? `Cryptographic checksum ${sig.checksum.slice(0, 16)}… recorded against the agreement.`
        : 'Signature recorded against the agreement with an audit trail entry.',
      at: sig.signedAt ?? deal.updatedAt,
      tone: 'complete',
      icon: 'signature',
    });
  });

  if (deal.finalizedAt) {
    entries.push({
      id: `final-${deal.id}`,
      title: 'Agreement Finalized',
      detail: 'All required signatures captured and the agreement locked for integrity.',
      at: deal.finalizedAt,
      tone: 'complete',
      icon: 'check',
    });
  }

  if (deal.stampDutyCertificateUrl) {
    entries.push({
      id: `stamp-${deal.id}`,
      title: 'Stamp Duty Certificate Issued',
      detail:
        deal.stampDutyAmount !== null
          ? `Statutory stamp duty of ${formatNairaValue(deal.stampDutyAmount)} remitted and certified.`
          : 'Statutory stamp duty certificate issued.',
      at: deal.updatedAt,
      tone: 'complete',
      icon: 'payment',
    });
  }

  entries.push({
    id: `created-${deal.id}`,
    title: 'Deal File Created',
    detail: `Agreement opened under the ${deal.agent?.fullName ?? 'assigned'} mandate.`,
    at: deal.createdAt,
    tone: 'muted',
    icon: 'flag',
  });

  return entries.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

function TimelineTab({ deal, entries }: { deal: DetailDeal; entries: TimelineEntry[] }) {
  return (
    <AgentCard className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            Audit Trail &amp; Transaction Chronology
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Immutable system event log for {deal.reference}, hashed against the signing and
            payment providers.
          </p>
        </div>
        <span className="self-start rounded-full bg-primary/10 px-3 py-1 font-mono-numeric text-xs font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3] sm:self-auto">
          {entries.length} Events Recorded
        </span>
      </div>

      {entries.length === 0 ? (
        <AgentEmptyState
          icon={<History className="h-10 w-10" />}
          title="No events recorded yet"
          description="Signature, payment and finalization events will appear here as the matter progresses."
        />
      ) : (
        <div className="relative space-y-8 pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-zinc-200 sm:pl-8 before:left-3.5 dark:before:bg-zinc-700">
          {entries.map((entry) => {
            const dot =
              entry.tone === 'active'
                ? 'bg-primary text-white'
                : entry.tone === 'complete'
                  ? 'bg-primary text-white dark:text-zinc-900'
                  : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400';
            const Icon =
              entry.icon === 'payment'
                ? CircleDollarSign
                : entry.icon === 'signature'
                  ? FileSignature
                  : entry.icon === 'check'
                    ? CheckSquare
                    : Info;
            return (
              <div key={entry.id} className="relative space-y-2">
                <div
                  className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm sm:-left-8 ${dot}`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {entry.title}
                  </span>
                  <span className="font-mono-numeric text-xs text-zinc-500">
                    {formatDateTime(entry.at)}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{entry.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </AgentCard>
  );
}

// ─── Quick actions ───────────────────────────────────────────────────────────

function ActionsTab({ deal }: { deal: DetailDeal }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <AgentCard className="space-y-4 p-6">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          Agent Operational Controls
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Perform deal modifications, generate addendums, and log direct interaction records.
        </p>
        <div className="space-y-3 pt-2">
          <ActionRow
            icon={<MessageSquare className="h-5 w-5" />}
            title="Log Interaction Note"
            description="Add offline meeting or verbal agreement memo"
            href="/dashboard/agent/messages"
          />
          <ActionRow
            icon={<FileSignature className="h-5 w-5" />}
            title="Create Lease Addendum"
            description="Draft supplementary clause for parking or renovations"
            href="/dashboard/agent/agreements/new"
          />
          <ActionRow
            icon={<UsersIcon />}
            title="Add Co-Broker or Legal Counsel"
            description="Invite a second agent for a commission split agreement"
            href="/dashboard/agent/invites"
          />
        </div>
      </AgentCard>

      <AgentCard className="space-y-4 p-6">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          Statutory Compliance Tools
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Direct integrations with the Lagos State Lands Bureau and Corporate Affairs
          Commission.
        </p>
        <div className="space-y-3 pt-2">
          <ActionRow
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Run Alausa Title Check"
            description="Re-verify the Lagos State Governor's Consent record"
            href="/dashboard/agent/verifications"
            external
          />
          <ActionRow
            icon={<Receipt className="h-5 w-5" />}
            title="LASRERA Tax Withholding Certificate"
            description="Generate a 5% WHT credit note for Lagos IRS"
            href="/dashboard/agent/statements"
            external
          />
          <ActionRow
            icon={<Scale className="h-5 w-5" />}
            title="Initiate Lease Termination"
            description="Issue statutory notice under the Lagos Tenancy Law"
            href="/dashboard/agent/agreements"
            danger
          />
        </div>
      </AgentCard>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Documents ───────────────────────────────────────────────────────────────

function DocumentsTab({ deal }: { deal: DetailDeal }) {
  const docs: { id: string; name: string; type: string; url: string | null; at: string | null }[] = [
    {
      id: 'agreement',
      name: 'Executed Tenancy Agreement',
      type: 'Agreement PDF',
      url: deal.pdfUrl,
      at: deal.finalizedAt ?? deal.updatedAt,
    },
    {
      id: 'stamp-duty',
      name: 'Stamp Duty Certificate',
      type: 'Statutory Certificate',
      url: deal.stampDutyCertificateUrl,
      at: deal.updatedAt,
    },
  ];

  const available = docs.filter((d) => d.url);

  return (
    <AgentCard className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Statutory Document Depository
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Authenticated and tamper-proof legal deeds, KYC records, and clearing receipts.
          </p>
        </div>
        <span className="self-start rounded-full bg-primary/10 px-3 py-1 font-mono-numeric text-xs font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3] sm:self-auto">
          {available.length} Document{available.length === 1 ? '' : 's'} Available
        </span>
      </div>

      {available.length === 0 ? (
        <AgentEmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No documents uploaded yet"
          description="The executed agreement PDF and the statutory stamp duty certificate will appear here once issued."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Type
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Issued
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {available.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      {doc.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400">{doc.type}</td>
                  <td className="px-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(doc.at)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={doc.url!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AgentCard>
  );
}

// ─── Shared small components ─────────────────────────────────────────────────

function InfoTile({
  icon,
  label,
  title,
  body,
  tags,
  verified,
  badge,
  figures,
}: {
  icon: React.ReactNode;
  label: string;
  title?: string;
  body?: string | null;
  tags?: string[];
  verified?: boolean;
  badge?: string;
  figures?: { label: string; value: number; note: string }[];
}) {
  return (
    <div className="space-y-2 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
      <div className="flex items-center gap-2 text-[11px] uppercase text-zinc-600 dark:text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      {title ? (
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h4>
            {verified ? (
              <BadgeCheck className="h-4 w-4 text-primary dark:text-[#4edea3]" />
            ) : null}
          </div>
          {body ? (
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{body}</p>
          ) : null}
        </div>
      ) : null}
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold capitalize text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {humanise(tag)}
            </span>
          ))}
        </div>
      ) : null}
      {badge ? (
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <span className="truncate font-mono-numeric text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            {badge}
          </span>
          <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            Verified
          </span>
        </div>
      ) : null}
      {figures ? (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {figures.map((f) => (
            <div key={f.label}>
              <span className="block text-[10px] uppercase text-zinc-600 dark:text-zinc-400">
                {f.label}
              </span>
              <span className="font-mono-numeric text-sm font-bold text-zinc-900 dark:text-white">
                {formatNairaValue(f.value)}
              </span>
              <span className="mt-0.5 block text-[10px] text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                {f.note}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LedgerRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="truncate font-medium text-zinc-900 dark:text-white">{label}</span>
      </div>
      <span className="shrink-0 font-mono-numeric font-semibold text-zinc-900 dark:text-white">
        {formatNairaValue(value)}
      </span>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900"
    >
      <div className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-zinc-800 dark:text-[#4edea3]">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
      <span className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-[13px] font-semibold text-[var(--sovereign-hover)] transition-transform group-hover:translate-x-1 dark:border-white/[0.08] dark:text-[#4edea3]">
        <span className="truncate">{meta}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </span>
    </Link>
  );
}

function ActionRow({
  icon,
  title,
  description,
  href,
  external,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-between gap-3 rounded-lg bg-zinc-50 p-3.5 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={danger ? 'text-red-500' : 'text-primary dark:text-[#4edea3]'}>
          {icon}
        </span>
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </span>
          <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
        </div>
      </div>
      <span className="shrink-0 text-zinc-500">
        {external ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </span>
    </Link>
  );
}
