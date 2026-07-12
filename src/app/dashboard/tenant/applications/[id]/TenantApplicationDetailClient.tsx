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
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  rejected: {
    label: 'Not Successful',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-gray-100 text-on-surface-variant border-outline-variant',
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
                <span style={{ color: 'var(--muted)' }}>/</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-medium"
                  style={{ color: 'var(--text)' }}
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
              className="font-heading font-bold"
              style={{
                fontSize: 'var(--text-page-title)',
                color: 'var(--text)',
              }}
            >
              Application Details
            </h1>
            <p
              className="flex items-center gap-1 mt-1"
              style={{ color: 'var(--muted)' }}
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
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Property
                    </p>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      {initial.listing.title}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Area
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        {initial.listing.area}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        State
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        {initial.listing.state}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Rent
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text)' }}
                    >
                      ₦{initial.listing.price.toLocaleString()}
                      {initial.listing.pricePeriod
                        ? `/${initial.listing.pricePeriod}`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Type
                    </p>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--text)' }}
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
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
                      }}
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
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        {initial.landlord.fullName}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--muted)' }}
                      >
                        {initial.landlord.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Applied On
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
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
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Last Updated
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
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
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Reviewed On
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
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
                        className="rounded-xl overflow-hidden border"
                        style={{ borderColor: 'var(--border)' }}
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
                    className="text-sm mt-4"
                    style={{ color: 'var(--muted)' }}
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
                    style={{ color: 'var(--muted)', opacity: 0.4 }}
                  />
                  <h3
                    className="font-heading font-bold text-lg mb-2"
                    style={{ color: 'var(--text)' }}
                  >
                    No documents yet
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
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
                        className="w-0.5 h-full"
                        style={{ background: 'var(--border)' }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        Application Submitted
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--muted)' }}
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
                                : 'var(--muted)',
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className="font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Application Reviewed
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--muted)' }}
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
                          className="font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Application Accepted
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--muted)' }}
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
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <p
                          className="font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Application Not Successful
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--muted)' }}
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
                      className="whitespace-pre-line"
                      style={{ color: 'var(--text)' }}
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
                      className="whitespace-pre-line"
                      style={{ color: 'var(--text)' }}
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
                      style={{ color: 'var(--muted)', opacity: 0.4 }}
                    />
                    <h3
                      className="font-heading font-bold text-lg mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      No notes yet
                    </h3>
                    <p style={{ color: 'var(--muted)' }}>
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
