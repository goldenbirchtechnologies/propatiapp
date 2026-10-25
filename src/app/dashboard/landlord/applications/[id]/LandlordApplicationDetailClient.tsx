'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
  ExternalLink,
  ClipboardList,
  UserX,
  Tag,
  Copy,
  Download,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  withdrawn: { label: 'Withdrawn', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
};

const stageConfig: Record<ApplicationStage, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  screening: { label: 'Screening', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  guarantor_pending: { label: 'Guarantor Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
};

function screeningPill(value: string) {
  const normalized = String(value || '').toLowerCase();
  if (!normalized || normalized === 'not_started' || normalized === 'none' || normalized === 'false')
    return <span className="text-xs text-red-700 border border-red-200 rounded-full px-2 py-0.5">Not Verified</span>;
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'true')
    return <span className="text-xs text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">Verified</span>;
  return <span className="text-xs text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">Pending</span>;
}

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
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

  const price = Number(application.listing.price) || 0;
  const stampDuty = Math.max(500, price * 0.0078);
  const total = price + stampDuty;

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

  const timeline = [
    { label: 'Application submitted', date: application.createdAt, done: true },
    { label: 'Marked under review', date: application.status === 'under_review' || application.status === 'accepted' || application.status === 'rejected' ? application.reviewedAt : null, done: ['under_review', 'accepted', 'rejected'].includes(application.status) },
    { label: 'Additional info requested', date: application.requestedInfoAt, done: !!application.requestedInfoAt },
    { label: 'Decision recorded', date: application.status === 'accepted' || application.status === 'rejected' ? application.reviewedAt : null, done: application.status === 'accepted' || application.status === 'rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/landlord" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/landlord/applications" className="hover:text-emerald-600 transition-colors">Applications</Link>
        <span>/</span>
        <span className="font-medium text-zinc-900 dark:text-white">{application.listing.title}</span>
      </nav>

      {/* Header card with status pill */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.08]">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {application.tenant.avatarUrl ? (
                <img src={application.tenant.avatarUrl} alt={application.tenant.fullName} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-7 h-7 text-zinc-400" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{application.tenant.fullName}</h1>
                {application.tenant.idVerified && <BadgeCheck className="w-5 h-5 text-emerald-600" />}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {application.tenant.jobTitle || application.tenant.employmentStatus?.replace('_', ' ') || 'Applicant'}
                {application.tenant.employerName ? ` • ${application.tenant.employerName}` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-mono text-xs">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  APP-{application.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span className="text-xs">Applied {new Date(application.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap lg:flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0 justify-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={() => toast.success('Messaging channel opened')}
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <button
                type="button"
                className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={() => toast.success('Downloading agreement pack')}
              >
                <Download className="w-4 h-4" /> Agreement
              </button>
            </div>
            <Link
              href={`/dashboard/landlord/properties/${application.listing.id}`}
              className="w-full sm:w-auto h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <KeyRound className="w-4 h-4" /> Manage Unit
            </Link>
          </div>
        </div>

        {/* KYC badges banner */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/[0.08] flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mr-1">Compliance:</span>
          {application.tenant.idVerified && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Tier 3 Identity Verified
            </span>
          )}
          {application.tenant.ninVerified && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" /> NIN Verified
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> 2FA OTP Verified
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
            {cfg.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stageCfg.className}`}>
            {stageCfg.label}
          </span>
        </div>
      </div>

      {/* Status pill row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.className}`}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {cfg.label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Stage: <span className="font-medium text-zinc-900 dark:text-white">{stageCfg.label}</span>
        </span>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application details */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
          <CardHeader className="border-b border-zinc-200 dark:border-white/[0.08]">
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <ClipboardList className="w-5 h-5 text-emerald-600" /> Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Property</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{application.listing.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{application.listing.area}, {application.listing.state}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Address</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{application.listing.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</p>
                <p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{application.listing.propertyType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Listing Type</p>
                <p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{application.listing.listingType || '—'}</p>
              </div>
            </div>

            {application.listing.images?.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img src={application.listing.images[0].url} alt={application.listing.title} className="w-full h-full object-cover" />
              </div>
            )}

            {application.listing.amenities?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-zinc-500 dark:text-zinc-400">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {application.listing.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link href={`/properties/${application.listing.id}`} className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
              <ExternalLink className="w-3 h-3" /> View Listing
            </Link>

            {application.message && (
              <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Applicant Message</p>
                <p className="text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">{application.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant profile */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
          <CardHeader className="border-b border-zinc-200 dark:border-white/[0.08]">
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <Users className="w-5 h-5 text-emerald-600" /> Tenant Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                {application.tenant.avatarUrl ? (
                  <img src={application.tenant.avatarUrl} alt={application.tenant.fullName} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{application.tenant.fullName}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Applied {new Date(application.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-900 dark:text-white">{application.tenant.email}</span>
                <button type="button" className="text-zinc-400 hover:text-emerald-600" onClick={() => { navigator.clipboard.writeText(application.tenant.email); toast.success('Email copied'); }}>
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {application.tenant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{application.tenant.phone}</span>
                </div>
              )}
              {application.tenant.employmentStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  <span className="capitalize text-zinc-900 dark:text-white">{application.tenant.employmentStatus.replace('_', ' ')}</span>
                </div>
              )}
              {application.tenant.yearlyIncome && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{formatNaira(Number(application.tenant.yearlyIncome))}/yr</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {application.tenant.idVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
                  <BadgeCheck className="w-3 h-3" /> ID Verified
                </span>
              )}
              {application.tenant.ninVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> NIN Verified
                </span>
              )}
            </div>

            {application.tenant.profileBio && (
              <div>
                <p className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">About</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{application.tenant.profileBio}</p>
              </div>
            )}

            {/* Screening */}
            <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] space-y-2">
              <p className="text-xs font-medium text-zinc-900 dark:text-white">Screening</p>
              {Object.keys(application.screeningStatus || {}).length === 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No screening checks yet.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {Object.entries(application.screeningStatus || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 border border-zinc-200 dark:border-white/[0.08] rounded-full px-2 py-1 text-xs">
                    <span className="capitalize text-zinc-900 dark:text-white">{key.replace('_', ' ')}</span>
                    {screeningPill(value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-900 dark:text-white">Documents</p>
              {application.applicantDocuments.length === 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No documents uploaded.</p>
              )}
              {application.applicantDocuments.map((doc, idx) => (
                <a key={idx} href={String(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline text-zinc-900 dark:text-white">
                  <FileText className="w-4 h-4" /> {String(doc.name || doc.type || 'Document')}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial breakdown */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
        <CardHeader className="border-b border-zinc-200 dark:border-white/[0.08]">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Annual Rent</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{formatNaira(price)}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Stamp Duty (0.78%)</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{formatNaira(stampDuty)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatNaira(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: guarantor + decision */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex rounded-lg border border-zinc-200 dark:border-white/[0.08] overflow-hidden w-fit">
            {(['applicant', 'guarantor', 'decision'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDetailTab(t)}
                className={`px-3 py-1.5 text-sm capitalize ${detailTab === t ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="p-6 space-y-4">
          {detailTab === 'applicant' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Applicant screening and documents are shown in the Tenant Profile card above.</p>
            </div>
          )}

          {detailTab === 'guarantor' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-900 dark:text-white">Guarantor Information</p>
              {(!application.guarantorData || Object.keys(application.guarantorData).length === 0) && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No guarantor information provided yet.</p>
              )}
              {Object.entries(application.guarantorData || {}).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-zinc-900 dark:text-white font-medium text-right">{String(value)}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs font-medium text-zinc-900 dark:text-white mb-2">Guarantor Verification</p>
                {(application.guarantorData as any)?.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 border border-red-200 rounded-full px-2 py-0.5">
                    <UserX className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>
            </div>
          )}

          {detailTab === 'decision' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5 text-zinc-900 dark:text-white">Notes (visible to the tenant)</label>
                <Textarea
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] w-full resize-none focus:border-emerald-600"
                  rows={3}
                  placeholder="Add a note visible to the tenant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                  Rejection reason: {application.rejectionReason}
                </div>
              )}

              {application.requestedInfoAt && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-700">
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  <label className="text-sm font-medium block mb-1.5 text-zinc-900 dark:text-white">Rejection reason</label>
                  <Textarea
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] w-full resize-none focus:border-emerald-600"
                    rows={2}
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {application.agreement && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-emerald-200 dark:border-emerald-800">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-zinc-900 dark:text-white">
                    Agreement {application.agreement.status} —{' '}
                    <Link href="/dashboard/landlord/agreements" className="underline font-medium text-emerald-600">
                      View agreement
                    </Link>
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
        <CardHeader className="border-b border-zinc-200 dark:border-white/[0.08]">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <Clock className="w-5 h-5 text-emerald-600" /> Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ol className="relative border-l border-zinc-200 dark:border-white/[0.08] space-y-4 ml-2">
            {timeline.map((t, i) => (
              <li key={i} className="ml-4">
                <span className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 ${t.done ? 'bg-emerald-600 border-emerald-600' : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600'}`} />
                <p className={`text-sm font-medium ${t.done ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>{t.label}</p>
                {t.date && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(t.date).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Landlord notes */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm">
        <CardHeader className="border-b border-zinc-200 dark:border-white/[0.08]">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <AlertCircle className="w-5 h-5 text-emerald-600" /> Landlord Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{application.landlordNotes || 'No notes yet.'}</p>
        </CardContent>
      </Card>
    </div>
  );
}