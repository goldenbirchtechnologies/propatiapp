'use client';

import { useState } from 'react';
import { Landmark, Wallet } from 'lucide-react';
import { onboardingLandlordSettlementSchema } from '@/lib/validators';
import {
  DCallout,
  DCheckboxRow,
  DCurrency,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { formatNaira } from '@/components/onboarding/dossier/role-meta';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const LEASE_TERMS = [
  { value: '6m', label: '6 months' },
  { value: '12m', label: '12 months' },
  { value: '24m', label: '24 months' },
  { value: 'flexible', label: 'Flexible' },
] as const;

/**
 * Where rent lands and how the caution deposit is ring-fenced. The commission
 * consent is a literal `true` in the schema, so it cannot be submitted
 * unchecked.
 */
export default function LandlordSettlementStep({ onSaved }: StepProps) {
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bvn, setBvn] = useState('');
  const [targetMonthlyRent, setTargetMonthlyRent] = useState('');
  const [targetAnnualRent, setTargetAnnualRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [preferredLeaseDuration, setPreferredLeaseDuration] = useState('12m');
  const [commissionConsent, setCommissionConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  const monthly = Number(targetMonthlyRent);
  const derivedAnnual = Number.isFinite(monthly) && monthly > 0 ? monthly * 12 : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingLandlordSettlementSchema.safeParse({
      bankName,
      accountName,
      accountNumber,
      bvn: bvn || undefined,
      targetMonthlyRent: targetMonthlyRent === '' ? undefined : Number(targetMonthlyRent),
      targetAnnualRent: targetAnnualRent === '' ? undefined : Number(targetAnnualRent),
      securityDeposit: securityDeposit === '' ? undefined : Number(securityDeposit),
      preferredLeaseDuration,
      commissionConsent: commissionConsent ? true : undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/landlord/settlement', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Landmark className="h-4 w-4" />} title="Settlement account" className="mb-5">
        Rent is collected into a protected collection account and swept to this NUBAN. The account
        name must match the ownership entity captured in the previous section.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Bank name" required error={fieldErrors.bankName}>
          <DInput
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. GTBank"
          />
        </DField>

        <DField label="Account name" required error={fieldErrors.accountName}>
          <DInput
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="As it appears on the statement"
          />
        </DField>

        <DField
          label="Account number"
          required
          note="NUBAN · 10–12 digits"
          error={fieldErrors.accountNumber}
        >
          <DInput
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="0123456789"
            inputMode="numeric"
            mono
          />
        </DField>

        <DField
          label="BVN"
          note="Optional · 11 digits"
          error={fieldErrors.bvn}
          hint="Speeds up name matching on the settlement account."
        >
          <DInput
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="22XXXXXXXXX"
            inputMode="numeric"
            mono
          />
        </DField>
      </DGrid>

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]">
        <Wallet className="h-3.5 w-3.5" /> Rent expectations
      </p>

      <DGrid cols={3}>
        <DField
          label="Target monthly rent"
          note="₦"
          error={fieldErrors.targetMonthlyRent}
          hint={derivedAnnual != null ? `${formatNaira(derivedAnnual)} per annum` : undefined}
        >
          <DCurrency
            value={targetMonthlyRent}
            onChange={(e) => setTargetMonthlyRent(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="500,000.00"
            inputMode="decimal"
          />
        </DField>

        <DField label="Annual target" note="₦" error={fieldErrors.targetAnnualRent}>
          <DCurrency
            value={targetAnnualRent}
            onChange={(e) => setTargetAnnualRent(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={derivedAnnual != null ? String(derivedAnnual) : '6,000,000.00'}
            inputMode="decimal"
          />
        </DField>

        <DField
          label="Security deposit"
          note="₦"
          error={fieldErrors.securityDeposit}
          hint="Ring-fenced, not released to you at intake."
        >
          <DCurrency
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="500,000.00"
            inputMode="decimal"
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField label="Preferred lease duration" error={fieldErrors.preferredLeaseDuration}>
          <DSelect
            value={preferredLeaseDuration}
            onChange={(e) => setPreferredLeaseDuration(e.target.value)}
          >
            {LEASE_TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </DSelect>
        </DField>
      </div>

      <div className="mt-4">
        <DCheckboxRow
          id="commission-consent"
          checked={commissionConsent}
          onCheckedChange={setCommissionConsent}
        >
          I acknowledge the agency commission percentages, the maintenance reserve cap and the
          one-off onboarding fee.
        </DCheckboxRow>
        {fieldErrors.commissionConsent ? (
          <p className="mt-1 text-[11px] font-medium leading-[14px] text-[#ba1a1a]">
            {fieldErrors.commissionConsent}
          </p>
        ) : null}
      </div>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save settlement"
        disabled={!commissionConsent}
      />
    </form>
  );
}
