'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Percent } from 'lucide-react';
import type { Discounts } from '../types';

export interface Step13Props {
  value?: Partial<Discounts>;
  onChange: (value: Partial<Discounts>) => void;
}

const DISCOUNT_OPTIONS = [
  { key: 'new_listing_promotion', label: 'New listing promotion', type: 'switch', default: true },
  { key: 'last_minute_percentage', label: 'Last minute discount', type: 'number', default: 9 },
  { key: 'weekly_percentage', label: 'Weekly stay discount', type: 'number', default: 5 },
  { key: 'monthly_percentage', label: 'Monthly stay discount', type: 'number', default: 10 },
];

export default function Step13Discounts({ value, onChange }: Step13Props) {
  const [newListing, setNewListing] = useState(value?.new_listing_promotion ?? true);
  const [lastMinute, setLastMinute] = useState(value?.last_minute_percentage?.toString() ?? '');
  const [weekly, setWeekly] = useState(value?.weekly_percentage?.toString() ?? '');
  const [monthly, setMonthly] = useState(value?.monthly_percentage?.toString() ?? '');

  useEffect(() => {
    onChange({
      new_listing_promotion: newListing,
      last_minute_percentage: lastMinute ? parseFloat(lastMinute) : undefined,
      weekly_percentage: weekly ? parseFloat(weekly) : undefined,
      monthly_percentage: monthly ? parseFloat(monthly) : undefined,
    });
  }, [newListing, lastMinute, weekly, monthly, onChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Promotions and discounts</h2>
      <p className="text-sm text-muted-foreground">Offer discounts to attract more bookings.</p>
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="new_listing_promotion" className="text-sm font-medium">New listing promotion</Label>
          <Switch
            id="new_listing_promotion"
            checked={newListing}
            onCheckedChange={setNewListing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="last_minute">Last minute %</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="last_minute"
                type="number"
                min={0}
                max={100}
                placeholder="9"
                value={lastMinute}
                onChange={(e) => setLastMinute(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly">Weekly %</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="weekly"
                type="number"
                min={0}
                max={100}
                placeholder="5"
                value={weekly}
                onChange={(e) => setWeekly(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Monthly %</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="monthly"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): Partial<Discounts> {
  return {};
}
