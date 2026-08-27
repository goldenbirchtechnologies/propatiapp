'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  ChevronRight,
  Home,
  MoreVertical,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard, StatusBadge } from '@/components/ui';

type Unit = {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  listingType: string;
  pricePeriod: string | null;
  rent: number;
  status: string;
  occupancy: string;
  isListed: boolean;
  currentTenant?: { id: string; fullName: string; email: string } | null;
};

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  price: number;
  pricePeriod: string | null;
  status: string;
  verificationTier: string;
  viewsCount: number;
  createdAt: string;
  owner: { id: string; fullName: string; email: string; avatarUrl?: string } | null;
  agent: { id: string; fullName: string; email: string } | null;
  coverImage: string | null;
  unitCount: number;
  vacantUnitCount: number;
  listedUnitCount: number;
  permissions: string[];
  units: Unit[];
};

type Props = {
  listings: Listing[];
};

function formatCurrency(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

const permissionLabels: Record<string, string> = {
  add_listings: 'Add listings',
  edit_listings: 'Edit listings',
  view_inquiries: 'View inquiries',
  record_payments: 'Record payments',
  schedule_viewings: 'Schedule viewings',
  upload_documents: 'Upload documents',
  view_reports: 'View reports',
  manage_team: 'Manage team',
};

export default function AgentPropertiesClient({ listings }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => {
    const totalProperties = listings.length;
    const totalUnits = listings.reduce((sum, l) => sum + l.unitCount, 0);
    const activeListings = listings.reduce((sum, l) => sum + (l.listedUnitCount || 0), 0);
    return { totalProperties, totalUnits, activeListings };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [listing.title, listing.area, listing.state, listing.propertyType || '', listing.address || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query, statusFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Managed Properties" value={String(counts.totalProperties)} icon={Building2} />
        <StatCard label="Total Units" value={String(counts.totalUnits)} icon={Home} />
        <StatCard label="Active Listings" value={String(counts.activeListings)} icon={CheckCircle2} />
        <StatCard label="Verified Properties" value={String(listings.filter((l) => l.verificationTier !== 'basic').length)} icon={ShieldCheck} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({listings.filter((l) => l.status === 'draft').length})</TabsTrigger>
            <TabsTrigger value="active">Active ({listings.filter((l) => l.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({listings.filter((l) => l.verificationTier !== 'basic').length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search managed properties..."
            className="pl-9 sm:w-72"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-900/40">
              <TableHead className="text-zinc-400">Property</TableHead>
              <TableHead className="text-zinc-400">Owner</TableHead>
              <TableHead className="text-zinc-400">Units</TableHead>
              <TableHead className="text-zinc-400">Listed</TableHead>
              <TableHead className="text-zinc-400">Permissions</TableHead>
              <TableHead className="text-right text-zinc-400">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-zinc-500 py-12">
                  No managed properties found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((listing) => {
                const isExpanded = expandedRows[listing.id];
                return (
                  <>
                    <TableRow key={listing.id} className="border-b border-white/[0.08]">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <Link href={`/dashboard/agent/properties/${listing.id}`} className="block text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                            {listing.title}
                          </Link>
                          <p className="text-xs text-zinc-500 truncate max-w-xs">
                            {listing.address || `${listing.area}, ${listing.state}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300">
                              {listing.listingType}
                            </Badge>
                            <StatusBadge status={listing.status} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white">{listing.owner?.fullName || '—'}</p>
                          <p className="text-xs text-zinc-500">{listing.owner?.email || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white">{listing.unitCount}</p>
                          <p className="text-xs text-zinc-500">{listing.vacantUnitCount} vacant</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white">{listing.listedUnitCount}</p>
                          <p className="text-xs text-zinc-500">published</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {listing.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-[11px] border-white/10 text-zinc-300">
                              {permissionLabels[perm] || perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900"
                            onClick={() => toggleRow(listing.id)}
                          >
                            {isExpanded ? 'Hide Units' : 'View Units'}
                            <ChevronRight className={`ml-1 size-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                          <Button asChild size="sm" className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                            <Link href={`/dashboard/agent/listings/${listing.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-zinc-950/40">
                        <TableCell colSpan={6} className="p-0">
                          <div className="px-6 py-4">
                            <p className="text-xs font-medium text-zinc-400 mb-3">Units</p>
                            {listing.units.length === 0 ? (
                              <p className="text-xs text-zinc-500">No units added yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {listing.units.map((unit) => (
                                  <div key={unit.id} className="rounded-lg border border-white/[0.08] bg-[#11151c] p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-white">{unit.unitNumber}</p>
                                        <p className="text-xs text-zinc-500">{unit.buildingName || '—'}</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300">
                                          {unit.listingType}
                                        </Badge>
                                        {unit.isListed ? (
                                          <span className="tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Listed</span>
                                        ) : (
                                          <span className="tag bg-muted text-zinc-500 border border-white/[0.08]">Unlisted</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                                      <span>{formatCurrency(unit.rent)} {unit.pricePeriod ? `/${unit.pricePeriod}` : ''}</span>
                                      <span className="text-zinc-500">{unit.occupancy}</span>
                                    </div>
                                    {unit.currentTenant && (
                                      <p className="mt-2 text-xs text-zinc-500">
                                        Tenant: {unit.currentTenant.fullName || unit.currentTenant.email}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
