'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  landlordNotes: string | null;
  createdAt: string | Date;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: string;
    pricePeriod: string | null;
    listingType: string;
    images: { url: string }[];
  };
  landlord: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-success/10 text-success border-success-bright/20' },
  rejected: { label: 'Not Successful', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-surface-container-low text-on-surface-variant border-outline-variant' },
};

export default function TenantApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const router = useRouter();

  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;

  function handleWithdraw(id: string) {
    setWithdrawingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'withdrawn' }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to withdraw application');
          return;
        }

        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'withdrawn' as ApplicationStatus } : a))
        );
        toast.success('Application withdrawn');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setWithdrawingId(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="$1 $2" style={{ fontSize: 'var(--text-page-title)' }}>
          My Applications
        </h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>
          Track the status of your rental applications
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={applications.length} icon={<Building2 className="w-5 h-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Under Review" value={underReview} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Accepted" value={accepted} icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="$1 $2" style={{ opacity: 0.4 }} />
            <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">
              No applications yet
            </h3>
            <p className="text-on-surface-variant" style={{ marginBottom: 'var(--space-lg)' }}>
              You haven&#39;t applied to unknown properties yet. Browse listings to get started.
            </p>
            <Link href="/dashboard/tenant/search" className="btn btn-primary">
              Browse Listings
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const cfg = statusConfig[app.status];
            const coverImage = app.listing.images[0];
            const isWithdrawable = app.status === 'pending' || app.status === 'under_review';
            const isWithdrawing = withdrawingId === app.id && isPending;

            return (
              <Card key={app.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                    <div
                      className="w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ background: 'var(--accent-bg)' }}
                    >
                      {coverImage ? (
                        <img src={coverImage.url} alt={app.listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="text-headline-sm truncate text-primary">
                            {app.listing.title}
                          </h3>
                          <p className="text-sm text-on-surface-variant">
                            {app.listing.area}, {app.listing.state}
                          </p>
                          <p className="text-sm font-medium mt-1 text-primary">
                            ₦{Number(app.listing.price).toLocaleString()}
                            {app.listing.pricePeriod ? `/${app.listing.pricePeriod}` : ''}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-on-surface-variant">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}Landlord: {app.landlord.fullName}
                      </div>

                      {app.landlordNotes && (
                        <div
                          className="$1 $2"
                        >
                          <span className="font-medium">Landlord note: </span>
                          {app.landlordNotes}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/listings/${app.listing.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          View Listing
                        </Link>
                        {isWithdrawable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(app.id)}
                            disabled={isWithdrawing}
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            {isWithdrawing ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-on-surface-variant">{label}</p>
            <p className="text-2xl text-headline-sm text-primary">{value}</p>
          </div>
          <div className="$1 $2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
