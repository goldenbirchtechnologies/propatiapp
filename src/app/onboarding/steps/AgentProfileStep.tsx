'use client';

import { useState } from 'react';
import { IdCard, PhoneCall } from 'lucide-react';
import { onboardingAgentProfileSchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

export default function AgentProfileStep({ facts, onSaved }: StepProps) {
  const [legalName, setLegalName] = useState(facts.fullName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState(facts.phone ?? '');
  const [corporateEmail, setCorporateEmail] = useState(facts.email ?? '');
  const [ninOrBvnOrTin, setNinOrBvnOrTin] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingAgentProfileSchema.safeParse({
      legalName,
      dateOfBirth: dateOfBirth || undefined,
      homeAddress: homeAddress || undefined,
      businessPhone,
      corporateEmail: corporateEmail || undefined,
      ninOrBvnOrTin: ninOrBvnOrTin || undefined,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/agent/profile', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<IdCard className="h-4 w-4" />} title="Brokerage register" className="mb-5">
        The name on this section is matched against your board registration in the next step, so use
        the legal name exactly as it appears on your licence.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Full legal name" required error={fieldErrors.legalName}>
          <DInput
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Tunde Balogun"
            autoComplete="name"
          />
        </DField>

        <DField label="Date of birth" note="Optional" error={fieldErrors.dateOfBirth}>
          <DInput
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </DField>

        <DField label="Business phone" required note="E.164" error={fieldErrors.businessPhone}>
          <DInput
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            mono
          />
        </DField>

        <DField label="Corporate email" note="Optional" error={fieldErrors.corporateEmail}>
          <DInput
            type="email"
            value={corporateEmail}
            onChange={(e) => setCorporateEmail(e.target.value)}
            placeholder="agent@brokerage.ng"
            autoComplete="email"
          />
        </DField>

        <DField label="NIN / BVN / TIN" note="Optional" error={fieldErrors.ninOrBvnOrTin}>
          <DInput
            value={ninOrBvnOrTin}
            onChange={(e) => setNinOrBvnOrTin(e.target.value.replace(/\s/g, ''))}
            placeholder="22XXXXXXXXX"
            mono
          />
        </DField>

        <DField label="Home address" note="Optional" error={fieldErrors.homeAddress}>
          <DInput
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
            placeholder="12 Adeola Odeku St, Victoria Island"
            autoComplete="street-address"
          />
        </DField>
      </DGrid>

      <div className="my-5 h-px w-full bg-[var(--surface-container-high)]" />

      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]">
        <PhoneCall className="h-3.5 w-3.5" /> Emergency contact
      </p>

      <DGrid cols={3}>
        <DField label="Contact name" required error={fieldErrors.emergencyContactName}>
          <DInput
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
            placeholder="Aisha Balogun"
          />
        </DField>

        <DField label="Contact phone" required error={fieldErrors.emergencyContactPhone}>
          <DInput
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            mono
          />
        </DField>

        <DField label="Relationship" required error={fieldErrors.emergencyContactRelationship}>
          <DInput
            value={emergencyContactRelationship}
            onChange={(e) => setEmergencyContactRelationship(e.target.value)}
            placeholder="Spouse"
          />
        </DField>
      </DGrid>

      <StepActions saving={saving} error={error} saved={saved} label="Save professional profile" />
    </form>
  );
}
