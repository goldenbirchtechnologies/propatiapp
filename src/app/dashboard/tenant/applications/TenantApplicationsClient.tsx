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
  under_review: { label: 'Under Review', className: 'bg-zinc-900 text-zinc-300 border-white/[0.08]' },
  accepted: { label: 'Accepted', className: 'bg-success/10 text-[#00ff66] border-[#00ff66]/20' },
  rejected: { label: 'Not Successful', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-zinc-950/50 text-zinc-500 border-white/[0.08]' },
};

export default function TenantApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const router = useRouter();

  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;
  const rejected = applications.filter((a) => a.status === 'rejected').length;

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
        <h1 className="font-heading font-semibold" style={{ fontSize: 'var(--text-page-title)' }}>
          My Applications
        </h1>
        <p className="text-zinc-500" style={{ marginTop: 'var(--space-vs)' }}>
          Track the status of your rental applications
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={applications.length} icon={<Building2 className="w-5 h-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Under Review" value={underReview} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Accepted" value={accepted} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Declined" value={rejected} icon={<XCircle className="w-5 h-5" />} />
      </div>

      {applications.length === 0 ? (
        <div className="glass-card">
          <div className="p-6 py-16 text-center">
            <Building2 className="w-12 h-12 text-zinc-500" style={{ opacity: 0.4 }} />
            <h3 className="font-headline-sm text-white mb-2 text-white">
              No applications yet
            </h3>
            <p className="text-zinc-500" style={{ marginBottom: 'var(--space-lg)' }}>
              You haven't applied to any properties yet. Browse listings to get started.
            </p>
            <Link
              href="/dashboard/tenant/search"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-none mt-4"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const cfg = statusConfig[app.status];
            const coverImage = app.listing.images[0];
            const isWithdrawable = app.status === 'pending' || app.status === 'under_review';
            const isWithdrawing = withdrawingId === app.id && isPending;

            return (
              <div className="glass-card" key={app.id} className="overflow-hidden">
                <div className="p-6 p-0">
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
                          <h3 className="text-white truncate text-white">
                            {app.listing.title}
                          </h3>
                          <p className="text-sm text-zinc-500">
                            {app.listing.area}, {app.listing.state}
                          </p>
                          <p className="text-sm font-medium mt-1 text-white">
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

                      <div className="mt-3 text-xs text-zinc-500">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}Landlord: {app.landlord.fullName}
                      </div>

                      {app.landlordNotes && (
                        <div className="mt-2 space-y-1">
                          <span className="bg-accent/10 text-accent border-accent/20 rounded-md px-2 py-1 text-sm">
                            Landlord note:
                          </span>
                          <p className="text-sm text-zinc-500">{app.landlordNotes}</p>
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
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass-card">
      <div className="p-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1 text-zinc-500">{label}</p>
            <p className="text-2xl text-white text-white">{value}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400" style={{ flexShrink: 0 }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
