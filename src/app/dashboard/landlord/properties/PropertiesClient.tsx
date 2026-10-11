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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { StatCard } from '@/components/ui/stat-card';

type ListingUnit = {
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
  bedrooms?: number;
  bathrooms?: number;
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
  listedUnitCount: number;
  assignedAgent: { id: string; fullName: string | null; email: string | null } | null;
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

function formatListingType(value?: string) {
  const map: Record<string, string> = {
    rent: 'Rent',
    sale: 'For Sale',
    short_let: 'Short-Let',
    share: 'Shared',
    commercial: 'Commercial',
  };
  if (!value) return 'Rent';
  return map[value] || titleCase(value);
}

function formatUnitSubtext(unit: ListingUnit) {
  if (unit.bedrooms != null && unit.bathrooms != null) {
    return `${unit.bedrooms} Bed • ${unit.bathrooms} Bath`;
  }
  if (unit.type) {
    return titleCase(unit.type);
  }
  return `Unit ${unit.unitNumber}`;
}

function OccupancyBadge({ occupancy }: { occupancy?: string }) {
  const cfg =
    {
      VACANT: { class: 'bg-success/10 text-[#10b981] border-success/20', label: 'Vacant' },
      OCCUPIED: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Occupied' },
      NOTICE_GIVEN: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Notice Given' },
      MAINTENANCE: { class: 'bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]', label: 'Under Maintenance' },
    }[occupancy || 'VACANT'] || {
      class: 'bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]',
      label: occupancy || 'Unknown',
    };

  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function ListingStatusBadge({ isListed }: { isListed?: boolean }) {
  if (isListed) {
    return <span className="tag bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08]/20">Listed</span>;
  }
  return <span className="tag bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]">Unlisted</span>;
}

export default function PropertiesClient({ listings }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const counts = useMemo(() => {
    const totalProperties = listings.length;
    const totalUnits = listings.reduce((sum, l) => sum + l.unitCount, 0);
    const activeListings = listings.reduce((sum, l) => sum + (l.listedUnitCount || 0), 0);
    const verified = listings.filter((l) => l.verification?.overallStatus === 'certified').length;
    return { totalProperties, totalUnits, activeListings, verified };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && listing.listedUnitCount === 0) return false;
        if (statusFilter !== 'active' && listing.status !== statusFilter) return false;
      }
      if (!q) return true;
      const haystack = [listing.title, listing.area, listing.state, listing.propertyType || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query, statusFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goToPublish = (listingId: string, _unit?: ListingUnit) => {
    router.push(`/dashboard/landlord/properties/${listingId}`);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Properties" value={String(counts.totalProperties)} icon={BuildingIcon} />
        <StatCard label="Total Units" value={String(counts.totalUnits)} icon={BuildingIcon} />
        <StatCard label="Active Listings" value={String(counts.activeListings)} icon={CheckCircleIcon} />
        <StatCard label="Verified" value={String(counts.verified)} icon={ShieldCheckIcon} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({listings.filter((l) => l.status === 'draft').length})</TabsTrigger>
            <TabsTrigger value="active">Active ({listings.filter((l) => l.listedUnitCount > 0).length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({counts.verified})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 dark:text-zinc-600 dark:text-zinc-500" />
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-zinc-200">Properties Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-200 dark:border-white/[0.08] bg-[#121820] p-10 text-center text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
              No properties found.
            </div>
          ) : (
            filtered.map((listing) => (
              <div key={listing.id} className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-950 transition hover:border-zinc-700/60 md:flex-col">
                <Link href={`/dashboard/landlord/properties/${listing.id}`} className="relative block h-40 w-full shrink-0 overflow-hidden bg-zinc-900 md:aspect-[16/9] md:h-auto">
                  {listing.images[0]?.url ? (
                    <img src={listing.images[0].url} alt={titleCase(listing.title)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BuildingIcon className="h-10 w-10 text-zinc-700" />
                    </div>
                  )}
                  <span className="absolute right-2.5 top-2.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                    <VerificationBadge verification={listing.verification} />
                  </span>
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/dashboard/landlord/properties/${listing.id}`} className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-zinc-100 group-hover:underline">{titleCase(listing.title)}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Property actions"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-white/[0.08] bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/landlord/properties/${listing.id}`}>View / Manage</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>Add Unit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleDelete(listing.id)}
                          >
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="truncate pr-2">{titleCase(listing.area)}, {titleCase(listing.state)}</span>
                      <span className="shrink-0 font-medium text-zinc-300">{listing.unitCount} Units</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${listing.listedUnitCount > 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-zinc-900 text-zinc-300 border-zinc-200 dark:border-white/[0.08]'}`}>
                        {listing.listedUnitCount > 0 ? 'Listed' : 'Unlisted'}
                      </span>
                      <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${listing.vacantUnitCount > 0 ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'}`}>
                        {listing.vacantUnitCount > 0 ? `${listing.vacantUnitCount} Vacant` : 'Full'}
                      </span>
                      {listing.assignedAgent ? (
                        <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                          Agent: {listing.assignedAgent.fullName || listing.assignedAgent.email}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" asChild className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">
                      <Link href={`/dashboard/landlord/properties/${listing.id}`}>Manage</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-lg border-zinc-200 dark:border-white/[0.08] bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-900 dark:text-white">
                      <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>Add Unit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'bg-success/10 text-[#10b981] border-success/20', label: 'Active' },
    draft: { class: 'bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]', label: 'Draft' },
    suspended: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Suspended' },
    deleted: { class: 'bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: { overallStatus: string; currentLayer: number } | null }) {
  if (!verification) {
    return <span className="tag bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]">Not Started</span>;
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return <span className="tag bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]">Not Started</span>;
    case 'in_progress':
      return (
        <span className="tag bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08]/20 inline-flex items-center gap-1">
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
      return <span className="tag bg-red-500/10 text-red-500 border-red-500/20">Rejected</span>;
    default:
      return <span className="tag bg-muted text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]">{verification.overallStatus}</span>;
  }
}

function UnitActions({
  listing,
  unit,
  onNavigate,
}: {
  listing: Listing;
  unit: ListingUnit;
  onNavigate: (listingId: string, unit: ListingUnit) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleAction = (action: () => void) => {
    if (unit.occupancy === 'OCCUPIED' && !unit.isListed) {
      setPendingAction(() => action);
      setConfirmOpen(true);
      return;
    }
    action();
  };

  const confirmOccupiedListing = () => {
    if (pendingAction) {
      pendingAction();
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const occupancyLabel =
    unit.occupancy === 'OCCUPIED'
      ? 'This unit is currently occupied.'
      : 'This unit has notice given.';

  const leaseHint =
    unit.occupancy === 'OCCUPIED'
      ? 'Listing now may target a future move-in date.'
      : 'The tenant may still be in place until vacated.';

  if (unit.occupancy === 'OCCUPIED' && unit.isListed) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/landlord/leases?unitId=${unit.id}`}>View Active Lease</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/dashboard/landlord/properties/${listing.id}`}>Tenant Info</Link>
        </Button>
      </div>
    );
  }

  if (unit.isListed) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onNavigate(listing.id, unit)}
      >
        Unlist
      </Button>
    );
  }

  if (unit.listingType === 'short_let') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onNavigate(listing.id, unit)}
      >
        Manage Calendar
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() =>
          handleAction(() => onNavigate(listing.id, unit))
        }
      >
        {unit.occupancy === 'NOTICE_GIVEN' ? 'List Ahead of Vacancy' : 'List to Marketplace'}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>List an occupied unit?</AlertDialogTitle>
            <AlertDialogDescription>
              {occupancyLabel} {leaseHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOccupiedListing}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}