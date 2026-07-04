'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useUnits } from '@/hooks/useUnits';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
  Users,
  Home,
  DollarSign,
  ArrowLeft,
  Wrench,
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

function StatCardSkeleton() {
  return (
    <div
      className="skel-card"
      style={{
        animation: 'skel-pulse 1.6s ease-in-out infinite',
        padding: 'var(--space-lg)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="rounded"
          style={{
            height: 14,
            width: 14,
            background:
              'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
        <div
          className="rounded"
          style={{
            height: 11,
            width: '55%',
            background:
              'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
      </div>
      <div
        className="rounded mt-3"
        style={{
          height: 28,
          width: '45%',
          background:
            'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skel-shimmer 1.6s linear infinite',
        }}
      />
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)', animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '40%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '25%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '20%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '25%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'var(--border)' }} /></td>
    </tr>
  );
}

export default function UnitsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [occupancyFilter, setOccupancyFilter] = useState('all');
  const router = useRouter();
  const { data: orgsData, isLoading: orgsLoading, error: orgsError, refetch: refetchOrgs } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: unitsData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnits(orgId || '', {
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(occupancyFilter !== 'all' ? { occupancy: occupancyFilter.replace('notice_given', 'NOTICE_GIVEN') } : {}),
    limit: 100,
  });

  const isLoading = orgsLoading;
  const error = orgsError || unitsError;
  const units = unitsData?.data || [];

  const retry = async () => {
    try {
      await refetchOrgs();
      if (orgId) await refetchUnits();
    } catch {
      // handled by error state
    }
  };

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: any) => u.occupancy === 'OCCUPIED').length;
  const vacantUnits = units.filter((u: any) => u.occupancy === 'VACANT').length;
  const maintenanceUnits = units.filter((u: any) => u.status === 'MAINTENANCE').length;
  const totalMonthlyRent = units.reduce((sum: number, u: any) => sum + (Number(u.rent) || 0), 0);

  const filteredUnits = units.filter((unit: any) => {
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesOccupancy = occupancyFilter === 'all' || unit.occupancy === occupancyFilter.toUpperCase();
    const matchesSearch =
      !search ||
      unit.unitNumber?.toLowerCase().includes(search.toLowerCase()) ||
      unit.buildingName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesOccupancy && matchesSearch;
  });

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Units
              </h1>
              <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Unit registry and occupancy overview</p>
            </div>
          </div>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Unable to load units</p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                {error instanceof Error ? error.message : 'Something went wrong.'}
              </p>
              <Button variant="outline" onClick={retry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Units
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Unit registry and occupancy overview</p>
          </div>
        </div>

        {/* Stat Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Units</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalUnits}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Occupied</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{occupiedUnits}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-amber-600" />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Vacant</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{vacantUnits}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-red-600" />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Maintenance</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{maintenanceUnits}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Monthly Rent</p>
              </div>
              <p className="text-2xl font-bold text-green-600">₦{(totalMonthlyRent / 1e6).toFixed(1)}M</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        {!isLoading && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                <Input
                  placeholder="Search units by number or building..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  style={{ background: 'var(--input-background)' }}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="RENTED">Rented</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Occupancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occupancy</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="VACANT">Vacant</SelectItem>
                  <SelectItem value="NOTICE_GIVEN">Notice Given</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card>
          <div className="p-4">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Tenant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <RowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            ) : unitsLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Tenant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <RowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'var(--text)' }}>No units found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  {units.length === 0 ? 'No units have been added yet.' : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Tenant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit: any) => (
                    <TableRow
                      key={unit.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => router.push(`/dashboard/estate-manager/units/${unit.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p style={{ color: 'var(--text)' }}>{unit.buildingName || 'Unnamed'}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>Unit {unit.unitNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{unit.type}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[unit.status]?.className || 'tag-gray'}>
                          {statusConfig[unit.status]?.label || unit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={occupancyConfig[unit.occupancy]?.className || 'tag-gray'}>
                          {occupancyConfig[unit.occupancy]?.label || unit.occupancy}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>₦{Number(unit.rent).toLocaleString()}</TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>{unit.currentTenant?.fullName || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
