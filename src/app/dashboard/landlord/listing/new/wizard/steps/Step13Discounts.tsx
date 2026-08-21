'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Percent } from 'lucide-react';
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

  const sync = () => {
    onChange({
      new_listing_promotion: flags.new_listing_promotion,
      last_minute_percentage: flags.last_minute_percentage ? parseFloat(percents.last_minute_percentage) || 0 : undefined,
      weekly_percentage: flags.weekly_percentage ? parseFloat(percents.weekly_percentage) || 0 : undefined,
      monthly_percentage: flags.monthly_percentage ? parseFloat(percents.monthly_percentage) || 0 : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Promotions and discounts</h2>
      <p className="text-sm text-muted-foreground">Offer discounts to attract more bookings.</p>
      <div className="space-y-3">
        {DISCOUNT_OPTIONS.map((option) => {
          const checked = flags[option.key];
          return (
            <Card key={option.key} className={`relative p-4 flex items-center justify-between gap-4 border-2 transition ${
              checked ? 'border-primary bg-[#262626]' : 'border-[#262626]'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={option.key}
                    checked={checked}
                    onCheckedChange={(c) => {
                      setFlags((prev) => ({ ...prev, [option.key]: Boolean(c) }));
                      sync();
                    }}
                  />
                  <Label htmlFor={option.key} className="text-sm font-medium">
                    {option.label}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="size-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={percents[option.key as keyof typeof percents]}
                  onChange={(e) => {
                    setPercents((prev) => ({ ...prev, [option.key]: e.target.value }));
                    sync();
                  }}
                  disabled={!checked}
                  className="w-20"
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
