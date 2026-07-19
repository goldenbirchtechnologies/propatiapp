'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Users, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useTenants } from '@/hooks/useTenants';

function StatCardSkeleton() {
  return (
    <div
      className="card p-4"
      style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded" style={{ height: 14, width: 14, background: 'border-border' }} />
        <div className="rounded" style={{ height: 11, width: '55%', background: 'border-border' }} />
      </div>
      <div className="rounded mt-3" style={{ height: 28, width: '45%', background: 'border-border' }} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'border-border', animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'border-border' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '60%', background: 'border-border' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '45%', background: 'border-border' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'border-border' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '40%', background: 'border-border' }} /></td>
    </tr>
  );
}

export default function EstateManagerTenantsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: orgsData, isLoading: orgsLoading, error: orgsError, refetch: refetchOrgs } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: tenantsData, isLoading: tenantsLoading, error: tenantsError, refetch: refetchTenants } = useTenants(orgId || '');
  const tenants = tenantsData?.data || [];

  const isLoading = orgsLoading || tenantsLoading;
  const error = orgsError || tenantsError;

  const retry = async () => {
    try {
      await refetchOrgs();
      if (orgId) await refetchTenants();
    } catch {
      // handled by error state
    }
  };

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
          <div className="space-y-6">
            <div>
              <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Tenants</h1>
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Manage tenant operations and occupancy</p>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
              <p className="text-destructive font-medium mb-1">Unable to load tenants</p>
              <p className="text-sm text-muted-foreground mb-3">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
              <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: 'p-4 p-6' }}>Retry</button>
            </div>
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const pendingTenants = tenants.filter((t) => t.status === 'pending').length;
  const noticePeriodTenants = tenants.filter((t) => t.status === 'notice_period').length;

  const filteredTenants = tenants.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.unit.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success/10 text-success border border-border">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border border-border">Pending</Badge>;
      case 'notice_period':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border border-border">Notice Period</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border border-border">{status}</Badge>;
    }
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Tenants</h1>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Manage tenant operations and occupancy</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: 'text-muted-foreground' }} />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Total Tenants</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{totalTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-success" />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Active</p>
                </div>
                <p className="text-2xl font-bold text-success">{activeTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: 'text-muted-foreground' }} />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Pending</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{pendingTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-warning" />
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Notice Period</p>
                </div>
                <p className="text-2xl font-bold text-warning">{noticePeriodTenants}</p>
              </Card>
            </>
          )}
        </div>

        {!isLoading && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'text-muted-foreground' }} />
                <Input placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="notice_period">Notice Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        <Card>
          <div className="p-4">
            {isLoading ? (
              <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lease End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{[1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)}</TableBody>
                </Table>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 h-12 mx-auto mb-4" style={{ color: 'text-muted-foreground', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'text-primary' }}>No tenants found</p>
                <p className="text-sm mt-1" style={{ color: 'text-muted-foreground' }}>No tenants assigned yet.</p>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 h-12 mx-auto mb-4" style={{ color: 'text-muted-foreground', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'text-primary' }}>No tenants found</p>
                <p className="text-sm mt-1" style={{ color: 'text-muted-foreground' }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lease End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.unit}</TableCell>
                      <TableCell>{tenant.email}</TableCell>
                      <TableCell>{statusBadge(tenant.status)}</TableCell>
                      <TableCell>{tenant.leaseEnd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
