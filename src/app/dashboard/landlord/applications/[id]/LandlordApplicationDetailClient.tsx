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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-success-bright/10 text-success border-success-bright/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-surface-container-low text-on-surface-variant border-outline-variant' },
};

const stageConfig: Record<ApplicationStage, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  screening: { label: 'Screening', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  guarantor_pending: { label: 'Guarantor Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-success-bright/10 text-success border-success-bright/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function screeningPill(value: string) {
  const normalized = String(value || '').toLowerCase();
  if (!normalized || normalized === 'not_started' || normalized === 'none' || normalized === 'false')
    return <span className="text-xs text-destructive border border-destructive/20 rounded-full px-2 py-0.5">Not Verified</span>;
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'true')
    return <span className="text-xs text-success border border-success/20 rounded-full px-2 py-0.5">Verified</span>;
  return <span className="text-xs text-warning border border-warning/20 rounded-full px-2 py-0.5">Pending</span>;
}

export default function LandlordApplicationDetailClient({
  application,
}: {
  application: Application;
}) {
  const [notes, setNotes] = useState(application.landlordNotes ?? '');
  const [rejectionReason, setRejectionReason] = useState(application.rejectionReason ?? '');
  const [isPending, startTransition] = useTransition();
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
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/dashboard/landlord" className="hover:underline">
          Dashboard
        </Link>
        <AppIcon name="/" className="lucide" />
        <Link href="/dashboard/landlord/applications" className="hover:underline">
          Applications
        </Link>
        <AppIcon name="/" className="lucide" />
        <span className="font-medium">
          {application.listing.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord/applications"
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary text-primary">
              Application Details
            </h1>
            <p className="text-sm text-on-surface-variant">
              {application.listing.title} · {application.listing.area}, {application.listing.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={stageCfg.className}>{stageCfg.label}</Badge>
          <Badge className={cfg.className}>{cfg.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline-sm text-headline-sm text-primary text-primary">
              <Building2 className="inline w-5 h-5 mr-2 text-primary" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.listing.images.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-container-lowest">
                <img
                  src={application.listing.images[0].url}
                  alt={application.listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant">Price</p>
                <p className="text-sm font-bold text-primary">
                  ₦{Number(application.listing.price).toLocaleString()}
                  {application.listing.pricePeriod && `/${application.listing.pricePeriod}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Type</p>
                <p className="text-sm font-medium capitalize text-primary">
                  {application.listing.propertyType || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Listing Type</p>
                <p className="text-sm font-medium capitalize text-primary">
                  {application.listing.listingType || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Address</p>
                <p className="text-sm font-medium text-primary">
                  {application.listing.address || '—'}
                </p>
              </div>
            </div>
            {application.listing.amenities.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-on-surface-variant">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {application.listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link href={`/properties/${application.listing.id}`} className="btn btn-secondary btn-sm inline-flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> View Listing
            </Link>
          </CardContent>
        </Card>

        {/* Tenant Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline-sm text-headline-sm text-primary text-primary">
              <Users className="inline w-5 h-5 mr-2 text-primary" />
              Applicant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                {application.tenant.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-primary">{application.tenant.fullName}</p>
                <p className="text-xs text-on-surface-variant">
                  Applied {new Date(application.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-on-surface-variant" />
                <span className="text-primary">{application.tenant.email}</span>
              </div>
              {application.tenant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-primary">{application.tenant.phone}</span>
                </div>
              )}
              {application.tenant.employmentStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-on-surface-variant" />
                  <span className="capitalize text-primary">{application.tenant.employmentStatus.replace('_', ' ')}</span>
                </div>
              )}
              {application.tenant.yearlyIncome && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-primary">₦{Number(application.tenant.yearlyIncome).toLocaleString()}/yr</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {application.tenant.idVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-success bg-success-bright/10 border border-success-bright/20 rounded-full px-2 py-0.5">
                  <BadgeCheck className="w-3 h-3" /> ID Verified
                </span>
              )}
              {application.tenant.ninVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> NIN Verified
                </span>
              )}
            </div>

            {application.tenant.profileBio && (
              <div>
                <p className="text-xs font-medium mb-1 text-on-surface-variant">About</p>
                <p className="text-sm text-primary">{application.tenant.profileBio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Applicant Message */}
      {application.message && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Applicant Message</p>
                <p className="text-sm p-3 rounded-lg text-primary">
                  {application.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex rounded-lg border border-outline-variant overflow-hidden">
            <button
              type="button"
              onClick={() => setDetailTab('applicant')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'applicant' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              Applicant
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('guarantor')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'guarantor' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              Guarantor
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('decision')}
              className={`px-3 py-1.5 text-sm ${detailTab === 'decision' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              Decision
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {detailTab === 'applicant' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-primary">Screening</p>
                {Object.keys(application.screeningStatus || {}).length === 0 && (
                  <p className="text-xs text-on-surface-variant">No screening checks yet.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(application.screeningStatus || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 border border-outline-variant rounded-full px-2 py-1 text-xs">
                      <span className="capitalize text-primary">{key.replace('_', ' ')}</span>
                      {screeningPill(value)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-primary">Documents</p>
                {application.applicantDocuments.length === 0 && (
                  <p className="text-xs text-on-surface-variant">No documents uploaded.</p>
                )}
                {application.applicantDocuments.map((doc, idx) => (
                  <a key={idx} href={String(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline text-primary">
                    <FileText className="w-4 h-4" /> {String(doc.name || doc.type || 'Document')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'guarantor' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-primary">Guarantor Information</p>
              {(!application.guarantorData || Object.keys(application.guarantorData).length === 0) && (
                <p className="text-sm text-on-surface-variant">No guarantor information provided yet.</p>
              )}
              {Object.entries(application.guarantorData || {}).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-on-surface-variant capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-primary font-medium text-right">{String(value)}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs font-medium text-primary mb-2">Guarantor Verification</p>
                {(application.guarantorData as any)?.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success bg-success-bright/10 border border-success-bright/20 rounded-full px-2 py-0.5">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
                    <UserX className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>
            </div>
          )}

          {detailTab === 'decision' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5 text-primary">
                  Notes (visible to the tenant)
                </label>
                <Textarea
                  className="inp-field w-full resize-none"
                  rows={3}
                  placeholder="Add a note visible to the tenant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive">
                  Rejection reason: {application.rejectionReason}
                </div>
              )}

              {application.requestedInfoAt && (
                <div className="p-3 rounded-lg border border-warning/20 bg-warning/10 text-sm text-warning">
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
                  className="bg-success hover:bg-success/90 text-white"
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
                  <label className="text-sm font-medium block mb-1.5 text-primary">
                    Rejection reason
                  </label>
                  <Textarea
                    className="inp-field w-full resize-none"
                    rows={2}
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {application.agreement && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">
                    Agreement {application.agreement.status} —{' '}
                    <Link
                      href={`/dashboard/landlord/agreements`}
                      className="underline font-medium text-primary"
                    >
                      View agreement
                    </Link>
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
