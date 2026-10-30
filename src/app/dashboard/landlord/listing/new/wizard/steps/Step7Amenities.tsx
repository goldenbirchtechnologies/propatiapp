'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wifi, UtensilsCrossed, Car, Dumbbell, Waves, Tv, Wind, Shirt, Sparkles } from 'lucide-react';

export interface Step7Props {
  amenities?: string[];
  onChange: (amenities: string[]) => void;
}

const CATEGORIES: Record<string, { value: string; label: string; icon?: React.ReactNode }[]> = {
  Basics: [
    { value: 'wifi', label: 'Wifi', icon: <Wifi className="size-4" /> },
    { value: 'tv', label: 'TV', icon: <Tv className="size-4" /> },
    { value: 'kitchen', label: 'Kitchen', icon: <UtensilsCrossed className="size-4" /> },
    { value: 'washer', label: 'Washer', icon: <Shirt className="size-4" /> },
    { value: 'air_conditioning', label: 'Air conditioning', icon: <Wind className="size-4" /> },
    { value: 'parking', label: 'Parking', icon: <Car className="size-4" /> },
  ],
  Popular: [
    { value: 'pool', label: 'Pool', icon: <Waves className="size-4" /> },
    { value: 'gym', label: 'Gym', icon: <Dumbbell className="size-4" /> },
    { value: 'hot_tub', label: 'Hot tub', icon: <Waves className="size-4" /> },
    { value: 'bbq_grill', label: 'BBQ grill', icon: <UtensilsCrossed className="size-4" /> },
  ],
  Features: [
    { value: 'balcony', label: 'Balcony' },
    { value: 'garden', label: 'Garden' },
    { value: 'terrace', label: 'Terrace' },
    { value: 'fireplace', label: 'Fireplace' },
  ],
  Location: [
    { value: 'beach_access', label: 'Beach access' },
    { value: 'city_skyline', label: 'City skyline view' },
    { value: 'mountain_view', label: 'Mountain view' },
    { value: 'waterfront', label: 'Waterfront' },
  ],
  Safety: [
    { value: 'smoke_alarm', label: 'Smoke alarm' },
    { value: 'first_aid_kit', label: 'First aid kit' },
    { value: 'fire_extinguisher', label: 'Fire extinguisher' },
    { value: 'carbon_monoxide_alarm', label: 'Carbon monoxide alarm' },
  ],
};

export default function Step7Amenities({ amenities = [], onChange }: Step7Props) {
  const [selected, setSelected] = useState<string[]>(amenities);

  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter((x) => x !== value) : [...selected, value];
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 07 / Infrastructure & Utilities</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Institutional Amenities & Infrastructure Matrix</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Select facility assurances including independent power generation and security protocols.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(CATEGORIES).map(([category, items]) => (
          <div key={category} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{category}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const checked = selected.includes(item.value);
                return (
                  <label
                    key={item.value}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition ${
                      checked
                        ? 'border-primary dark:border-primary bg-primary/5'
                        : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] hover:border-zinc-300 dark:hover:border-white/20'
                    }`}
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

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { amenities?: string[] } {
  return {};
}