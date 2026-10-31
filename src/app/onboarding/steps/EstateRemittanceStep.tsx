'use client';

import { useState } from 'react';
import { Receipt, Landmark } from 'lucide-react';
import { onboardingEstateRemittanceSchema } from '@/lib/validators';
import {
  DCallout,
  DCheckboxRow,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const CYCLES = [
  { value: 'instant', label: 'Instant split transfer' },
  { value: 'monthly', label: 'Monthly cycle' },
  { value: 'annual', label: 'Annual disbursement' },
] as const;

const FEE_TYPES = [
  { value: 'percent', label: 'Percentage of rent' },
  { value: 'flat', label: 'Flat fee per tenancy' },
] as const;

/**
 * The client trust account. Tenant money is held here rather than in the
 * firm's operating account, and the remittance cycle decides when the owner
 * is paid net of management fee and withholding tax.
 */
export default function EstateRemittanceStep({ onSaved }: StepProps) {
  const [trustBankName, setTrustBankName] = useState('');
  const [trustAccountName, setTrustAccountName] = useState('');
  const [trustAccountNumber, setTrustAccountNumber] = useState('');
  const [remittanceCycle, setRemittanceCycle] = useState('monthly');
  const [managementFeeType, setManagementFeeType] = useState('percent');
  const [managementFeeValue, setManagementFeeValue] = useState('');
  const [whtInstructionAcknowledged, setWhtInstructionAcknowledged] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingEstateRemittanceSchema.safeParse({
      trustBankName,
      trustAccountName,
      trustAccountNumber,
      remittanceCycle,
      managementFeeType,
      managementFeeValue: managementFeeValue === '' ? undefined : Number(managementFeeValue),
      whtInstructionAcknowledged,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/estate/remittance', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Landmark className="h-4 w-4" />} title="Client trust account" className="mb-5">
        Tenant money must land in a designated client trust account, never an operating account.
        Rent is remitted to owners net of the management fee and any withholding tax.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Trust bank name" required error={fieldErrors.trustBankName}>
          <DInput
            value={trustBankName}
            onChange={(e) => setTrustBankName(e.target.value)}
            placeholder="e.g. GTBank"
          />
        </DField>

        <DField label="Trust account name" required error={fieldErrors.trustAccountName}>
          <DInput
            value={trustAccountName}
            onChange={(e) => setTrustAccountName(e.target.value)}
            placeholder="Golden Birch Client Trust"
          />
        </DField>

        <DField
          label="Trust account number"
          required
          note="NUBAN · 10–12 digits"
          error={fieldErrors.trustAccountNumber}
        >
          <DInput
            value={trustAccountNumber}
            onChange={(e) => setTrustAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="0123456789"
            inputMode="numeric"
            mono
          />
        </DField>

        <DField label="Remittance cycle" required error={fieldErrors.remittanceCycle}>
          <DSelect
            value={remittanceCycle}
            onChange={(e) => setRemittanceCycle(e.target.value)}
          >
            {CYCLES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </DSelect>
        </DField>
      </DGrid>

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]">
        <Receipt className="h-3.5 w-3.5" /> Management fee
      </p>

      <DGrid cols={2}>
        <DField label="Fee type" error={fieldErrors.managementFeeType}>
          <DSelect
            value={managementFeeType}
            onChange={(e) => setManagementFeeType(e.target.value)}
          >
            {FEE_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField
          label="Fee value"
          note={managementFeeType === 'percent' ? '%' : '₦'}
          error={fieldErrors.managementFeeValue}
          hint="Deducted before remittance, never added to the tenant's rent."
        >
          <DInput
            value={managementFeeValue}
            onChange={(e) => setManagementFeeValue(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={managementFeeType === 'percent' ? '10' : '50,000.00'}
            inputMode="decimal"
            mono
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DCheckboxRow
          id="estate-wht"
          checked={whtInstructionAcknowledged}
          onCheckedChange={setWhtInstructionAcknowledged}
        >
          I acknowledge withholding-tax protocols on rental income where applicable.
        </DCheckboxRow>
      </div>

      <StepActions saving={saving} error={error} saved={saved} label="Save remittance & finish" />
    </form>
  );
}
