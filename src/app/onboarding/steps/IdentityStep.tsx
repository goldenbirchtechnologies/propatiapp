'use client';

import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { onboardingIdentitySchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DPill,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const ID_TYPES = [
  { value: 'nin', label: 'National Identification Number (NIN)' },
  { value: 'bvn', label: 'Bank Verification Number (BVN)' },
  { value: 'passport', label: 'International passport' },
  { value: 'drivers_licence', label: "Driver's licence" },
  { value: 'voters_card', label: "Voter's card" },
] as const;

export default function IdentityStep({ facts, onSaved }: StepProps) {
  const [idType, setIdType] = useState<string>(facts.idType ?? 'nin');
  const [number, setNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingIdentitySchema.safeParse({ idType, number });
    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/identity', parsed.data);
  }

  if (facts.idVerified && !saved) {
    return (
      <div className="flex flex-col items-start gap-3">
        <DCallout icon={<ShieldCheck className="h-4 w-4" />} title="Identity verified">
          Your {ID_TYPES.find((t) => t.value === facts.idType)?.label ?? 'identity document'} has
          cleared the Prembly gateway. Listings, agreements and rent collections are unlocked.
        </DCallout>
        <DPill tone="mint">KYC complete</DPill>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Lock className="h-4 w-4" />} title="Encrypted at rest" className="mb-5">
        Your identity number is encrypted and hashed before it is stored, and is never printed back
        to the browser. Verification runs against the NIMC registry through Prembly.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Identity document" required error={fieldErrors.idType}>
          <DSelect value={idType} onChange={(e) => setIdType(e.target.value)}>
            {ID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField
          label="Document number"
          required
          note="Never displayed again"
          error={fieldErrors.number}
        >
          <DInput
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\s/g, '').slice(0, 20))}
            placeholder="e.g. 12345678901"
            inputMode="numeric"
            mono
          />
        </DField>
      </DGrid>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Verify identity"
        disabled={number.trim().length < 5}
        hint={
          facts.idVerified
            ? 'Verified. Submitting again replaces the stored record.'
            : 'This is optional, but skipping it leaves your account blocked.'
        }
      />
    </form>
  );
}
