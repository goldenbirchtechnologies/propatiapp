/**
 * Shared formatting + status vocabulary for the agent PIPELINE / BUY / SELL /
 * DEALS / CLIENTS screens.
 *
 * Kept in one place so the pipeline kanban, the deals ledger, the deal dossier
 * and the client directory all agree on how a stage, a status pill and a naira
 * figure are rendered.
 */

import type { AgreementStatus, AgreementType } from '@prisma/client';

// ─── Naira ────────────────────────────────────────────────────────────────────

/** ₦12,500,000 — no decimals, whole-naira grouping. */
export function formatNairaValue(naira: number): string {
  if (!Number.isFinite(naira) || naira === 0) return '₦0';
  return `₦${Math.round(naira).toLocaleString('en-NG')}`;
}

/** ₦12.5M / ₦1.84B — compact form for stat tiles and column headers. */
export function formatNairaCompact(naira: number): string {
  if (!Number.isFinite(naira) || naira === 0) return '₦0';
  const abs = Math.abs(naira);
  if (abs >= 1_000_000_000) return `₦${trimZero(naira / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `₦${trimZero(naira / 1_000_000)}M`;
  if (abs >= 1_000) return `₦${trimZero(naira / 1_000)}K`;
  return formatNairaValue(naira);
}

function trimZero(value: number): string {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
}

// ─── Dates ───────────────────────────────────────────────────────────────────

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

/** Days elapsed since an ISO timestamp — used for stage velocity. */
export function daysSince(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

// ─── Agreement status vocabulary ─────────────────────────────────────────────

export type StatusTone = 'neutral' | 'pending' | 'active' | 'complete' | 'danger';

export type StatusMeta = {
  label: string;
  tone: StatusTone;
  /** Dot colour used in the pill / pipeline headers. */
  dot: string;
};

const STATUS_META: Record<AgreementStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral', dot: 'bg-zinc-400 dark:bg-zinc-500' },
  pending_landlord: { label: 'Pending Landlord', tone: 'pending', dot: 'bg-amber-500' },
  pending_tenant: { label: 'Pending Tenant', tone: 'pending', dot: 'bg-amber-500' },
  tenant_signed: { label: 'Tenant Signed', tone: 'active', dot: 'bg-emerald-600 dark:text-emerald-400' },
  landlord_signed: { label: 'Landlord Signed', tone: 'active', dot: 'bg-emerald-600 dark:text-emerald-400' },
  fully_signed: { label: 'Fully Signed', tone: 'complete', dot: 'bg-emerald-600 dark:text-emerald-400' },
  terminated: { label: 'Terminated', tone: 'danger', dot: 'bg-red-500' },
  expired: { label: 'Expired', tone: 'danger', dot: 'bg-red-500' },
};

/** Statuses that still count as live pipeline matters. */
export const ACTIVE_AGREEMENT_STATUSES: AgreementStatus[] = [
  'draft',
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
];

export function statusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as AgreementStatus] ?? {
      label: humanise(status),
      tone: 'neutral',
      dot: 'bg-zinc-400 dark:bg-zinc-500',
    }
  );
}

/** Tailwind classes for a status pill. */
export function statusPillClass(tone: StatusTone): string {
  switch (tone) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
    case 'active':
      return 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/25';
    case 'complete':
      return 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/25';
    case 'danger':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25';
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]';
  }
}

// ─── Agreement type vocabulary ────────────────────────────────────────────────

export type TypeMeta = {
  label: string;
  /** Badge classes. */
  className: string;
};

const TYPE_META: Record<AgreementType, TypeMeta> = {
  rental: {
    label: 'Residential Lease',
    className:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]',
  },
  sale: {
    label: 'Outright Sale',
    className:
      'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25',
  },
  short_let: {
    label: 'Executive Short-Let',
    className:
      'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
  },
  share: {
    label: 'Share Tenancy',
    className:
      'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25',
  },
};

export function typeMeta(type: string): TypeMeta {
  return (
    TYPE_META[type as AgreementType] ?? {
      label: humanise(type),
      className:
        'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]',
    }
  );
}

// ─── Pipeline stage vocabulary ────────────────────────────────────────────────

export type StageId =
  | 'enquiries'
  | 'viewings'
  | 'offers'
  | 'agreements'
  | 'closed';

export type StageMeta = {
  id: StageId;
  title: string;
  shortTitle: string;
  /** Dot / accent colour for the column header. */
  accent: string;
  description: string;
};

export const PIPELINE_STAGES: StageMeta[] = [
  {
    id: 'enquiries',
    title: '1. Enquiries & Intake',
    shortTitle: 'Enquiries',
    accent: 'bg-zinc-400 dark:bg-zinc-500',
    description: 'New mandates and property enquiries',
  },
  {
    id: 'viewings',
    title: '2. Viewings & Inspection',
    shortTitle: 'Viewings',
    accent: 'bg-amber-500',
    description: 'Scheduled viewings and inspections',
  },
  {
    id: 'offers',
    title: '3. Offers & LOI',
    shortTitle: 'Offers',
    accent: 'bg-emerald-600 dark:text-emerald-400',
    description: 'Offers, LOIs and counter-offers',
  },
  {
    id: 'agreements',
    title: '4. Agreements & Conveyancing',
    shortTitle: 'Agreements',
    accent: 'bg-emerald-400',
    description: 'Execution, escrow and statutory clearance',
  },
  {
    id: 'closed',
    title: '5. Closed & Executed',
    shortTitle: 'Closed',
    accent: 'bg-emerald-600 dark:text-emerald-400',
    description: 'Completed and disbursed matters',
  },
];

export function stageMeta(id: string): StageMeta {
  return (
    PIPELINE_STAGES.find((s) => s.id === id) ?? {
      id: 'enquiries',
      title: id,
      shortTitle: id,
      accent: 'bg-zinc-400',
      description: '',
    }
  );
}

/**
 * Maps an agreement status onto the pipeline stage it currently sits in.
 * `draft` / `pending_*` are still pre-agreement so they land in Offers.
 */
export function stageForStatus(status: string): StageId {
  switch (status) {
    case 'fully_signed':
    case 'active':
      return 'closed';
    case 'tenant_signed':
    case 'landlord_signed':
      return 'agreements';
    case 'draft':
    case 'pending_landlord':
    case 'pending_tenant':
      return 'offers';
    default:
      return 'offers';
  }
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function humanise(value: string): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Nigerian agency commission is 10% by default (5% agency + 5% legal),
 * configurable per mandate. Used only where the schema carries no explicit
 * commission figure.
 */
export const AGENCY_COMMISSION_RATE = 0.1;

export function estimateCommission(consideration: number): number {
  return Math.round(consideration * AGENCY_COMMISSION_RATE);
}
