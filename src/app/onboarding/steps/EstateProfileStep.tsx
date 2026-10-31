'use client';

import { useState } from 'react';
import { Landmark } from 'lucide-react';
import { onboardingEstateProfileSchema } from '@/lib/validators';
import {
  DCallout,
  DCheckboxRow,
  DField,
  DGrid,
  DInput,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

/**
 * The operator entity: CAC registration for a corporate firm, and the NIESV /
 * ESVARBON professional credential for the licensed surveyor behind it.
 */
export default function EstateProfileStep({ facts, onSaved }: StepProps) {
  const [legalEntityName, setLegalEntityName] = useState('');
  const [isCorporate, setIsCorporate] = useState(true);
  const [cacTinNumber, setCacTinNumber] = useState('');
  const [professionalCredentialNumber, setProfessionalCredentialNumber] = useState('');
  const [professionalCredentialBoard, setProfessionalCredentialBoard] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState(facts.phone ?? '');
  const [emergencyHotline, setEmergencyHotline] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingEstateProfileSchema.safeParse({
      legalEntityName,
      isCorporate,
      cacTinNumber: cacTinNumber || undefined,
      professionalCredentialNumber: professionalCredentialNumber || undefined,
      professionalCredentialBoard: professionalCredentialBoard || undefined,
      officeAddress,
      businessPhone: businessPhone || undefined,
      emergencyHotline: emergencyHotline || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/estate/profile', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Landmark className="h-4 w-4" />} title="Professional standing" className="mb-5">
        Estate management is a regulated profession. The firm entity and the individual surveyor
        credential are both recorded, because the mandate is signed by the firm and executed by the
        surveyor.
      </DCallout>

      <DField label="Legal operator entity" required error={fieldErrors.legalEntityName}>
        <DInput
          value={legalEntityName}
          onChange={(e) => setLegalEntityName(e.target.value)}
          placeholder="Golden Birch Estate Management Ltd."
          autoComplete="organization"
        />
      </DField>

      <div className="mt-3">
        <DCheckboxRow
          id="estate-is-corporate"
          checked={isCorporate}
          onCheckedChange={setIsCorporate}
        >
          Operating as a registered corporate entity, not a sole practitioner.
        </DCheckboxRow>
      </div>

      <DGrid cols={2} className="mt-4">
        <DField label="CAC / TIN number" note="Optional" error={fieldErrors.cacTinNumber}>
          <DInput
            value={cacTinNumber}
            onChange={(e) => setCacTinNumber(e.target.value)}
            placeholder="RC-1849204 / TIN 12345678-0001"
            mono
          />
        </DField>

        <DField
          label="Professional credential"
          note="NIESV / ESVARBON"
          error={fieldErrors.professionalCredentialNumber}
        >
          <DInput
            value={professionalCredentialNumber}
            onChange={(e) => setProfessionalCredentialNumber(e.target.value)}
            placeholder="ESV-2024-00123"
            mono
          />
        </DField>

        <DField
          label="Credential issuing board"
          note="Optional"
          error={fieldErrors.professionalCredentialBoard}
        >
          <DInput
            value={professionalCredentialBoard}
            onChange={(e) => setProfessionalCredentialBoard(e.target.value)}
            placeholder="NIESV"
          />
        </DField>

        <DField label="Business phone" note="Optional" error={fieldErrors.businessPhone}>
          <DInput
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            mono
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField
          label="Primary office address"
          required
          error={fieldErrors.officeAddress}
          hint="The address on your professional registration."
        >
          <DInput
            value={officeAddress}
            onChange={(e) => setOfficeAddress(e.target.value)}
            placeholder="12 Adeola Odeku St, Victoria Island, Lagos"
            autoComplete="street-address"
          />
        </DField>
      </div>

      <div className="mt-4">
        <DField
          label="Emergency hotline"
          note="Optional"
          error={fieldErrors.emergencyHotline}
          hint="Shown to tenants for urgent building faults."
        >
          <DInput
            value={emergencyHotline}
            onChange={(e) => setEmergencyHotline(e.target.value)}
            placeholder="+234 801 234 5679"
            inputMode="tel"
            mono
          />
        </DField>
      </div>

      <StepActions saving={saving} error={error} saved={saved} label="Save operator profile" />
    </form>
  );
}
