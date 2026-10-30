'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, Bed, Bath, Home } from 'lucide-react';
import type { FloorPlan } from '../types';

export interface Step4Props {
  value?: Partial<FloorPlan>;
  onChange: (value: Partial<FloorPlan>) => void;
}

const DEFAULTS: FloorPlan = {
  guests_count: 4,
  bedrooms_count: 3,
  beds_count: 1,
  bathrooms_count: 2,
};

export default function Step4Capacity({ value, onChange }: Step4Props) {
  const [guests, setGuests] = useState(value?.guests_count ?? DEFAULTS.guests_count);
  const [bedrooms, setBedrooms] = useState(value?.bedrooms_count ?? DEFAULTS.bedrooms_count);
  const [beds, setBeds] = useState(value?.beds_count ?? DEFAULTS.beds_count);
  const [bathrooms, setBathrooms] = useState(value?.bathrooms_count ?? DEFAULTS.bathrooms_count);

  const sync = (patch: Partial<FloorPlan>) => {
    onChange({
      guests_count: patch.guests_count ?? guests,
      bedrooms_count: patch.bedrooms_count ?? bedrooms,
      beds_count: patch.beds_count ?? beds,
      bathrooms_count: patch.bathrooms_count ?? bathrooms,
    });
  };

  const Stepper = ({
    label,
    value: v,
    setValue,
    min,
    max,
    step = 1,
    icon,
  }: {
    label: string;
    value: number;
    setValue: (n: number) => void;
    min: number;
    max: number;
    step?: number;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-xl">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <Label className="text-sm font-medium text-zinc-900 dark:text-white">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0 border-zinc-200 dark:border-white/[0.08]"
          onClick={() => {
            const next = Math.max(min, v - step);
            setValue(next);
            sync({ [label.toLowerCase().replace(/s$/, '')]: next } as any);
          }}
        >
          -
        </Button>
        <span className="w-12 text-center text-sm font-semibold text-zinc-900 dark:text-white">{v}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0 border-zinc-200 dark:border-white/[0.08]"
          onClick={() => {
            const next = Math.min(max, v + step);
            setValue(next);
            sync({ [label.toLowerCase().replace(/s$/, '')]: next } as any);
          }}
        >
          +
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 04 / Spatial Capacity & Footprint</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Capacity Matrix & Lagos GIS Coordinates</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Input floor dimension ratios, parking allocations, and cadastral spatial metrics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stepper label="Guests" value={guests} setValue={setGuests} min={1} max={50} icon={<Users className="size-5" />} />
        <Stepper label="Bedrooms" value={bedrooms} setValue={setBedrooms} min={0} max={50} icon={<Bed className="size-5" />} />
        <Stepper label="Beds" value={beds} setValue={setBeds} min={1} max={100} icon={<Bed className="size-5" />} />
        <Stepper label="Bathrooms" value={bathrooms} setValue={setBathrooms} min={0.5} max={50} step={0.5} icon={<Bath className="size-5" />} />
      </div>
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Maximum Authorized Occupancy Cap</span>
          <span className="font-mono text-primary font-bold">{guests} Persons</span>
        </div>
        <input className="w-full accent-primary" type="range" min={1} max={12} value={Math.min(guests, 12)} onChange={(e) => { setGuests(parseInt(e.target.value)); sync({ guests_count: parseInt(e.target.value) }); }} />
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          <span>Single Executive (1)</span>
          <span>Family Standard (4-6)</span>
          <span>Diplomatic Delegation (10+)</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 block">Gross Floor Area</span>
            <span className="font-semibold text-zinc-900 dark:text-white">480 m²</span>
          </div>
          <Home className="size-5 text-zinc-400" />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 block">Dedicated Parking</span>
            <span className="font-semibold text-zinc-900 dark:text-white">3 Dedicated</span>
          </div>
          <Home className="size-5 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Partial<FloorPlan> | undefined;
  if (!d) {
    errors.push('Capacity fields are required');
    return errors;
  }
  if (typeof d.guests_count !== 'number' || d.guests_count < 1) {
    errors.push('Guests count must be at least 1');
  }
  if (typeof d.beds_count !== 'number' || d.beds_count < 1) {
    errors.push('Beds count must be at least 1');
  }
  if (typeof d.bathrooms_count !== 'number' || d.bathrooms_count < 0.5) {
    errors.push('Bathrooms count must be at least 0.5');
  }
  return errors;
}

export function getData(): Partial<FloorPlan> {
  return {};
}