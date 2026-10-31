'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DButton, DPill } from './primitives';
import { ROLE_META } from './role-meta';

/**
 * The onboarding dossier shell.
 *
 * Mirrors the Stitch "Sovereign Estate" flow layout: a brand bar, a hero that
 * names the dossier, a horizontal step pipeline, then a two-column body where
 * the open step card sits beside a sticky summary rail. Every role shares this
 * frame so the four flows read as one product; the rail and the pipeline
 * vocabulary are what make each role feel distinct.
 */

export interface ShellStep {
  id: string;
  title: string;
  done: boolean;
  skippable?: boolean;
}

export interface DossierShellProps {
  role: string;
  steps: ShellStep[];
  activeIndex: number;
  /** Highest step index the user may jump to from the pipeline. */
  maxReachableIndex: number;
  onSelectStep: (index: number) => void;
  onExit: () => void;
  rail: React.ReactNode;
  children: React.ReactNode;
}

export function DossierShell({
  role,
  steps,
  activeIndex,
  maxReachableIndex,
  onSelectStep,
  onExit,
  rail,
  children,
}: DossierShellProps) {
  const meta = ROLE_META[role];
  const total = steps.length;
  const doneCount = steps.filter((s) => s.done).length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="dossier-theme min-h-screen">
      {/* ── Brand bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--outline-variant)]/40 bg-[#fbf8fc]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[var(--accent)] text-[14px] font-bold text-white"
            >
              P
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold leading-4 tracking-[0.08em] text-[var(--on-surface)]">
                PROPATI
              </p>
              <p className="dossier-eyebrow truncate text-[var(--on-surface-variant)]">
                {meta?.label ?? 'Account'} intake
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:inline-flex">
              <StepCounter index={activeIndex} total={total} progress={progress} />
            </span>
            <DButton variant="ghost" size="sm" onClick={onExit} className="h-8">
              Save &amp; exit
            </DButton>
          </div>
        </div>
        {/* Hairline progress meter — the only progress affordance above the fold. */}
        <div aria-hidden className="h-[2px] w-full bg-[var(--surface-container-high)]">
          <div
            className="h-full bg-[var(--accent)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-8 md:px-8 md:pt-10">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 max-w-[62ch]">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <DPill tone="mint">{meta?.label ?? 'Account'}</DPill>
              <DPill tone="danger">
                <ShieldCheck className="h-3 w-3" /> Statutory intake
              </DPill>
            </div>
            <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.015em] text-[var(--on-surface)] md:text-[32px] md:tracking-[-0.01em]">
              {meta?.title ?? 'Account onboarding'}
            </h1>
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--on-surface-variant)]">
              {meta?.subtitle}
            </p>
          </div>
          <div className="sm:hidden">
            <StepCounter index={activeIndex} total={total} progress={progress} />
          </div>
        </div>

        {/* ── Pipeline ────────────────────────────────────────────────── */}
        <StepPipeline
          role={role}
          steps={steps}
          activeIndex={activeIndex}
          maxReachableIndex={maxReachableIndex}
          onSelectStep={onSelectStep}
        />

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_312px]">
          <div className="min-w-0">{children}</div>
          <aside className="lg:sticky lg:top-[88px]">{rail}</aside>
        </div>
      </div>
    </div>
  );
}

/* ── Step counter ─────────────────────────────────────────────────────── */

function StepCounter({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
      <span className="dossier-mono text-[var(--on-surface)]">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <span aria-hidden className="h-3 w-px bg-[var(--outline-variant)]" />
      <span className="dossier-mono">{progress}%</span>
    </span>
  );
}

/* ── Pipeline ─────────────────────────────────────────────────────────── */

function StepPipeline({
  role,
  steps,
  activeIndex,
  maxReachableIndex,
  onSelectStep,
}: {
  role: string;
  steps: ShellStep[];
  activeIndex: number;
  maxReachableIndex: number;
  onSelectStep: (index: number) => void;
}) {
  const labels = ROLE_META[role]?.stepLabels ?? {};

  return (
    <nav aria-label="Onboarding steps" className="mt-6">
      <ol className="custom-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
        {steps.map((step, i) => {
          const active = i === activeIndex;
          const reachable = i <= maxReachableIndex;
          const label = labels[step.id] ?? step.title;

          return (
            <li key={step.id} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => reachable && onSelectStep(i)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex items-center gap-2 rounded-[8px] px-2.5 py-2 transition-colors',
                  active
                    ? 'bg-[rgba(0,108,73,0.1)]'
                    : reachable
                      ? 'hover:bg-[var(--surface-container-low)]'
                      : 'cursor-not-allowed opacity-55'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                    step.done
                      ? 'bg-[var(--accent)] text-white'
                      : active
                        ? 'bg-[var(--primary-container)] text-white'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                  )}
                >
                  {step.done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : reachable ? (
                    i + 1
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-[12px] leading-4',
                    active
                      ? 'font-semibold text-[var(--accent)]'
                      : 'font-medium text-[var(--on-surface-variant)]'
                  )}
                >
                  {label}
                </span>
              </button>

              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'mx-0.5 h-px w-4 shrink-0',
                    steps[i].done ? 'bg-[var(--primary-container)]' : 'bg-[var(--outline-variant)]'
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Card footer nav ──────────────────────────────────────────────────── */

export function DossierNav({
  onBack,
  onNext,
  backDisabled,
  busy,
  isLast,
  blocked,
}: {
  onBack: () => void;
  onNext: () => void;
  backDisabled: boolean;
  busy: boolean;
  isLast: boolean;
  blocked: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <DButton variant="ghost" size="md" onClick={onBack} disabled={backDisabled || busy}>
        <ArrowLeft className="h-4 w-4" /> Back
      </DButton>

      <div className="flex items-center gap-2">
        {blocked ? (
          <span className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#93000a] sm:inline-flex">
            <Lock className="h-3 w-3" /> Skipped step blocking
          </span>
        ) : null}
        <DButton size="md" onClick={onNext} disabled={busy}>
          {isLast ? 'Complete onboarding' : 'Continue'}
          {!busy ? <ArrowRight className="h-4 w-4" /> : null}
        </DButton>
      </div>
    </div>
  );
}
