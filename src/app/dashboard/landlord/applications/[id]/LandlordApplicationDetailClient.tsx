'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  FileText,
  MessageSquare,
  ShieldCheck,
  Shield,
  BadgeCheck,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ClipboardList,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageHeader, SectionLabel } from '@/components/ui';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
type ApplicationStage = 'submitted' | 'screening' | 'guarantor_pending' | 'approved' | 'rejected';

interface GuarantorData {
  name?: string;
  relationship?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  verified?: boolean;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  stage?: ApplicationStage;
  message: string | null;
  landlordNotes: string | null;
  rejectionReason: string | null;
  requestedInfoAt: string | null;
  createdAt: string;
  reviewedAt: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: string;
    pricePeriod: string | null;
    propertyType: string | null;
    listingType: string | null;
    images: { url: string }[];
    amenities: string[];
  };
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    employmentStatus: string | null;
    employerName: string | null;
    jobTitle: string | null;
    yearlyIncome: string | null;
    profileBio: string | null;
    idVerified: boolean;
    ninVerified: boolean;
    createdAt: string;
  };
  screeningStatus: Record<string, string>;
  guarantorData: GuarantorData;
  applicantDocuments: Array<Record<string, unknown>>;
  agreement: { id: string; status: string } | null;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  under_review: { label: 'Under Review', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  accepted: { label: 'Accepted', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-zinc-900/50 text-zinc-400 border-white/[0.08]' },
};

const stageConfig: Record<ApplicationStage, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  screening: { label: 'Screening', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  guarantor_pending: { label: 'Guarantor Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function screeningPill(value: string) {
  const normalized = String(value || '').toLowerCase();
  if (!normalized || normalized === 'not_started' || normalized === 'none' || normalized === 'false')
    return <span className="text-xs text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">Not Verified</span>;
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'true')
    return <span className="text-xs text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">Verified</span>;
  return <span className="text-xs text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">Pending</span>;
}

export default function LandlordApplicationDetailClient({
  application,
}: {
  application: Application;
}) {
  const [notes, setNotes] = useState(application.landlordNotes ?? '');
  const [rejectionReason, setRejectionReason] = useState(application.rejectionReason ?? '');
  const [isPending, startTransition] = useTransition();
  const isLoading = isPending;
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'review' | 'request_info' | null>(null);
  const [detailTab, setDetailTab] = useState<'applicant' | 'guarantor' | 'decision'>('applicant');
  const router = useRouter();

  const isActionable = ['pending', 'under_review'].includes(application.status);
  const cfg = statusConfig[application.status];
  const stage = application.stage || 'submitted';
  const stageCfg = stageConfig[stage];

  function handleAction(type: 'accept' | 'reject' | 'review' | 'request_info') {
    setActionType(type);

    startTransition(async () => {
      let body: Record<string, unknown> = {};
      if (type === 'accept') {
        body = { action: 'approve', landlordNotes: notes || undefined };
      } else if (type === 'reject') {
        body = { status: 'rejected', landlordNotes: notes || undefined, rejectionReason: rejectionReason || undefined, action: 'reject' };
      } else if (type === 'review') {
        body = { status: 'under_review', landlordNotes: notes || undefined };
      } else if (type === 'request_info') {
        body = { landlordNotes: notes || undefined, requestedInfoAt: new Date().toISOString() };
      }

      try {
        const res = await fetch(`/api/applications/${application.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to update application');
          setActionType(null);
          return;
        }

        if (type === 'accept') {
          toast.success('Application accepted. Conversation and agreement draft created.');
        } else if (type === 'reject') {
          toast.success('Application rejected.');
        } else if (type === 'request_info') {
          toast.success('Additional information requested.');
        } else {
          toast.success('Marked as under review.');
        }

        setActionType(null);
        router.refresh();
      } catch {
        toast.error('Something went wrong');
        setActionType(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/landlord" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/landlord/applications" className="hover:underline">Applications</Link>
        <span>/</span>
        <span className="font-medium text-white">{application.listing.title}</span>
      </nav>

      {/* Header */}
      <PageHeader
        title="Application Details"
        description={`${application.listing.title} · ${application.listing.area}, ${application.listing.state}`}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={stageCfg.label} className={stageCfg.className}>
              {stageCfg.label}
            </StatusBadge>
            <StatusBadge status={cfg.label} className={cfg.className}>
              {cfg.label}
            </StatusBadge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Card */}
        <div className="glass-card lg:col-span-2 glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Property
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {(application.listing?.images?.length || 0) > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
                <img
                  src={application.listing.images[0].url}
                  alt={application.listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Price</p>
                <p className="text-sm font-bold text-white">
                  ₦{Number(application.listing.price).toLocaleString()}
                  {application.listing.pricePeriod && `/${application.listing.pricePeriod}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Type</p>
                <p className="text-sm font-medium capitalize text-white">{application.listing.propertyType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Listing Type</p>
                <p className="text-sm font-medium capitalize text-white">{application.listing.listingType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Address</p>
                <p className="text-sm font-medium text-white">{application.listing.address || '—'}</p>
              </div>
            </div>
            {application.listing.amenities.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-zinc-500">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {application.listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-300 border-emerald-500/20"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link href={`/properties/${application.listing.id}`} className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
              <ExternalLink className="w-3 h-3" /> View Listing
            </Link>
          </div>
        </div>

        {/* Tenant Card */}
        <div className="glass-card glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Applicant
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={application.tenant.avatarUrl || undefined}
                name={application.tenant.fullName}
                size="md"
              />
              <div>
                <p className="font-bold text-white">{application.tenant.fullName}</p>
                <p className="text-xs text-zinc-500">
                  Applied {new Date(application.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-white">{application.tenant.email}</span>
              </div>
              {application.tenant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-zinc-500" />
                  <span className="text-white">{application.tenant.phone}</span>
                </div>
              )}
              {application.tenant.employmentStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-zinc-500" />
                  <span className="capitalize text-white">{application.tenant.employmentStatus.replace('_', ' ')}</span>
                </div>
              )}
              {application.tenant.yearlyIncome && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  <span className="text-white">₦{Number(application.tenant.yearlyIncome).toLocaleString()}/yr</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {application.tenant.idVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  <BadgeCheck className="w-3 h-3" /> ID Verified
                </span>
              )}
              {application.tenant.ninVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> NIN Verified
                </span>
              )}
            </div>

            {application.tenant.profileBio && (
              <div>
                <p className="text-xs font-medium mb-1 text-zinc-500">About</p>
                <p className="text-sm text-zinc-400">{application.tenant.profileBio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicant Message */}
      {application.message && (
        <div className="glass-card glass-card">
          <div className="p-6 p-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 mt-0.5 text-emerald-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">Applicant Message</p>
                <p className="text-sm p-3 rounded-lg bg-zinc-950 text-white">{application.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => setDetailTab('applicant')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'applicant' ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
            >
              Applicant
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('guarantor')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'guarantor' ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
            >
              Guarantor
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('decision')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'decision' ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
            >
              Decision
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {detailTab === 'applicant' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-white">Screening</p>
                {Object.keys(application.screeningStatus || {}).length === 0 && (
                  <p className="text-xs text-zinc-500">No screening checks yet.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(application.screeningStatus || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 border border-white/[0.08] rounded-full px-2 py-1 text-xs">
                      <span className="capitalize text-white">{key.replace('_', ' ')}</span>
                      {screeningPill(value)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-white">Documents</p>
                {application.applicantDocuments.length === 0 && (
                  <p className="text-xs text-zinc-500">No documents uploaded.</p>
                )}
                {application.applicantDocuments.map((doc, idx) => (
                  <a key={idx} href={String(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline text-white">
                    <FileText className="w-4 h-4" /> {String(doc.name || doc.type || 'Document')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'guarantor' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-white">Guarantor Information</p>
              {(!application.guarantorData || Object.keys(application.guarantorData).length === 0) && (
                <p className="text-sm text-zinc-500">No guarantor information provided yet.</p>
              )}
              {Object.entries(application.guarantorData || {}).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-zinc-500 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-white font-medium text-right">{String(value)}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs font-medium text-white mb-2">Guarantor Verification</p>
                {(application.guarantorData as any)?.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                    <UserX className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>
            </div>
          )}

          {detailTab === 'decision' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5 text-white">Notes (visible to the tenant)</label>
                <Textarea
                  className="bg-zinc-950 border border-white/[0.08] w-full resize-none focus:border-emerald-500/50"
                  rows={3}
                  placeholder="Add a note visible to the tenant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
                  Rejection reason: {application.rejectionReason}
                </div>
              )}

              {application.requestedInfoAt && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-sm text-amber-400">
                  Additional info requested on {new Date(application.requestedInfoAt).toLocaleString('en-NG')}.
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('request_info')}
                  disabled={isLoading || !isActionable}
                >
                  {actionType === 'request_info' && isLoading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ClipboardList className="w-3 h-3 mr-1" />
                  )}
                  Request Additional Info
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction('reject')}
                  disabled={isLoading || !isActionable}
                >
                  {actionType === 'reject' && isLoading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <UserX className="w-3 h-3 mr-1" />
                  )}
                  Reject Application
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction('accept')}
                  disabled={isLoading || !isActionable}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {actionType === 'accept' && isLoading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  Approve & Generate Lease
                </Button>
              </div>

              {(actionType === 'reject' || application.rejectionReason) && (
                <div>
                  <label className="text-sm font-medium block mb-1.5 text-white">Rejection reason</label>
                  <Textarea
                    className="bg-zinc-950 border border-white/[0.08] w-full resize-none focus:border-emerald-500/50"
                    rows={2}
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {application.agreement && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900 text-white border border-emerald-500/20">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white">
                    Agreement {application.agreement.status} —{' '}
                    <Link href="/dashboard/landlord/agreements" className="underline font-medium text-emerald-400">
                      View agreement
                    </Link>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
