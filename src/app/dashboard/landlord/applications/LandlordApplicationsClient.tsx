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
} from '@/components/ui/dialog';
import { Building2, Users, Clock, CheckCircle, XCircle, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant bg-muted/40 p-8 text-center text-on-surface-variant">
      No applications yet.
    </div>
  );
}
import { useRouter } from 'next/navigation';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  landlordNotes: string | null;
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
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-success-bright/10 text-success border-success-bright/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-surface-container-low text-on-surface-variant border-outline-variant' },
};

export default function LandlordApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [listingFilter, setListingFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'review' | null>(null);
  const router = useRouter();

  const uniqueListings = Array.from(
    new Map(applications.map((a) => [a.listing.id, a.listing])).values()
  );

  const filtered = applications.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (listingFilter !== 'all' && a.listing.id !== listingFilter) return false;
    return true;
  });

  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;

  function openReview(app: Application) {
    setSelectedApp(app);
    setNotes(app.landlordNotes ?? '');
    setActionType(null);
  }

  function handleAction(type: 'accept' | 'reject' | 'review') {
    if (!selectedApp) return;
    setActionType(type);

    const statusMap = { accept: 'accepted', reject: 'rejected', review: 'under_review' } as const;
    const nextStatus = statusMap[type];

    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${selectedApp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus, landlordNotes: notes || undefined }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to update application');
          setActionType(null);
          return;
        }

        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? { ...a, status: nextStatus, landlordNotes: notes || a.landlordNotes }
              : a
          )
        );

        if (type === 'accept') {
          toast.success('Application accepted. Conversation and agreement draft created.');
        } else if (type === 'reject') {
          toast.success('Application rejected.');
        } else {
          toast.success('Application marked as under review.');
        }

        setSelectedApp(null);
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
      <div>
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary text-primary">
          Applications
        </h1>
        <p className="text-on-surface-variant">
          Review and manage rental applications for your properties
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={applications.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Under Review" value={underReview} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Accepted" value={accepted} icon={<CheckCircle className="w-5 h-5" />} />
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
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2 text-primary">
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
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Tenant</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Listing</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Message</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Date</th>
                  <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const cfg = statusConfig[app.status];
                  const isActionable = ['pending', 'under_review'].includes(app.status);

                  return (
                    <tr key={app.id} className="border-b border-outline-variant">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="$1 $2"
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
                        <p className="text-xs text-on-surface-variant">{app.listing.area}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm max-w-48 truncate text-on-surface-variant">
                          {app.message || '—'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}
                        >
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
                        <Link href={`/dashboard/landlord/applications/${app.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isActionable}
                          >
                            {isActionable ? 'Review' : 'View'}
                          </Button>
                        </Link>
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
        <DialogContent className="max-w-lg">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Review Application</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div
                  className="p-4 rounded-xl bg-primary/10 text-primary"
                >
                  <p className="text-sm font-semibold text-primary">
                    {selectedApp.listing.title}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {selectedApp.listing.area}, {selectedApp.listing.state}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="$1 $2"
                  >
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
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
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

                {(selectedApp.tenant.employmentStatus ||
                  selectedApp.tenant.employerName ||
                  selectedApp.tenant.yearlyIncome) && (
                  <div
                    className="p-3 rounded-lg space-y-1 text-sm border-outline-variant">
                    <p className="font-medium mb-2 text-primary">Employment</p>
                    {selectedApp.tenant.employmentStatus && (
                      <p className="text-on-surface-variant">
                        Status: <span className="$1 $2">{selectedApp.tenant.employmentStatus.replace('_', ' ')}</span>
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

                {selectedApp.message && (
                  <div>
                    <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-primary">Applicant message</p>
                    <p
                      className="text-sm p-3 rounded-lg text-primary">
                      {selectedApp.message}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium block mb-1.5 text-primary">
                    Notes (optional)
                  </label>
                  <textarea
                    className="inp-field w-full resize-none"
                    rows={3}
                    placeholder="Add a note visible to the tenant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('review')}
                  disabled={isLoading || selectedApp.status === 'under_review'}
                >
                  {actionType === 'review' && isLoading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : null}
                  Mark Under Review
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction('reject')}
                    disabled={isLoading}
                  >
                    {actionType === 'reject' && isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAction('accept')}
                    disabled={isLoading}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    {actionType === 'accept' && isLoading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Accept
                  </Button>
                </div>
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
            <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">{label}</p>
            <p className="text-2xl font-headline-sm text-headline-sm font-bold text-primary text-primary">{value}</p>
          </div>
          <div className="$1 $2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
