'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  ChevronRight,
  Home,
  Download,
  X,
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
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard, StatusBadge } from '@/components/ui';
import { toast } from '@/hooks/use-toast';

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
  organizationId: string;
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
  userRole?: string;
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

export default function AgentPropertiesClient({ listings, userRole }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

  const selectedCount = selectedIds.size;

  const handlePublishSelected = async () => {
    if (selectedCount === 0) return;
    const confirmed = window.confirm(
      `Publish ${selectedCount} selected listing(s)? This will mark their unlisted units as listed.`
    );
    if (!confirmed) return;

    setPublishing(true);
    try {
      const selectedListings = listings.filter((l) => selectedIds.has(l.id));
      const unlistedUnits = selectedListings.flatMap((l) =>
        l.units.filter((u) => !u.isListed)
      );

      if (unlistedUnits.length === 0) {
        toast({ title: 'No unlisted units to publish' });
        setPublishing(false);
        return;
      }

      let updated = 0;
      for (const unit of unlistedUnits) {
        try {
          const res = await fetch(`/api/orgs/${unit.organizationId}/units/${unit.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isListed: true }),
          });
          if (res.ok) {
            updated++;
          }
        } catch {
          // continue to next unit
        }
      }

      toast({ title: `Published ${updated} unit(s)` });
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      toast({
        title: 'Publish failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleExportCSV = () => {
    if (selectedCount === 0) return;
    const selectedListings = listings.filter((l) => selectedIds.has(l.id));
    const rows = selectedListings.flatMap((l) =>
      l.units.map((u) => ({
        Property: l.title,
        Unit: u.unitNumber,
        Building: u.buildingName || '',
        Type: u.listingType,
        Rent: u.rent,
        Period: u.pricePeriod || '',
        Occupancy: u.occupancy,
        Status: u.isListed ? 'Listed' : 'Unlisted',
      }))
    );

    if (rows.length === 0) {
      toast({ title: 'No units to export' });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export started' });
  };

  const globalSearchPath = userRole === 'tenant' ? '/dashboard/tenant/search' : '/search';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Managed Properties" value={String(counts.totalProperties)} icon={Building2} />
        <StatCard label="Total Units" value={String(counts.totalUnits)} icon={Home} />
        <StatCard label="Active Listings" value={String(counts.activeListings)} icon={CheckCircle2} />
        <StatCard
          label="Verified Properties"
          value={String(listings.filter((l) => l.verificationTier !== 'basic').length)}
          icon={ShieldCheck}
        />
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <span className="text-sm text-emerald-400 font-medium">{selectedCount} selected</span>
          <Button
            size="sm"
            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handlePublishSelected}
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : 'Publish Selected'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 size-3.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-lg text-zinc-400 hover:text-white"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="mr-2 size-3.5" />
            Clear
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-4">
        <form action={globalSearchPath} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">
                All ({String(listings.length).trim()})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Draft ({String(listings.filter((l) => l.status === 'draft').length).trim()})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({String(listings.filter((l) => l.status === 'active').length).trim()})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({String(listings.filter((l) => l.verificationTier !== 'basic').length).trim()})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              name="q"
              placeholder="Search managed properties..."
              className="pl-9 w-full"
            />
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-900/40">
              <TableHead className="w-10 text-zinc-400">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
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
                <TableCell colSpan={7} className="text-center text-sm text-zinc-500 py-12">
                  No managed properties found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((listing) => {
                const isExpanded = expandedRows[listing.id];
                const isSelected = selectedIds.has(listing.id);
                return (
                  <>
                    <TableRow
                      key={listing.id}
                      className={`border-b border-white/[0.08] ${isSelected ? 'bg-white/[0.02]' : ''}`}
                    >
                      <TableCell className="py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(listing.id)}
                          aria-label={`Select ${listing.title}`}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/agent/properties/${listing.id}`}
                            className="block text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                          >
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
                          <p className="text-xs text-zinc-500">
                            {listing.listedUnitCount > 0 ? 'published' : 'unpublished'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {listing.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {listing.permissions.slice(0, 3).map((perm) => (
                              <Badge
                                key={perm}
                                variant="outline"
                                className="text-[11px] border-white/10 text-zinc-300"
                              >
                                {permissionLabels[perm] || perm}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">Not assigned</span>
                        )}
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
                            <ChevronRight
                              className={`ml-1 size-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Link href={`/dashboard/agent/listings/${listing.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-zinc-950/40">
                        <TableCell colSpan={7} className="p-0">
                          <div className="px-6 py-4">
                            <p className="text-xs font-medium text-zinc-400 mb-3">Units</p>
                            {listing.units.length === 0 ? (
                              <p className="text-xs text-zinc-500">No units added yet.</p>
                            ) : (
                              <div className="rounded-xl border border-white/[0.08] bg-[#11151c] overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-zinc-900/40">
                                      <TableHead className="text-zinc-400">Unit Name</TableHead>
                                      <TableHead className="text-zinc-400">Price</TableHead>
                                      <TableHead className="text-zinc-400">Occupancy</TableHead>
                                      <TableHead className="text-zinc-400">Status</TableHead>
                                      <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {listing.units.map((unit) => (
                                      <TableRow key={unit.id} className="border-b border-white/[0.06]">
                                        <TableCell className="py-3">
                                          <div>
                                            <p className="text-sm font-medium text-white">{unit.unitNumber}</p>
                                            <p className="text-xs text-zinc-500">{unit.buildingName || '—'}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                          <span className="text-sm text-white">
                                            {unit.rent > 0
                                              ? formatCurrency(unit.rent)
                                              : 'Contact for Pricing'}
                                            {unit.pricePeriod && unit.rent > 0
                                              ? `/${unit.pricePeriod}`
                                              : ''}
                                          </span>
                                        </TableCell>
                                        <TableCell className="py-3">
                                          <span className="text-xs text-zinc-400">{unit.occupancy}</span>
                                        </TableCell>
                                        <TableCell className="py-3">
                                          {unit.isListed ? (
                                            <span className="tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                              Listed
                                            </span>
                                          ) : (
                                            <span className="tag bg-muted text-zinc-500 border border-white/[0.08]">
                                              Unlisted
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                          <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900"
                                          >
                                            <Link href={`/dashboard/agent/properties/${listing.id}`}>View</Link>
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
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
