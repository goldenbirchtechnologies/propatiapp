'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import DojahWidgetClient from '@/components/verification/DojahWidgetClient';
import { toast } from 'sonner';

type Props = {
  listingId: string;
  verificationId: string | null;
  l2IdType: string | null;
  l2Status: string | null;
  currentLayer: number;
  overallStatus: string | null;
  l1Status: string | null;
};

export default function Step2IdentityClient(props: Props) {
  const [status, setStatus] = useState(props.l2Status);
  const [checking, setChecking] = useState(false);
  const canProceed = props.l1Status === 'approved' || props.currentLayer >= 2;

  async function completeLayer() {
    const response = await fetch('/api/verification/layer2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: props.listingId, idType: props.l2IdType || undefined }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || 'Could not update property verification.');
    setStatus('approved');
    toast.success('Identity verified for this property');
  }

  async function handleComplete(result: { success: boolean; error?: string }) {
    if (!result.success) {
      toast.error(result.error || 'Dojah verification failed');
      return;
    }
    setChecking(true);
    try {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const response = await fetch('/api/verification/dojah/status', { cache: 'no-store' });
        const json = await response.json().catch(() => ({}));
        const kycStatus = json?.data?.status;
        if (kycStatus === 'approved') {
          await completeLayer();
          return;
        }
        if (kycStatus === 'rejected') throw new Error('Dojah did not approve this identity.');
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
      }
      toast.message('Verification is still processing. Refresh shortly.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not complete verification.');
    } finally {
      setChecking(false);
    }
  }

  if (!canProceed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
        <AlertCircle className="h-5 w-5 text-warning" />
        Complete Layer 1 document review before starting identity verification.
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium">
        <CheckCircle2 className="h-5 w-5 text-[#006c49]" /> Identity verified successfully.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checking && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-warning" /> Waiting for Dojah to confirm the result…
        </div>
      )}
      <DojahWidgetClient
        type="identification"
        metadata={{ propertyVerificationId: props.verificationId, listingId: props.listingId }}
        triggerLabel="Verify property owner with Dojah"
        onComplete={handleComplete}
      />
    </div>
  );
}
