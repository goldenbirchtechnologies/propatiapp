'use client';

import { useState } from 'react';
import { Scale, ScrollText } from 'lucide-react';
import { onboardingEstateAuthoritySchema } from '@/lib/validators';
import {
  DCallout,
  DCheckboxRow,
  DCurrency,
  DField,
  DGrid,
  DInput,
  DTextarea,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

/**
 * The mandate. Without an executed management agreement or a Power of
 * Attorney, a manager has no standing to sign a tenancy, serve a Quit Notice
 * or receive rent on the owner's behalf.
 */
export default function EstateAuthorityStep({ onSaved }: StepProps) {
  const [hasManagementAgreement, setHasManagementAgreement] = useState(false);
  const [agreementFileName, setAgreementFileName] = useState('');
  const [evictionAuthority, setEvictionAuthority] = useState(false);
  const [evictionAuthorityNote, setEvictionAuthorityNote] = useState('');
  const [minIncomeThreshold, setMinIncomeThreshold] = useState('');
  const [guarantorRequirementNote, setGuarantorRequirementNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingEstateAuthoritySchema.safeParse({
      hasManagementAgreement,
      agreementFileName: agreementFileName || undefined,
      evictionAuthority,
      evictionAuthorityNote: evictionAuthorityNote || undefined,
      minIncomeThreshold: minIncomeThreshold === '' ? undefined : Number(minIncomeThreshold),
      guarantorRequirementNote: guarantorRequirementNote || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/estate/authority', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<ScrollText className="h-4 w-4" />} title="Legal mandate" className="mb-5">
        The Management Agreement or Power of Attorney is the document that lets you act for the
        owner. Without it, agreements you sign are not binding on the landlord.
      </DCallout>

      <DCheckboxRow
        id="estate-management-agreement"
        checked={hasManagementAgreement}
        onCheckedChange={setHasManagementAgreement}
      >
        An executed Property Management Agreement or Power of Attorney grants this firm legal
        authority to act on behalf of the landlord.
      </DCheckboxRow>

      <div className="mt-4">
        <DField
          label="Agreement document"
          note="File name · optional"
          error={fieldErrors.agreementFileName}
        >
          <DInput
            value={agreementFileName}
            onChange={(e) => setAgreementFileName(e.target.value)}
            placeholder="management-agreement-2024.pdf"
          />
        </DField>
      </div>

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <DCheckboxRow
        id="estate-eviction-authority"
        checked={evictionAuthority}
        onCheckedChange={setEvictionAuthority}
      >
        Authorised to serve statutory notices — Quit Notices, Demand Notices — and to handle tenancy
        disputes on the owner&apos;s behalf.
      </DCheckboxRow>

      <div className="mt-4">
        <DField
          label="Eviction authority note"
          note="Optional"
          error={fieldErrors.evictionAuthorityNote}
          hint="Cite the clause that confers the power."
        >
          <DTextarea
            value={evictionAuthorityNote}
            onChange={(e) => setEvictionAuthorityNote(e.target.value)}
            placeholder="Authorised per clause 4.2 of the management agreement."
            rows={2}
          />
        </DField>
      </div>

      <div className="mt-4">
        <DCallout icon={<Scale className="h-4 w-4" />} title="Screening parameters" tone="neutral">
          These thresholds are applied to every application against your portfolio.
        </DCallout>
      </div>

      <DGrid cols={2} className="mt-4">
        <DField
          label="Minimum income threshold"
          note="₦ / month"
          error={fieldErrors.minIncomeThreshold}
        >
          <DCurrency
            value={minIncomeThreshold}
            onChange={(e) => setMinIncomeThreshold(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="300,000.00"
            inputMode="decimal"
          />
        </DField>

        <DField
          label="Guarantor requirement"
          note="Optional"
          error={fieldErrors.guarantorRequirementNote}
        >
          <DInput
            value={guarantorRequirementNote}
            onChange={(e) => setGuarantorRequirementNote(e.target.value)}
            placeholder="Two guarantors, one a civil servant"
          />
        </DField>
      </DGrid>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save authority"
        disabled={!hasManagementAgreement}
      />
    </form>
  );
}
