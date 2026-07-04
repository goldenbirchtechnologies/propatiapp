'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
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

const MOCK_TENANTS = [
  { id: '1', name: 'Alice Johnson', unit: 'A101', email: 'alice@example.com', status: 'active', leaseEnd: '2025-12-31', noticePeriod: false },
  { id: '2', name: 'Bob Smith', unit: 'B202', email: 'bob@example.com', status: 'active', leaseEnd: '2025-09-30', noticePeriod: false },
  { id: '3', name: 'Carol White', unit: 'C303', email: 'carol@example.com', status: 'pending', leaseEnd: '-', noticePeriod: false },
  { id: '4', name: 'David Brown', unit: 'D404', email: 'david@example.com', status: 'active', leaseEnd: '2025-08-15', noticePeriod: true },
  { id: '5', name: 'Eve Davis', unit: 'E505', email: 'eve@example.com', status: 'notice_period', leaseEnd: '2025-07-31', noticePeriod: true },
];

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
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
        <div
          className="rounded"
          style={{
            height: 11,
            width: '55%',
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
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
          background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
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
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '60%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '45%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '50%', background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '40%', background: 'var(--border)' }} /></td>
    </tr>
  );
}

export default function EstateManagerTenantsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tenants, setTenants] = useState<typeof MOCK_TENANTS>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTenants(MOCK_TENANTS);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setTenants(MOCK_TENANTS);
    }, 700);
  };

  if (error) {
    return (
      <DashboardShell
        navigation={ESTATE_MANAGER_NAVIGATION}
        userRole="estate_manager"
        userName="Estate Manager"
        userAvatar={undefined}
      >
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              Tenants
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Manage tenant operations and occupancy
            </p>
          </div>
          <div className="rounded-lg border" style={{ background: 'var(--destructive)', borderColor: 'var(--destructive)' }} role="alert">
            <div className="bg-destructive/10 border-destructive/30 p-6 text-center rounded-lg" role="alert">
              <p className="text-destructive font-medium mb-1">Unable to load tenants</p>
              <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
              <button onClick={retry} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-sm) var(--space-lg)' }}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const totalTenants = MOCK_TENANTS.length;
  const activeTenants = MOCK_TENANTS.filter((t) => t.status === 'active').length;
  const pendingTenants = MOCK_TENANTS.filter((t) => t.status === 'pending').length;
  const noticePeriodTenants = MOCK_TENANTS.filter((t) => t.status === 'notice_period' || t.noticePeriod).length;

  const filteredTenants = tenants.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.unit.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName="Estate Manager"
      userAvatar={undefined}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              Tenants
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Manage tenant operations and occupancy
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Tenants</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Active</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{activeTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Pending</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{pendingTenants}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Notice Period</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">{noticePeriodTenants}</p>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        {!loading && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                <Input
                  placeholder="Search tenants..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="notice_period">Notice Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Table or Skeleton or Empty State */}
        <Card>
          <div className="p-4">
            {loading ? (
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
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <RowSkeleton key={i} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'var(--text)' }}>No tenants found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  {tenants.length === 0 ? 'No tenants assigned yet.' : 'Try adjusting your filters.'}
                </p>
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
                      <TableCell>
                        <Badge
                          variant={
                            tenant.status === 'active'
                              ? 'default'
                              : tenant.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {tenant.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{tenant.leaseEnd}</TableCell>
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
