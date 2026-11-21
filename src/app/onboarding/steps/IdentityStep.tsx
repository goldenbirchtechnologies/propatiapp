'use client';

import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import DojahWidgetClient from '@/components/verification/DojahWidgetClient';
import PaystackDedicatedAccountCard from '@/components/payments/PaystackDedicatedAccountCard';
import { DCallout, DPill } from '@/components/onboarding/dossier/primitives';
import type { StepProps } from './types';

/** Identity is provider-hosted; PropatiBox never renders a raw NIN/BVN input. */
const ROLE_WIDGET_IDS: Record<string, string | undefined> = {
  tenant: process.env.NEXT_PUBLIC_DOJAH_TENANT_WIDGET_ID,
  landlord: process.env.NEXT_PUBLIC_DOJAH_LANDLORD_WIDGET_ID,
  agent: process.env.NEXT_PUBLIC_DOJAH_AGENT_WIDGET_ID,
  estate_manager: process.env.NEXT_PUBLIC_DOJAH_ESTATE_MANAGER_WIDGET_ID,
  admin: process.env.NEXT_PUBLIC_DOJAH_ADMIN_WIDGET_ID,
};

export default function IdentityStep({ role, facts, onSaved }: StepProps) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (facts.idVerified) {
    return (
      <div className="flex flex-col items-start gap-3">
        <DCallout icon={<ShieldCheck className="h-4 w-4" />} title="Identity verified">
          Your identity has cleared the Dojah KYC check. Listings, agreements and rent collections
          are unlocked according to your role.
        </DCallout>
        <DPill tone="mint">KYC complete</DPill>
        <PaystackDedicatedAccountCard />
      </div>
    );
  }

  async function handleComplete(result: { success: boolean; error?: string }) {
    if (!result.success) {
      setError(result.error || 'Dojah could not complete the verification. Please try again.');
      return;
    }

    setChecking(true);
    setError(null);
    try {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const response = await fetch('/api/verification/dojah/status', { cache: 'no-store' });
        const json = await response.json().catch(() => ({}));
        const status = json?.data?.status;
        if (status === 'approved') {
          await onSaved();
          return;
        }
        if (status === 'rejected') {
          setError('Your verification was not approved. Please retry with a clear document and good lighting.');
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
      }
      setError('Verification is still processing. Refresh this step shortly to see the latest status.');
    } catch {
      setError('We could not refresh your verification status. Please try again shortly.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-5">
      <DCallout icon={<Lock className="h-4 w-4" />} title="Secure identity check">
        Dojah securely collects your government ID and, when enabled in the widget configuration,
        BVN validation for your Paystack rent account. Liveness is optional for standard onboarding
        and may be requested later for higher-risk actions. PropatiBox receives the signed
        verification result rather than a raw NIN/BVN form submission.
      </DCallout>
      <DojahWidgetClient
        type="identification"
        widgetId={ROLE_WIDGET_IDS[role]}
        metadata={{ purpose: 'identity_and_dedicated_rent_account', role, liveness: 'optional' }}
        triggerLabel={checking ? 'Confirming verification…' : 'Verify securely with Dojah'}
        onComplete={handleComplete}
      />
      {error && <p className="text-sm font-medium text-[#ba1a1a]">{error}</p>}
    </div>
  );
}
