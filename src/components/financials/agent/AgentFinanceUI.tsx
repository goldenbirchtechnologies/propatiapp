'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared Stitch-fidelity primitives for the agent FINANCE screens.
 *
 * Bichrome rules (every `dark:` class has a light base):
 *   cards        bg-white      dark:bg-zinc-900
 *   insets       bg-zinc-50   dark:bg-zinc-800/50
 *   borders      border-zinc-200  dark:border-white/[0.08]
 *   text         text-zinc-900   dark:text-white
 *   muted        text-zinc-600   dark:text-zinc-400
 *   primary      primary/400
 *   tertiary     amber
 *   error        red
 */

export const AGENT_FINANCE_CARD =
  'rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900';

export const AGENT_FINANCE_INSET =
  'rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50';

export const AGENT_FINANCE_LABEL =
  'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

export const AGENT_FINANCE_MUTED = 'text-zinc-600 dark:text-zinc-400';

export const AGENT_FINANCE_HEADING =
  'text-2xl font-bold tracking-tight text-zinc-900 dark:text-white';

/* ─── Page shell ──────────────────────────────────────────────────────────── */

export function FinancePage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

/* ─── Breadcrumb ──────────────────────────────────────────────────────────── */

export function FinanceBreadcrumb({ items }: { items: string[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-300 dark:text-zinc-700">/</span>}
            <span className={last ? 'text-primary dark:text-[#4edea3]' : undefined}>{item}</span>
          </span>
        );
      })}
    </nav>
  );
}

/* ─── Page header ─────────────────────────────────────────────────────────── */

export function FinanceHeader({
  breadcrumb,
  title,
  description,
  badges,
  actions,
}: {
  breadcrumb: string[];
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <FinanceBreadcrumb items={breadcrumb} />
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <h1 className={AGENT_FINANCE_HEADING}>{title}</h1>
          {badges}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ─── Buttons ─────────────────────────────────────────────────────────────── */

export function FinanceButton({
  children,
  variant = 'outline',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
}) {
  const variants = {
    primary:
      'bg-primary hover:bg-primary text-white border border-primary shadow-sm shadow-primary/20',
    outline:
      'border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]',
    ghost:
      'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white',
    danger:
      'border border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15',
  } as const;
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── KPI card ────────────────────────────────────────────────────────────── */

export function FinanceStatCard({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  footer,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'primary' | 'amber' | 'red' | 'blue' | 'neutral';
  footer?: ReactNode;
  className?: string;
}) {
  const toneClasses = {
    primary: 'bg-primary/10 border-primary/20 text-primary dark:text-[#4edea3]',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    neutral:
      'bg-zinc-100 dark:bg-white/[0.06] border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400',
  } as const;

  const topBar = {
    primary: 'bg-primary',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    neutral: 'bg-zinc-300 dark:bg-zinc-700',
  } as const;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5',
        className,
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1', topBar[tone])} />
      <div className="flex items-start justify-between gap-3">
        <span className={AGENT_FINANCE_LABEL}>{label}</span>
        {icon ? (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
              toneClasses[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
        {value}
      </div>
      {hint ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

/* ─── Progress rail ───────────────────────────────────────────────────────── */

export function FinanceProgress({
  value,
  tone = 'primary',
  className,
}: {
  value: number;
  tone?: 'primary' | 'amber' | 'red';
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = {
    primary: 'bg-primary',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  } as const;
  return (
    <div
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800',
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('h-full rounded-full transition-all', fill[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/* ─── Status pill ─────────────────────────────────────────────────────────── */

export type FinanceStatusTone = 'success' | 'pending' | 'escrow' | 'error' | 'neutral';

export function FinanceStatus({
  tone,
  children,
  className,
}: {
  tone: FinanceStatusTone;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    success: 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] border-primary/20',
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    escrow: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    neutral:
      'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── Filter shell ────────────────────────────────────────────────────────── */

export function FinanceFilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FinanceSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-[220px] flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

export function FinanceSelect({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        'h-10 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 px-3 pr-8 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ─── Segmented tabs ──────────────────────────────────────────────────────── */

export function FinanceTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: Array<{ value: string; label: string; count?: number }>;
  active: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 p-1',
        className,
      )}
      role="tablist"
    >
      {tabs.map((t) => {
        const selected = t.value === active;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selected
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-white',
            )}
          >
            {t.label}
            {typeof t.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                  selected
                    ? 'bg-primary/10 text-primary dark:text-[#4edea3]'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400',
                )}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Table shell ─────────────────────────────────────────────────────────── */

export function FinanceTableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FinanceTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      <tr className="border-b border-zinc-200 dark:border-white/[0.08]">{children}</tr>
    </thead>
  );
}

export function FinanceTh({
  children,
  align = 'left',
  className,
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 font-semibold whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function FinanceTd({
  children,
  align = 'left',
  className,
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 align-middle',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function FinanceTableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-white/[0.06] hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
      {children}
    </tr>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */

export function FinanceEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-white/[0.12] bg-zinc-50 dark:bg-zinc-800/30 px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ─── Compliance banner ───────────────────────────────────────────────────── */

export function FinanceComplianceBanner({
  icon,
  title,
  body,
  meta,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary dark:text-[#4edea3]">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
          {body ? (
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
          ) : null}
          {meta ? <div className="mt-2">{meta}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────────────── */

export function FinancePagination({
  page,
  pageCount,
  onPage,
  summary,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  summary: string;
}) {
  if (pageCount <= 1) {
    return (
      <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 sm:flex-row">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{summary}</p>
      </div>
    );
  }

  const pages: Array<number | '…'> = [];
  for (let p = 1; p <= pageCount; p += 1) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 sm:flex-row">
      <p className="text-xs text-zinc-600 dark:text-zinc-400">{summary}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-zinc-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={
                p === page
                  ? 'rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white'
                  : 'rounded-md px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/[0.06]'
              }
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ─── Misc helpers ────────────────────────────────────────────────────────── */

/** Formats a naira amount with 2dp, e.g. ₦1,234.50 */
export function naira(value: number): string {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formats a naira amount with no decimals, e.g. ₦1,235 */
export function nairaShort(value: number): string {
  return `₦${Math.round(value).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

/** Formats a naira amount into a compact string, e.g. ₦1.2M */
export function nairaCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `₦${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `₦${(value / 1_000).toFixed(1)}K`;
  return nairaShort(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function initialsOf(name?: string | null): string {
  if (!name) return '—';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '—'
  );
}
