'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DCallout, DCheckboxRow, DField, DInput } from '@/components/onboarding/dossier/primitives';

type Props = {
  bankCode: string;
  accountNumber: string;
};

export default function PaystackPayoutValidation({ bankCode, accountNumber }: Props) {
  const [bvn, setBvn] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function validatePayoutAccount() {
    setError(null);
    setMessage(null);

    if (!consent) {
      setError('Please consent before sharing your BVN with Paystack.');
      return;
    }

    if (!/^\d{11}$/.test(bvn)) {
      setError('BVN must be exactly 11 digits.');
      return;
    }

    if (!bankCode || !/^\d{10,12}$/.test(accountNumber)) {
      setError('Select a bank and enter a valid account number first.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/paystack/dedicated-account/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, accountNumber, bankCode }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; status?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || 'Paystack could not validate this payout account.');
      }

      setBvn('');
      setMessage(
        payload?.status === 'active'
          ? 'Paystack payout account enabled.'
          : 'Paystack received the request. We will finish validation shortly.',
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Validation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5">
      <DCallout icon={<ShieldCheck className="h-4 w-4" />} title="Paystack payout validation" tone="neutral">
        BVN is not part of your Dojah identity profile. Paystack may request it separately for
        dedicated-account compliance. It is sent directly to Paystack for this payout account and
        is not saved by PropatiBox.
      </DCallout>

      <div className="mt-3 rounded-[8px] border border-[var(--outline-variant)] p-3">
        <DField label="BVN" note="11 digits" error={error ?? undefined}>
          <DInput
            value={bvn}
            onChange={(event) => setBvn(event.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="Enter BVN only when enabling Paystack payouts"
            inputMode="numeric"
            mono
            autoComplete="off"
          />
        </DField>

        <div className="mt-3">
          <DCheckboxRow id="paystack-bvn-consent" checked={consent} onCheckedChange={setConsent}>
            I consent to PropatiBox sending my BVN to Paystack solely to validate this payout
            account.
          </DCheckboxRow>
        </div>

        <button
          type="button"
          onClick={validatePayoutAccount}
          disabled={submitting || !consent || !bankCode || !accountNumber}
          className="mt-3 rounded-[6px] bg-[var(--accent)] px-3 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Validating…' : 'Enable Paystack payouts'}
        </button>

        {message ? <p className="mt-2 text-[12px] text-[var(--accent)]">{message}</p> : null}
      </div>
    </div>
  );
}
