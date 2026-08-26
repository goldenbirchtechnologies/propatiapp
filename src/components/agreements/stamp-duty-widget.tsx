'use client';

import { useState } from 'react';
import { CheckCircle2, ExternalLink, Download, AlertCircle, Loader2, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export type StampDutyStatus = 'pending' | 'paid' | 'certificate_issued' | 'failed' | null;

interface StampDutyData {
  status: StampDutyStatus;
  amount?: number;
  remitaRrr?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  paidAt?: string;
}

interface StampDutyWidgetProps {
  agreementId: string;
  annualRent: number;
  stampDuty?: StampDutyData;
  onStatusChange?: (status: StampDutyStatus) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateDisplayAmount(annualRent: number): number {
  if (annualRent <= 10000) return 0;
  return Math.max(annualRent * 0.0078, 500);
}

export function StampDutyWidget({
  agreementId,
  annualRent,
  stampDuty,
  onStatusChange,
}: StampDutyWidgetProps) {
  const { toast } = useToast();
  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentRrr, setCurrentRrr] = useState<string | null>(stampDuty?.remitaRrr ?? null);
  const [currentStatus, setCurrentStatus] = useState<StampDutyStatus>(
    stampDuty?.status ?? null
  );
  const [certificateNumber, setCertificateNumber] = useState<string | null>(
    stampDuty?.certificateNumber ?? null
  );
  const [certificateUrl, setCertificateUrl] = useState<string | null>(
    stampDuty?.certificateUrl ?? null
  );

  const displayAmount = calculateDisplayAmount(annualRent);

  const handleInitiate = async () => {
    try {
      setInitiating(true);
      const res = await fetch('/api/stamp-duty/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to initiate stamp duty payment');
      }

      const { rrr, paymentUrl } = json.data;
      setCurrentRrr(rrr);

      window.open(paymentUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: 'Redirecting to payment',
        description: 'Complete your stamp duty payment on Remita, then return here to verify.',
      });
    } catch (error) {
      toast({
        title: 'Payment initiation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setInitiating(false);
    }
  };

  const handleVerify = async () => {
    if (!currentRrr) return;

    try {
      setVerifying(true);
      const res = await fetch('/api/stamp-duty/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rrr: currentRrr, agreementId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to verify payment');
      }

      const { paid, certificateNumber: certNum, certificateUrl: certUrl } = json.data;

      if (!paid) {
        toast({
          title: 'Payment not confirmed yet',
          description: 'Your payment has not been confirmed. Please complete payment on Remita first.',
          variant: 'destructive',
        });
        return;
      }

      const newStatus: StampDutyStatus = certNum ? 'certificate_issued' : 'paid';
      setCurrentStatus(newStatus);
      if (certNum) setCertificateNumber(certNum);
      if (certUrl) setCertificateUrl(certUrl);
      onStatusChange?.(newStatus);

      toast({
        title: 'Stamp duty paid',
        description: certNum
          ? `Certificate ${certNum} has been issued and endorsed on your agreement.`
          : 'Payment confirmed. Your certificate will be issued shortly.',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  if (displayAmount === 0) {
    return null;
  }

  if (currentStatus === 'certificate_issued' || currentStatus === 'paid') {
    return (
      <Card className="p-6 border-green-200 bg-emerald-500/10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-green-900">Stamp Duty Paid</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {currentStatus === 'certificate_issued' ? 'Certificate Issued' : 'Paid'}
              </Badge>
            </div>
            <p className="text-sm text-emerald-400 mb-3">
              Required by Nigerian Stamp Duties Act
            </p>
            {certificateNumber && (
              <div className="space-y-1">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Certificate:</span>{' '}
                  <span className="font-mono">{certificateNumber}</span>
                </p>
                {certificateUrl && (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-400 underline hover:text-green-900"
                  >
                    <Download className="h-3 w-3" />
                    Download e-Certificate
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-amber-200 bg-amber-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Stamp className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-amber-900">Stamp Duty Required</h3>
            <Badge variant="outline" className="border-amber-400 text-amber-700">
              Pending
            </Badge>
          </div>
          <p className="text-sm text-amber-700 mb-1">Required by Nigerian Stamp Duties Act</p>
          <p className="text-2xl font-bold text-amber-900 mb-3">
            {formatCurrency(displayAmount)}
          </p>
          <p className="text-xs text-amber-600 mb-4">
            0.78% of annual rent (₦{annualRent.toLocaleString('en-NG')}) — paid to FIRS via Remita
          </p>

          {currentStatus === 'failed' && (
            <div className="flex items-center gap-2 mb-3 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Previous payment attempt failed. Please try again.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!currentRrr ? (
              <Button
                onClick={handleInitiate}
                disabled={initiating}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {initiating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing payment...
                  </>
                ) : (
                  <>
                    <Stamp className="h-4 w-4 mr-2" />
                    Pay Stamp Duty
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleInitiate}
                  disabled={initiating}
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  {initiating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Open Payment Page
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      I&apos;ve Paid — Verify
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
