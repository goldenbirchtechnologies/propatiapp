'use client';

import { useState } from 'react';
import { Handshake } from 'lucide-react';
import { onboardingGuarantorSchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DTextarea,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

/**
 * The guarantor deed is the last thing that makes a rental dossier admissible
 * for stamp duty, so the relationship and contact are both required.
 */
export default function GuarantorStep({ facts, onSaved }: StepProps) {
  const [guarantorName, setGuarantorName] = useState(facts.guarantorName ?? '');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorRelationship, setGuarantorRelationship] = useState(
    facts.guarantorRelationship ?? ''
  );
  const [guarantorAddress, setGuarantorAddress] = useState('');
  const [guarantorOccupation, setGuarantorOccupation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingGuarantorSchema.safeParse({
      guarantorName,
      guarantorPhone,
      guarantorRelationship,
      guarantorAddress: guarantorAddress || undefined,
      guarantorOccupation: guarantorOccupation || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/guarantor', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Handshake className="h-4 w-4" />} title="Guarantor deed" className="mb-5">
        Your guarantor is contacted once, by SMS, to confirm the relationship. They are not shown
        your income, your identity numbers or your tenancy terms.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Guarantor full name" required error={fieldErrors.guarantorName}>
          <DInput
            value={guarantorName}
            onChange={(e) => setGuarantorName(e.target.value)}
            placeholder="e.g. Adaeze N. Okafor"
            autoComplete="name"
          />
        </DField>

        <DField
          label="Guarantor phone"
          required
          note="E.164"
          error={fieldErrors.guarantorPhone}
        >
          <DInput
            value={guarantorPhone}
            onChange={(e) => setGuarantorPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            mono
          />
        </DField>

        <DField label="Relationship" required error={fieldErrors.guarantorRelationship}>
          <DInput
            value={guarantorRelationship}
            onChange={(e) => setGuarantorRelationship(e.target.value)}
            placeholder="e.g. Parent, uncle, employer"
          />
        </DField>

        <DField label="Occupation" note="Optional" error={fieldErrors.guarantorOccupation}>
          <DInput
            value={guarantorOccupation}
            onChange={(e) => setGuarantorOccupation(e.target.value)}
            placeholder="e.g. Civil servant"
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField label="Guarantor address" note="Optional" error={fieldErrors.guarantorAddress}>
          <DTextarea
            value={guarantorAddress}
            onChange={(e) => setGuarantorAddress(e.target.value)}
            placeholder="Street, city, state"
            rows={2}
          />
        </DField>
      </div>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save guarantor & finish"
        hint="This is the last section of your tenant dossier."
      />
    </form>
  );
}
