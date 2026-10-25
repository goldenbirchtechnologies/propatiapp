'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin, Banknote } from 'lucide-react';
import type { Pricing } from '../types';

export interface Step12Props {
  value?: Partial<Pricing>;
  onChange: (value: Partial<Pricing>) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

export default function Step12Pricing({ value, onChange }: Step12Props) {
  const [currency, setCurrency] = useState(value?.currency ?? 'NGN');
  const [basePrice, setBasePrice] = useState(value?.base_price?.toString() ?? '');
  const [weekend, setWeekend] = useState(value?.weekend_pricing?.toString() ?? '');

  const sync = (patch?: Partial<{ currency: string; base_price: string; weekend_pricing: string }>) => {
    const c = patch?.currency ?? currency;
    const b = patch?.base_price ?? basePrice;
    const w = patch?.weekend_pricing ?? weekend;
    onChange({
      currency: c,
      base_price: parseFloat(b) || 0,
      weekend_pricing: w ? parseFloat(w) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 12 / Financial Architecture & Liquidity</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Institutional Pricing, Escrow & Statutory Fees</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Configure annual lease float, caution escrow accounts, and LIRS stamp duty rates.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 text-emerald-600 rounded-lg text-sm font-medium">
          <Banknote className="size-4" /> Paystack Institutional Escrow Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-900 dark:text-white">Annual Net Base Rent</Label>
              <span className="text-xs font-semibold text-emerald-600">BILLED YEARLY IN ADVANCE</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-mono font-bold text-lg text-zinc-900 dark:text-white">₦</span>
              <Input
                type="number"
                min={10}
                step="0.01"
                placeholder="0.00"
                value={basePrice}
                onChange={(e) => { setBasePrice(e.target.value); sync({ base_price: e.target.value }); }}
                className="h-14 pl-12 pr-20 font-mono font-bold text-lg bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]"
              />
              <span className="absolute right-4 text-xs text-zinc-400">/ ANNUM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Caution Escrow</span>
                <span className="text-xs font-semibold text-emerald-600">10% STANDARD</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-zinc-900 dark:text-white">₦</span>
                <Input readOnly value={basePrice ? (parseFloat(basePrice) * 0.1).toFixed(2) : ''} className="pl-8 bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Floated in interest-bearing Paystack escrow until tenancy sign-off.</p>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Facility Sinking Fund</span>
                <span className="text-xs font-semibold text-emerald-600">IPP & DIESEL</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-zinc-900 dark:text-white">₦</span>
                <Input type="number" value={weekend} onChange={(e) => { setWeekend(e.target.value); sync({ weekend_pricing: e.target.value }); }} className="pl-8 bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Includes 24/7 power, security detail, pool, and water treatment.</p>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-emerald-600" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Legal Fee & LIRS Stamp Duty Assessment</span>
              <span className="ml-auto text-xs font-mono text-zinc-400">5.0% OF BASE RENT</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white">Lagos State Tenancy Registry & Legal Indenture</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Drafted by Sovereign Legal LLP under NBA scale fees</div>
              </div>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">₦ {basePrice ? (parseFloat(basePrice) * 0.05).toLocaleString() : '0'}</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <Label htmlFor="currency" className="text-sm font-medium text-zinc-900 dark:text-white">Currency</Label>
            <Select value={currency} onValueChange={(v) => { setCurrency(v); sync({ currency: v }); }}>
              <SelectTrigger id="currency" className="bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Upfront Settlement Bill</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 font-semibold">T1 INSTITUTIONAL</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Base Annual Lease (12 Months)</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">₦ {basePrice ? parseFloat(basePrice).toLocaleString() : '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Caution Float (10% Refundable)</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">₦ {basePrice ? (parseFloat(basePrice) * 0.1).toLocaleString() : '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Legal Drafting & LASG Stamp Duty</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">₦ {basePrice ? (parseFloat(basePrice) * 0.05).toLocaleString() : '0'}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Total Initial Capital Outlay</span>
                <span className="text-xl font-mono font-bold text-emerald-600">₦ {basePrice ? (parseFloat(basePrice) * 1.15).toLocaleString() : '0'}</span>
              </div>
              <span className="text-xs text-zinc-400">Reconciled via automated NIBSS / Paystack virtual dedicated IBAN.</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Banknote className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white">Guaranty Trust Bank</div>
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400">0492817290 · Sovereign Holdings</div>
              </div>
            </div>
            <CheckIcon />
          </div>
          <Button variant="outline" className="w-full gap-2 border-zinc-200 dark:border-white/[0.08]">
            <MapPin className="size-4" /> View similar listings
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <svg className="size-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>;
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