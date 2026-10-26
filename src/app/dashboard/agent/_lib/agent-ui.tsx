'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Surfaces ─────────────────────────────────────────────────────────────────

export function AgentCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function AgentCardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-zinc-800/50">
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-emerald-600 dark:text-emerald-400">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

export function AgentStatCard({
  label,
  value,
  sublabel,
  icon,
  accent = 'emerald',
  trailing,
}: {
  label: string;
  value: string;
  sublabel?: ReactNode;
  icon?: ReactNode;
  accent?: 'emerald' | 'amber' | 'red' | 'neutral';
  trailing?: ReactNode;
}) {
  const accentClass = {
    emerald: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  }[accent];

  return (
    <AgentCard className="flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              accentClass
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="font-mono-numeric text-2xl font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
          {value}
        </p>
        {sublabel ? (
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{sublabel}</div>
        ) : null}
      </div>
      {trailing}
    </AgentCard>
  );
}

// ─── Segmented control ───────────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800',
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              active
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Filter chip / pill ──────────────────────────────────────────────────────

export function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
        active
          ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-900'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      )}
    >
      <span>{children}</span>
      {count !== undefined ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 font-mono-numeric text-[11px]',
            active
              ? 'bg-white/25 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function ToneBadge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        className
      )}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', dot)} /> : null}
      {children}
    </span>
  );
}

// ─── Table shell ──────────────────────────────────────────────────────────────

export function AgentTableWrap({ children }: { children: ReactNode }) {
  return (
    <AgentCard className="overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </AgentCard>
  );
}

export function AgentTh({
  children,
  className,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400',
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function AgentTd({
  children,
  className,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 align-middle text-sm text-zinc-900 dark:text-white',
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function AgentEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 text-zinc-400 dark:text-zinc-600">{icon}</div>
      ) : null}
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

// ─── Toolbar controls ────────────────────────────────────────────────────────

export function ToolbarSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
      />
    </div>
  );
}

export function ToolbarSelect({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 pr-8 text-[13px] font-medium text-zinc-900 outline-none transition-colors focus:border-emerald-600 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function PrimaryAction({
  children,
  icon,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryAction({
  children,
  icon,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export function AgentBreadcrumb({
  items,
}: {
  items: { label: string; href?: string; current?: boolean }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 ? <span className="text-zinc-400">/</span> : null}
          {item.href && !item.current ? (
            <a
              href={item.href}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {item.label}
            </a>
          ) : (
            <span className={item.current ? 'text-emerald-600 dark:text-emerald-400' : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
