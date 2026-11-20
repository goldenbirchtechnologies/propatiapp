'use client';

import { AlertCircle, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandlordSectionId, LandlordSectionStatus } from '@/lib/landlord-profile/types';

export interface LandlordRailItem extends LandlordSectionStatus {
  index: number;
  label: string;
}

export function SectionRail({
  items,
  activeId,
  onSelect,
  percent,
  completedCount,
}: {
  items: LandlordRailItem[];
  activeId: LandlordSectionId;
  onSelect: (id: LandlordSectionId) => void;
  percent: number;
  completedCount: number;
}) {
  const active = items.find((item) => item.sectionId === activeId);

  return (
    <nav aria-label="Owner profile sections" className="min-w-0 lg:sticky lg:top-4">
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60">
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Profile setup</p>
            <p className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {completedCount}/{items.length}
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
              aria-label={`Owner profile ${percent}% complete`}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {percent}% complete · based on saved records
          </p>
        </div>

        <ol className="hidden divide-y divide-zinc-100 dark:divide-white/[0.06] lg:block">
          {items.map((item) => {
            const isActive = item.sectionId === activeId;
            return (
              <li key={item.sectionId}>
                <button
                  type="button"
                  onClick={() => onSelect(item.sectionId)}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                    'hover:bg-zinc-50 dark:hover:bg-white/[0.04]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    isActive && 'bg-primary/[0.06] dark:bg-primary/10 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r-full before:bg-primary',
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

        <div className="-mx-px flex gap-2 overflow-x-auto p-3 lg:hidden">
          {items.map((item) => {
            const isActive = item.sectionId === activeId;
            return (
              <button
                key={item.sectionId}
                type="button"
                onClick={() => onSelect(item.sectionId)}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                    : 'border-zinc-200 text-zinc-600 dark:border-white/10 dark:text-zinc-400',
                )}
              >
                <span className="tabular-nums opacity-70">
                  {String(item.index).padStart(2, '0')}
                </span>
                <span>{item.label}</span>
                <SectionMark done={item.done} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      {active && !active.done && active.missing.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
          <span>
            Still needed:{' '}
            <span className="text-zinc-700 dark:text-zinc-300">{active.missing.join(', ')}</span>
          </span>
        </p>
      )}
    </nav>
  );
}

function SectionMark({ done, size = 'md' }: { done: boolean; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return done ? (
    <Check className={cn(cls, 'shrink-0 text-emerald-600 dark:text-emerald-400')} aria-hidden />
  ) : (
    <Circle className={cn(cls, 'shrink-0 text-zinc-300 dark:text-zinc-600')} aria-hidden />
  );
}
