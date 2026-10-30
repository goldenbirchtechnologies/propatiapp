import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared presentational primitives for the agent Operations desk screens.
 * Bichrome: light surface + zinc dark mode, emerald primary, amber tertiary, red error.
 * These deliberately avoid `DashboardShell` — the shell is rendered by each page.
 */

/* ------------------------------------------------------------------ */
/* Surfaces                                                           */
/* ------------------------------------------------------------------ */

export function OpsCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function OpsCardHeader({
  eyebrow,
  title,
  icon,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08]',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon ? (
          <span className="w-8 h-8 shrink-0 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-primary dark:text-[#4edea3]">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white truncate">{title}</h2>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export function OpsEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400',
        className
      )}
    >
      {children}
    </span>
  );
}

export function OpsLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400',
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Badges / pills                                                      */
/* ------------------------------------------------------------------ */

export type OpsTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<OpsTone, string> = {
  neutral:
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]',
  primary:
    'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] border-primary dark:border-primary/30',
  success:
    'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] border-primary dark:border-primary/30',
  warning:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  danger:
    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
  info: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]',
};

export function OpsBadge({
  tone = 'neutral',
  children,
  className,
  icon,
}: {
  tone?: OpsTone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap',
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function OpsButton({
  children,
  variant = 'secondary',
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary:
      'bg-primary hover:bg-[var(--sovereign-hover)] text-white disabled:bg-primary/50',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white',
    ghost:
      'bg-transparent hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800',
    danger:
      'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400',
  };
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

export function OpsInput({
  className,
  ...rest
}: { className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cn(
        'w-full h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] px-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50',
        className
      )}
    />
  );
}

export function OpsSelect({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cn(
        'w-full h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25',
        className
      )}
    >
      {children}
    </select>
  );
}

export function OpsTextarea({
  className,
  ...rest
}: { className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={cn(
        'w-full rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/25',
        className
      )}
    />
  );
}

export function OpsField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function OpsPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

export function OpsBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 ? <span className="text-zinc-400 dark:text-zinc-600">/</span> : null}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-primary dark:hover:text-[#4edea3] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-primary dark:text-[#4edea3]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function OpsStatCard({
  label,
  value,
  sub,
  badge,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  badge?: { label: string; tone: OpsTone };
  icon?: ReactNode;
  tone?: OpsTone;
}) {
  const valueTone: Record<OpsTone, string> = {
    neutral: 'text-zinc-900 dark:text-white',
    primary: 'text-primary dark:text-[#4edea3]',
    success: 'text-primary dark:text-[#4edea3]',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-zinc-900 dark:text-white',
  };
  const iconTone: Record<OpsTone, string> = {
    neutral: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
    primary: 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-primary dark:text-[#4edea3]',
    success: 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-primary dark:text-[#4edea3]',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
  };
  return (
    <OpsCard className="p-4 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <OpsLabel>{label}</OpsLabel>
          <div className={cn('mt-1 text-2xl font-bold tracking-tight', valueTone[tone])}>{value}</div>
        </div>
        {icon ? (
          <span
            className={cn(
              'w-9 h-9 shrink-0 rounded-lg flex items-center justify-center',
              iconTone[tone]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {sub || badge ? (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-white/[0.08]">
          {sub ? (
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{sub}</span>
          ) : (
            <span />
          )}
          {badge ? <OpsBadge tone={badge.tone}>{badge.label}</OpsBadge> : null}
        </div>
      ) : null}
    </OpsCard>
  );
}

export function OpsEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {action ? <div className="pt-5">{action}</div> : null}
    </div>
  );
}

export function OpsSectionTitle({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {icon ? (
          <span className="text-primary dark:text-[#4edea3] shrink-0">{icon}</span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
          {description ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatNaira(
  value: number | string | null | undefined,
  opts: { decimals?: boolean } = {}
): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: opts.decimals === false ? 0 : 2,
    maximumFractionDigits: opts.decimals === false ? 0 : 2,
  }).format(n);
}

export function formatCompactNaira(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString('en-NG')}`;
}

export function formatDate(
  value: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', opts);
}

export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(d);
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '—';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
