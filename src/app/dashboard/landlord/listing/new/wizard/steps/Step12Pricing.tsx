'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Calculator, FileText, Percent, ShieldCheck } from 'lucide-react';
import { DEFAULT_PLATFORM_CONFIG } from '@/lib/platform-config';
import { calculateTransactionBreakdown } from '@/lib/transaction-fees';
import type { Pricing } from '../types';

export interface Step12Props {
  value?: Partial<Pricing>;
  onChange: (value: Partial<Pricing>) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];
const money = (kobo: number) =>
  `₦ ${Math.round(kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

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

  const amountKobo = Math.round((parseFloat(basePrice) || 0) * 100);
  const cautionRate = DEFAULT_PLATFORM_CONFIG.transactionFees.shortlet.cautionDepositRate;
  const fees = useMemo(
    () =>
      calculateTransactionBreakdown({
        vertical: 'shortlet',
        amountKobo,
        cautionDepositKobo: Math.round(amountKobo * cautionRate),
        cardType: 'local',
      }),
    [amountKobo, cautionRate]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 12 / Financial Architecture & Liquidity</span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Shortlet Pricing, Escrow & VAT</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Guests pay 0% platform fee. Host commission, VAT and caution escrow are shown separately.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
          <Banknote className="size-4" /> Paystack Escrow Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-900 dark:text-white">Base Booking Value</Label>
              <span className="text-xs font-semibold text-primary">GUEST PLATFORM FEE 0%</span>
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
              <span className="absolute right-4 text-xs text-zinc-400">/ STAY</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Use the nightly rate, or the fixed package price for a closed-stay listing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Caution Escrow</span>
                <span className="text-xs font-semibold text-primary">{Math.round(cautionRate * 100)}% REFUNDABLE</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-zinc-900 dark:text-white">₦</span>
                <Input readOnly value={basePrice ? (parseFloat(basePrice) * cautionRate).toFixed(2) : ''} className="pl-8 bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Held in escrow with 0% platform fee and refunded after checkout.</p>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Weekend / Peak Uplift</span>
                <span className="text-xs font-semibold text-primary">OPTIONAL</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-zinc-900 dark:text-white">₦</span>
                <Input type="number" value={weekend} onChange={(e) => { setWeekend(e.target.value); sync({ weekend_pricing: e.target.value }); }} className="pl-8 bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Applied to peak dates only; not included in the base estimate.</p>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-primary" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Host Commission & VAT</span>
              <span className="ml-auto text-xs font-mono text-zinc-400">6% + 7.5% VAT</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white">VAT on platform commission</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">7.5% of the 6% commission only — never on rent or caution</div>
              </div>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{money(fees.vatOnPlatformFee)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="size-4 text-primary" />
              No agency fee, agreement or legal fee, or stamp duty is charged to a shortlet guest.
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
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Guest Settlement Bill</span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">SHORTLET</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Base Booking Value</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">{money(fees.baseAmountKobo)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Caution Float (refundable)</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">{money(fees.escrowHoldAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Agency Fee</span>
                <span className="font-mono text-zinc-400">Not applicable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Agreement / Legal Fee</span>
                <span className="font-mono text-zinc-400">Not applicable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Gateway fee (local card, est.)</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">{money(fees.gatewayFee)}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Platform commission + VAT (host)</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">
                  − {money(fees.platformFeeKobo + fees.vatOnPlatformFee)}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Guest Pays at Checkout</span>
                <span className="text-xl font-mono font-bold text-primary">{money(fees.grossChargedToTenant)}</span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Host net payout at check-in</span>
                <span className="font-mono">{money(fees.landlordNetPayout)}</span>
              </div>
              <span className="text-xs text-zinc-400">Commission and VAT are deducted from the host payout; caution stays in escrow.</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl flex items-start gap-3">
            <FileText className="size-5 mt-0.5 text-primary" />
            <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                <Calculator className="size-4" /> Host-only settlement
              </span>
              <span>Rates are read from the admin-controlled platform fee config and reconciled through the Paystack split engine.</span>
            </div>
          </div>
        </div>
      </div>
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
