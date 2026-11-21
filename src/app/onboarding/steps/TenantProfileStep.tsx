'use client';

import { useEffect, useState } from 'react';
import { HeartHandshake, Home, Loader2, UserRound } from 'lucide-react';
import {
  DCallout,
  DCurrency,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { StepActions } from './_shared';
import type { StepProps } from './types';

type ProfileDraft = {
  dateOfBirth: string;
  gender: string;
  nationality: string;
  stateOfResidence: string;
  maritalStatus: string;
  nokName: string;
  nokPhone: string;
  nokRelationship: string;
  preferredState: string;
  preferredBedrooms: string;
  maxMonthlyBudget: string;
  otherIncomeSources: string;
};

const EMPTY: ProfileDraft = {
  dateOfBirth: '',
  gender: '',
  nationality: 'NG',
  stateOfResidence: '',
  maritalStatus: '',
  nokName: '',
  nokPhone: '',
  nokRelationship: '',
  preferredState: '',
  preferredBedrooms: '',
  maxMonthlyBudget: '',
  otherIncomeSources: '',
};

export default function TenantProfileStep({ onSaved }: StepProps) {
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/users/me/tenant-profile', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your profile.');
        const json = await response.json();
        const dossier = json.data?.dossier ?? {};
        if (!active) return;
        setDraft({
          dateOfBirth: dossier.dateOfBirth ? String(dossier.dateOfBirth).slice(0, 10) : '',
          gender: dossier.gender ?? '',
          nationality: dossier.nationality ?? 'NG',
          stateOfResidence: dossier.stateOfResidence ?? '',
          maritalStatus: dossier.maritalStatus ?? '',
          nokName: dossier.nokName ?? '',
          nokPhone: dossier.nokPhone ?? '',
          nokRelationship: dossier.nokRelationship ?? '',
          preferredState: dossier.preferredState ?? '',
          preferredBedrooms: dossier.preferredBedrooms == null ? '' : String(dossier.preferredBedrooms),
          maxMonthlyBudget: dossier.maxMonthlyBudget == null ? '' : String(dossier.maxMonthlyBudget),
          otherIncomeSources: dossier.otherIncomeSources ?? '',
        });
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Could not load your profile.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setError(null);
  }

  async function saveSection(section: string, data: Record<string, unknown>) {
    const response = await fetch('/api/users/me/tenant-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) throw new Error(json?.error ?? 'Could not save your profile.');
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await saveSection('personal', {
        dateOfBirth: draft.dateOfBirth || null,
        gender: draft.gender || null,
        nationality: draft.nationality || null,
        stateOfResidence: draft.stateOfResidence || null,
        maritalStatus: draft.maritalStatus || null,
      });
      await saveSection('nextOfKin', {
        nokName: draft.nokName || null,
        nokPhone: draft.nokPhone || null,
        nokRelationship: draft.nokRelationship || null,
      });
      await saveSection('financial', { otherIncomeSources: draft.otherIncomeSources || null });
      await saveSection('preferences', {
        preferredState: draft.preferredState || null,
        preferredBedrooms: draft.preferredBedrooms === '' ? null : Number(draft.preferredBedrooms),
        maxMonthlyBudget: draft.maxMonthlyBudget === '' ? null : Number(draft.maxMonthlyBudget),
      });
      setSaved(true);
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 py-8 text-sm text-[var(--on-surface-variant)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading your profile…</div>;
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <div>
      <DCallout icon={<UserRound className="h-4 w-4" />} title="Your profile, in one place" className="mb-5">
        These details help us tailor property matches and applications. Optional fields can be left blank and completed later from your profile.
      </DCallout>

      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]"><UserRound className="h-3.5 w-3.5" /> Personal details</p>
      <DGrid cols={2}>
        <DField label="Date of birth" note="Optional"><DInput type="date" value={draft.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></DField>
        <DField label="Gender" note="Optional"><DSelect value={draft.gender} onChange={(e) => update('gender', e.target.value)} placeholder="Choose an option"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></DSelect></DField>
        <DField label="Nationality" required hint="Use the two-letter country code, for example NG."><DInput value={draft.nationality} onChange={(e) => update('nationality', e.target.value.toUpperCase().slice(0, 2))} placeholder="NG" /></DField>
        <DField label="State of residence" required><DInput value={draft.stateOfResidence} onChange={(e) => update('stateOfResidence', e.target.value)} placeholder="Lagos" /></DField>
        <DField label="Marital status" required><DSelect value={draft.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} placeholder="Choose an option"><option value="single">Single</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option></DSelect></DField>
      </DGrid>

      <div className="my-6 h-px w-full bg-[var(--surface-container-high)]" />
      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]"><HeartHandshake className="h-3.5 w-3.5" /> Next of kin</p>
      <DGrid cols={2}>
        <DField label="Full name" required><DInput value={draft.nokName} onChange={(e) => update('nokName', e.target.value)} placeholder="Ada Okafor" /></DField>
        <DField label="Phone number" required><DInput value={draft.nokPhone} onChange={(e) => update('nokPhone', e.target.value)} placeholder="+234 801 234 5678" inputMode="tel" mono /></DField>
        <DField label="Relationship" required><DInput value={draft.nokRelationship} onChange={(e) => update('nokRelationship', e.target.value)} placeholder="Sister" /></DField>
      </DGrid>

      <div className="my-6 h-px w-full bg-[var(--surface-container-high)]" />
      <p className="dossier-eyebrow mb-3 flex items-center gap-1.5 text-[var(--on-surface-variant)]"><Home className="h-3.5 w-3.5" /> Rental preferences</p>
      <DGrid cols={2}>
        <DField label="Preferred state" required><DInput value={draft.preferredState} onChange={(e) => update('preferredState', e.target.value)} placeholder="Lagos" /></DField>
        <DField label="Bedrooms" required><DInput type="number" min="0" max="20" value={draft.preferredBedrooms} onChange={(e) => update('preferredBedrooms', e.target.value)} placeholder="2" inputMode="numeric" /></DField>
        <DField label="Maximum monthly budget" required><DCurrency value={draft.maxMonthlyBudget} onChange={(e) => update('maxMonthlyBudget', e.target.value)} placeholder="450000" inputMode="numeric" /></DField>
        <DField label="Other income sources" note="Optional"><DInput value={draft.otherIncomeSources} onChange={(e) => update('otherIncomeSources', e.target.value)} placeholder="Investments, freelance work, or none" /></DField>
      </DGrid>

      <StepActions saving={saving} error={error} saved={saved} label="Save personal profile" />
      </div>
    </form>
  );
}
