'use client';

import { useMemo, useState } from 'react';
import { Banknote, Calculator, FileText, Percent, Stamp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_PLATFORM_CONFIG } from '@/lib/platform-config';
import { calculateListingFees } from '@/lib/listing-fees';

interface FeeBreakdownProps {
  monthlyRent: number;
  pricePeriod?: string;
  leaseTermMonths?: number;
  listingType?: string;
}

const money = (value: number) =>
  `₦ ${Math.round(value).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

export default function FeeBreakdown({
  monthlyRent,
  pricePeriod = 'month',
  leaseTermMonths = 12,
  listingType = 'rent',
}: FeeBreakdownProps) {
  const shortlet = listingType === 'short_let';
  const sale = listingType === 'sale';
  const [agencyRate, setAgencyRate] = useState('0.1');
  const [legalRate, setLegalRate] = useState('0.05');

  const fees = useMemo(
    () =>
      calculateListingFees({
        monthlyRent,
        pricePeriod,
        leaseTermMonths,
        listingType,
        agencyFeeRate: Number(agencyRate),
        agreementFeeRate: Number(legalRate),
      }),
    [monthlyRent, pricePeriod, leaseTermMonths, listingType, agencyRate, legalRate]
  );

  if (monthlyRent <= 0) {
    return (
      <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/[0.06] rounded-xl">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Calculator className="size-4" />
          <span className="text-xs font-medium">Enter an amount to see the fee breakdown</span>
        </div>
      </div>
    );
  }

  const baseLabel = shortlet ? 'Base Booking Value' : sale ? 'Sale Price' : 'Annual Base Rent';
  const baseDetail = shortlet
    ? pricePeriod === 'night'
      ? 'Nightly rate · fees assessed per night'
      : 'Fixed-stay price'
    : pricePeriod === 'year' || pricePeriod === 'total'
      ? 'Fixed term amount'
      : `${money(monthlyRent)} × 12 months`;

  const cautionRate = DEFAULT_PLATFORM_CONFIG.transactionFees.shortlet.cautionDepositRate;
  const caution = fees.baseAmount * cautionRate;

  const lineItems = shortlet
    ? [
        { label: baseLabel, value: fees.baseAmount, detail: baseDetail, icon: FileText },
        {
          label: 'Agency Fee',
          value: 0,
          detail: 'Not charged on shortlets',
          icon: Percent,
        },
        {
          label: 'Agreement / Legal Fee',
          value: 0,
          detail: 'Not charged on shortlets',
          icon: FileText,
        },
        {
          label: 'Platform Commission (host-only)',
          value: fees.platformFee,
          detail: '6% of booking value · deducted from host payout',
          icon: Calculator,
        },
        {
          label: 'VAT on Platform Commission',
          value: fees.vatOnPlatformFee,
          detail: '7.5% of the platform fee only',
          icon: Percent,
        },
        {
          label: 'Caution Deposit (refundable)',
          value: caution,
          detail: `${Math.round(cautionRate * 100)}% held in escrow · 0% platform fee`,
          icon: Banknote,
        },
      ]
    : sale
      ? [
          { label: baseLabel, value: fees.baseAmount, detail: baseDetail, icon: FileText },
          {
            label: 'Platform Commission',
            value: fees.platformFee,
            detail: '1% of sale value · deducted from agent/developer commission',
            icon: Calculator,
          },
          {
            label: 'VAT on Platform Commission',
            value: fees.vatOnPlatformFee,
            detail: '7.5% of the platform fee only',
            icon: Percent,
          },
        ]
      : [
          { label: baseLabel, value: fees.annualRent, detail: baseDetail, icon: FileText },
          {
            label: 'Agreement / Legal Fee',
            value: fees.agreementFee,
            detail: `${Math.round(fees.agreementFeeRate * 100)}% of annual rent`,
            icon: FileText,
          },
          {
            label: 'Agency Fee',
            value: fees.agencyFee,
            detail: `${Math.round(fees.agencyFeeRate * 100)}% of annual rent · maximum 10%`,
            icon: Percent,
          },
          {
            label: 'Stamp Duty',
            value: fees.stampDuty,
            detail:
              fees.stampDuty === 0 ? 'Below ₦10,000 threshold' : '0.78% of annual rent (statutory)',
            icon: Stamp,
          },
          {
            label: 'Platform Fee (3.5%)',
            value: fees.platformFee,
            detail: 'Taken from the agency fee, split with landlord if short',
            icon: Calculator,
          },
          {
            label: 'VAT on Platform Fee',
            value: fees.vatOnPlatformFee,
            detail: '7.5% of the platform fee only',
            icon: Percent,
          },
        ];

  return (
    <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/[0.06] rounded-xl space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-primary" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Fee Breakdown</span>
          <Badge variant="secondary" className="text-[10px]">ESTIMATE</Badge>
        </div>
        {shortlet && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">GUEST PLATFORM FEE 0%</span>
        )}
      </div>

      {!shortlet && !sale && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Agency fee rate</span>
            <Select value={agencyRate} onValueChange={setAgencyRate}>
              <SelectTrigger className="h-7 w-24 text-xs bg-white dark:bg-white/[0.04]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="0.05">5%</SelectItem>
                <SelectItem value="0.1">10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Legal fee rate</span>
            <Select value={legalRate} onValueChange={setLegalRate}>
              <SelectTrigger className="h-7 w-24 text-xs bg-white dark:bg-white/[0.04]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.05">5%</SelectItem>
                <SelectItem value="0.075">7.5%</SelectItem>
                <SelectItem value="0.1">10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {lineItems.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 py-1">
            <div className="flex items-start gap-2">
              <item.icon className="size-3.5 mt-0.5 text-zinc-400" />
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">{item.label}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{item.detail}</div>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-900 dark:text-white whitespace-nowrap">
              {money(item.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {shortlet ? 'Guest Pays at Check-in' : sale ? 'Buyer Pays' : 'Total Initial Payable'}
          </span>
          <span className="text-lg font-mono font-bold text-primary">
            {money(shortlet ? fees.baseAmount + caution : fees.totalInitialPayable)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>{shortlet ? 'Host net payout (after 6% + VAT)' : 'Net after platform fee & VAT'}</span>
          <span className="font-mono">{money(fees.hostNetPayout)}</span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
          {shortlet
            ? 'Shortlets have no agency or agreement/legal fee. VAT applies only to the platform commission; caution is refunded after checkout.'
            : sale
              ? 'VAT applies to the platform commission only. No agency or agreement fee is added to the buyer’s price.'
              : `Includes annual rent, ${Math.round(fees.agreementFeeRate * 100)}% agreement fee, ${Math.round(fees.agencyFeeRate * 100)}% agency fee and statutory stamp duty (0.78%). Refundable caution deposit is excluded.`}
        </p>
      </div>
    </div>
  );
}
