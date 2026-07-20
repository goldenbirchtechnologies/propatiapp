'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useUnit } from '@/hooks/useUnits';
import { useOrganizationTickets } from '@/hooks/useOrganizationTickets';
import { useAgreementsByListing } from '@/hooks/useAgreements';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Building2,
  MapPin,
  ArrowLeft,
  Wrench,
  Users,
  FileText,
  Calendar,
  DollarSign,
  BedDouble,
  Bath,
  Square,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Available', className: 'tag-green' },
  RENTED: { label: 'Rented', className: 'tag-blue' },
  MAINTENANCE: { label: 'Maintenance', className: 'tag-amber' },
  UNAVAILABLE: { label: 'Unavailable', className: 'tag-red' },
};

const occupancyConfig: Record<string, { label: string; className: string }> = {
  VACANT: { label: 'Vacant', className: 'tag-gray' },
  OCCUPIED: { label: 'Occupied', className: 'tag-green' },
  NOTICE_GIVEN: { label: 'Notice Given', className: 'tag-amber' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'tag-gray' },
  medium: { label: 'Medium', className: 'tag-blue' },
  high: { label: 'High', className: 'tag-amber' },
  urgent: { label: 'Urgent', className: 'tag-red' },
};

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const unitId = params.unitId as string;

  const { data: orgsData, isLoading: orgsLoading, error: orgsError } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const {
    data: unitData,
    isLoading: unitLoading,
    error: unitError,
    refetch: refetchUnit,
  } = useUnit(orgId || '', unitId);

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useOrganizationTickets(
    orgId || '',
    unitData?.data?.listingId ? { listingId: unitData.data.listingId, limit: 20 } : undefined,
    !!orgId && !!unitData?.data?.listingId
  );

  const {
    data: agreementsData,
    isLoading: agreementsLoading,
    error: agreementsError,
    refetch: refetchAgreements,
  } = useAgreementsByListing(unitData?.data?.listingId || '', !!unitData?.data?.listingId);

  const loading = orgsLoading || unitLoading;
  const error = orgsError || unitError;

  const unit = unitData?.data;
  const tickets = ticketsData?.data || [];
  const agreements = agreementsData?.data || [];

  const handleRetry = async () => {
    try {
      await refetchUnit();
      if (unit?.listingId) {
        await refetchTickets();
        await refetchAgreements();
      }
      toast({ title: 'Success', description: 'Data refreshed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to refresh data', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  if (error || !unit) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Unit Details
              </h1>
            </div>
          </div>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Unable to load unit details</p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                {error instanceof Error ? error.message : 'Unit not found or access denied.'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button asChild>
                  <Link href="/dashboard/estate-manager/portfolio">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portfolio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard/estate-manager' },
    { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio' },
    { label: 'Units', href: '/dashboard/estate-manager/units' },
    { label: `${unit.buildingName || ''} ${unit.unitNumber}` },
  ];

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <ErrorBoundary>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span style={{ color: 'var(--muted)' }}>/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {unit.buildingName ? `${unit.buildingName} — ` : ''}
                Unit {unit.unitNumber}
              </h1>
              <p className="flex items-center gap-1 mt-1" style={{ color: 'var(--muted)' }}>
                <MapPin className="h-4 w-4" />
                {unit.listing?.address || 'No address linked'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusConfig[unit.status]?.className || 'tag-gray'}>
              {statusConfig[unit.status]?.label || unit.status}
            </Badge>
            <Badge className={occupancyConfig[unit.occupancy]?.className || 'tag-gray'}>
              {occupancyConfig[unit.occupancy]?.label || unit.occupancy}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">
              Maintenance
              {tickets.length > 0 && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {tickets.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tenants">
              Tenants
              {agreements.length > 0 && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {agreements.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Unit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Building</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.buildingName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Unit Number</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.unitNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Type</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.type}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Status</p>
                      <Badge className={statusConfig[unit.status]?.className || 'tag-gray'}>
                        {statusConfig[unit.status]?.label || unit.status}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                      <BedDouble className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Bedrooms</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{unit.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                      <Bath className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Bathrooms</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{unit.bathrooms}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                      <Square className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Size (sqm)</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{unit.sizeSqm ? Number(unit.sizeSqm).toLocaleString() : '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Monthly Rent</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                      ₦{Number(unit.rent).toLocaleString()}
                    </p>
                  </div>
                  {unit.cautionDeposit && (
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Caution Deposit</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>
                        ₦{Number(unit.cautionDeposit).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {unit.serviceCharge && (
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Service Charge</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>
                        ₦{Number(unit.serviceCharge).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {unit.currentTenant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Current Tenant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Name</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.currentTenant.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Email</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.currentTenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>Phone</p>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{unit.currentTenant.phone || '—'}</p>
                    </div>
                  </div>
                  {unit.leaseStartDate && unit.leaseEndDate && (
                    <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>Lease Start</p>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {new Date(unit.leaseStartDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>Lease End</p>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {new Date(unit.leaseEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Maintenance History */}
          <TabsContent value="maintenance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Maintenance History
                </CardTitle>
                <Button size="sm" asChild>
                  <Link href="/dashboard/estate-manager/maintenance">Create Ticket</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : ticketsError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>Failed to load maintenance history</p>
                    <Button variant="outline" size="sm" onClick={() => refetchTickets()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket: unknown) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg border transition hover:shadow-sm"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/dashboard/estate-manager/maintenance/${ticket.id}`}
                            className="font-medium hover:underline block truncate"
                            style={{ color: 'var(--text)' }}
                          >
                            {ticket.title}
                          </Link>
                          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                            {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={priorityConfig[ticket.priority]?.className || 'tag-gray'}>
                            {priorityConfig[ticket.priority]?.label || ticket.priority}
                          </Badge>
                          <Badge className={ticket.status === 'open' ? 'tag-red' : ticket.status === 'resolved' || ticket.status === 'closed' ? 'tag-green' : 'tag-blue'}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                    <p style={{ color: 'var(--muted)' }}>No maintenance history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenant History */}
          <TabsContent value="tenants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Tenant History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agreementsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : agreementsError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>Failed to load tenant history</p>
                    <Button variant="outline" size="sm" onClick={() => refetchAgreements()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : agreements.length > 0 ? (
                  <div className="space-y-3">
                    {agreements.map((agreement: unknown) => (
                      <div
                        key={agreement.id}
                        className="flex items-center justify-between p-4 rounded-lg border transition hover:shadow-sm"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>
                            {agreement.tenant?.fullName || 'Unknown Tenant'}
                          </p>
                          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                            {agreement.type} • {agreement.status.replace('_', ' ')}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : '—'}
                            {agreement.endDate ? ` — ${new Date(agreement.endDate).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`tag tag-${agreement.status === 'fully_signed' || agreement.status === 'active' ? 'green' : agreement.status === 'terminated' || agreement.status === 'expired' ? 'red' : 'amber'}`}>
                            {agreement.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                    <p style={{ color: 'var(--muted)' }}>No tenant history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
