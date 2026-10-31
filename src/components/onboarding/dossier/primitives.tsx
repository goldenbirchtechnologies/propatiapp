'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dossier primitives.
 *
 * These are hand-built rather than shadcn wrappers on purpose: the Stitch
 * "Sovereign Estate" references style controls as filled 40px fields on a
 * lavender canvas with an 8px radius, and shadcn's dark-first variants fight
 * every one of those decisions. Owning the markup keeps the fidelity exact and
 * the whole onboarding flow consistent.
 */

/* ── Card ─────────────────────────────────────────────────────────────── */

export function DCard({
  children,
  className,
  as: Tag = 'section',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
}) {
  return (
    <Tag
      className={cn(
        'rounded-[12px] bg-[var(--surface-container-lowest)] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Section head. `bar` renders the tinted strip used by the landlord / estate
 * references; without it the head sits inline like the tenant reference.
 */
export function DCardHead({
  icon,
  title,
  badge,
  sub,
  bar = false,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  badge?: React.ReactNode;
  sub?: React.ReactNode;
  bar?: boolean;
  className?: string;
}) {
  if (bar) {
    return (
      <div
        className={cn(
          '-mx-6 -mt-6 mb-1 flex items-center justify-between gap-3 rounded-t-[12px] bg-[var(--surface-container-low)] px-6 pb-3 pt-4',
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 text-[var(--accent)]">{icon}</span> : null}
          <h3 className="truncate text-[16px] font-semibold tracking-[-0.005em] text-[var(--on-surface)]">
            {title}
          </h3>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon ? <span className="shrink-0 text-[var(--accent)]">{icon}</span> : null}
          <h3 className="text-[16px] font-semibold tracking-[-0.005em] text-[var(--on-surface)]">
            {title}
          </h3>
        </div>
        {sub ? (
          <p className="mt-1 text-[12px] leading-4 text-[var(--on-surface-variant)]">{sub}</p>
        ) : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

/* ── Badges ───────────────────────────────────────────────────────────── */

const BADGE_TONES = {
  primary: 'bg-[rgba(0,108,73,0.1)] text-[var(--accent)]',
  solid: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  mint: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
  neutral: 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
  muted: 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]',
  danger: 'bg-[rgba(186,26,26,0.1)] text-[#93000a]',
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function DBadge({
  children,
  tone = 'primary',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-[3px] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.04em]',
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DPill({
  children,
  tone = 'primary',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]',
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Field wrapper ────────────────────────────────────────────────────── */

export function DField({
  label,
  note,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode;
  /** Right-aligned micro-note beside the label (e.g. "Read-only", "₦/annum"). */
  note?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label ? (
        <label className="flex items-center justify-between gap-2 text-[13px] font-semibold leading-[18px] text-[var(--on-surface)]">
          <span className="min-w-0">
            {label}
            {required ? <span className="ml-0.5 text-[#ba1a1a]">*</span> : null}
          </span>
          {note ? (
            <span className="shrink-0 text-[11px] font-normal leading-[14px] text-[var(--on-surface-variant)]">
              {note}
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-[11px] leading-[14px] font-medium text-[#ba1a1a]">{error}</p>
      ) : hint ? (
        <p className="text-[11px] leading-[14px] text-[var(--on-surface-variant)]">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────────────────── */

const CONTROL =
  'h-10 w-full rounded-[8px] border border-transparent bg-[var(--surface-container-low)] ' +
  'px-3 text-[14px] leading-5 text-[var(--on-surface)] outline-none transition-colors ' +
  'placeholder:text-[#71717a] hover:bg-[var(--surface-container)] ' +
  'focus:border-[var(--primary-container)] focus:bg-[var(--surface-container-lowest)] ' +
  'focus:ring-2 focus:ring-[rgba(16,185,129,0.2)] ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const DInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean; invalid?: boolean }
>(function DInput({ className, mono, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        CONTROL,
        mono && 'font-medium dossier-mono',
        invalid && 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[rgba(186,26,26,0.18)]',
        className
      )}
      {...props}
    />
  );
});

export const DTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function DTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(CONTROL, 'h-auto min-h-[84px] resize-y py-2.5', className)}
      {...props}
    />
  );
});

/** Native select — matches the reference's `appearance-none` + chevron affordance. */
export const DSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }
>(function DSelect({ className, placeholder, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(CONTROL, 'cursor-pointer appearance-none pr-9', className)}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--on-surface-variant)]"
      />
    </div>
  );
});

/** Read-only display value styled as a locked field. */
export function DReadonly({
  value,
  icon,
  className,
  tone = 'default',
}: {
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <div
      className={cn(
        'flex h-10 items-center justify-between gap-2 rounded-[8px] px-3 text-[14px]',
        tone === 'accent'
          ? 'bg-[rgba(0,108,73,0.06)] text-[var(--accent)]'
          : 'bg-[var(--surface-container)] text-[var(--on-surface)]',
        className
      )}
    >
      <span className="truncate">{value}</span>
      {icon ? <span className="shrink-0">{icon}</span> : null}
    </div>
  );
}

/** Naira-prefixed financial input, per DESIGN.md currency field guidance. */
export function DCurrency({
  prefix = '₦',
  suffix,
  className,
  inputClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: string;
  suffix?: React.ReactNode;
  inputClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-10 overflow-hidden rounded-[8px] bg-[var(--surface-container-low)]',
        'transition-colors focus-within:ring-2 focus-within:ring-[rgba(16,185,129,0.2)]',
        className
      )}
    >
      <span className="flex items-center justify-center bg-[var(--surface-container-high)] px-3 text-[14px] font-bold text-[var(--on-surface-variant)]">
        {prefix}
      </span>
      <input
        className={cn(
          'w-full min-w-0 bg-transparent px-3 text-[14px] font-semibold text-[var(--on-surface)] outline-none',
          'placeholder:font-normal placeholder:text-[#71717a] dossier-mono',
          inputClassName
        )}
        {...props}
      />
      {suffix ? (
        <span className="flex shrink-0 items-center bg-[var(--surface-container-low)] px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/* ── Checkbox / radio rows ────────────────────────────────────────────── */

export function DCheckboxRow({
  id,
  checked,
  onCheckedChange,
  children,
  className,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-[8px] p-3 transition-colors',
        checked
          ? 'bg-[rgba(0,108,73,0.08)] ring-1 ring-[rgba(0,108,73,0.2)]'
          : 'bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)]',
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--primary)]"
      />
      <span className="select-none text-[12px] leading-[18px] text-[var(--on-surface)]">
        {children}
      </span>
    </label>
  );
}

export function DChecklistRow({
  id,
  checked,
  onCheckedChange,
  title,
  description,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-[8px] bg-[var(--surface-container-low)] p-3 transition-colors hover:bg-[var(--surface-container)]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold leading-5 text-[var(--on-surface)]">
          {title}
        </span>
        <span className="mt-1 block text-[12px] leading-[18px] text-[var(--on-surface-variant)]">
          {description}
        </span>
      </span>
    </label>
  );
}

export function DToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-semibold leading-[18px] transition-colors',
        active
          ? 'bg-[rgba(0,108,73,0.1)] text-[var(--accent)] ring-1 ring-[rgba(0,108,73,0.35)]'
          : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
      )}
    >
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-[4px] text-[10px]',
          active
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
            : 'bg-[var(--surface-container-highest)] text-transparent'
        )}
      >
        ✓
      </span>
      {children}
    </button>
  );
}

/* ── Stat tile ────────────────────────────────────────────────────────── */

export function DStat({
  label,
  value,
  note,
  icon,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-[12px] bg-[var(--surface-container-low)] p-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[var(--on-surface-variant)]">
        <span className="dossier-eyebrow">{label}</span>
        {icon ? <span className="shrink-0">{icon}</span> : null}
      </div>
      <p className="text-[14px] font-semibold leading-5 text-[var(--on-surface)]">{value}</p>
      {note ? (
        <p className="text-[12px] leading-4 text-[var(--on-surface-variant)]">{note}</p>
      ) : null}
    </div>
  );
}

/* ── Callout ──────────────────────────────────────────────────────────── */

export function DCallout({
  icon,
  title,
  children,
  tone = 'mint',
  className,
}: {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'mint' | 'neutral' | 'danger';
  className?: string;
}) {
  const tones = {
    mint: 'bg-[rgba(0,108,73,0.07)] text-[var(--on-surface)]',
    neutral: 'bg-[var(--surface-container)] text-[var(--on-surface)]',
    danger: 'bg-[rgba(186,26,26,0.07)] text-[var(--on-surface)]',
  } as const;

  const iconTone = {
    mint: 'text-[var(--accent)]',
    neutral: 'text-[var(--on-surface-variant)]',
    danger: 'text-[#ba1a1a]',
  } as const;

  return (
    <div className={cn('flex items-start gap-3 rounded-[8px] p-3', tones[tone], className)}>
      {icon ? <span className={cn('mt-0.5 shrink-0', iconTone[tone])}>{icon}</span> : null}
      <div className="min-w-0">
        {title ? (
          <p className="text-[14px] font-semibold leading-5 text-[var(--on-surface)]">{title}</p>
        ) : null}
        <div className="text-[12px] leading-[18px] text-[var(--on-surface-variant)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

export function DButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variants = {
    primary:
      'bg-[var(--primary-container)] text-[#ffffff] shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] hover:bg-[var(--primary)]',
    secondary:
      'bg-[var(--surface-container)] text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]',
    ghost:
      'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
  } as const;

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[13px]',
    lg: 'h-11 px-6 text-[14px]',
  } as const;

  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] font-semibold',
        'transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Layout helpers ───────────────────────────────────────────────────── */

export function DGrid({
  cols = 2,
  children,
  className,
}: {
  cols?: 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

export function DDivider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-[var(--surface-container-high)]', className)} />;
}
