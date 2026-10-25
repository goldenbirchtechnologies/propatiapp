'use client';

import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

export interface Step10Props {
  highlights?: string[];
  onChange: (highlights: string[]) => void;
}

const OPTIONS = [
  { value: 'peaceful', label: 'Peaceful', description: 'A quiet, relaxing stay' },
  { value: 'unique', label: 'Unique', description: 'A one-of-a-kind property' },
  { value: 'family_friendly', label: 'Family-friendly', description: 'Great for families with kids' },
  { value: 'stylish', label: 'Stylish', description: 'Modern and beautifully designed' },
  { value: 'central', label: 'Central', description: 'Close to city center and attractions' },
  { value: 'spacious', label: 'Spacious', description: 'Plenty of room to spread out' },
];

export default function Step10Highlights({ highlights = [], onChange }: Step10Props) {
  const [selected, setSelected] = useState<string[]>(highlights);

  const toggle = (value: string) => {
    let next: string[];
    if (selected.includes(value)) {
      next = selected.filter((x) => x !== value);
    } else {
      if (selected.length >= 2) {
        next = selected;
      } else {
        next = [...selected, value];
      }
    }
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 10 / Highlights</span>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Highlights</h2>
          <Sparkles className="size-5 text-amber-500" />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Pick up to 2 highlights that best describe your listing.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPTIONS.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`relative flex flex-col gap-2 p-5 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 border-emerald-600 dark:border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="font-semibold text-sm text-zinc-900 dark:text-white">{opt.label}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">{opt.description}</div>
            </button>
          );
        })}
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{selected.length}/2 selected</div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { highlights?: string[] } {
  return {};
}