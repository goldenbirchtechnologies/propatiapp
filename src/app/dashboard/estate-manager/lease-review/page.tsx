'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { FileText, CheckCircle2, AlertTriangle, XCircle, Download, Copy, RefreshCw } from 'lucide-react';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';

// ─── Real AgreementStatus enum from prisma/schema.prisma ───
type AgreementStatus = 
  | 'draft'
  | 'pending_landlord'
  | 'pending_tenant'
  | 'tenant_signed'
  | 'landlord_signed'
  | 'fully_signed'
  | 'terminated'
  | 'expired';

interface Agreement {
  id: string;
  type: string;
  status: AgreementStatus;
  rentAmount: number | null;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  documentUrl: string | null;
  listing: { id: string; title: string; area: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string } | null;
  landlord: { id: string; fullName: string | null } | null;
}

// Schema-based clause checklist derived from agreement state
const CLAUSES = [
  { 
    id: 'rent', 
    title: 'Rent & Payment Terms', 
    statusMap: {
      draft: 'pending',
      pending_landlord: 'in_progress',
      pending_tenant: 'in_progress',
      tenant_signed: 'completed',
      landlord_signed: 'completed',
      fully_signed: 'completed',
    }
  },
  { 
    id: 'security_deposit', 
    title: 'Security Deposit', 
    statusMap: {
      draft: 'pending',
      pending_landlord: 'in_progress',
      pending_tenant: 'pending',
      tenant_signed: 'completed',
      landlord_signed: 'completed',
      fully_signed: 'completed',
    }
  },
  { id: 'duration', title: 'Lease Duration', statusMap: {
      draft: 'pending',
      pending_landlord: 'completed',
      pending_tenant: 'completed',
      tenant_signed: 'completed',
      landlord_signed: 'completed',
      fully_signed: 'completed',
    }
  },
  { id: 'maintenance', title: 'Maintenance Responsibilities', statusMap: {
      draft: 'pending',
      pending_landlord: 'pending',
      pending_tenant: 'pending',
      tenant_signed: 'completed',
      landlord_signed: 'completed',
      fully_signed: 'completed',
    }
  },
  { id: 'termination', title: 'Termination Clause', statusMap: {
      draft: 'pending',
      pending_landlord: 'pending',
      pending_tenant: 'pending',
      tenant_signed: 'completed',
      landlord_signed: 'completed',
      fully_signed: 'completed',
    }
  },
];

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  pending: { label: 'Pending', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  completed: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
};

const TYPE_LABELS: Record<string, string> = {
  tenancy: 'Residential Tenancy Deed',
  commercial: 'Commercial Lease',
  short_let: 'Short-let Agreement',
  sale: 'Sale Agreement',
  renewal: 'Lease Renewal',
};

function ngn(amount: number | null): string {
  if (amount === null) return '—';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EstateManagerLeaseReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organization } = useActiveOrganization();
  const agreementId = searchParams.get('id');
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agreementId) {
      router.replace('/dashboard/estate-manager/agreements');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orgs/${organization?.id}/agreements/${agreementId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load agreement (${res.status})`);
        const json = await res.json();
        setAgreement(json?.data ?? null);
      } catch (e) {
        setError((e as Error).message ?? 'Could not load agreement');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [agreementId, organization, router]);

  if (loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <div className="mx-auto w-full max-w-[1240px] p-6 lg:p-10 space-y-6" aria-busy="true">
          <div className="h-9 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !agreement) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <ErrorBoundary>
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Lease Agreement Review</h1>
            <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6">
              <p className="text-red-500 font-medium">Error</p>
              <p className="text-red-500/80 text-sm mt-1">{error ?? 'Agreement not found'}</p>
              <button 
                onClick={() => {
                  if (agreementId) {
                    const params = new URLSearchParams(searchParams);
                    params.delete('id');
                    router.replace(`/dashboard/estate-manager/agreements?${params.toString()}`);
                  }
                }}
                className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
              >
                Back to Agreements
              </button>
            </div>
          </section>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  const isSigned = agreement.status === 'fully_signed' || agreement.status === 'tenant_signed' || agreement.status === 'landlord_signed';
  const signatureStatus = isSigned ? 'Fully Signed' : 
    agreement.status === 'pending_tenant' ? 'Awaiting Tenant Signature' :
    agreement.status === 'pending_landlord' ? 'Awaiting Landlord Signature' :
    agreement.status === 'tenant_signed' ? 'Landlord Needs to Sign' :
    agreement.status === 'landlord_signed' ? 'Tenant Needs to Sign' :
    agreement.status === 'draft' ? 'Draft' : agreement.status.replace('_', ' ');

  const handleCopyLink = () => {
    if (agreement.documentUrl) {
      navigator.clipboard.writeText(agreement.documentUrl);
    }
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Lease Agreement Review</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Ref: {agreement.id} · {agreement.listing?.title ?? 'Property Details'}
              </p>
            </div>
            
            <div className="flex gap-3">
              {agreement.documentUrl && (
                <a 
                  href={agreement.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-medium transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Request Changes
              </button>
              <button 
                onClick={() => {
                  alert('Agreement approved - this would trigger the webhook');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-[#10b981]-foreground hover:bg-success/90 transition-colors text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Agreement
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Viewer / Agreement Details */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm bg-white dark:bg-zinc-900 p-6">
              <div className="border-b border-zinc-200 dark:border-white/[0.08] pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white uppercase">
                    {TYPE_LABELS[agreement.type] ?? 'Agreement'}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    ID: {agreement.id}
                  </p>
                  {agreement.createdAt && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Created: {formatDate(agreement.createdAt)}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_META[agreement.status] ?? STATUS_META['draft'].cls}`}>
                    {signatureStatus}
                  </span>
                  {agreement.documentUrl && (
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Copy document link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Agreement terms from real data */}
              <div className="space-y-4 text-sm text-zinc-900 dark:text-white leading-relaxed">
                <p>
                  This Agreement is made between{' '}
                  <strong>Landlord</strong> ({agreement.landlord?.fullName ?? '—'}) and{' '}
                  <strong>Tenant</strong> ({agreement.tenant?.fullName ?? '—'}) for the lease of{' '}
                  <strong>{agreement.listing?.title ?? 'the property'}</strong>.
                </p>

                {agreement.rentAmount && agreement.rentPeriod && (
                  <p>
                    <strong>1. Rent & Payment Terms.</strong> {ngn(agreement.rentAmount)} {agreement.rentPeriod}.
                  </p>
                )}

                <p>
                  <strong>2. Security Deposit.</strong> A deposit equal to 6 months rent shall be held for the duration of the tenancy.
                </p>

                {agreement.startDate && (
                  <p>
                    <strong>3. Lease Duration.</strong> Commencing {formatDate(agreement.startDate)}{' '}
                    {agreement.endDate && `to ${formatDate(agreement.endDate)}`}.
                  </p>
                )}

                <p>
                  <strong>4. Maintenance.</strong> Landlord shall maintain structural elements; tenant is responsible for interior upkeep.
                </p>

                <p>
                  <strong>5. Termination.</strong> Either party may terminate with 90 days written notice subject to penalties.
                </p>
              </div>
            </div>

            {/* Clause Checklist */}
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm bg-white dark:bg-zinc-900 p-5">
              <h3 className="font-heading font-bold text-zinc-900 dark:text-white mb-4">Clause Checklist</h3>
              <div className="space-y-3">
                {CLAUSES.map((clause) => {
                  const clauseStatus = clause.statusMap[agreement.status] ?? 'pending';
                  const meta = STATUS_META[clauseStatus];
                  return (
                    <div 
                      key={clause.id} 
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-white/[0.08]"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{clause.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.08]">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-medium transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}