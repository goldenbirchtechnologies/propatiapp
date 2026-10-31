'use client';

import { useState } from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { onboardingAgentLicenseSchema } from '@/lib/validators';
import {
  DCallout,
  DCheckboxRow,
  DField,
  DGrid,
  DInput,
  DToggleChip,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

/**
 * Board registration plus indemnity cover. An agency must also hold a CAC
 * registration, so the entity toggle is what unlocks that field.
 */
export default function AgentLicenseStep({ onSaved }: StepProps) {
  const [board, setBoard] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isAgency, setIsAgency] = useState(false);
  const [cacDocumentFileName, setCacDocumentFileName] = useState('');
  const [indemnityPolicyNumber, setIndemnityPolicyNumber] = useState('');
  const [indemnityExpiryDate, setIndemnityExpiryDate] = useState('');
  const [codeOfConductConsent, setCodeOfConductConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingAgentLicenseSchema.safeParse({
      board,
      licenseNumber,
      isAgency,
      cacDocumentFileName: isAgency ? cacDocumentFileName || undefined : undefined,
      indemnityPolicyNumber: indemnityPolicyNumber || undefined,
      indemnityExpiryDate: indemnityExpiryDate || undefined,
      codeOfConductConsent: codeOfConductConsent ? true : undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/agent/license', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<BadgeCheck className="h-4 w-4" />} title="Board verification" className="mb-5">
        REDAN and the state real-estate boards publish their member registers. Your licence number is
        checked against the register before mandates can be executed.
      </DCallout>

      <DGrid cols={2}>
        <DField
          label="Real estate board"
          required
          note="REDAN / NIESV / regional"
          error={fieldErrors.board}
        >
          <DInput
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            placeholder="REDAN"
          />
        </DField>

        <DField label="Licence / certificate number" required error={fieldErrors.licenseNumber}>
          <DInput
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="REDAN-LAG-2024-00123"
            mono
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField label="Acting as" required>
          <div className="flex flex-wrap gap-2">
            <DToggleChip active={!isAgency} onClick={() => setIsAgency(false)}>
              Individual / freelancer
            </DToggleChip>
            <DToggleChip active={isAgency} onClick={() => setIsAgency(true)}>
              Agency / firm
            </DToggleChip>
          </div>
        </DField>
      </div>

      {isAgency ? (
        <div className="mt-4">
          <DField
            label="CAC registration document"
            note="File name"
            error={fieldErrors.cacDocumentFileName}
            hint="Required for an agency. Upload support is handled by the compliance team after intake."
          >
            <DInput
              value={cacDocumentFileName}
              onChange={(e) => setCacDocumentFileName(e.target.value)}
              placeholder="cac-certificate-2024.pdf"
            />
          </DField>
        </div>
      ) : null}

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <DGrid cols={2}>
        <DField
          label="Indemnity / E&O policy number"
          note="Optional"
          error={fieldErrors.indemnityPolicyNumber}
        >
          <DInput
            value={indemnityPolicyNumber}
            onChange={(e) => setIndemnityPolicyNumber(e.target.value)}
            placeholder="AXA-PI-2024-8891"
          />
        </DField>

        <DField
          label="Indemnity expiry"
          note="Optional"
          error={fieldErrors.indemnityExpiryDate}
        >
          <DInput
            type="date"
            value={indemnityExpiryDate}
            onChange={(e) => setIndemnityExpiryDate(e.target.value)}
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DCheckboxRow
          id="agent-code-of-conduct"
          checked={codeOfConductConsent}
          onCheckedChange={setCodeOfConductConsent}
        >
          I confirm background clearance and assent to fair-housing guidelines and the ethical code
          of conduct.
        </DCheckboxRow>
        {fieldErrors.codeOfConductConsent ? (
          <p className="mt-1 text-[11px] font-medium leading-[14px] text-[#ba1a1a]">
            {fieldErrors.codeOfConductConsent}
          </p>
        ) : null}
      </div>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save licensing"
        disabled={!codeOfConductConsent}
        hint={
          codeOfConductConsent ? undefined : (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Code of conduct assent is required.
            </span>
          )
        }
      />
    </form>
  );
}
