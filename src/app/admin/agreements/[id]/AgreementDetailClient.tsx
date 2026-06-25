'use client';

import { Decimal } from '@prisma/client/runtime/library';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Eye, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgreementDetail {
  id: string;
  type: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: Decimal | null;
  rentPeriod: string | null;
  cautionDeposit: Decimal | null;
  serviceCharge: Decimal | null;
  noticePeriodDays: number;
  specialClauses: string | null;
  riskTier: string | null;
  jurisdictionState: string | null;
  governingStatute: string | null;
  headTenantVerified: boolean | null;
  lockStatus: string;
  finalizedAt: Date | null;
  createdAt: Date;
  pdfUrl: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: Decimal;
    propertyType: string | null;
    images: { url: string }[];
  } | null;
  landlord: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  agent: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  signatures: {
    id: string;
    role: string;
    signedAt: Date;
    signer: { fullName: string; email: string };
  }[];
  stampDuty: {
    id: string;
    amount: bigint;
    status: string;
    remitaRrr: string | null;
    certificateHash: string | null;
    agreementPdfHash: string | null;
    linkageHash: string | null;
  } | null;
  rentSchedule: {
    id: string;
    amount: bigint;
    dueDate: Date;
    paidAt: Date | null;
    status: string;
  }[];
  transactions: {
    id: string;
    amount: bigint;
    status: string;
    type: string;
    createdAt: Date;
    payer: { fullName: string };
    payee: { fullName: string };
  }[];
}

interface AgreementDetailClientProps {
  agreement: AgreementDetail;
}

export default function AgreementDetailClient({ agreement }: AgreementDetailClientProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      draft: 'tag-amber',
      pending_landlord: 'tag-blue',
      pending_tenant: 'tag-blue',
      tenant_signed: 'tag-teal',
      landlord_signed: 'tag-teal',
      fully_signed: 'tag-green',
      terminated: 'tag-red',
      expired: 'tag-gray',
    };
    return config[status] || 'tag-gray';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_landlord: 'Pending Landlord',
      pending_tenant: 'Pending Tenant',
      tenant_signed: 'Tenant Signed',
      landlord_signed: 'Landlord Signed',
      fully_signed: 'Fully Signed',
      terminated: 'Terminated',
      expired: 'Expired',
    };
    return labels[status] || status;
  };

  const getLockBadge = (status: string) => {
    const config: Record<string, string> = {
      mutable: 'tag-green',
      locked: 'tag-red',
      pending_approval: 'tag-blue',
    };
    return config[status] || 'tag-gray';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Agreement Details
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Agreement ID: {agreement.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Property Info */}
      {agreement.listing && (
        <div className="card p-6">
          <div className="flex items-start gap-4">
            {agreement.listing.images[0] ? (
              <img
                src={agreement.listing.images[0].url}
                alt={agreement.listing.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-heading font-bold" style={{ color: 'var(--text)' }}>
                {agreement.listing.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {agreement.listing.address}, {agreement.listing.area}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {agreement.listing.state} • {agreement.listing.propertyType}
              </p>
              <p className="text-lg font-bold mt-2" style={{ color: 'var(--text)' }}>
                ₦{agreement.listing.price.toLocaleString()}
                {agreement.type === 'rental' ? `/${agreement.rentPeriod || 'month'}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Overview */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Agreement Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</p>
            <Badge className={getStatusBadge(agreement.status)}>
              {getStatusLabel(agreement.status)}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Lock Status</p>
            <Badge className={getLockBadge(agreement.lockStatus)}>
              {agreement.lockStatus}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Risk Tier</p>
            <Badge className="tag-blue">{agreement.riskTier || 'standard'}</Badge>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Contracting Parties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Landlord</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.landlord?.fullName || 'N/A'}</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{agreement.landlord?.email}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Tenant</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.tenant?.fullName || 'N/A'}</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{agreement.tenant?.email}</p>
          </div>
          {agreement.agent && (
            <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Agent</p>
              <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.agent.fullName}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{agreement.agent.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Terms */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Financial Terms
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Rent Amount</p>
            <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
              {agreement.rentAmount ? `₦${Number(agreement.rentAmount).toLocaleString()}` : '—'}
              {agreement.rentPeriod && ' /' + agreement.rentPeriod}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Caution Deposit</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              {agreement.cautionDeposit ? `₦${Number(agreement.cautionDeposit).toLocaleString()}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Service Charge</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              {agreement.serviceCharge ? `₦${Number(agreement.serviceCharge).toLocaleString()}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Signatures
        </h3>
        {agreement.signatures.length > 0 ? (
          <div className="space-y-3">
            {agreement.signatures.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-elevated)]">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{sig.signer.fullName}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{sig.signer.email} · {sig.role}</p>
                </div>
                <Badge className="tag-green">
                  Signed {new Date(sig.signedAt).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
            No signatures recorded
          </p>
        )}
      </div>

      {/* Stamp Duty */}
      {agreement.stampDuty && (
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Stamp Duty
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</p>
              <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                ₦{Number(agreement.stampDuty.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</p>
              <Badge className={getStatusBadge(agreement.stampDuty.status)}>
                {agreement.stampDuty.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Remita Request</p>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {agreement.stampDuty.remitaRrr || '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rent Schedule */}
      {agreement.rentSchedule.length > 0 && (
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Rent Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Due Date
                  </th>
                  <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Amount
                  </th>
                  <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Paid Date
                  </th>
                  <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {agreement.rentSchedule.map((rs) => (
                  <tr key={rs.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3" style={{ color: 'var(--text)' }}>
                      {new Date(rs.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text)' }}>
                      ₦{Number(rs.amount).toLocaleString()}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text)' }}>
                      {rs.paidAt ? new Date(rs.paidAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <Badge className={rs.status === 'paid' ? 'tag-green' : 'tag-amber'}>
                        {rs.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Special Clauses */}
      {agreement.specialClauses && (
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Special Clauses
          </h3>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {agreement.specialClauses}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {agreement.pdfUrl && (
          <a href={`/api/agreements/${agreement.id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </a>
        )}
        <Button variant="outline" onClick={() => router.push(`/listings/${agreement.listing?.id}`)}>
          <Eye className="h-4 w-4 mr-2" />
          View Listing
        </Button>
      </div>
    </div>
  );
}