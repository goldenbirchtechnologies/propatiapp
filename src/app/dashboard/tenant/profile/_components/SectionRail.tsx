'use client';

import { Check, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TenantSectionId } from '@/lib/tenant-profile/completion';

export interface RailItem {
  id: TenantSectionId;
  /** Number shown in the rail, 01–10. */
  index: number;
  label: string;
  done: boolean;
  missing: string[];
}

interface SectionRailProps {
  items: RailItem[];
  activeId: TenantSectionId;
  onSelect: (id: TenantSectionId) => void;
  percent: number;
  completedCount: number;
}

/**
 * Numbered vertical rail. Replaces the seven-tab strip, which had no overflow
 * affordance and was itself a cause of the page's horizontal scroll.
 *
 * Below `lg` it becomes a horizontal scroller of the same numbered chips, so
 * the page never widens beyond its column.
 */
export function SectionRail({ items, activeId, onSelect, percent, completedCount }: SectionRailProps) {
  const total = items.length;
  const active = items.find((i) => i.id === activeId);

  return (
    <nav aria-label="Profile sections" className="lg:sticky lg:top-4">
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/50">
        <div className="border-b border-zinc-200 px-4 py-3.5 dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Your profile</p>
            <p className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {completedCount}/{total}
            </p>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Profile ${percent}% complete`}
            />
          </div>
        </div>

        {/* Wide: numbered list. */}
        <ol className="hidden divide-y divide-zinc-100 dark:divide-white/[0.06] lg:block">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    'hover:bg-zinc-50 dark:hover:bg-white/[0.04]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    isActive && 'bg-primary/[0.06] dark:bg-primary/10',
                  )}
                >
                  <span
                    className={cn(
                      'w-5 shrink-0 text-[11px] font-semibold tabular-nums',
                      isActive ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500',
                    )}
                  >
                    {String(item.index).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      isActive
                        ? 'font-semibold text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400',
                    )}
                  >
                    {item.label}
                  </span>
                  <SectionMark done={item.done} />
                </button>
              </li>
            );
          })}
        </ol>

        {/* Narrow: the same numbers, scrolled horizontally inside the column. */}
        <div className="-mx-px flex gap-2 overflow-x-auto p-3 lg:hidden">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                    : 'border-zinc-200 text-zinc-600 dark:border-white/10 dark:text-zinc-400',
                )}
              >
                <span className="tabular-nums opacity-70">{String(item.index).padStart(2, '0')}</span>
                <span>{item.label}</span>
                <SectionMark done={item.done} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      {/* What is left in the open section, so the reason for an amber dot is
          never a mystery. */}
      {active && !active.done && active.missing.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
          <span>
            Still needed: <span className="text-zinc-700 dark:text-zinc-300">{active.missing.join(', ')}</span>
          </span>
        </p>
      )}
    </nav>
  );
}

/** Tick when done, hollow dot when not. The label is announced, not the glyph. */
function SectionMark({ done, size = 'md' }: { done: boolean; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return done ? (
    <Check className={cn(cls, 'shrink-0 text-emerald-600 dark:text-emerald-400')} aria-hidden />
  ) : (
    <Circle className={cn(cls, 'shrink-0 text-zinc-300 dark:text-zinc-600')} aria-hidden />
  );
}
