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

/**
 * Dojah verifies NIN and BVN only. The step previously offered passport,
 * driver's licence and voter's card as well, but `onboardingIdentitySchema`
 * accepts nothing but `nin | bvn`, so those three choices could never submit.
 */
const ID_TYPES = [
  { value: 'nin', label: 'National Identification Number (NIN)' },
  { value: 'bvn', label: 'Bank Verification Number (BVN)' },
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
          cleared the Dojah identity check. Listings, agreements and rent collections are unlocked.
        </DCallout>
        <DPill tone="mint">KYC complete</DPill>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Lock className="h-4 w-4" />} title="Encrypted at rest" className="mb-5">
        Your identity number is encrypted and hashed before it is stored, and is never printed back
        to the browser. Verification runs against the national identity registry through Dojah.
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
          note="11 digits · never displayed again"
          error={fieldErrors.number}
        >
          <DInput
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
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
        disabled={number.trim().length !== 11}
        hint={
          facts.idVerified
            ? 'Verified. Submitting again replaces the stored record.'
            : 'This is optional, but skipping it leaves your account blocked.'
        }
      />
    </form>
  );
}
