'use client';

import { useState } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrganizationListings } from '@/hooks/useOrganizations';
import { useUnits, usePortfolioOverview } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Plus, Search, Filter, FileUp, Eye, Edit, Home } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: portfolioData } = usePortfolioOverview(orgId ?? '');
  const { data: unitsData } = useUnits(orgId ?? '', { limit: 100 });

  const portfolioUnits = portfolioData?.data?.units || {};
  const units = unitsData?.data || [];
  const unitsByListingId = new Map(units.map((u: unknown) => [u.listingId, u]));

  // Only fetch listings when we have a valid organization ID to avoid repeated requests
  const { data: listingsData, isLoading: listingsLoading } = useOrganizationListings(
    orgId ?? '',
    { limit: 100 },
    Boolean(orgId)
  );

  const listings = listingsData?.data || [];

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing: unknown) => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const unit = unitsByListingId.get(listing.id);
    const unitOccupancy = unit?.occupancy?.toUpperCase?.() || 'VACANT';
    const matchesOccupancy = occupancyFilter === 'all' ||
      (occupancyFilter === 'occupied' && unitOccupancy === 'OCCUPIED') ||
      (occupancyFilter === 'vacant' && unitOccupancy === 'VACANT');

    return matchesSearch && matchesStatus && matchesOccupancy;
  });

  if (orgsLoading || listingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-zinc-500 mb-4" />
        <p className="text-zinc-500">No organization found</p>
      </div>
    );
  }

  const totalUnits = portfolioUnits.totalUnits ?? listings.length;
  const occupiedUnits = portfolioUnits.occupiedUnits ?? 0;
  const vacantUnits = portfolioUnits.vacantUnits ?? 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-zinc-500">
            Manage all properties under {org.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/landlord/properties/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 animate-fadeIn">
        <div className="glass-card bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-lg font-semibold text-white text-sm font-medium">Total Units</h3>
            <Home className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold">{totalUnits}</div>
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-lg font-semibold text-white text-sm font-medium">Occupied</h3>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-emerald-500">{occupiedUnits}</div>
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-lg font-semibold text-white text-sm font-medium">Vacant</h3>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-emerald-500">{vacantUnits}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="p-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by title or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Occupancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Units ({filteredListings.length})</h3>
        </div>
        <div className="p-6">
          {filteredListings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing: unknown) => {
                  const unit = unitsByListingId.get(listing.id);
                  const isOccupied = unit?.occupancy?.toUpperCase?.() === 'OCCUPIED';
                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-sm text-zinc-500">
                            {listing.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {listing.propertyType || 'N/A'}
                      </TableCell>
                      <TableCell>
                        ₦{Number(listing.price || 0).toLocaleString()}
                        {listing.pricePeriod && `/${listing.pricePeriod}`}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isOccupied ? 'success' : 'secondary'}
                        >
                          {isOccupied ? 'Occupied' : 'Vacant'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                          >
                            <Link
                              href={`/dashboard/estate-manager/portfolio/${listing.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                          >
                            <Link href={`/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Home className="h-12 w-12 mx-auto mb-4 text-zinc-500 opacity-50" />
              <p className="text-zinc-500">No units found</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href={`/dashboard/landlord/properties/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Unit
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
