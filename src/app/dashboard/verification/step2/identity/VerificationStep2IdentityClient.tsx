'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

type Props = {
  listingId: string;
  verificationId: string | null;
  l2IdType: string | null;
  l2Status: string | null;
  currentLayer: number;
  overallStatus: string | null;
  l1Status: string | null;
};

const ID_TYPES = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'bvn', label: 'Bank Verification Number (BVN)' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_licence', label: 'Driver\'s Licence' },
  { value: 'voters_card', label: "Voter's Card" },
];

function Step2IdentityClient(props: Props) {
  const [idType, setIdType] = useState(props.l2IdType || '');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(props.l2Status);

  const canProceed = props.l1Status === 'approved' || props.currentLayer >= 2;
  const isReadOnly = !['not_started', 'in_progress'].includes(props.overallStatus || '') || status === 'pending';

  const submitIdentity = async () => {
    if (!idType) {
      toast.error('Select an ID type');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/verification/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: props.verificationId,
          verificationType: idType === 'drivers_licence' ? 'nin' : idType === 'voters_card' ? 'nin' : idType,
          number: idNumber || '00000000000',
          firstName: '',
          lastName: '',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Identity verification failed');
      }

      const data = await res.json();
      setStatus('pending');
      toast.success('Identity verification submitted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = props.currentLayer >= 2 && props.l2Status === 'approved' ? 100 : props.currentLayer >= 2 ? 50 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {props.l2Status === 'approved' ? 'Identity verified successfully' : props.l2Status === 'rejected' ? 'Identity verification failed' : 'Complete identity verification to proceed'}
          </p>
        </CardContent>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canProceed ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">Please complete Layer 1 (Document upload) before proceeding.</p>
            </div>
          ) : status === 'approved' ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-[#00ff66]" />
              <p className="text-sm font-medium">Identity verified successfully.</p>
            </div>
          ) : status === 'pending' ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <Loader2 className="h-4 w-4 animate-spin text-warning" />
              <p className="text-sm">Identity verification in progress. This may take a few moments.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  disabled={isReadOnly}
                >
                  <option value="">Select ID type</option>
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter ID number"
                  className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  disabled={isReadOnly}
                />
              </div>
              <Button onClick={submitIdentity} disabled={submitting || isReadOnly || !idType} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Identity
              </Button>
            </>
          )}
        </CardContent>
      </div>

      <div className="flex justify-end">
        {props.l2Status === 'approved' && (
          <Button onClick={() => { window.location.href = `/dashboard/verification/step3/video?listingId=${props.listingId}`; }}>
            Continue to Step 3 <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default Step2IdentityClient;
