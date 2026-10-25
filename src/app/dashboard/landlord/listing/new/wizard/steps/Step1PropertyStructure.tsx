'use client';

import { Home, Hotel, Warehouse, Tent, Check, Building2 } from 'lucide-react';
import { useState } from 'react';
import type { PropertyStructure } from '../types';

export interface Step1Props {
  value?: PropertyStructure;
  onChange: (value: PropertyStructure) => void;
}

const OPTIONS: { value: PropertyStructure; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'house', label: 'House', icon: <Home className="size-5" />, desc: 'Standalone residential dwelling with private grounds.' },
  { value: 'apartment', label: 'Apartment', icon: <Hotel className="size-5" />, desc: 'Unit within a multi-tenant residential building.' },
  { value: 'barn', label: 'Barn / Warehouse', icon: <Warehouse className="size-5" />, desc: 'Industrial or agricultural conversion asset.' },
  { value: 'bed_and_breakfast', label: 'Bed & Breakfast', icon: <Building2 className="size-5" />, desc: 'Hospitality lodging with daily service.' },
  { value: 'hotel', label: 'Hotel', icon: <Hotel className="size-5" />, desc: 'Full-service hospitality institution.' },
  { value: 'tent', label: 'Tent / Glamping', icon: <Tent className="size-5" />, desc: 'Temporary or experiential accommodation.' },
];

export default function Step1PropertyStructure({ value, onChange }: Step1Props) {
  const [internal, setInternal] = useState<PropertyStructure | undefined>(value);
  const selected = value ?? internal;

  const handleSelect = (v: PropertyStructure) => {
    setInternal(v);
    onChange(v);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 01 / Spatial Architecture</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Property Structure & Asset Classification</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Define title deed parameters, building typology, and target tenancy terms for institutional listing.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`relative flex flex-col gap-3 p-5 rounded-xl border transition-all text-left ${
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
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-600/10 text-emerald-600' : 'bg-zinc-50 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400'}`}>
                {opt.icon}
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">{opt.label}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="size-4 text-emerald-600" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Asset Visualizer</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Selected typology drives regulatory disclosure requirements and tenancy terms.</p>
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { property_structure?: PropertyStructure } {
  return {};
}