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

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
type ApplicationStage = 'submitted' | 'screening' | 'guarantor_pending' | 'approved' | 'rejected';

export function EmptyState() {
  return (
    <Card className="border-dashed border-outline-variant bg-surface-container-lowest/70 p-8 text-center shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">No applications yet</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-on-surface-variant">
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
    employmentStatus?: string | null;
  };
  screeningStatus: Record<string, string>;
  guarantorData: GuarantorData;
  applicantDocuments: Array<Record<string, unknown>>;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  under_review: { label: 'Under Review', className: 'bg-info/10 text-info border-info/20' },
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
    new Map(applications.map((a) => [a.listing.id, a.listing])).values()
  );

  const filtered = applications.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (stageFilter !== 'all' && (a.stage || 'submitted') !== stageFilter) return false;
    if (listingFilter !== 'all' && a.listing.id !== listingFilter) return false;
    return true;
  });

  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;
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
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">Leasing workflow</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Tenant Applications
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
          Review, screen, and manage tenancy applications end to end.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Total" value={applications.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Under Review" value={underReview} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Accepted" value={accepted} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Screening" value={stageStats.screening} icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="Guarantor Pending" value={stageStats.guarantor_pending} icon={<UserCheck className="w-5 h-5" />} />
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-wrap gap-4">
          <select
            className="inp-field"
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
            className="inp-field"
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
            className="inp-field"
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
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-on-surface-variant" />
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              No applications found
            </h3>
            <p className="text-on-surface-variant">
              {applications.length === 0
                ? 'You have not received any applications yet.'
                : 'No applications match the selected filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Tenant</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Listing</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Stage</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const cfg = statusConfig[app.status];
                  const stage = app.stage || 'submitted';
                  const stageCfg = stageConfig[stage];
                  const isActionable = ['pending', 'under_review'].includes(app.status);

                  return (
                    <tr key={app.id} className="border-b border-outline-variant">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center"
                          >
                            {app.tenant.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-primary">
                              {app.tenant.fullName}
                            </p>
                            <p className="text-xs text-on-surface-variant">{app.tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-primary">{app.listing.title}</p>
                        <p className="text-xs text-on-surface-variant">{app.listing.area}, {app.listing.state}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${stageCfg.className}`}>
                          {stageCfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-on-surface-variant">
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
                  {selectedApp.listing.title} · {selectedApp.listing.area}, {selectedApp.listing.state}
                </DialogDescription>
              </DialogHeader>

              {detailTab === 'applicant' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center">
                      {selectedApp.tenant.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-primary">
                          {selectedApp.tenant.fullName}
                        </p>
                        {selectedApp.tenant.idVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-success bg-success-bright/10 border border-success-bright/20 rounded-full px-2 py-0.5">
                            <BadgeCheck className="w-3 h-3" /> ID Verified
                          </span>
                        )}
                        {selectedApp.tenant.ninVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-info bg-info/10 border border-info/20 rounded-full px-2 py-0.5">
                            <ShieldCheck className="w-3 h-3" /> NIN Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant">{selectedApp.tenant.email}</p>
                      {selectedApp.tenant.phone && (
                        <p className="text-sm text-on-surface-variant">{selectedApp.tenant.phone}</p>
                      )}
                    </div>
                  </div>

                  {(selectedApp.tenant.employmentStatus || selectedApp.tenant.employerName || selectedApp.tenant.yearlyIncome) && (
                    <div className="p-3 rounded-lg space-y-1 text-sm border border-outline-variant">
                      <p className="font-medium mb-2 text-primary">Employment</p>
                      {selectedApp.tenant.employmentStatus && (
                        <p className="text-on-surface-variant">
                          Status: <span className="font-medium">{String(selectedApp.tenant.employmentStatus).replace('_', ' ')}</span>
                        </p>
                      )}
                      {selectedApp.tenant.employerName && (
                        <p className="text-on-surface-variant">
                          Employer: <span className="text-primary">{selectedApp.tenant.employerName}</span>
                        </p>
                      )}
                      {selectedApp.tenant.jobTitle && (
                        <p className="text-on-surface-variant">
                          Role: <span className="text-primary">{selectedApp.tenant.jobTitle}</span>
                        </p>
                      )}
                      {selectedApp.tenant.yearlyIncome && (
                        <p className="text-on-surface-variant">
                          Income: <span className="text-primary">₦{Number(selectedApp.tenant.yearlyIncome).toLocaleString()}/yr</span>
                        </p>
                      )}
                    </div>
                  )}

                  {selectedApp.tenant.profileBio && (
                    <div>
                      <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-primary">About</p>
                      <p className="text-sm text-on-surface-variant">{selectedApp.tenant.profileBio}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary">Screening</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(selectedApp.screeningStatus || {}).length === 0 && (
                        <span className="text-xs text-on-surface-variant">No screening checks yet.</span>
                      )}
                      {Object.entries(selectedApp.screeningStatus || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 border border-outline-variant rounded-full px-2 py-1 text-xs">
                          <span className="capitalize text-primary">{key.replace('_', ' ')}</span>
                          {screeningPill(value)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary">Documents</p>
                    {selectedApp.applicantDocuments.length === 0 && (
                      <p className="text-xs text-on-surface-variant">No documents uploaded.</p>
                    )}
                    {selectedApp.applicantDocuments.map((doc, idx) => (
                      <a key={idx} href={String(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline text-primary">
                        <FileText className="w-4 h-4" /> {String(doc.name || doc.type || 'Document')}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === 'guarantor' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-primary">Guarantor Information</p>
                    {(!selectedApp.guarantorData || Object.keys(selectedApp.guarantorData).length === 0) && (
                      <p className="text-sm text-on-surface-variant">No guarantor information provided yet.</p>
                    )}
                    {Object.entries(selectedApp.guarantorData || {}).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-on-surface-variant capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-primary font-medium text-right">{String(value)}</span>
                      </div>
                    ))}

                    <div className="pt-2">
                      <p className="text-xs font-medium text-primary mb-2">Guarantor Verification</p>
                      {(selectedApp.guarantorData as any)?.verified ? (
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

                  {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                    <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive">
                      Rejection reason: {selectedApp.rejectionReason}
                    </div>
                  )}

                  {selectedApp.requestedInfoAt && (
                    <div className="p-3 rounded-lg border border-warning/20 bg-warning/10 text-sm text-warning">
                      Additional info requested on {new Date(selectedApp.requestedInfoAt).toLocaleString('en-NG')}.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('request_info')}
                      disabled={isLoading || !['pending', 'under_review'].includes(selectedApp.status)}
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
                      disabled={isLoading || !['pending', 'under_review'].includes(selectedApp.status)}
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
                      disabled={isLoading || !['pending', 'under_review'].includes(selectedApp.status)}
                      className="bg-success hover:bg-success/90 text-white"
                    >
                      {actionType === 'accept' && isLoading ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      Approve & Generate Lease
                    </Button>
                  </div>

                  {(actionType === 'reject' || selectedApp.rejectionReason) && (
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
                </div>
              )}

              <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
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
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">{label}</p>
            <p className="text-2xl font-headline-sm text-headline-sm font-bold text-primary">{value}</p>
          </div>
          <div className="flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
