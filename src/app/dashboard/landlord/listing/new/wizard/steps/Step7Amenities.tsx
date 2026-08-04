'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wifi, UtensilsCrossed, Car, Dumbbell, Waves, Tv, Wind, Shirt } from 'lucide-react';

export interface Step7Props {
  amenities?: string[];
  onChange: (amenities: string[]) => void;
}

const CATEGORIES: Record<string, { value: string; label: string; icon: React.ReactNode }[]> = {
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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">What amenities does your place offer?</h2>
      {Object.entries(CATEGORIES).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition ${
                  selected.includes(item.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Checkbox
                  checked={selected.includes(item.value)}
                  onCheckedChange={() => toggle(item.value)}
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { amenities?: string[] } {
  return {};
}
