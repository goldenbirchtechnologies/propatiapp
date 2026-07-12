'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DashboardSection } from '@/components/layout/DashboardShell';
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Image as ImageIcon,
  User,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

interface Listing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  price: number;
  pricePeriod: string | null;
  listingType: string;
  description: string;
  images: { id: string; url: string; isCover: boolean }[];
}

interface Landlord {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  landlordNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing: Listing;
  landlord: Landlord;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-success/10 text-success border-success-bright/20',
  },
  rejected: {
    label: 'Not Successful',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-surface-container-low text-on-surface-variant border-outline-variant',
  },
};

export default function TenantApplicationDetailClient({
  application: initial,
}: {
  application: Application;
}) {
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await router.refresh();
      toast.success('Data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setRetrying(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard/tenant' },
    { label: 'Applications', href: '/dashboard/tenant/applications' },
    { label: initial.listing.title },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span  className="text-on-surface-variant">/</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors text-on-surface-variant"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-medium text-primary"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/tenant/applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1
              className="text-headline-sm"
              className="text-primary" style={{ fontSize: 'var(--text-page-title)', }}
            >
              Application Details
            </h1>
            <p
              className="flex items-center gap-1 mt-1 text-on-surface-variant"
            >
              <MapPin className="h-4 w-4" />
              {initial.listing.address}
            </p>
          </div>
        </div>
        <Badge
          className={`${statusConfig[initial.status].className} border`}
        >
          {statusConfig[initial.status].label}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <DashboardSection>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2
                      className="h-5 w-5"
                      style={{ color: 'var(--accent)' }}
                    />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-on-surface-variant">
                      Property
                    </p>
                    <p
                      className="font-medium text-primary"
                    >
                      {initial.listing.title}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-on-surface-variant">
                        Area
                      </p>
                      <p
                        className="font-medium text-primary"
                      >
                        {initial.listing.area}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant">
                        State
                      </p>
                      <p
                        className="font-medium text-primary"
                      >
                        {initial.listing.state}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-on-surface-variant">
                      Rent
                    </p>
                    <p
                      className="text-2xl font-bold text-primary"
                    >
                      ₦{initial.listing.price.toLocaleString()}
                      {initial.listing.pricePeriod
                        ? `/${initial.listing.pricePeriod}`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">
                      Type
                    </p>
                    <p
                      className="font-medium text-primary"
                    >
                      {initial.listing.listingType}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User
                      className="h-5 w-5"
                      style={{ color: 'var(--accent)' }}
                    />
                    Landlord Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-headline-sm text-white"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--accent2))`, }}
                    >
                      {initial.landlord.avatarUrl ? (
                        <img
                          src={initial.landlord.avatarUrl}
                          alt={initial.landlord.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        initial.landlord.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p
                        className="font-medium text-primary"
                      >
                        {initial.landlord.fullName}
                      </p>
                      <p
                        className="text-sm text-on-surface-variant"
                      >
                        {initial.landlord.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-on-surface-variant">
                        Applied On
                      </p>
                      <p
                        className="font-medium text-primary"
                      >
                        {new Date(initial.createdAt).toLocaleDateString(
                          'en-NG',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant">
                        Last Updated
                      </p>
                      <p
                        className="font-medium text-primary"
                      >
                        {new Date(initial.updatedAt).toLocaleDateString(
                          'en-NG',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {initial.reviewedAt && (
                    <div>
                      <p className="text-sm text-on-surface-variant">
                        Reviewed On
                      </p>
                      <p
                        className="font-medium text-primary"
                      >
                        {new Date(initial.reviewedAt).toLocaleDateString(
                          'en-NG',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DashboardSection>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-6">
          <DashboardSection
            emptyMessage="No documents attached to this application."
            onRetry={handleRetry}
          >
            {initial.listing.images.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText
                      className="h-5 w-5"
                      style={{ color: 'var(--accent)' }}
                    />
                    Listing Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {initial.listing.images.map((img) => (
                      <div
                        key={img.id}
                        className="rounded-xl overflow-hidden border border-outline-variant"
                      >
                        <img
                          src={img.url}
                          alt={initial.listing.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-sm mt-4 text-on-surface-variant"
                  >
                    These are the listing images associated with the
                    property.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon
                    className="h-12 w-12 mb-4"
                    className="text-on-surface-variant" style={{ opacity: 0.4 }}
                  />
                  <h3
                    className="font-headline-sm text-headline-sm mb-2 text-primary"
                  >
                    No documents yet
                  </h3>
                  <p  className="text-on-surface-variant">
                    There are no documents attached to this application.
                  </p>
                </CardContent>
              </Card>
            )}
          </DashboardSection>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-6">
          <DashboardSection>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock
                    className="h-5 w-5"
                    style={{ color: 'var(--accent)' }}
                  />
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                      <div
                        className="w-0.5 h-full bg-surface-container"
                      />
                    </div>
                    <div className="space-y-1">
                      <p
                        className="font-medium text-primary"
                      >
                        Application Submitted
                      </p>
                      <p
                        className="text-sm text-on-surface-variant"
                      >
                        {new Date(initial.createdAt).toLocaleString(
                          'en-NG',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {initial.reviewedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background:
                              initial.status === 'accepted'
                                ? 'var(--accent)'
                                : 'var(--surface-container-low)',
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className="font-medium text-primary"
                        >
                          Application Reviewed
                        </p>
                        <p
                          className="text-sm text-on-surface-variant"
                        >
                          {new Date(initial.reviewedAt).toLocaleString(
                            'en-NG',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {initial.status === 'accepted' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{ color: 'var(--accent)' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className="font-medium text-primary"
                        >
                          Application Accepted
                        </p>
                        <p
                          className="text-sm text-on-surface-variant"
                        >
                          Congratulations! Your application has been
                          accepted.
                        </p>
                      </div>
                    </div>
                  )}
                  {initial.status === 'rejected' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="space-y-1">
                        <p
                          className="font-medium text-primary"
                        >
                          Application Not Successful
                        </p>
                        <p
                          className="text-sm text-on-surface-variant"
                        >
                          Unfortunately, your application was not
                          successful.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </DashboardSection>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-6">
          <DashboardSection
            emptyMessage="No notes on this application."
            onRetry={handleRetry}
          >
            <div className="space-y-6">
              {initial.message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare
                        className="h-5 w-5"
                        style={{ color: 'var(--accent)' }}
                      />
                      Your Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="whitespace-pre-line text-primary"
                    >
                      {initial.message}
                    </p>
                  </CardContent>
                </Card>
              )}
              {initial.landlordNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User
                        className="h-5 w-5"
                        style={{ color: 'var(--accent)' }}
                      />
                      Landlord Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="whitespace-pre-line text-primary"
                    >
                      {initial.landlordNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
              {!initial.message && !initial.landlordNotes && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare
                      className="h-12 w-12 mb-4"
                      className="text-on-surface-variant" style={{ opacity: 0.4 }}
                    />
                    <h3
                      className="font-headline-sm text-headline-sm mb-2 text-primary"
                    >
                      No notes yet
                    </h3>
                    <p  className="text-on-surface-variant">
                      There are no messages or notes on this application.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
