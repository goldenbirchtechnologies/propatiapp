'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  NotebookPen,
  Plus,
  BadgeCheck,
  Mail,
  Phone,
  Copy,
  MapPin,
  Building2,
  History,
  FolderOpen,
  ArrowRight,
  Wallet,
  Lock,
  Scale,
  ChevronRight,
  CheckCircle2,
  Inbox,
  ShieldCheck,
  ExternalLink,
  FileText,
} from 'lucide-react';
import {
  AgentCard,
  AgentCardHeader,
  AgentEmptyState,
  AgentStatCard,
  AgentTableWrap,
  AgentTd,
  AgentTh,
  ToneBadge,
} from '../../_lib/agent-ui';
import {
  formatDate,
  formatDateShort,
  formatNairaCompact,
  formatNairaValue,
  humanise,
  initials,
  statusMeta,
  statusPillClass,
  typeMeta,
  type StageId,
} from '../../_lib/agent-deal-format';

type ClientDeal = {
  id: string;
  reference: string;
  type: string;
  status: string;
  stage: StageId;
  propertyTitle: string;
  propertyAddress: string;
  propertyArea: string | null;
  consideration: number;
  cautionDeposit: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type ClientAsset = {
  id: string;
  title: string;
  address: string;
  area: string | null;
  value: number;
  status: string;
  stage: StageId;
};

type ClientProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  type: string;
  bio: string | null;
  ninVerified: boolean;
  bvnVerified: boolean;
  phoneVerified: boolean;
  clientSince: string;
  lastContact: string;
};

type LedgerFilter = 'all' | 'active' | 'completed';

export default function AgentClientDetailClient({
  client,
  deals,
  assets,
  metrics,
}: {
  client: ClientProfile;
  deals: ClientDeal[];
  assets: ClientAsset[];
  metrics: {
    totalDeals: number;
    activeDeals: number;
    closedDeals: number;
    transactedValue: number;
    pendingEscrow: number;
  };
}) {
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>('all');
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const verified = client.ninVerified || client.bvnVerified;

  const filteredDeals = deals.filter((d) => {
    if (ledgerFilter === 'all') return true;
    if (ledgerFilter === 'active') {
      return !['fully_signed', 'expired', 'terminated'].includes(d.status);
    }
    return ['fully_signed', 'expired', 'terminated'].includes(d.status);
  });

  const saveNote = () => {
    // Notes are held locally — there is no client-note persistence endpoint yet.
    setNoteSaved(true);
    setNote('');
    setNoteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Sub-bar + breadcrumb ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px] text-zinc-600 dark:text-zinc-400"
        >
          <Link
            href="/dashboard/agent"
            className="transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            Sales &amp; CRM
          </Link>
          <span className="text-zinc-400">/</span>
          <Link
            href="/dashboard/agent/clients"
            className="transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            Clients
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="max-w-xs truncate font-mono-numeric font-semibold text-emerald-700 dark:text-emerald-400 md:max-w-md">
            {client.id.toUpperCase()} · {client.name}
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/agent/clients"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2.5 py-1 font-mono-numeric text-[13px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {metrics.activeDeals > 0 ? 'Active Mandate File' : 'Dormant Mandate File'}
          </span>
        </div>
      </div>

      {/* ── Client header card ─────────────────────────────────────────── */}
      <AgentCard className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold tracking-tight text-white shadow-md dark:text-zinc-900">
                {client.avatarUrl ? (
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  initials(client.name)
                )}
              </div>
              {verified ? (
                <span
                  title="KYC verified entity"
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm dark:bg-zinc-900"
                >
                  <BadgeCheck className="h-4 w-4" />
                </span>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {client.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-600/10 px-2 py-0.5 font-mono-numeric text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  {verified ? 'CAC Verified' : 'Verification pending'}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {humanise(client.role)}
                </span>
                {' · '}
                {client.type}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 font-semibold uppercase tracking-wider text-zinc-900 dark:bg-zinc-800 dark:text-white">
                  {client.type} Relationship
                </span>
                <span className="inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  Client since {formatDate(client.clientSince)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <Scale className="h-3.5 w-3.5" />
                  {verified
                    ? 'KYC · NDPR & NFIU status on file'
                    : 'Identity verification outstanding'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap shrink-0 items-center gap-2">
            <Link
              href={`/dashboard/agent/messages?recipientId=${client.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Link>
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <NotebookPen className="h-4 w-4" />
              Add Note
            </button>
            <Link
              href={`/dashboard/agent/agreements/new?clientId=${client.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              + New Agreement
            </Link>
          </div>
        </div>

        {noteSaved ? (
          <p className="relative mt-4 rounded-lg bg-emerald-600/10 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Note recorded against this client file.
          </p>
        ) : null}

        {noteOpen ? (
          <div className="relative mt-4 rounded-xl bg-zinc-50 p-4 shadow-md dark:bg-zinc-800/60">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                <NotebookPen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Record Institutional Memorandum / Executive Note
              </span>
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                aria-label="Close note editor"
                className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                ×
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter sensitive deal notes, board approvals, or escrow compliance directives…"
              className="h-20 w-full resize-none rounded-lg bg-white p-2.5 text-xs text-zinc-900 outline-none ring-1 ring-zinc-200 placeholder:text-zinc-500 focus:ring-emerald-600 dark:bg-zinc-900 dark:text-white dark:ring-white/[0.08]"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                className="rounded-lg px-3 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                disabled={!note.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-zinc-900"
              >
                Save to Client Ledger
              </button>
            </div>
          </div>
        ) : null}
      </AgentCard>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* LEFT: contact, bio, audit trail */}
        <div className="space-y-6 xl:col-span-4">
          <AgentCard className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Entity &amp; Contact Record
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-600/10 px-2 py-0.5 font-mono-numeric text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                {verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
                  <span>Official Contact Desk</span>
                  <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {client.phoneVerified ? 'Phone verified' : 'Email on file'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 font-mono-numeric text-zinc-900 dark:text-white">
                    <Mail className="h-4 w-4 shrink-0 text-zinc-500" />
                    <span className="truncate">{client.email}</span>
                  </span>
                  <button
                    type="button"
                    title="Copy email"
                    onClick={() => navigator.clipboard?.writeText(client.email)}
                    className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {client.phone ? (
                <div className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                    Direct Telephone
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 font-mono-numeric text-zinc-900 dark:text-white">
                      <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
                      <span className="truncate">{client.phone}</span>
                    </span>
                    <a
                      href={`tel:${client.phone}`}
                      className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Identity Verification
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    <BadgeCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    NIN {client.ninVerified ? 'Verified' : 'Pending'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    <BadgeCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    BVN {client.bvnVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                    Client Since
                  </span>
                  <span className="font-mono-numeric text-zinc-900 dark:text-white">
                    {formatDate(client.clientSince)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Lagos, NG
                </span>
              </div>
            </div>
          </AgentCard>

          <AgentCard className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Mandate Bio &amp; Appetite
              </span>
              <span className="font-mono-numeric text-[11px] font-semibold text-zinc-500">
                PROFILE_BIO
              </span>
            </div>
            {client.bio ? (
              <blockquote className="relative rounded-lg bg-zinc-50 p-3 text-[13px] italic leading-relaxed text-zinc-900 dark:bg-zinc-800/60 dark:text-white">
                “{client.bio}”
              </blockquote>
            ) : (
              <p className="rounded-lg bg-zinc-50 p-3 text-[13px] text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                No mandate biography has been recorded for this client yet.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="flex flex-col rounded bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <span className="text-[11px] uppercase text-zinc-500">Relationship</span>
                <span className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                  {client.type}
                </span>
              </div>
              <div className="flex flex-col rounded bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <span className="text-[11px] uppercase text-zinc-500">Platform Role</span>
                <span className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                  {humanise(client.role)}
                </span>
              </div>
              <div className="flex flex-col rounded bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <span className="text-[11px] uppercase text-zinc-500">Open Matters</span>
                <span className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
                  {metrics.activeDeals}
                </span>
              </div>
              <div className="flex flex-col rounded bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <span className="text-[11px] uppercase text-zinc-500">Ticket Size</span>
                <span className="mt-0.5 font-mono-numeric font-semibold text-zinc-900 dark:text-white">
                  {metrics.transactedValue > 0
                    ? formatNairaCompact(metrics.transactedValue)
                    : '—'}
                </span>
              </div>
            </div>
          </AgentCard>

          <AgentCard className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Audit Trail &amp; Activity
              </span>
              <span className="text-[11px] uppercase text-zinc-500">Real-time Log</span>
            </div>
            {deals.length === 0 ? (
              <p className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                No activity recorded against this client file yet.
              </p>
            ) : (
              <div className="relative space-y-3 pl-2">
                {deals.slice(0, 5).map((d, i) => (
                  <div key={d.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        i === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-semibold leading-snug text-zinc-900 dark:text-white">
                        {statusMeta(d.status).label} — {d.propertyTitle}
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {typeMeta(d.type).label} · {formatNairaValue(d.consideration)}
                      </span>
                      <span className="mt-0.5 font-mono-numeric text-[11px] text-zinc-500">
                        {formatDate(d.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AgentCard>
        </div>

        {/* RIGHT: metrics, ledgers, assets */}
        <div className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <AgentStatCard
              label="Total Deals"
              value={`${metrics.totalDeals} Files`}
              icon={<FolderOpen className="h-5 w-5" />}
              sublabel={
                <span className="mt-0.5">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {metrics.activeDeals} Active
                  </span>{' '}
                  · {metrics.closedDeals} Executed
                </span>
              }
            />
            <AgentStatCard
              label="Transacted Value"
              value={formatNairaCompact(metrics.transactedValue)}
              icon={<Wallet className="h-5 w-5" />}
              accent="neutral"
              sublabel={
                <span className="mt-0.5 block text-zinc-500">Cumulative NGN Flow</span>
              }
            />
            <AgentStatCard
              label="Pending Escrow"
              value={formatNairaCompact(metrics.pendingEscrow)}
              icon={<Lock className="h-5 w-5" />}
              accent="amber"
              sublabel={
                <span className="mt-0.5 block font-medium text-emerald-700 dark:text-emerald-400">
                  Paystack Escrow Locked
                </span>
              }
            />
            <AgentStatCard
              label="Active Mandate"
              value={client.type}
              icon={<ShieldCheck className="h-5 w-5" />}
              accent="neutral"
              sublabel={
                <span className="mt-0.5 block font-medium text-emerald-700 dark:text-emerald-400">
                  Institutional Representation
                </span>
              }
            />
          </div>

          {/* Related agreements ledger */}
          <AgentTableWrap>
            <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Related Agreements &amp; Transaction Ledgers
                </h2>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono-numeric text-xs font-semibold text-white dark:bg-emerald-500 dark:text-zinc-900">
                  {deals.length} Records
                </span>
              </div>
              <div className="inline-flex w-fit rounded-lg bg-zinc-200 p-1 text-[13px] dark:bg-zinc-700">
                {(
                  [
                    { key: 'all', label: `All (${deals.length})` },
                    { key: 'active', label: `Active (${metrics.activeDeals})` },
                    { key: 'completed', label: `Conveyed (${metrics.closedDeals})` },
                  ] as { key: LedgerFilter; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setLedgerFilter(tab.key)}
                    className={`rounded-md px-3 py-1 font-medium transition-all ${
                      ledgerFilter === tab.key
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {deals.length === 0 ? (
              <AgentEmptyState
                icon={<Inbox className="h-12 w-12" />}
                title="No agreements on this client file"
                description="Draft a new agreement for this client to start a mandate."
                action={
                  <Link
                    href={`/dashboard/agent/agreements/new?clientId=${client.id}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-900"
                  >
                    <Plus className="h-4 w-4" />
                    + New Agreement
                  </Link>
                }
              />
            ) : filteredDeals.length === 0 ? (
              <AgentEmptyState
                icon={<Inbox className="h-10 w-10" />}
                title="No records in this view"
                description="Switch tabs to see other ledgers for this client."
              />
            ) : (
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
                  <tr>
                    <AgentTh>Agreement ID &amp; Property</AgentTh>
                    <AgentTh>Tenure / Structure</AgentTh>
                    <AgentTh>Status</AgentTh>
                    <AgentTh className="text-right">Contract Value</AgentTh>
                    <AgentTh>Created Date</AgentTh>
                    <AgentTh className="text-right">Action</AgentTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {filteredDeals.map((d) => {
                    const status = statusMeta(d.status);
                    return (
                      <tr
                        key={d.id}
                        className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      >
                        <AgentTd>
                          <div className="flex min-w-0 flex-col">
                            <span className="font-mono-numeric text-[11px] font-semibold text-zinc-500">
                              {d.reference}
                            </span>
                            <span className="truncate font-semibold leading-tight text-zinc-900 dark:text-white">
                              {d.propertyTitle}
                            </span>
                            <span className="truncate text-zinc-500">{d.propertyAddress}</span>
                          </div>
                        </AgentTd>
                        <AgentTd>
                          <span className="text-zinc-900 dark:text-white">
                            {typeMeta(d.type).label}
                          </span>
                          <span className="block text-[11px] text-zinc-500">
                            {d.propertyArea ?? '—'}
                          </span>
                        </AgentTd>
                        <AgentTd>
                          <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                            {status.label}
                          </ToneBadge>
                        </AgentTd>
                        <AgentTd className="text-right font-mono-numeric font-bold">
                          {formatNairaValue(d.consideration)}
                        </AgentTd>
                        <AgentTd className="font-mono-numeric text-zinc-600 dark:text-zinc-400">
                          {formatDateShort(d.createdAt)}
                        </AgentTd>
                        <AgentTd className="text-right">
                          <Link
                            href={`/dashboard/agent/deals/${d.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 font-semibold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white dark:bg-zinc-800 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-900"
                          >
                            View Deal
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </AgentTd>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {deals.length > 0 ? (
              <div className="flex flex-col items-center justify-between gap-2 bg-zinc-50 px-4 py-3 text-[13px] text-zinc-500 sm:flex-row dark:bg-zinc-800/50">
                <span className="font-mono-numeric text-[12px]">
                  Showing {filteredDeals.length} of {deals.length} transactions
                </span>
                <span className="font-mono-numeric text-[12px] font-semibold text-zinc-900 dark:text-white">
                  Portfolio Aggregate: {formatNairaValue(metrics.transactedValue)}
                </span>
              </div>
            ) : null}
          </AgentTableWrap>

          {/* Featured assets */}
          <AgentCard className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Featured Asset Portfolios Under Inspection
              </span>
              <Link
                href="/dashboard/agent/listings"
                className="inline-flex items-center gap-0.5 text-[13px] font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                View Directory
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {assets.length === 0 ? (
              <p className="rounded-lg bg-zinc-50 p-4 text-center text-[13px] text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                No assets are currently linked to this client&apos;s mandates.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {assets.map((asset) => {
                  const status = statusMeta(asset.status);
                  return (
                    <Link
                      key={asset.id}
                      href={`/dashboard/agent/deals/${asset.id}`}
                      className="flex gap-3 rounded-lg bg-zinc-50 p-3 transition-shadow hover:shadow-md dark:bg-zinc-800/60"
                    >
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <ToneBadge className={statusPillClass(status.tone)} dot={status.dot}>
                            {status.label}
                          </ToneBadge>
                          <h3 className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {asset.title}
                          </h3>
                          <p className="truncate font-mono-numeric text-xs text-zinc-500">
                            {asset.address}
                            {asset.area ? ` · ${asset.area}` : ''}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-mono-numeric text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {formatNairaCompact(asset.value)}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 self-start text-zinc-400" />
                    </Link>
                  );
                })}
              </div>
            )}
          </AgentCard>

          {/* Direct dispatch */}
          <AgentCard className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Direct Executive Dispatch
              </span>
              <span className="font-mono-numeric text-[11px] text-zinc-500">
                Encrypted Channel · NFIU Audited
              </span>
            </div>

            <div className="space-y-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white dark:text-zinc-900">
                    {initials(client.name)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {client.name}
                    </span>
                    <span className="ml-1.5 text-[11px] text-zinc-500">{client.type}</span>
                  </div>
                </div>
                <span className="font-mono-numeric text-[11px] text-zinc-500">
                  Last touch {formatDate(client.lastContact)}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {client.bio
                  ? client.bio
                  : `No executive memorandum has been recorded for ${client.name}. Use the encrypted channel below or the messages console for a logged conversation.`}
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Type direct update to ${client.name}…`}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-[13px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/dashboard/agent/messages"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-4 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Full Thread
                </Link>
                <Link
                  href={`/dashboard/agent/messages?recipientId=${client.id}`}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
                >
                  Reply via Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </AgentCard>
        </div>
      </div>
    </div>
  );
}
