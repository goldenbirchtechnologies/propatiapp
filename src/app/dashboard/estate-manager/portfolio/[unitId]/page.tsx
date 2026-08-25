'use client';

import { useParams, useRouter } from 'next/navigation';
import { useListings } from '@/hooks/useListings';
import { useOrganizationTickets } from '@/hooks/useOrganizationTickets';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useUnits } from '@/hooks/useUnits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  Home,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;

  const { data: orgsData } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: listingData, isLoading } = useListings({ limit: 1 });
  const listing = listingData?.pages?.[0]?.data?.find((l: unknown) => l.id === unitId);

  const { data: unitsData } = useUnits(orgId || '', { limit: 100 });
  const units = unitsData?.data || [];
  const unit = units.find((u: unknown) => u.listingId === listing?.id) || null;

  const { data: ticketsData } = useOrganizationTickets(
    orgId || '',
    { listingId: unitId, limit: 10 },
    !!orgId && !!unitId
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Home className="h-16 w-16 text-zinc-500 mb-4" />
        <p className="text-zinc-500">Unit not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/dashboard/estate-manager/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    );
  }

  const isOccupied = unit?.occupancy === 'OCCUPIED';
  const currentTenant = isOccupied ? unit.currentTenant : null;

  const lease = isOccupied && unit
    ? {
        startDate: unit.leaseStartDate,
        endDate: unit.leaseEndDate,
        rentAmount: unit.rent,
        status: 'active',
      }
    : null;

  const tickets = ticketsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
            <p className="text-zinc-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.address}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/listings/${listing.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Unit
            </Link>
          </Button>
          {isOccupied && (
            <Button variant="outline">Mark Vacant</Button>
          )}
        </div>
      </div>

      {/* Unit Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Property Type</span>
              <Badge variant="secondary">{listing.propertyType || 'N/A'}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Listing Type</span>
              <Badge>{listing.listingType}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Status</span>
              <Badge
                variant={
                  listing.status === 'active'
                    ? 'default'
                    : listing.status === 'draft'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {listing.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Occupancy</span>
              <Badge variant={isOccupied ? 'success' : 'secondary'}>
                {isOccupied ? 'Occupied' : 'Vacant'}
              </Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-zinc-500">Bedrooms</p>
                <p className="text-lg font-semibold">{listing.bedrooms || 0}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Bathrooms</p>
                <p className="text-lg font-semibold">{listing.bathrooms || 0}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Parking</p>
                <p className="text-lg font-semibold">{listing.parkingSpaces || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tenant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTenant ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-zinc-500">Name</p>
                  <p className="font-medium">{currentTenant.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="font-medium">{currentTenant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Phone</p>
                  <p className="font-medium">{currentTenant.phone || '—'}</p>
                </div>
                {unit.leaseStartDate && (
                <div>
                  <p className="text-sm text-zinc-500">Move-in Date</p>
                  <p className="font-medium">
                    {new Date(unit.leaseStartDate).toLocaleDateString()}
                  </p>
                </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  View Tenant Profile
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-2 text-zinc-500 opacity-50" />
                <p className="text-zinc-500">No tenant assigned</p>
                <Button variant="outline" className="mt-4">
                  Assign Tenant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lease Information */}
      {lease && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lease Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-zinc-500">Start Date</p>
                <p className="font-medium">
                  {new Date(lease.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">End Date</p>
                <p className="font-medium">
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Rent Amount</p>
                <p className="font-medium">
                  ₦{Number(lease.rentAmount || 0).toLocaleString()}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Status</p>
                <Badge variant="default">{lease.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance History
          </CardTitle>
          <Button size="sm" asChild>
            <Link href={`/dashboard/estate-manager/maintenance`}>
              Create Ticket
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket: unknown) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-zinc-500">
                      {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                    <Badge>{ticket.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto mb-2 text-zinc-500 opacity-50" />
              <p className="text-zinc-500">No maintenance history</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-zinc-500 opacity-50" />
            <p className="text-zinc-500">No payment history available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
