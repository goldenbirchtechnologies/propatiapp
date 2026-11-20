'use client';

import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Landmark, ReceiptText, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  LandlordPlatformFees,
  LandlordProfileValues,
  LandlordSettlementView,
} from '@/lib/landlord-profile/types';
import { KeyValue, SelectField, SubSection, TextField } from '../_components/parts';

const percent = (rate: number): string => {
  const value = rate * 100;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
};

const settlementVariant = (state: LandlordSettlementView['state']) => {
  if (state === 'verified') return 'success' as const;
  if (state === 'pending') return 'warning' as const;
  return 'secondary' as const;
};

const settlementLabel = (state: LandlordSettlementView['state']) => {
  if (state === 'verified') return 'Verified';
  if (state === 'pending') return 'Pending';
  return 'Not linked';
};

export function SectionFinancialMandate({
  profile,
  settlement,
  fees,
  onChange,
}: {
  profile: LandlordProfileValues;
  settlement: LandlordSettlementView;
  fees: LandlordPlatformFees;
  onChange: (patch: Partial<LandlordProfileValues>) => void;
}) {
  const feeType = profile.managementFeeType;
  const isPercentage = feeType === 'percentage';

  return (
    <div className="space-y-5">
      <SubSection
        title="Payout account"
        description="Cleared rent is paid only to the verified settlement account on your account."
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-zinc-400" aria-hidden />
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {settlement.bankName || 'No bank linked'}
              </p>
              <Badge variant={settlementVariant(settlement.state)}>
                {settlement.state === 'verified' && <BadgeCheck className="h-3 w-3" aria-hidden />}
                {settlementLabel(settlement.state)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {settlement.accountName || 'Account name not available'}
              {settlement.accountNumberMasked ? ` · ${settlement.accountNumberMasked}` : ''}
            </p>
          </div>
          {settlement.state !== 'verified' && (
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/landlord?onboarding=1">
                Complete payout setup
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
        <p className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
          {settlement.state === 'verified'
            ? 'Payouts are active. Rent is routed to this account after the tenant payment clears.'
            : 'Payouts stay on hold until the settlement account is verified. You can still receive and manage tenancies.'}
        </p>
      </SubSection>

      <SubSection
        title="Management fee mandate"
        description="Your own fee for managing this property. This is separate from PropatiBox platform fees."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="managementFeeType"
            label="Fee type"
            value={feeType ?? ''}
            options={[
              { value: 'percentage', label: 'Percentage of rent' },
              { value: 'fixed', label: 'Fixed amount per month' },
            ]}
            onChange={(value) => {
              const next = (value || null) as LandlordProfileValues['managementFeeType'];
              onChange({
                managementFeeType: next,
                ...(next ? {} : { managementFeeValue: '' }),
              });
            }}
            allowEmpty
            emptyLabel="No management fee"
            hint="Leave unset if you manage the property yourself."
          />
          <TextField
            id="managementFeeValue"
            label={isPercentage ? 'Percentage' : 'Monthly amount'}
            value={profile.managementFeeValue}
            onChange={(value) => {
              const digits = value.replace(/[^\d]/g, '');
              if (isPercentage && digits && Number(digits) > 100) return;
              if (digits.length > 7) return;
              onChange({ managementFeeValue: digits });
            }}
            placeholder={isPercentage ? '10' : '50000'}
            inputMode="numeric"
            disabled={!feeType}
            hint={
              feeType
                ? isPercentage
                  ? 'Whole percent of collected rent, up to 100.'
                  : 'Whole naira amount per month.'
                : 'Choose a fee type first.'
            }
          />
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-white/[0.08] dark:text-zinc-400">
          <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            {feeType
              ? isPercentage
                ? `A ${profile.managementFeeValue || '0'}% management fee will be recorded against rent collections for this owner.`
                : `A fixed ₦${Number(profile.managementFeeValue || 0).toLocaleString('en-NG')} monthly management fee will be recorded against this owner.`
              : 'No management fee is configured. Rent collection and payouts are unaffected.'}
          </p>
        </div>
      </SubSection>

      <SubSection
        title="Platform fee schedule"
        description="Set centrally by PropatiBox. These rates are shown for transparency and cannot be edited here."
      >
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
            <KeyValue label="Agency fee">{percent(fees.agencyFeeRate)}</KeyValue>
            <KeyValue label="Agreement fee">{percent(fees.agreementFeeRate)}</KeyValue>
            <KeyValue label="Caution deposit">{percent(fees.cautionDepositRate)}</KeyValue>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
            <KeyValue label="VAT on platform fees">{percent(fees.vatRate)}</KeyValue>
            <KeyValue label="Fee payer">{fees.platformFeePayer.replaceAll('_', ' ')}</KeyValue>
            <KeyValue label="Stamp duty instrument">
              {fees.stampDutyInstrument.replaceAll('_', ' ')}
            </KeyValue>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ReceiptText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            Platform fees are applied when a tenancy or payment is processed. They are not a
            deduction from your management fee mandate.
          </p>
        </div>
      </SubSection>
    </div>
  );
}
