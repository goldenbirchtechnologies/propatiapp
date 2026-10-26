'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
  Loader2,
  Stamp,
  Building2,
  User,
  Link2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export type StampDutyStatus = 'pending' | 'paid' | 'certificate_issued' | 'failed' | null;

export interface StampDutyData {
  status: StampDutyStatus;
  amount?: number;
  remitaRrr?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  paidAt?: string;
  authority?: string | null;
  instrument?: string | null;
  basis?: string | null;
  taxableAmount?: number | null;
  payerType?: string | null;
  payerName?: string | null;
  payerRcNumber?: string | null;
  linkageHash?: string | null;
}

interface StampDutyWidgetProps {
  agreementId: string;
  /** Annual rent, used only as a fallback if the server quote fails. */
  annualRent?: number;
  stampDuty?: StampDutyData;
  onStatusChange?: (status: StampDutyStatus) => void;
}

type Quote = {
  agreementId: string;
  instrument: string;
  basis: string;
  rate: number;
  annualRent: number;
  taxableAmount: number;
  amount: number;
  leaseTermMonths: number;
  authority: string;
  authorityLabel: string;
  authorityState: string | null;
  payerType: string;
  payerName: string;
  payerRcNumber: string | null;
  payers: {
    landlord: { type: string; name: string; rcNumber: string | null };
    tenant: { type: string; name: string; rcNumber: string | null };
  };
  propertyAddress: string;
  alreadyStamped: boolean;
  existingStatus: string | null;
  existingRrr: string | null;
  payable: boolean;
};

const INSTRUMENT_LABEL: Record<string, string> = {
  residential_tenancy: 'Residential tenancy',
  commercial_lease: 'Commercial / corporate lease',
  short_let: 'Short-let tenancy',
  sale_conveyance: 'Conveyance on sale',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function StampDutyWidget({
  agreementId,
  annualRent = 0,
  stampDuty,
  onStatusChange,
}: StampDutyWidgetProps) {
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [currentRrr, setCurrentRrr] = useState<string | null>(stampDuty?.remitaRrr ?? null);
  const [currentStatus, setCurrentStatus] = useState<StampDutyStatus>(stampDuty?.status ?? null);
  const [certificateNumber, setCertificateNumber] = useState<string | null>(stampDuty?.certificateNumber ?? null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(stampDuty?.certificateUrl ?? null);
  const [linkageHash, setLinkageHash] = useState<string | null>(stampDuty?.linkageHash ?? null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/stamp-duty/quote?agreementId=${encodeURIComponent(agreementId)}`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not assess stamp duty');
        if (!cancelled) setQuote(json.data as Quote);
      } catch (e) {
        if (!cancelled) setQuoteError(e instanceof Error ? e.message : 'Could not assess stamp duty');
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agreementId]);

  const handleInitiate = async () => {
    try {
      setInitiating(true);
      const res = await fetch('/api/stamp-duty/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Failed to initiate stamp duty payment');

      setCurrentRrr(json.data.rrr);
      if (json.data.mock) {
        toast({
          title: 'Test mode',
          description: 'Remita is not configured — this reference will not collect real duty.',
        });
      }
      window.open(json.data.paymentUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Redirecting to payment',
        description: 'Complete the duty on Remita, then return here to verify.',
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
      if (!res.ok) throw new Error(json.message || json.error || 'Failed to verify payment');

      const { paid, certificateNumber: certNum, certificateUrl: certUrl, linkageHash: hash } = json.data;
      if (!paid) {
        toast({
          title: 'Payment not confirmed yet',
          description: 'Remita has not confirmed this payment. Complete it, then verify again.',
          variant: 'destructive',
        });
        return;
      }

      const newStatus: StampDutyStatus = certNum ? 'certificate_issued' : 'paid';
      setCurrentStatus(newStatus);
      if (certNum) setCertificateNumber(certNum);
      if (certUrl) setCertificateUrl(certUrl);
      if (hash) setLinkageHash(hash);
      onStatusChange?.(newStatus);

      toast({
        title: 'Stamp duty settled',
        description: certNum
          ? `Certificate ${certNum} issued and endorsed on the agreement.`
          : 'Payment confirmed. The certificate will issue shortly.',
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

  const copyHash = async () => {
    if (!linkageHash) return;
    try {
      await navigator.clipboard.writeText(linkageHash);
      toast({ title: 'Integrity hash copied' });
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' });
    }
  };

  if (loadingQuote) {
    return (
      <Card className="p-5 border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Assessing stamp duty…
        </div>
      </Card>
    );
  }

  // Nothing to remit for this instrument, or the assessment could not be made.
  if (quoteError) {
    return (
      <Card className="p-5 border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">{quoteError}</p>
        </div>
      </Card>
    );
  }

  if (!quote || (!quote.amount && !quote.alreadyStamped)) {
    return (
      <Card className="p-5 border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-start gap-3">
          <Stamp className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-900 dark:text-white">No stamp duty payable</p>
            <p className="mt-1">
              The taxable amount
              {quote ? ` (${formatCurrency(quote.taxableAmount)})` : ''} is at or below the statutory
              threshold, so this instrument does not require stamping.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const settled = currentStatus === 'certificate_issued' || currentStatus === 'paid';
  const PayerIcon = quote.payerType === 'corporate' ? Building2 : User;
  const basisLabel =
    quote.basis === 'annual_rent'
      ? "One year's rent"
      : `Total rent over ${quote.leaseTermMonths} months`;
  const rateLabel = `${(quote.rate * 100).toFixed(2)}%`;

  const assessmentRows = (
    <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
      <div className="flex justify-between gap-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Instrument</dt>
        <dd className="text-right font-medium text-zinc-900 dark:text-white">
          {INSTRUMENT_LABEL[quote.instrument] ?? quote.instrument}
        </dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Duty basis</dt>
        <dd className="text-right font-medium text-zinc-900 dark:text-white">{basisLabel}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Taxable amount</dt>
        <dd className="text-right font-mono text-zinc-900 dark:text-white">
          {formatCurrency(quote.taxableAmount)}
        </dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Rate</dt>
        <dd className="text-right font-mono text-zinc-900 dark:text-white">{rateLabel}</dd>
      </div>
      <div className="flex justify-between gap-2 sm:col-span-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Collecting authority</dt>
        <dd className="text-right font-medium text-zinc-900 dark:text-white">{quote.authorityLabel}</dd>
      </div>
      <div className="flex items-center justify-between gap-2 sm:col-span-2">
        <dt className="text-zinc-500 dark:text-zinc-400">Named on certificate</dt>
        <dd className="flex items-center gap-1.5 text-right font-medium text-zinc-900 dark:text-white">
          <PayerIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {quote.payerName}
            {quote.payerRcNumber ? ` (RC ${quote.payerRcNumber})` : ''}
          </span>
        </dd>
      </div>
    </dl>
  );

  if (settled) {
    return (
      <Card className="border-emerald-200 bg-emerald-500/[0.06] p-6 dark:border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Stamp duty settled</h3>
              <Badge className="border-emerald-200 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300">
                {currentStatus === 'certificate_issued' ? 'Certificate issued' : 'Paid'}
              </Badge>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Stamped under the Stamp Duties Act, CAP S8, LFN 2004 — the instrument is admissible in
              evidence.
            </p>
            {assessmentRows}
            <div className="mt-3 space-y-1.5">
              {certificateNumber && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">Certificate:</span>{' '}
                  <span className="font-mono">{certificateNumber}</span>
                </p>
              )}
              {certificateUrl && (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
                >
                  <Download className="h-3 w-3" />
                  Download e-certificate
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {linkageHash && (
                <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-2 dark:bg-white/[0.04]">
                  <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Integrity hash
                    </p>
                    <p className="break-all font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                      {linkageHash}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyHash}
                    className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    aria-label="Copy integrity hash"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
          <Stamp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Stamp duty required</h3>
            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
              Pending
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            An unstamped instrument cannot be tendered in a Nigerian court — settle the duty to make
            this agreement admissible.
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(quote.amount)}
          </p>
          {assessmentRows}

          {currentStatus === 'failed' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Previous payment attempt failed. Please try again.</span>
            </div>
          )}

          {!quote.payable && (
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Duty can be remitted once the agreement is fully signed. Either party may settle it.
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!currentRrr ? (
              <Button
                onClick={handleInitiate}
                disabled={initiating || !quote.payable}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {initiating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing payment…
                  </>
                ) : (
                  <>
                    <Stamp className="mr-2 h-4 w-4" />
                    Remit stamp duty
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleInitiate}
                  disabled={initiating}
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-300"
                >
                  {initiating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Open payment page
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      I&apos;ve paid — verify
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
          {currentRrr && (
            <p className="mt-2 font-mono text-[11px] text-zinc-500">RRR {currentRrr}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
