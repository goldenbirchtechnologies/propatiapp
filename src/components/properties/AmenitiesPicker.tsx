'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { AmenityCategory } from '@/lib/amenities';
import { Sparkles } from 'lucide-react';

export interface AmenitiesPickerProps {
  categories: AmenityCategory[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function AmenitiesPicker({ categories, selected, onChange }: AmenitiesPickerProps) {
  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter((x) => x !== value) : [...selected, value];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Amenities</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Property Amenities</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Select all amenities that apply to this property.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.label} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{category.label}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {category.items.map((item) => {
                const checked = selected.includes(item.value);
                return (
                  <label
                    key={item.value}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition',
                      checked
                        ? 'border-primary dark:border-primary bg-primary/5'
                        : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] hover:border-zinc-300 dark:hover:border-white/20'
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggle(item.value)} />
                    <div className="flex items-center gap-2">
                      {item.icon && <span className="text-zinc-600 dark:text-zinc-400">{item.icon}</span>}
                      <span className="text-sm text-zinc-900 dark:text-white">{item.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
