'use client';

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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  landlordNotes: string | null;
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
  agreement: { id: string; status: string } | null;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-success-bright/10 text-success border-success-bright/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  withdrawn: { label: 'Withdrawn', className: 'bg-surface-container-low text-on-surface-variant border-outline-variant' },
};

export default function LandlordApplicationDetailClient({
  application,
}: {
  application: Application;
}) {
  const [notes, setNotes] = useState(application.landlordNotes ?? '');
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'review' | null>(null);
  const router = useRouter();

  const isActionable = ['pending', 'under_review'].includes(application.status);
  const cfg = statusConfig[application.status];

  function handleAction(type: 'accept' | 'reject' | 'review') {
    setActionType(type);
    const statusMap = { accept: 'accepted', reject: 'rejected', review: 'under_review' } as const;
    const nextStatus = statusMap[type];

    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${application.id}`, {
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

        if (type === 'accept') {
          toast.success('Application accepted. Conversation and agreement draft created.');
        } else if (type === 'reject') {
          toast.success('Application rejected.');
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
        <span>/</span>
        <Link href="/dashboard/landlord/applications" className="hover:underline">
          Applications
        </Link>
        <span>/</span>
        <span className="text-primary" className="font-medium">
          {application.listing.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord/applications"
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="font-headline-sm text-headline-sm font-bold text-primary text-primary">
              Application Details
            </h1>
            <p className="text-sm text-on-surface-variant">
              {application.listing.title} · {application.listing.area}, {application.listing.state}
            </p>
          </div>
        </div>
        <Badge className={cfg.className}>{cfg.label}</Badge>
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
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                className="bg-gradient-to-br from-primary to-accent"
              >
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

      {/* Notes & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline-sm text-headline-sm text-primary text-primary">
            <FileText className="inline w-5 h-5 mr-2 text-primary" />
            Review Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-primary">
              Notes (visible to the tenant)
            </label>
            <textarea
              className="inp-field w-full resize-none"
              rows={3}
              placeholder="Add a note visible to the tenant..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {isActionable && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('review')}
                disabled={isPending || application.status === 'under_review'}
              >
                {actionType === 'review' && isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                Mark Under Review
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction('reject')}
                disabled={isPending}
              >
                {actionType === 'reject' && isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleAction('accept')}
                disabled={isPending}
                className="bg-success hover:bg-success/90 text-white"
              >
                {actionType === 'accept' && isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                )}
                Accept
              </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
