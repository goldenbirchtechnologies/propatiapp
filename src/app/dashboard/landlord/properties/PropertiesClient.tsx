'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2 as BuildingIcon,
  CheckCircle as CheckCircleIcon,
  FileText as FileIcon,
  ShieldCheck as ShieldCheckIcon,
  MoreVertical,
  Search,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import { VerificationBadge as SharedVerificationBadge } from '@/components/ui/badges';

type ListingUnit = {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  status: string;
  occupancy: string;
};

type Listing = {
  id: string;
  title: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  status: string;
  price: number;
  pricePeriod: string | null;
  viewsCount: number;
  allowShortlet: boolean;
  images: { url: string }[];
  verification: { overallStatus: string; currentLayer: number } | null;
  unitCount: number;
  vacantUnitCount: number;
  units: ListingUnit[];
};

type Props = {
  listings: Listing[];
};

function formatCurrency(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

function titleCase(value: string) {
  return value
    .split(/[\s,]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const LISTING_TYPE_MAP: Record<string, 'rent' | 'sale' | 'short_let' | 'share' | 'commercial'> = {
  rent: 'rent',
  sale: 'sale',
  shortlet: 'short_let',
  short_let: 'short_let',
  share: 'share',
  roomshare: 'share',
  commercial: 'commercial',
};

export default function PropertiesClient({ listings }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shortletStates, setShortletStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(listings.map((l) => [l.id, !!l.allowShortlet]))
  );
  const [shortletLoading, setShortletLoading] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [publishSelectedUnits, setPublishSelectedUnits] = useState<Record<string, boolean>>({});
  const [publishLoading, setPublishLoading] = useState(false);

  const counts = useMemo(() => {
    const draft = listings.filter((l) => l.status === 'draft').length;
    const active = listings.filter((l) => l.status === 'active').length;
    const verified = listings.filter((l) => l.verification?.overallStatus === 'certified').length;
    return { draft, active, verified };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (statusFilter !== 'all' && listing.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        listing.title,
        listing.area,
        listing.state,
        listing.listingType,
        listing.propertyType || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query, statusFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openPublishModal = (listing: Listing) => {
    const initial: Record<string, boolean> = {};
    listing.units
      .filter((u) => u.occupancy === 'VACANT')
      .forEach((u) => {
        initial[u.id] = true;
      });
    setPublishSelectedUnits(initial);
    setPublishTarget(listing.id);
  };

  const selectedVacantUnitIds = useMemo(() => {
    if (!publishTarget) return [];
    const listing = listings.find((l) => l.id === publishTarget);
    if (!listing) return [];
    return listing.units
      .filter((u) => u.occupancy === 'VACANT' && publishSelectedUnits[u.id])
      .map((u) => u.id);
  }, [publishTarget, publishSelectedUnits, listings]);

  const handlePublish = async () => {
    if (!publishTarget) return;
    const listing = listings.find((l) => l.id === publishTarget);
    if (!listing) return;

    setPublishLoading(true);
    try {
      const selectedUnits = listing.units.filter((u) => publishSelectedUnits[u.id]);
      const res = await fetch(`/api/listings/${publishTarget}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to publish property');
      }

      const unitLabels = selectedUnits.map((u) => `Unit ${u.unitNumber}`).join(', ');
      toast({
        title: 'Published',
        description: `Successfully published ${selectedUnits.length || listing.vacantUnitCount} unit(s) (${unitLabels || listing.title}) to the Marketplace.`,
      });
      setPublishTarget(null);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Publish failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setPublishLoading(false);
    }
  };

  const handleShortletToggle = async (listingId: string, enabled: boolean) => {
    setShortletLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowShortlet: enabled }),
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update short-let setting');
      }

      setShortletStates((prev) => ({ ...prev, [listingId]: enabled }));
      toast({ title: 'Updated', description: 'Short-let setting saved.' });
    } catch (error) {
      setShortletStates((prev) => ({ ...prev, [listingId]: !enabled }));
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setShortletLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({ success: false, error: 'Failed to delete' }));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete property');
      }

      toast({ title: 'Deleted', description: data?.message || 'Property deleted successfully' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'active' | 'suspended') => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Failed to ${status === 'active' ? 'publish' : status === 'draft' ? 'unpublish' : 'resume'} property`);
      }

      toast({ title: 'Updated', description: data?.message || `Listing status updated to ${status}` });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    }
  };

  const publishListing = listings.find((l) => l.id === publishTarget);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={listings.length} icon={<BuildingIcon className="size-5" />} />
        <StatCard label="Active" value={counts.active} icon={<CheckCircleIcon className="size-5" />} />
        <StatCard label="Draft" value={counts.draft} icon={<FileIcon className="size-5" />} />
        <StatCard label="Verified" value={counts.verified} icon={<ShieldCheckIcon className="size-5" />} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({counts.verified})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties..."
              className="pl-9 sm:w-64"
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/landlord/properties/new">
              <Plus className="size-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BuildingIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-headline-sm text-headline-sm font-bold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                {query ? 'Try adjusting your search or filter.' : 'Get started by adding your first property listing.'}
              </p>
              {!query && (
                <Button asChild>
                  <Link href="/dashboard/landlord/properties/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground" />
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Property</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Verification</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Views</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Short-let</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Units</th>
                    <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((listing) => {
                    const isExpanded = !!expandedRows[listing.id];
                    const listingTypeKey = LISTING_TYPE_MAP[listing.listingType.toLowerCase()] || 'rent';
                    const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT');
                    return (
                      <>
                        <tr key={listing.id} className="border-b border-outline-variant last:border-b-0">
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleRow(listing.id)}
                            >
                              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </Button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {listing.images[0] ? (
                                <img
                                  src={listing.images[0].url}
                                  alt={listing.title}
                                  className="w-14 h-14 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                                  <BuildingIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-foreground">{titleCase(listing.title)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {titleCase(listing.area)}, {titleCase(listing.state)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1">
                              <ListingTypeBadge type={listingTypeKey} />
                              {listing.propertyType && (
                                <Badge variant="secondary" className="ml-1">
                                  {listing.propertyType}
                                </Badge>
                              )}
                            </span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={listing.status} />
                          </td>
                          <td className="p-4">
                            <VerificationBadge verification={listing.verification} />
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {formatCurrency(listing.price)}
                            <span className="text-xs text-muted-foreground">/{listing.pricePeriod || 'month'}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">{listing.viewsCount.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!!shortletStates[listing.id]}
                                disabled={shortletLoading === listing.id}
                                onCheckedChange={(checked) => handleShortletToggle(listing.id, checked)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {shortletStates[listing.id] ? 'Enabled' : 'Off'}
                              </span>
                              {shortletLoading === listing.id && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {listing.unitCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => toggleRow(listing.id)}
                                className="text-left"
                              >
                                <span>
                                  {listing.unitCount} unit{listing.unitCount === 1 ? '' : 's'} &middot;{' '}
                                  <span className={listing.vacantUnitCount > 0 ? 'text-success' : 'text-destructive'}>
                                    {listing.vacantUnitCount} vacant
                                  </span>
                                </span>
                              </button>
                            ) : (
                              <span>No units</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="size-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/${listing.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/verify?listingId=${listing.id}`}>Verify</Link>
                                </DropdownMenuItem>
                                {(listing.status === 'draft' || listing.status === 'active') && (
                                  <DropdownMenuItem onSelect={() => openPublishModal(listing)}>
                                    {listing.status === 'draft' ? 'Publish' : 'Republish'}
                                  </DropdownMenuItem>
                                )}
                                {listing.status === 'suspended' && (
                                  <DropdownMenuItem onSelect={() => handleStatusChange(listing.id, 'active')}>
                                    Resume
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>Add Unit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() => handleDelete(listing.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-outline-variant last:border-b-0">
                            <td colSpan={10} className="p-0">
                              <div className="px-4 py-4 bg-background/50">
                                {listing.units.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No units linked to this property.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                                          <th className="pb-2 pr-4">Unit</th>
                                          <th className="pb-2 pr-4">Type</th>
                                          <th className="pb-2 pr-4">Beds</th>
                                          <th className="pb-2 pr-4">Baths</th>
                                          <th className="pb-2 pr-4">Rent</th>
                                          <th className="pb-2 pr-4">Status</th>
                                          <th className="pb-2">Occupancy</th>
                                        </tr>
                                      </thead>
                                      <tbody className="text-foreground">
                                        {listing.units.map((unit) => (
                                          <tr key={unit.id} className="border-t border-outline-variant/60">
                                            <td className="py-2 pr-4">
                                              <div>
                                                <p className="font-medium">
                                                  Unit {unit.unitNumber}
                                                  {unit.buildingName ? ` • ${unit.buildingName}` : ''}
                                                </p>
                                              </div>
                                            </td>
                                            <td className="py-2 pr-4 capitalize">{unit.type}</td>
                                            <td className="py-2 pr-4">{unit.bedrooms}</td>
                                            <td className="py-2 pr-4">{unit.bathrooms}</td>
                                            <td className="py-2 pr-4">{formatCurrency(unit.rent)}</td>
                                            <td className="py-2 pr-4 capitalize">{unit.status.toLowerCase()}</td>
                                            <td className="py-2">
                                              <span className={unit.occupancy === 'VACANT' ? 'text-success' : 'text-destructive'}>
                                                {unit.occupancy.toLowerCase()}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!publishTarget} onOpenChange={(open) => !open && !publishLoading && setPublishTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select units to publish</DialogTitle>
            <DialogDescription>
              {publishListing
                ? `Choose which vacant units from ${titleCase(publishListing.title)} should go live on the marketplace.`
                : 'Choose which vacant units should go live on the marketplace.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {publishListing && publishListing.units.filter((u) => u.occupancy === 'VACANT').length === 0 && (
              <p className="text-sm text-muted-foreground">No vacant units available for this property.</p>
            )}
            {publishListing?.units
              .filter((u) => u.occupancy === 'VACANT')
              .map((unit) => (
                <label key={unit.id} className="flex items-start gap-3 rounded-lg border border-outline-variant p-3">
                  <Checkbox
                    checked={!!publishSelectedUnits[unit.id]}
                    onCheckedChange={(checked) =>
                      setPublishSelectedUnits((prev) => ({
                        ...prev,
                        [unit.id]: checked === true,
                      }))
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Unit {unit.unitNumber}
                      {unit.buildingName ? ` • ${unit.buildingName}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {unit.type} • {unit.bedrooms} bed • {unit.bathrooms} bath • {formatCurrency(unit.rent)}
                    </p>
                  </div>
                </label>
              ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishTarget(null)}
              disabled={publishLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={publishLoading || selectedVacantUnitIds.length === 0}>
              {publishLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish selected units
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-headline-sm font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">{Icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'bg-success/10 text-success border-success/20', label: 'Active' },
    draft: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Draft' },
    suspended: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Suspended' },
    deleted: { class: 'bg-muted text-muted-foreground border-outline-variant', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-muted text-muted-foreground border-outline-variant', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function ListingTypeBadge({ type }: { type: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial' }) {
  const config: Record<string, { class: string; label: string }> = {
    rent: { class: 'bg-type-rent/10 text-type-rent border-type-rent/20', label: 'For Rent' },
    sale: { class: 'bg-type-sale/10 text-type-sale border-type-sale/20', label: 'For Sale' },
    short_let: { class: 'bg-type-shortlet/10 text-type-shortlet border-type-shortlet/20', label: 'Short Let' },
    share: { class: 'bg-type-roomshare/10 text-type-roomshare border-type-roomshare/20', label: 'Room Share' },
    commercial: { class: 'bg-commercial-gold/10 text-commercial-gold border-commercial-gold/20', label: 'Commercial' },
  };
  const cfg = config[type] || { class: 'bg-muted text-muted-foreground border-outline-variant', label: type };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: { overallStatus: string; currentLayer: number } | null }) {
  if (!verification) {
    return <span className="tag bg-warning/10 text-warning border-warning/20">Not Started</span>;
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return <span className="tag bg-warning/10 text-warning border-warning/20">Not Started</span>;
    case 'in_progress':
      return (
        <span className="tag bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Layer {verification.currentLayer}
        </span>
      );
    case 'certified':
      return <SharedVerificationBadge tier="certified" />;
    case 'rejected':
      return <span className="tag bg-destructive/10 text-destructive border-destructive/20">Rejected</span>;
    default:
      return <span className="tag bg-muted text-muted-foreground border-outline-variant">{verification.overallStatus}</span>;
  }
}
