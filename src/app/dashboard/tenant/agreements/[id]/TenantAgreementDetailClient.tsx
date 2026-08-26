'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  FileText,
  Home,
  User,
  Calendar,
  DollarSign,
  Pen,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';

type Agreement = {
  id: string;
  type: string;
  status: string;
  rentAmount: number;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  specialClauses: string | null;
  jurisdictionState: string | null;
  governingStatute: string | null;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  pdfUrl: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string | null;
    state: string | null;
    price: number;
    description: string;
    images: { url: string; isCover: boolean }[];
  } | null;
  landlord: { id: string; fullName: string | null; email: string | null; phone: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string | null; phone: string | null } | null;
  agent: { id: string; fullName: string | null; email: string | null; phone: string | null } | null;
  signatures: { id: string; role: string; signedAt: string; consentText: string | null }[];
  transactions: { id: string; type: string; amount: number; status: string; createdAt: string }[];
};

type Props = { agreement: Agreement };

const statusConfig: Record<
  string,
  { label: string; class: string }
> = {
  draft: { class: 'bg-zinc-950 text-zinc-500 border-white/[0.08]', label: 'Draft' },
  pending_landlord: { label: 'Pending Landlord', class: 'bg-zinc-900 text-white border-white/[0.08]/30' },
  pending_tenant: { label: 'Pending Your Signature', class: 'bg-warning/10 text-warning border-warning/20' },
  tenant_signed: { label: 'Tenant Signed', class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20' },
  landlord_signed: { label: 'Landlord Signed', class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20' },
  fully_signed: { label: 'Fully Signed', class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20' },
  terminated: { label: 'Terminated', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
  expired: { label: 'Expired', class: 'bg-zinc-950 text-zinc-500 border-white/[0.08]' },
};

function fmtCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

export default function TenantAgreementDetailClient({ agreement }: Props) {
  const [signing, setSigning] = useState(false);
  const coverImage = agreement.listing?.images.find((i) => i.isCover) || agreement.listing?.images[0];
  const status = statusConfig[agreement.status] || statusConfig.draft;
  const isSignable = ['pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agreement.status);
  const hasSigned = agreement.signatures.some((s) => s.role === 'tenant');

  const handleSign = async () => {
    setSigning(true);
    try {
      const res = await fetch(`/api/agreements/${agreement.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentText: 'I agree to the terms of this agreement.' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to sign');
      }
      toast({ title: 'Signed', description: 'Agreement signed successfully' });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Signing failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Agreement Details</h1>
        <Badge className={status.class}>{status.label}</Badge>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Home className="h-5 w-5" />
            {agreement.listing?.title || 'Agreement'}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {coverImage && (
              <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                <img src={coverImage.url} alt={agreement.listing?.title || ''} className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-500">Property</p>
                <p className="font-medium text-white">{agreement.listing?.title}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Location</p>
                <p className="font-medium text-white">
                  {agreement.listing?.area}
                  {agreement.listing?.state ? `, ${agreement.listing.state}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Rent</p>
                <p className="font-medium text-white">{fmtCurrency(agreement.rentAmount)} {agreement.rentPeriod ? `/ ${agreement.rentPeriod}` : ''}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Period</p>
                <p className="font-medium text-white">
                  {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString('en-NG') : '—'} – {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('en-NG') : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Jurisdiction</p>
                <p className="font-medium text-white">
                  {agreement.jurisdictionState ? `${agreement.jurisdictionState}` : '—'}
                  {agreement.governingStatute ? ` • ${agreement.governingStatute}` : ''}
                </p>
              </div>
            </div>
          </div>

          {agreement.specialClauses && (
            <div className="mt-4">
              <p className="text-sm text-zinc-500">Special Clauses</p>
              <p className="text-sm whitespace-pre-wrap text-white">{agreement.specialClauses}</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Parties
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-zinc-500">Landlord</p>
              <p className="font-medium text-white">{agreement.landlord?.fullName || 'Unknown'}</p>
              <p className="text-xs text-zinc-500">{agreement.landlord?.email}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Tenant</p>
              <p className="font-medium text-white">{agreement.tenant?.fullName || 'Unknown'}</p>
              <p className="text-xs text-zinc-500">{agreement.tenant?.email}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Agent</p>
              <p className="font-medium text-white">{agreement.agent?.fullName || '—'}</p>
              <p className="text-xs text-zinc-500">{agreement.agent?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Signatures
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {['landlord', 'tenant', 'agent'].map((role) => {
              const sig = agreement.signatures.find((s) => s.role === role);
              return (
                <div key={role} className="flex items-center justify-between border border-white/[0.08] rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium capitalize text-white">{role}</p>
                    {sig && (
                      <p className="text-xs text-zinc-500">
                        Signed on {new Date(sig.signedAt).toLocaleString('en-NG')}
                      </p>
                    )}
                  </div>
                  {sig ? (
                    <Badge className="bg-success/10 text-[#00ff66] border-success/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/[0.08] text-zinc-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {agreement.transactions?.length > 0 && (
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transactions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {agreement.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border border-white/[0.08] rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                    <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString('en-NG')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{fmtCurrency(tx.amount)}</p>
                    <p className="text-xs text-zinc-500 capitalize">{tx.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isSignable && !hasSigned && (
          <Button onClick={handleSign} disabled={signing}>
            <Pen className="h-4 w-4 mr-2" />
            {signing ? 'Signing...' : 'Sign Agreement'}
          </Button>
        )}
        {agreement.pdfUrl && (
          <Button asChild variant="outline">
            <a href={agreement.pdfUrl} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="/dashboard/tenant/agreements">Back to Agreements</Link>
        </Button>
      </div>
    </div>
  );
}
