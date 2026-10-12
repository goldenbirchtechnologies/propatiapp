'use client';

import { useState } from 'react';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { useOrganizationListings } from '@/hooks/useOrganizations';
import { useUnits, usePortfolioOverview } from '@/hooks/useUnits';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { NoOrgState } from '@/components/organizations/NoOrgState';
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
import { Building2, Plus, Search, FileUp, Eye, Edit, Home } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');

  const { organization, organizations, setOrganization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  const { data: portfolioData } = usePortfolioOverview(orgId ?? '');
  const { data: unitsData } = useUnits(orgId ?? '', { limit: 100 });

  const portfolioUnits = portfolioData?.data?.units || {};
  const units = unitsData?.data || [];
  const unitsByListingId = new Map(units.map((u: any) => [u.listingId, u]));

  // Only fetch listings when we have a valid organization ID
  const { data: listingsData, isLoading: listingsLoading } = useOrganizationListings(
    orgId ?? '',
    { limit: 100 },
    Boolean(orgId)
  );

  const listings = listingsData?.data || [];

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing: any) => {
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

  if (orgLoading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-96" />
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
        <NoOrgState
          title="No Organization"
          description="You need an organization to manage your portfolio. Create one or link an existing organization."
          actionLabel="Create Organization"
          actionHref="/dashboard/estate-manager/profile"
          secondaryLabel="Link Organization"
          secondaryHref="/dashboard/estate-manager/invite-property-manager"
        />
      </DashboardShell>
    );
  }

  const totalUnits = portfolioUnits.totalUnits ?? listings.length;
  const occupiedUnits = portfolioUnits.occupiedUnits ?? 0;
  const vacantUnits = portfolioUnits.vacantUnits ?? 0;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Portfolio</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage all properties under {organization.name}
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Total Units</h3>
            <Home className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{totalUnits}</div>
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-emerald-500/10 via-emerald-500/20 to-emerald-500/30">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Occupied</h3>
            <Building2 className="h-4 w-4 text-[#10b981]" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-[#10b981]">{occupiedUnits}</div>
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-amber-500/10 via-amber-500/20 to-amber-500/30">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Vacant</h3>
            <Building2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-amber-500">{vacantUnits}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="p-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
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
                <SelectItem value="all" className="font-medium" style={{ backgroundColor: 'var(--accent)' }}>All Status</SelectItem>
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
                <SelectItem value="all" className="font-medium" style={{ backgroundColor: 'var(--accent)' }}>All Units</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Units ({filteredListings.length})</h3>
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
                {filteredListings.map((listing: any) => {
                  const unit = unitsByListingId.get(listing.id);
                  const isOccupied = unit?.occupancy?.toUpperCase?.() === 'OCCUPIED';
                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{listing.title}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {listing.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{listing.propertyType || 'N/A'}</TableCell>
                      <TableCell>
                        ₦{Number(listing.price || 0).toLocaleString()}
                        {listing.pricePeriod && `/${listing.pricePeriod}`}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={listing.status === 'active' ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={isOccupied ? 'occupied' : 'vacant'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/dashboard/estate-manager/portfolio/${listing.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
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
              <Home className="h-12 w-12 mx-auto mb-4 text-zinc-600 dark:text-zinc-400 opacity-50" />
              <p className="text-zinc-600 dark:text-zinc-400">No units found. Add your first property to get started.</p>
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
    </DashboardShell>
  );
}
