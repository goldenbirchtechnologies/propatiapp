'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, Download, Clock, CheckCircle2, XCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAgreement } from '@/hooks/useAgreements';
import { AgreementStatusBadge } from '@/components/agreements/agreement-status-badge';
import { RentScheduleTable, type RentScheduleEntry } from '@/components/agreements/rent-schedule-table';
import { StampDutyWidget } from '@/components/agreements/stamp-duty-widget';
import { useToast } from '@/hooks/use-toast';

export default function AgreementDetailClient() {
  const params = useParams<{ role: string; id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const role = (params.role as 'landlord' | 'tenant') || 'tenant';
  const agreementId = params.id as string;

  const { data: agreement, isLoading } = useAgreement(agreementId);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`/api/agreements/${agreementId}/pdf`);
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement-${agreementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Download Complete',
        description: 'Agreement PDF has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setSharing(true);
      const res = await fetch(`/api/agreements/${agreementId}/send-whatsapp`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp');
      toast({
        title: 'WhatsApp Link Sent',
        description: `Agreement update sent to the party on WhatsApp.`,
        className: 'bg-success/10 border-green-200 text-[#00ff66]',
      });
    } catch (error) {
      toast({
        title: 'WhatsApp Delivery Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  const handleSignAgreement = () => {
    router.push(`/dashboard/${role}/agreements/${agreementId}/sign`);
  };

  const canUserSign = () => {
    if (!agreement) return false;
    if (role === 'landlord' && ['pending_landlord', 'tenant_signed'].includes(agreement.status)) {
      return true;
    }
    if (role === 'tenant' && ['pending_tenant', 'landlord_signed'].includes(agreement.status)) {
      return true;
    }
    return false;
  };

  const getWaitingMessage = () => {
    if (!agreement) return '';
    if (role === 'landlord' && agreement.status === 'landlord_signed') {
      return 'Waiting for tenant signature';
    }
    if (role === 'tenant' && agreement.status === 'tenant_signed') {
      return 'Waiting for landlord signature';
    }
    return '';
  };

  const rentSchedule: RentScheduleEntry[] = agreement?.status === 'fully_signed'
    ? [
        {
          id: '1',
          dueDate: agreement.startDate || new Date().toISOString(),
          type: 'deposit',
          amount: agreement.cautionDeposit || 0,
          status: 'pending',
        },
        {
          id: '2',
          dueDate: agreement.startDate || new Date().toISOString(),
          type: 'rent',
          amount: agreement.rentAmount || 0,
          status: 'pending',
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-obsidian-800/30 rounded w-1/3"></div>
          <div className="h-64 bg-obsidian-800/30 rounded"></div>
          <div className="h-48 bg-obsidian-800/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-12 text-center">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Agreement Not Found</h2>
          <p className="text-neutral-400 mb-6">
            The agreement you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push(`/dashboard/${role}/agreements`)}>
            Back to Agreements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agreement Details</h1>
            <p className="text-neutral-400">
              Agreement ID: <span className="font-mono">{agreement.id}</span>
            </p>
          </div>
          <AgreementStatusBadge status={agreement.status} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canUserSign() && (
            <Button onClick={handleSignAgreement} size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Review & Sign Agreement
            </Button>
          )}
          {agreement.status === 'fully_signed' && (
            <Button onClick={handleDownloadPDF} variant="outline" disabled={downloading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          )}
          {(agreement.status === 'pending_tenant' || agreement.status === 'pending_landlord' || agreement.status === 'fully_signed') && (
            <Button onClick={handleSendWhatsApp} variant="outline" disabled={sharing}>
              <Share2 className="h-4 w-4 mr-2" />
              {sharing ? 'Sending...' : 'Send on WhatsApp'}
            </Button>
          )}
        </div>

        {/* Waiting Message */}
        {getWaitingMessage() && (
          <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <p className="text-white font-medium">{getWaitingMessage()}</p>
          </div>
        )}
      </div>

      {/* Property Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Property Information</h2>
        <div className="flex gap-4">
          {agreement.listing?.photos?.[0] && (
            <img
              src={agreement.listing.photos[0]}
              alt={agreement.listing.title}
              className="w-32 h-32 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{agreement.listing?.title}</h3>
            <p className="text-neutral-400">{agreement.listing?.address}</p>
            <div className="flex gap-4 text-sm">
              {agreement.listing?.bedrooms && (
                <span className="flex items-center gap-1 text-neutral-400">
                  <FileText className="h-4 w-4" /> {agreement.listing.bedrooms} Bedrooms
                </span>
              )}
              {agreement.listing?.bathrooms && (
                <span className="flex items-center gap-1 text-neutral-400">
                  <FileText className="h-4 w-4" /> {agreement.listing.bathrooms} Bathrooms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Parties</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Landlord</h3>
            <p className="text-lg">{agreement.landlord?.fullName || 'Unknown'}</p>
            <p className="text-sm text-neutral-400">{agreement.landlord?.email}</p>
            {agreement.landlordSignedAt && (
              <div className="mt-2 flex items-center gap-2 text-[#00ff66]">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">
                  Signed on {format(new Date(agreement.landlordSignedAt), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tenant</h3>
            <p className="text-lg">{agreement.tenant?.fullName || 'Unknown'}</p>
            <p className="text-sm text-neutral-400">{agreement.tenant?.email}</p>
            {agreement.tenantSignedAt && (
              <div className="mt-2 flex items-center gap-2 text-[#00ff66]">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">
                  Signed on {format(new Date(agreement.tenantSignedAt), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms Summary */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Agreement Terms</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-400">Lease Period</p>
            <p className="font-medium">
              {agreement.startDate && format(new Date(agreement.startDate), 'MMM dd, yyyy')} -{' '}
              {agreement.endDate && format(new Date(agreement.endDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Payment Schedule</p>
            <p className="font-medium capitalize">{agreement.rentPeriod || 'Monthly'}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Rent Amount</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(agreement.rentAmount || 0)}
            </p>
          </div>
          {agreement.cautionDeposit && (
            <div>
              <p className="text-sm text-neutral-400">Caution Deposit</p>
              <p className="text-xl font-bold">{formatCurrency(agreement.cautionDeposit)}</p>
            </div>
          )}
          {agreement.serviceCharge && (
            <div>
              <p className="text-sm text-neutral-400">Service Charge</p>
              <p className="text-xl font-bold">{formatCurrency(agreement.serviceCharge)}</p>
            </div>
          )}
        </div>

        {agreement.terms && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-sm text-neutral-400 mb-2">Additional Terms</p>
              <p className="text-sm whitespace-pre-wrap">{agreement.terms}</p>
            </div>
          </>
        )}
      </div>

      {/* Rent Schedule */}
      {agreement.status === 'fully_signed' && rentSchedule.length > 0 && (
        <Card className="p-6 mb-6">
          <RentScheduleTable entries={rentSchedule} showActions={role === 'tenant'} />
        </div>
      )}

      {/* Stamp Duty */}
      {agreement.status === 'fully_signed' && (
        <div className="mb-6">
          <StampDutyWidget
            agreementId={agreement.id}
            annualRent={agreement.rentAmount || 0}
            stampDuty={(agreement as unknown).stampDuty as never}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="w-0.5 h-full bg-obsidian-800/30"></div>
            </div>
            <div className="flex-1 pb-8">
              <p className="font-medium">Agreement Created</p>
              <p className="text-sm text-neutral-400">
                {agreement.createdAt && format(new Date(agreement.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {agreement.landlordSignedAt && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="w-0.5 h-full bg-obsidian-800/30"></div>
              </div>
              <div className="flex-1 pb-8">
                <p className="font-medium">Signed by Landlord</p>
                <p className="text-sm text-neutral-400">
                  {format(new Date(agreement.landlordSignedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}

          {agreement.tenantSignedAt && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">Signed by Tenant</p>
                <p className="text-sm text-neutral-400">
                  {format(new Date(agreement.tenantSignedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
