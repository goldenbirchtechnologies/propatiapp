'use client';

import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, CircleAlert, FileCheck2, Landmark, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  LandlordCompletion,
  LandlordDocumentRow,
  LandlordPlatformFees,
  LandlordProfileValues,
  LandlordSectionId,
  LandlordSettlementView,
} from '@/lib/landlord-profile/types';
import { KeyValue } from './parts';

const percent = (rate: number): string => {
  const value = rate * 100;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
};

const entityLabel = (value: LandlordProfileValues['legalEntityType']): string => {
  if (value === 'company') return 'Company';
  if (value === 'joint') return 'Joint owners';
  if (value === 'individual') return 'Individual';
  return 'Not set';
};

const feeLabel = (value: LandlordProfileValues): string => {
  if (!value.managementFeeType || !value.managementFeeValue) return 'Not configured';
  return value.managementFeeType === 'percentage'
    ? `${value.managementFeeValue}% of rent`
    : `₦${Number(value.managementFeeValue).toLocaleString('en-NG')} / month`;
};

const settlementTone = (state: LandlordSettlementView['state']) => {
  if (state === 'verified') return 'success' as const;
  if (state === 'pending') return 'warning' as const;
  return 'secondary' as const;
};

const settlementLabel = (state: LandlordSettlementView['state']) => {
  if (state === 'verified') return 'Verified';
  if (state === 'pending') return 'Pending';
  return 'Not linked';
};

const sectionLabel: Record<LandlordSectionId, string> = {
  legal: 'Legal ownership',
  contact: 'Contact & address',
  tax: 'Tax & compliance',
  documents: 'Identity & documents',
  financial: 'Financial mandate',
};

export function OwnerSummaryPanel({
  profile,
  settlement,
  documents,
  completion,
  fees,
  onGoToSection,
}: {
  profile: LandlordProfileValues;
  settlement: LandlordSettlementView;
  documents: LandlordDocumentRow[];
  completion: LandlordCompletion;
  fees: LandlordPlatformFees;
  onGoToSection: (id: LandlordSectionId) => void;
}) {
  const nextSection = completion.sections.find((section) => !section.done);
  const verifiedDocs = documents.filter((doc) => doc.status === 'verified').length;

  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-4">
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60">
        <div className="border-b border-zinc-200 px-4 py-3.5 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Ownership record</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            A snapshot of the facts stored against your owner account.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 px-4 dark:divide-white/[0.06]">
          <div className="py-2.5">
            <KeyValue label="Entity">{entityLabel(profile.legalEntityType)}</KeyValue>
            <KeyValue label="Legal name">
              {profile.legalName || <span className="text-zinc-400">Not set</span>}
            </KeyValue>
            {profile.legalEntityType === 'company' && (
              <KeyValue label="RC number">
                {profile.companyRegistrationNumber || (
                  <span className="text-zinc-400">Not set</span>
                )}
              </KeyValue>
            )}
            {profile.legalEntityType === 'joint' && (
              <KeyValue label="Joint owners">
                {profile.jointOwnerNames ? profile.jointOwnerNames.split(/[;,]/).filter(Boolean).length : 0}
              </KeyValue>
            )}
          </div>
          <div className="py-2.5">
            <KeyValue label="Contact email">
              {profile.contactEmail || <span className="text-zinc-400">Not set</span>}
            </KeyValue>
            <KeyValue label="Phone">
              {profile.primaryPhone || <span className="text-zinc-400">Not set</span>}
            </KeyValue>
            <KeyValue label="Tax ID">
              {profile.taxIdType && profile.taxNumber
                ? `${profile.taxIdType.toUpperCase()} · ${profile.taxNumber}`
                : 'Not set'}
            </KeyValue>
          </div>
          <div className="py-2.5">
            <KeyValue label="Management fee">{feeLabel(profile)}</KeyValue>
            <KeyValue label="Documents">
              {documents.length === 0 ? (
                'None uploaded'
              ) : (
                <span className="inline-flex items-center gap-1">
                  <FileCheck2 className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {documents.length} uploaded
                  {verifiedDocs > 0 ? ` · ${verifiedDocs} verified` : ''}
                </span>
              )}
            </KeyValue>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Payout account</p>
          </div>
          <Badge variant={settlementTone(settlement.state)}>
            {settlement.state === 'verified' && <BadgeCheck className="h-3 w-3" aria-hidden />}
            {settlementLabel(settlement.state)}
          </Badge>
        </div>
        <div className="px-4 py-2.5">
          <KeyValue label="Bank">{settlement.bankName || 'Not linked'}</KeyValue>
          <KeyValue label="Account name">{settlement.accountName || 'Not linked'}</KeyValue>
          <KeyValue label="Account">{settlement.accountNumberMasked || 'Not linked'}</KeyValue>
        </div>
        {settlement.state !== 'verified' && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-white/[0.08]">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/dashboard/landlord?onboarding=1">
                Complete payout setup
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-white/[0.08]">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Platform fee schedule</p>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Set by PropatiBox. Read-only.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 px-4 dark:divide-white/[0.06]">
          <div className="py-2.5">
            <KeyValue label="Agency fee">{percent(fees.agencyFeeRate)}</KeyValue>
            <KeyValue label="Agreement fee">{percent(fees.agreementFeeRate)}</KeyValue>
            <KeyValue label="Caution deposit">{percent(fees.cautionDepositRate)}</KeyValue>
            <KeyValue label="VAT on platform fees">{percent(fees.vatRate)}</KeyValue>
          </div>
          <div className="py-2.5">
            <KeyValue label="Fee payer">
              {fees.platformFeePayer.replaceAll('_', ' ')}
            </KeyValue>
            <KeyValue label="Stamp duty">
              {fees.stampDutyInstrument.replaceAll('_', ' ')}
            </KeyValue>
          </div>
        </div>
      </div>

      {nextSection ? (
        <div
          className={cn(
            'rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4',
            'dark:border-amber-500/25 dark:bg-amber-500/10',
          )}
        >
          <div className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Next: {sectionLabel[nextSection.sectionId]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {nextSection.missing.length > 0
                  ? `Still needed: ${nextSection.missing.join(', ')}`
                  : 'Complete this section to strengthen your ownership record.'}
              </p>
              <button
                type="button"
                onClick={() => onGoToSection(nextSection.sectionId)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Go to section
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4 dark:border-primary/25 dark:bg-primary/10">
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Ownership record complete
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Every required section is stored. Keep documents current before they expire.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
