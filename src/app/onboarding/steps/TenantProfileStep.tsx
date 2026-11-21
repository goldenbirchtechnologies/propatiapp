'use client';

import { useEffect, useState } from 'react';
import { HeartHandshake, Home, Loader2, MessageSquare, Phone, ShieldCheck, UserRound } from 'lucide-react';
import {
  DCallout,
  DCurrency,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { StepActions, firstIssue } from './_shared';
import { onboardingContactSchema, onboardingPhoneVerifySchema } from '@/lib/validators';
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
  const [phone, setPhone] = useState('');
  const [phonePhase, setPhonePhase] = useState<'request' | 'verify' | 'done'>(
    'request'
  );
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
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
        setPhone(json.data?.profile?.phone ?? '');
        setPhonePhase(json.data?.profile?.phoneVerified ? 'done' : 'request');
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

  async function requestPhoneCode() {
    setError(null);
    const parsed = onboardingContactSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/onboarding/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.message ?? json?.error ?? 'Could not send the code.');
      setDevCode(json?.data?.devCode ?? null);
      setPhonePhase('verify');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send the code.'); }
    finally { setSaving(false); }
  }

  async function verifyPhone() {
    setError(null);
    const parsed = onboardingPhoneVerifySchema.safeParse({ code });
    if (!parsed.success) { setError(firstIssue(parsed.error)); return; }
    setSaving(true);
    try {
      const response = await fetch('/api/onboarding/phone/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.message ?? json?.error ?? 'That code did not work.');
      setPhonePhase('done'); setCode('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'That code did not work.'); }
    finally { setSaving(false); }
  }

  async function save() {
    if (phonePhase !== 'done') {
      setError('Verify your mobile number before saving this profile.');
      return;
    }
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
      <DCallout icon={<MessageSquare className="h-4 w-4" />} title="Contact information" className="mb-5">
        Verify the mobile number PropatiBox should use for property, agreement and payment updates.
      </DCallout>
      {phonePhase === 'done' ? (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[8px] bg-[rgba(0,108,73,0.08)] p-3 text-[13px] text-[var(--on-surface)]">
          <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-medium">{phone} is verified.</span>
          <button type="button" onClick={() => setPhonePhase('request')} className="text-[12px] font-semibold text-[var(--accent)] hover:underline">Use another number</button>
        </div>
      ) : (
        <div className="mb-6 rounded-[8px] bg-[var(--surface-container-low)] p-4">
          <DGrid cols={2}>
            <DField label="Mobile number" required note="E.164">
              <DInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 801 234 5678" inputMode="tel" mono disabled={phonePhase === 'verify'} />
            </DField>
            {phonePhase === 'verify' ? <DField label="Six-digit code" required hint={devCode ? `Development mode — your code is ${devCode}.` : 'Check your SMS inbox.'}><DInput value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" autoComplete="one-time-code" mono /></DField> : null}
          </DGrid>
          <div className="mt-4 flex flex-wrap gap-2">
            {phonePhase === 'request' ? <button type="button" onClick={() => void requestPhoneCode()} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--primary-container)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"><Phone className="h-4 w-4" /> Send verification code</button> : <button type="button" onClick={() => void verifyPhone()} disabled={saving || code.length !== 6} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[var(--primary-container)] px-4 text-[13px] font-semibold text-white disabled:opacity-50"><ShieldCheck className="h-4 w-4" /> Verify number</button>}
          </div>
        </div>
      )}
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
