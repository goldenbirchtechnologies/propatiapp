/**
 * Shared Stitch design-language helpers for the agent dashboard screens.
 *
 * Token mapping (Stitch -> Tailwind, light/dark bichrome):
 *   surface                -> bg-zinc-50        dark:bg-zinc-950
 *   surface-container-lowest-> bg-white         dark:bg-zinc-900
 *   surface-container-low  -> bg-zinc-50        dark:bg-zinc-800/50
 *   surface-container      -> bg-zinc-100       dark:bg-zinc-800
 *   surface-container-high -> bg-zinc-200       dark:bg-zinc-700/60
 *   surface-container-highest->bg-zinc-300      dark:bg-zinc-700
 *   outline-variant        -> border-zinc-200   dark:border-white/[0.08]
 *   primary                -> [var(--sovereign-hover)]       dark:primary
 *   primary-container      -> primary       dark:[#4edea3]
 *   on-primary-container   -> primary       dark:primary
 *   secondary-container    -> emerald-200       dark:primary/20
 *   tertiary               -> red-700          dark:red-500
 *   tertiary-container     -> red-100          dark:red-500/20
 *   error                  -> red-700          dark:red-400
 *   on-surface             -> text-zinc-900    dark:text-white
 *   on-surface-variant     -> text-zinc-600    dark:text-zinc-400
 */

export const CARD =
  'rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-white/[0.08]';

export const CARD_SOFT =
  'rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08]';

export const INSET =
  'rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08]';

export const LABEL_SM =
  'text-[11px] uppercase tracking-[0.04em] font-semibold';

export const TITLE_MD =
  'text-[16px] leading-6 font-semibold tracking-[-0.005em]';

export const TITLE_SM =
  'text-[14px] leading-5 font-semibold';

export const HEADLINE_SM =
  'text-[20px] leading-7 font-semibold tracking-[-0.01em]';

export const HEADLINE_MD =
  'text-[24px] leading-8 font-semibold tracking-[-0.015em]';

export const HEADLINE_LG =
  'text-[32px] leading-10 font-bold tracking-[-0.02em]';

export const BODY_SM = 'text-[12px] leading-4';

export const MONO_NUMERIC =
  'font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[14px] leading-5 font-medium tabular-nums';

export const MUTED = 'text-zinc-600 dark:text-zinc-400';

export const OUTLINE = 'text-zinc-500 dark:text-zinc-500';

export const PRIMARY_TEXT = 'text-[var(--sovereign-hover)] dark:text-[#4edea3]';

export const PRIMARY_BG = 'bg-[var(--sovereign-hover)] dark:bg-primary';

export const PRIMARY_CONTAINER_BG = 'bg-primary dark:bg-[#4edea3]';

export const PRIMARY_CONTAINER_TEXT = 'text-primary dark:text-primary';

export const SECONDARY_CONTAINER_BG = 'bg-primary/60 dark:bg-primary/20';

export const SECONDARY_CONTAINER_TEXT = 'text-[var(--sovereign-hover)] dark:text-[#6ffbbe]';

export const TERTIARY_BG = 'bg-red-100 dark:bg-red-500/20';

export const TERTIARY_TEXT = 'text-red-700 dark:text-red-400';

export const ON_SURFACE = 'text-zinc-900 dark:text-white';

export const DIVIDER = 'border-zinc-200 dark:border-white/[0.08]';

/** Format a naira amount with no decimals. */
export function naira(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return `₦${(Number.isFinite(n) ? n : 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Compact naira amount for dense tiles (1.2B / 485.2M / 14.9M). */
export function nairaCompact(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n === 0) return '₦0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return naira(n);
}

export function humanise(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Relative time from an ISO timestamp, e.g. "2 hours ago". */
export function timeAgo(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const then = typeof iso === 'string' ? new Date(iso) : iso;
  const diff = Date.now() - then.getTime();
  if (Number.isNaN(diff)) return '—';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) === 1 ? '' : 's'} ago`;
}

/** Format a date as "12 Mar 2026". */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a time as "11:30 AM". */
export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Map a listing status to the Stitch status pill palette. */
export function listingStatusPill(status: string): {
  label: string;
  className: string;
  dot: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className:
          'bg-primary/60 dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]',
        dot: 'bg-[var(--sovereign-hover)] dark:bg-[#4edea3]',
      };
    case 'draft':
      return {
        label: 'Under Review',
        className: 'bg-zinc-200 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
    case 'suspended':
      return {
        label: 'Suspended',
        className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        dot: 'bg-red-700 dark:bg-red-400',
      };
    case 'deleted':
      return {
        label: 'Deleted',
        className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
        dot: 'bg-zinc-400 dark:bg-zinc-600',
      };
    default:
      return {
        label: humanise(status),
        className: 'bg-zinc-200 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
  }
}

/** Map an agreement status to the Stitch status pill palette. */
export function agreementStatusPill(status: string): {
  label: string;
  className: string;
  dot: string;
} {
  switch (status) {
    case 'fully_signed':
      return {
        label: 'Active / Signed',
        className:
          'bg-primary/60 dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]',
        dot: 'bg-[var(--sovereign-hover)] dark:bg-[#4edea3]',
      };
    case 'landlord_signed':
    case 'tenant_signed':
      return {
        label: 'Awaiting Escrow',
        className:
          'bg-primary/60 dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]',
        dot: 'bg-[var(--sovereign-hover)] dark:bg-[#4edea3]',
      };
    case 'pending_landlord':
    case 'pending_tenant':
      return {
        label: 'Under Review',
        className: 'bg-zinc-200 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
    case 'draft':
      return {
        label: 'Draft Protocol',
        className: 'bg-zinc-200 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
    case 'terminated':
      return {
        label: 'Terminated',
        className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        dot: 'bg-red-700 dark:bg-red-400',
      };
    case 'expired':
      return {
        label: 'Expired',
        className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        dot: 'bg-red-700 dark:bg-red-400',
      };
    default:
      return {
        label: humanise(status),
        className: 'bg-zinc-200 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
      };
  }
}

/** Verification tier label + tone. */
export function verificationTierPill(tier: string): {
  label: string;
  className: string;
  icon: 'verified' | 'shield';
} {
  switch (tier) {
    case 'certified':
      return {
        label: 'Tier 4 · Certified',
        className:
          'bg-primary/60 dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]',
        icon: 'verified',
      };
    case 'inspected':
      return {
        label: 'Tier 3 · Inspected',
        className:
          'bg-primary/60 dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]',
        icon: 'verified',
      };
    case 'verified':
      return {
        label: 'Tier 2 · Verified',
        className:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
        icon: 'verified',
      };
    default:
      return {
        label: 'Tier 1 · Basic',
        className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
        icon: 'shield',
      };
  }
}

/** Percentage helper that guards divide-by-zero. */
export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

/** Initials for an avatar fallback. */
export function initials(name: string | null | undefined): string {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
