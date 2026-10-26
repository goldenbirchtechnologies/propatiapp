'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared Stitch-fidelity primitives for the agent standing screens
 * (profile, verifications, professional licence, reputation).
 *
 * Palette follows the Stitch token set — bichrome surfaces (white / zinc-900)
 * with emerald-600 as the primary accent, amber for tertiary/pending and red
 * for error states.
 */

export const SURFACE = 'bg-white dark:bg-zinc-900';
export const SURFACE_MUTED = 'bg-zinc-50 dark:bg-zinc-800/50';
export const BORDER = 'border-zinc-200 dark:border-white/[0.08]';
export const TEXT = 'text-zinc-900 dark:text-white';
export const TEXT_MUTED = 'text-zinc-600 dark:text-zinc-400';
export const PRIMARY = 'text-emerald-600 dark:text-emerald-400';
export const PRIMARY_BG = 'bg-emerald-600 dark:bg-emerald-500';

/** Bordered card surface used across every panel on these screens. */
export function StandingCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
        BORDER,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Section heading with an optional icon slot on the left. */
export function StandingSectionTitle({
  icon,
  title,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2.5">
        {icon ? <span className="shrink-0 text-zinc-700 dark:text-zinc-200">{icon}</span> : null}
        <h3 className={cn('text-lg font-bold tracking-tight', TEXT)}>{title}</h3>
      </div>
      {action}
    </div>
  );
}

/** Uppercase micro-label used for field captions and stat eyebrows. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-[11px] font-semibold uppercase tracking-wider', TEXT_MUTED, className)}>
      {children}
    </span>
  );
}

/** Small rounded status chip. `tone` maps to the Stitch status colours. */
export function StatusChip({
  tone = 'neutral',
  children,
  icon,
  className,
}: {
  tone?: 'positive' | 'warning' | 'critical' | 'neutral' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    positive:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
    critical:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/25',
    info: 'bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-white/[0.08]',
    neutral:
      'bg-zinc-50 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-white/[0.08]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Filled / outline / ghost buttons matching the Stitch button language. */
export function StandingButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400',
    outline:
      'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
    ghost:
      'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-zinc-950 dark:hover:bg-red-400',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Icon-only square button used in toolbars and card headers. */
export function IconButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Slim progress bar with an emerald fill. */
export function Meter({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800', className)}>
      <div
        className={cn('h-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-500', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Dashed empty-state container used across the standing screens. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center',
        BORDER,
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
          {icon}
        </div>
      ) : null}
      <h4 className={cn('text-base font-bold', TEXT)}>{title}</h4>
      {description ? (
        <p className={cn('mt-1.5 max-w-md text-sm', TEXT_MUTED)}>{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Label/value row used inside the compliance panels. */
export function DataRow({
  label,
  value,
  className,
  valueClassName,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-1.5', className)}>
      <span className={cn('text-xs', TEXT_MUTED)}>{label}</span>
      <span className={cn('text-right text-xs font-semibold', TEXT, valueClassName)}>{value}</span>
    </div>
  );
}
