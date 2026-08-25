'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Clock,
  CheckCircle,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  UserCheck,
  UserX,
  ClipboardList,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PageHeader, SectionLabel, StatusBadge, StatCard, Avatar } from '@/components/ui';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
type ApplicationStage = 'submitted' | 'screening' | 'guarantor_pending' | 'approved' | 'rejected';

export function EmptyState() {
  return (
    <Card className="glass-card border-dashed border-zinc-700 p-8 text-center">
      <CardContent className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-white">No applications yet</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-zinc-400">
            Tenant applications will appear here once people start applying to your listings.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/landlord/properties/new">Add property</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/landlord/properties">View properties</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
  createdAt: string | Date;
  reviewedAt: string | Date | null;
  listing: {
    id: string;
    title: string;
    area: string;
    state: string;
    price: string;
    pricePeriod: string | null;
    images: { url: string }[];
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
  };
  screeningStatus: Record<string, string>;
  guarantorData: GuarantorData;
  applicantDocuments: Array<Record<string, unknown>>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  under_review: { label: 'Under Review', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  accepted: { label: 'Accepted', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-zinc-900/50 text-zinc-400 border-zinc-800' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-900/50 text-zinc-400 border-zinc-800' },
  canceled: { label: 'Canceled', className: 'bg-zinc-900/50 text-zinc-400 border-zinc-800' },
  submitted: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

const stageConfig: Record<string, { label: string; className: string }> = {
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

export default function LandlordApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initial);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all');
  const [listingFilter, setListingFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'review' | 'request_info' | null>(null);
  const [detailTab, setDetailTab] = useState<'applicant' | 'guarantor' | 'decision'>('applicant');
  const router = useRouter();

  const uniqueListings = Array.from(
    new Map(
      applications
        .filter((a) => a && a.listing && a.listing.id)
        .map((a) => [a.listing.id, a.listing])
    ).values()
  );

  const filtered = applications.filter((a) => {
    if (!a) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (stageFilter !== 'all' && (a.stage || 'submitted') !== stageFilter) return false;
    if (listingFilter !== 'all' && a.listing?.id !== listingFilter) return false;
    return true;
  });

  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const accepted = applications.filter((a) => a.status === 'accepted' || (a.status as string) === 'approved').length;
  const stageStats = {
    screening: applications.filter((a) => (a.stage || 'submitted') === 'screening').length,
    guarantor_pending: applications.filter((a) => (a.stage || 'submitted') === 'guarantor_pending').length,
  };

  function openReview(app: Application) {
    setSelectedApp(app);
    setNotes(app.landlordNotes ?? '');
    setRejectionReason(app.rejectionReason ?? '');
    setActionType(null);
    setDetailTab('applicant');
  }

  function handleAction(type: 'accept' | 'reject' | 'review' | 'request_info') {
    if (!selectedApp) return;
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
        const res = await fetch(`/api/applications/${selectedApp.id}`, {
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

        const json = await res.json();
        const updated = json.data as Application;
        setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelectedApp(updated);

        if (type === 'accept') toast.success('Application accepted. Conversation and agreement draft created.');
        else if (type === 'reject') toast.success('Application rejected.');
        else if (type === 'request_info') toast.success('Additional information requested.');
        else toast.success('Application marked as under review.');

        setActionType(null);
        router.refresh();
      } catch {
        toast.error('Something went wrong');
        setActionType(null);
      }
    });
  }

  const isLoading = isPending;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tenant Applications"
        description="Review, screen, and manage tenancy applications end to end"
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Total" value={String(applications.length)} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Pending" value={String(pending)} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Under Review" value={String(underReview)} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Accepted" value={String(accepted)} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Screening" value={String(stageStats.screening)} icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="Guarantor Pending" value={String(stageStats.guarantor_pending)} icon={<UserCheck className="w-5 h-5" />} />
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <select
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
            style={{ maxWidth: 200 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <select
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
            style={{ maxWidth: 200 }}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as ApplicationStage | 'all')}
          >
            <option value="all">All Stages</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Under Screening</option>
            <option value="guarantor_pending">Guarantor Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
            style={{ maxWidth: 260 }}
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
          >
            <option value="all">All Listings</option>
            {uniqueListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
            <h3 className="font-headline-sm text-headline-sm text-white mb-2">No applications found</h3>
            <p className="text-zinc-400">
              {applications.length === 0
                ? 'You have not received any applications yet.'
                : 'No applications match the selected filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="glass-card rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Tenant', 'Listing', 'Stage', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const cfg = statusConfig[app.status] || {
                    label: app.status ? String(app.status).replace('_', ' ') : 'Unknown',
                    className: 'bg-zinc-900/50 text-zinc-400 border-zinc-800',
                  };
                  const stage = app.stage || 'submitted';
                  const stageCfg = stageConfig[stage] || {
                    label: stage ? String(stage).replace('_', ' ') : 'Submitted',
                    className: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                  };
                  const isActionable = ['pending', 'under_review'].includes(app.status);
                  const tenantName = app.tenant?.fullName || 'Tenant';
                  const listingTitle = app.listing?.title || 'Untitled Listing';
                  const listingLocation = [app.listing?.area, app.listing?.state].filter(Boolean).join(', ');

                  return (
                    <tr key={app.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={app.tenant?.avatarUrl || undefined}
                            name={tenantName}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-sm text-white">{tenantName}</p>
                            <p className="text-xs text-zinc-500">{app.tenant?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{listingTitle}</p>
                        <p className="text-xs text-zinc-500">{listingLocation}</p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={stageCfg.label} className={stageCfg.className}>
                          {stageCfg.label}
                        </StatusBadge>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={cfg.label} className={cfg.className}>
                          {cfg.label}
                        </StatusBadge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-400">
                          {new Date(app.createdAt).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <Button
                          variant={isActionable ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => openReview(app)}
                        >
                          {isActionable ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-4xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Application Review</DialogTitle>
                <DialogDescription>
                  {selectedApp.listing?.title || 'Listing'} · {[selectedApp.listing?.area, selectedApp.listing?.state].filter(Boolean).join(', ')}
                </DialogDescription>
              </DialogHeader>

              {detailTab === 'applicant' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={selectedApp.tenant?.avatarUrl || undefined}
                      name={selectedApp.tenant?.fullName || 'T'}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white">{selectedApp.tenant?.fullName || 'Tenant'}</p>
                        {selectedApp.tenant?.idVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                            <BadgeCheck className="w-3 h-3" /> ID Verified
                          </span>
                        )}
                        {selectedApp.tenant?.ninVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                            <ShieldCheck className="w-3 h-3" /> NIN Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">{selectedApp.tenant?.email || ''}</p>
                      {selectedApp.tenant?.phone && (
                        <p className="text-sm text-zinc-400">{selectedApp.tenant.phone}</p>
                      )}
                    </div>
                  </div>

                  {(selectedApp.tenant?.employmentStatus || selectedApp.tenant?.employerName || selectedApp.tenant?.yearlyIncome) && (
                    <div className="p-3 rounded-lg space-y-1 text-sm border border-zinc-800">
                      <p className="font-medium mb-2 text-white">Employment</p>
                      {selectedApp.tenant?.employmentStatus && (
                        <p className="text-zinc-400">
                          Status: <span className="font-medium">{String(selectedApp.tenant.employmentStatus).replace('_', ' ')}</span>
                        </p>
                      )}
                      {selectedApp.tenant?.employerName && (
                        <p className="text-zinc-400">
                          Employer: <span className="text-white">{selectedApp.tenant.employerName}</span>
                        </p>
                      )}
                      {selectedApp.tenant?.jobTitle && (
                        <p className="text-zinc-400">
                          Role: <span className="text-white">{selectedApp.tenant.jobTitle}</span>
                        </p>
                      )}
                      {selectedApp.tenant?.yearlyIncome && (
                        <p className="text-zinc-400">
                          Income: <span className="text-white">₦{Number(selectedApp.tenant.yearlyIncome).toLocaleString()}/yr</span>
                        </p>
                      )}
                    </div>
                  )}

                  {selectedApp.tenant?.profileBio && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">About</p>
                      <p className="text-sm text-zinc-400">{selectedApp.tenant.profileBio}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-white">Screening</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(selectedApp.screeningStatus || {}).length === 0 && (
                        <span className="text-xs text-zinc-500">No screening checks yet.</span>
                      )}
                      {Object.entries(selectedApp.screeningStatus || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 border border-zinc-800 rounded-full px-2 py-1 text-xs">
                          <span className="capitalize text-white">{key.replace('_', ' ')}</span>
                          {screeningPill(value)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-white">Documents</p>
                    {(selectedApp.applicantDocuments || []).length === 0 && (
                      <p className="text-xs text-zinc-500">No documents uploaded.</p>
                    )}
                    {(selectedApp.applicantDocuments || []).map((doc, idx) => (
                      <a key={idx} href={String(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline text-white">
                        <FileText className="w-4 h-4" /> {String(doc.name || doc.type || 'Document')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
