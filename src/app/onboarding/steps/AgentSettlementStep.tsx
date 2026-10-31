'use client';

import { useState } from 'react';
import { Smartphone, Wallet } from 'lucide-react';
import { onboardingAgentSettlementSchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DSelect,
  DTextarea,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const DEVICES = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'both', label: 'Both' },
] as const;

export default function AgentSettlementStep({ onSaved }: StepProps) {
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [commissionSplitPercent, setCommissionSplitPercent] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('');
  const [primaryDeviceOs, setPrimaryDeviceOs] = useState('android');
  const [crmNotes, setCrmNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingAgentSettlementSchema.safeParse({
      bankName,
      accountName,
      accountNumber,
      commissionSplitPercent:
        commissionSplitPercent === '' ? undefined : Number(commissionSplitPercent),
      subscriptionTier: subscriptionTier || undefined,
      primaryDeviceOs,
      crmNotes: crmNotes || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/agent/settlement', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Wallet className="h-4 w-4" />} title="Commission escrow" className="mb-5">
        Commission settles to this NUBAN the moment a tenancy payment clears — not at the end of the
        month. Multi-party splits are distributed in the same transaction.
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
            placeholder="T. Balogun / Balogun Realty Ltd."
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
          label="Commission split"
          note="% · optional"
          error={fieldErrors.commissionSplitPercent}
          hint="Your share of the agency commission."
        >
          <DInput
            value={commissionSplitPercent}
            onChange={(e) => setCommissionSplitPercent(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="10"
            inputMode="decimal"
            mono
          />
        </DField>
      </DGrid>

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]">
        <Smartphone className="h-3.5 w-3.5" /> Field workflow
      </p>

      <DGrid cols={2}>
        <DField label="Subscription tier" note="Optional" error={fieldErrors.subscriptionTier}>
          <DInput
            value={subscriptionTier}
            onChange={(e) => setSubscriptionTier(e.target.value)}
            placeholder="Premium lead generation"
          />
        </DField>

        <DField label="Primary device" error={fieldErrors.primaryDeviceOs}>
          <DSelect
            value={primaryDeviceOs}
            onChange={(e) => setPrimaryDeviceOs(e.target.value)}
          >
            {DEVICES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </DSelect>
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField label="CRM / field tool notes" note="Optional" error={fieldErrors.crmNotes}>
          <DTextarea
            value={crmNotes}
            onChange={(e) => setCrmNotes(e.target.value)}
            placeholder="e.g. Zoho CRM; inspection photos captured in-app."
            rows={2}
          />
        </DField>
      </div>

      <StepActions saving={saving} error={error} saved={saved} label="Save settlement" />
    </form>
  );
}
