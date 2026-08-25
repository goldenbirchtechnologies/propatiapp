'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { PageHeader, SectionLabel } from '@/components/ui';

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
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  rejected: {
    label: 'Not Successful',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-zinc-900/50 text-zinc-400 border-zinc-800',
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
              {index > 0 && <span className="text-zinc-600">/</span>}
              {item.href ? (
                <Link href={item.href} className="text-zinc-400 hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-white">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Header */}
      <PageHeader
        title="Application Details"
        description={
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {initial.listing.address}
          </span>
        }
        actions={
          <StatusBadge status={statusConfig[initial.status].label} className={statusConfig[initial.status].className}>
            {statusConfig[initial.status].label}
          </StatusBadge>
        }
      />

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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500">Property</p>
                    <p className="font-medium text-white">{initial.listing.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Area</p>
                      <p className="font-medium text-white">{initial.listing.area}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">State</p>
                      <p className="font-medium text-white">{initial.listing.state}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-zinc-500">Rent</p>
                    <p className="text-2xl font-bold text-white">
                      ₦{initial.listing.price.toLocaleString()}
                      {initial.listing.pricePeriod ? `/${initial.listing.pricePeriod}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Type</p>
                    <p className="font-medium text-white">{initial.listing.listingType}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-400" />
                    Landlord Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={initial.landlord.avatarUrl || undefined}
                      name={initial.landlord.fullName}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-white">{initial.landlord.fullName}</p>
                      <p className="text-sm text-zinc-500">{initial.landlord.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Applied On</p>
                      <p className="font-medium text-white">
                        {new Date(initial.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Last Updated</p>
                      <p className="font-medium text-white">
                        {new Date(initial.updatedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {initial.reviewedAt && (
                    <div>
                      <p className="text-sm text-zinc-500">Reviewed On</p>
                      <p className="font-medium text-white">
                        {new Date(initial.reviewedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
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
          <DashboardSection emptyMessage="No documents attached to this application." onRetry={handleRetry}>
            {initial.listing.images.length > 0 ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    Listing Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {initial.listing.images.map((img) => (
                      <div key={img.id} className="rounded-xl overflow-hidden border border-zinc-800">
                        <img src={img.url} alt={initial.listing.title} className="w-full h-32 object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-4 text-zinc-500">These are the listing images associated with the property.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="text-zinc-500 mb-2" style={{ opacity: 0.4 }} />
                  <h3 className="font-headline-sm text-headline-sm mb-2 text-white">No documents yet</h3>
                  <p className="text-zinc-500">There are no documents attached to this application.</p>
                </CardContent>
              </Card>
            )}
          </DashboardSection>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-6">
          <DashboardSection>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      {initial.reviewedAt && <div className="w-0.5 h-full bg-zinc-800" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-white">Application Submitted</p>
                      <p className="text-sm text-zinc-500">
                        {new Date(initial.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {initial.reviewedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: initial.status === 'accepted' ? '#10b981' : '#3f3f46' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">Application Reviewed</p>
                        <p className="text-sm text-zinc-500">
                          {new Date(initial.reviewedAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                  {initial.status === 'accepted' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">Application Accepted</p>
                        <p className="text-sm text-zinc-500">Congratulations! Your application has been accepted.</p>
                      </div>
                    </div>
                  )}
                  {initial.status === 'rejected' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">Application Not Successful</p>
                        <p className="text-sm text-zinc-500">Unfortunately, your application was not successful.</p>
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
          <DashboardSection emptyMessage="No notes on this application." onRetry={handleRetry}>
            <div className="space-y-6">
              {initial.message && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-400" />
                      Your Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-white">{initial.message}</p>
                  </CardContent>
                </Card>
              )}
              {initial.landlordNotes && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-400" />
                      Landlord Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-white">{initial.landlordNotes}</p>
                  </CardContent>
                </Card>
              )}
              {!initial.message && !initial.landlordNotes && (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="text-zinc-500 mb-2" style={{ opacity: 0.4 }} />
                    <h3 className="font-headline-sm text-headline-sm mb-2 text-white">No notes yet</h3>
                    <p className="text-zinc-500">There are no messages or notes on this application.</p>
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
