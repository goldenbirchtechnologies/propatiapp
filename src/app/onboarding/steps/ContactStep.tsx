'use client';

import { useState } from 'react';
import { Loader2, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { onboardingContactSchema, onboardingPhoneVerifySchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DPill,
} from '@/components/onboarding/dossier/primitives';
import { maskPhone } from '@/components/onboarding/dossier/role-meta';
import { issuesOf, firstIssue, StepActions } from './_shared';
import type { StepProps } from './types';

/**
 * Two-phase GSM verification: request a code, then prove receipt.
 *
 * The API echoes the code in development (`devCode`) so the flow can be
 * exercised without an SMS provider; that value is only ever shown when
 * `NODE_ENV !== 'production'`.
 */
export default function ContactStep({ facts, onSaved }: StepProps) {
  const [phase, setPhase] = useState<'request' | 'verify' | 'done'>(
    facts.phoneVerified ? 'done' : 'request'
  );
  const [phone, setPhone] = useState(facts.phone ?? '');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function requestCode() {
    setError(null);
    setFieldError(null);

    const parsed = onboardingContactSchema.safeParse({ phone });
    if (!parsed.success) {
      setFieldError(issuesOf(parsed.error).phone ?? firstIssue(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not send the code.');
      setDevCode(json.data?.devCode ?? null);
      setPhase('verify');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
    } finally {
      setSaving(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = onboardingPhoneVerifySchema.safeParse({ code });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'That code did not work.');
      setPhase('done');
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work.');
    } finally {
      setSaving(false);
    }
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-start gap-3">
        <DCallout icon={<ShieldCheck className="h-4 w-4" />} title="Number verified">
          {maskPhone(phone || facts.phone)} can now receive agreements, rent notices and payment
          receipts from Propati.
        </DCallout>
        <DPill tone="mint">Verified</DPill>
        <button
          type="button"
          onClick={() => {
            setPhase('request');
            setCode('');
          }}
          className="text-[12px] font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Use a different number
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={verify}>
      <DCallout icon={<MessageSquare className="h-4 w-4" />} title="SMS + WhatsApp" className="mb-5">
        A six-digit code is sent to your GSM number. It expires in five minutes, and three codes may
        be requested per fifteen.
      </DCallout>

      <DGrid cols={2}>
        <DField
          label="GSM number"
          required
          note="E.164"
          error={fieldError ?? undefined}
          hint="Nigerian numbers only for now — +234 prefix."
        >
          <DInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            inputMode="tel"
            autoComplete="tel"
            disabled={phase === 'verify'}
            mono
          />
        </DField>

        {phase === 'verify' ? (
          <DField
            label="Six-digit code"
            required
            note="Expires in 5 min"
            error={error ?? undefined}
            hint={
              devCode
                ? `Development mode — your code is ${devCode}.`
                : 'Check your SMS inbox.'
            }
          >
            <DInput
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              mono
              autoFocus
            />
          </DField>
        ) : null}
      </DGrid>

      {phase === 'request' ? (
        <StepActions
          saving={saving}
          error={error}
          saved={false}
          label="Send verification code"
          hint="We never share your number with other users."
        />
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--surface-container-high)] pt-4">
          <button
            type="submit"
            disabled={saving || code.length !== 6}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--primary-container)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--primary)] disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            Verify number
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase('request');
              setCode('');
              setError(null);
              setDevCode(null);
            }}
            className="text-[12px] font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
          >
            Resend code
          </button>
          {error ? <p className="text-[12px] font-medium text-[#ba1a1a]">{error}</p> : null}
        </div>
      )}
    </form>
  );
}
