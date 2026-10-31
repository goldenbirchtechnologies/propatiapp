'use client';

import { useState } from 'react';
import { Building2, FileText } from 'lucide-react';
import { onboardingLandlordProfileSchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DSelect,
  DToggleChip,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const ENTITY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'joint', label: 'Joint owners' },
  { value: 'company', label: 'Company' },
] as const;

/**
 * Ownership entity decides what documentation the asset register demands: a
 * CAC number for a company, co-owner names for a joint holding, a NIN for an
 * individual.
 */
export default function LandlordProfileStep({ facts, onSaved }: StepProps) {
  const [legalEntityType, setLegalEntityType] = useState<string>('individual');
  const [legalName, setLegalName] = useState('');
  const [jointOwnerNames, setJointOwnerNames] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState(facts.phone ?? '');
  const [contactEmail, setContactEmail] = useState(facts.email ?? '');
  const [mailingAddress, setMailingAddress] = useState('');
  const [taxIdType, setTaxIdType] = useState<string>('tin');
  const [taxNumber, setTaxNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  const isCompany = legalEntityType === 'company';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingLandlordProfileSchema.safeParse({
      legalEntityType,
      legalName,
      jointOwnerNames: legalEntityType === 'joint' ? jointOwnerNames || undefined : undefined,
      companyName: isCompany ? companyName || undefined : undefined,
      primaryPhone,
      contactEmail,
      mailingAddress,
      taxIdType,
      taxNumber,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/landlord/profile', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Building2 className="h-4 w-4" />} title="Asset register" className="mb-5">
        Whatever entity holds the title is the entity that receives rent. A company must supply its
        CAC registration; joint owners are all named on the tenancy agreement.
      </DCallout>

      <DField label="Legal ownership entity" required className="mb-4">
        <div className="flex flex-wrap gap-2">
          {ENTITY_TYPES.map((t) => (
            <DToggleChip
              key={t.value}
              active={legalEntityType === t.value}
              onClick={() => setLegalEntityType(t.value)}
            >
              {t.label}
            </DToggleChip>
          ))}
        </div>
      </DField>

      <DGrid cols={2}>
        <DField
          label={isCompany ? 'Registered company name' : 'Full legal name'}
          required
          error={fieldErrors.legalName}
        >
          <DInput
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder={isCompany ? 'Golden Birch Holdings Ltd.' : 'Chukwuemeka A. Okafor'}
            autoComplete={isCompany ? 'organization' : 'name'}
          />
        </DField>

        {legalEntityType === 'joint' ? (
          <DField
            label="Joint owners"
            required
            note="Semicolon separated"
            error={fieldErrors.jointOwnerNames}
          >
            <DInput
              value={jointOwnerNames}
              onChange={(e) => setJointOwnerNames(e.target.value)}
              placeholder="Adaeze N. Okafor; Tunde B. Okafor"
            />
          </DField>
        ) : null}

        {isCompany ? (
          <DField label="Company name (as on CAC)" required error={fieldErrors.companyName}>
            <DInput
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Golden Birch Holdings Ltd."
            />
          </DField>
        ) : null}

        <DField label="Primary phone" required note="E.164" error={fieldErrors.primaryPhone}>
          <DInput
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            mono
          />
        </DField>

        <DField label="Contact email" required error={fieldErrors.contactEmail}>
          <DInput
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="owner@example.com"
            type="email"
            autoComplete="email"
          />
        </DField>
      </DGrid>

      <div className="mt-4">
        <DField
          label="Mailing address for official notices"
          required
          error={fieldErrors.mailingAddress}
          hint="Where statutory notices, demand letters and receipts are served."
        >
          <DInput
            value={mailingAddress}
            onChange={(e) => setMailingAddress(e.target.value)}
            placeholder="12 Adeola Odeku St, Victoria Island, Lagos"
            autoComplete="street-address"
          />
        </DField>
      </div>

      <div className="mt-4">
        <DCallout icon={<FileText className="h-4 w-4" />} title="Tax documentation" tone="neutral">
          Rental income is reported against this identifier. Propati does not file on your behalf.
        </DCallout>
      </div>

      <DGrid cols={2} className="mt-4">
        <DField label="Tax document type" required error={fieldErrors.taxIdType}>
          <DSelect value={taxIdType} onChange={(e) => setTaxIdType(e.target.value)}>
            <option value="tin">TIN — Tax Identification Number</option>
            <option value="nin">NIN — National Identification Number</option>
            <option value="other">Other tax code</option>
          </DSelect>
        </DField>

        <DField label="Tax number" required error={fieldErrors.taxNumber}>
          <DInput
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            placeholder="TIN / NIN"
            mono
          />
        </DField>
      </DGrid>

      <StepActions saving={saving} error={error} saved={saved} label="Save owner profile" />
    </form>
  );
}
