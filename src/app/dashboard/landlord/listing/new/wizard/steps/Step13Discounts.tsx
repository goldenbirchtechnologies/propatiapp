'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Percent, Tag } from 'lucide-react';
import type { Discounts } from '../types';

export interface Step13Props {
  value?: Partial<Discounts>;
  onChange: (value: Partial<Discounts>) => void;
}

const DISCOUNT_OPTIONS = [
  { key: 'new_listing_promotion', label: 'New listing promotion', description: 'Promote your new listing to guests.' },
  { key: 'last_minute_percentage', label: 'Last minute discount', description: 'Discounts for bookings at the last minute.' },
  { key: 'weekly_percentage', label: 'Weekly stay discount', description: 'Discount for weekly stays.' },
  { key: 'monthly_percentage', label: 'Monthly stay discount', description: 'Discount for monthly stays.' },
];

export default function Step13Discounts({ value, onChange }: Step13Props) {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    new_listing_promotion: value?.new_listing_promotion ?? true,
    last_minute_percentage: Boolean(value?.last_minute_percentage),
    weekly_percentage: Boolean(value?.weekly_percentage),
    monthly_percentage: Boolean(value?.monthly_percentage),
  });
  const [percents, setPercents] = useState({
    last_minute_percentage: value?.last_minute_percentage?.toString() ?? '9',
    weekly_percentage: value?.weekly_percentage?.toString() ?? '5',
    monthly_percentage: value?.monthly_percentage?.toString() ?? '10',
  });

  const sync = (nextFlags = flags, nextPercents = percents) => {
    onChange({
      new_listing_promotion: nextFlags.new_listing_promotion,
      last_minute_percentage: nextFlags.last_minute_percentage ? parseFloat(nextPercents.last_minute_percentage) || 0 : undefined,
      weekly_percentage: nextFlags.weekly_percentage ? parseFloat(nextPercents.weekly_percentage) || 0 : undefined,
      monthly_percentage: nextFlags.monthly_percentage ? parseFloat(nextPercents.monthly_percentage) || 0 : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 13 / Discounts</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Discounts</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Offer discounts to attract more bookings.</p>
      </div>
      <div className="flex flex-col gap-3">
        {DISCOUNT_OPTIONS.map((option) => {
          const checked = flags[option.key];
          return (
            <div
              key={option.key}
              className={`flex items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                checked
                  ? 'bg-white dark:bg-zinc-900 border-emerald-600 dark:border-emerald-500'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={option.key}
                    checked={checked}
                    onCheckedChange={(c) => {
                      const nextFlags = { ...flags, [option.key]: Boolean(c) };
                      setFlags(nextFlags);
                      sync(nextFlags, percents);
                    }}
                  />
                  <Label htmlFor={option.key} className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                    <Tag className="size-4 text-emerald-600" /> {option.label}
                  </Label>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 ml-6">{option.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="size-4 text-zinc-400" />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={percents[option.key as keyof typeof percents]}
                  onChange={(e) => {
                    const nextPercents = { ...percents, [option.key]: e.target.value };
                    setPercents(nextPercents);
                    sync(flags, nextPercents);
                  }}
                  disabled={!checked}
                  className="w-20 bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): Partial<Discounts> {
  return {};
}