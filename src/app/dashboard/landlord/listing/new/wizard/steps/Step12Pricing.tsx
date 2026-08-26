'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin } from 'lucide-react';
import type { Pricing } from '../types';

export interface Step12Props {
  value?: Partial<Pricing>;
  onChange: (value: Partial<Pricing>) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

export default function Step12Pricing({ value, onChange }: Step12Props) {
  const [currency, setCurrency] = useState(value?.currency ?? 'USD');
  const [basePrice, setBasePrice] = useState(value?.base_price?.toString() ?? '');
  const [weekend, setWeekend] = useState(value?.weekend_pricing?.toString() ?? '');

  const sync = () => {
    onChange({
      currency,
      base_price: parseFloat(basePrice) || 0,
      weekend_pricing: weekend ? parseFloat(weekend) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Set your base price</h2>
      <p className="text-sm text-zinc-500">This is your nightly base rate. You can adjust it for weekends later.</p>
      <div className="glass-card p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(v) => { setCurrency(v); sync(); }}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="base_price">Base price per night</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              id="base_price"
              type="number"
              min={10}
              step="0.01"
              placeholder="0.00"
              value={basePrice}
              onChange={(e) => { setBasePrice(e.target.value); sync(); }}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weekend_pricing">Weekend adjustment percentage (optional)</Label>
        <Input
          id="weekend_pricing"
          type="number"
          min={0}
          max={100}
          placeholder="e.g. 15 for 15% increase"
          value={weekend}
          onChange={(e) => { setWeekend(e.target.value); sync(); }}
        />
        <p className="text-xs text-zinc-500">Leave blank for no weekend adjustment.</p>
      </div>

      <Button variant="outline" className="w-full gap-2">
        <MapPin className="size-4" />
        View similar listings
      </Button>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Partial<Pricing> | undefined;
  if (!d) {
    errors.push('Pricing is required');
    return errors;
  }
  if (!d.base_price || d.base_price < 10) {
    errors.push('Base price must be at least 10');
  }
  if (!d.currency) {
    errors.push('Currency is required');
  }
  return errors;
}

export function getData(): Partial<Pricing> {
  return {};
}
