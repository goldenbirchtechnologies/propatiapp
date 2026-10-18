'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2 as BuildingIcon,
  CheckCircle as CheckCircleIcon,
  FileText as FileIcon,
  ShieldCheck as ShieldCheckIcon,
  MoreVertical,
  Search,
  Plus,
  ChevronRight,
  Heart,
  MapPin,
  Home,
  Eye,
  Pencil,
} from 'lucide-react';

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

export default function PropertiesClient({ listings }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
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
    <div className="space-y-6 p-4 sm:p-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              Institutional Portfolio
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Property Management</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Properties</h1>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage all your property listings, units, verification tiers, and leasing status
            </span>
          </div>
          {/* Live Stat Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-900 dark:text-white">{counts.totalProperties}</span> Properties
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <BuildingIcon size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-zinc-900 dark:text-white">{counts.totalUnits}</span> Total Units
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <CheckCircleIcon size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.activeListings}</span> Active
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              <ShieldCheckIcon size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.verified}</span> Verified
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start xl:self-center">
          <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <FileIcon size={16} />
            <span>Import Properties</span>
          </button>
          <Link
            href="/dashboard/landlord/properties/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filter & View Controls Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties by title, address, or tag..."
              className="pl-9 bg-white dark:bg-zinc-800"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All Statuses</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">View:</span>
            <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                title="Grid View"
              >
                <BuildingIcon size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                title="List View"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Showing {filtered.length} properties</span>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center">
          <BuildingIcon className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-900 dark:text-white">No properties found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {query || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first property to get started.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <div key={listing.id} className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              {/* Image Cover */}
              <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {listing.images[0]?.url ? (
                  <img src={listing.images[0].url} alt={titleCase(listing.title)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BuildingIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {listing.listedUnitCount > 0 ? 'Active' : titleCase(listing.status)}
                </div>
                {/* Favorite */}
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <Heart size={14} className={favorites[listing.id] ? 'fill-red-500 text-red-500' : ''} />
                </button>
                {/* Bottom overlays */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px] font-medium">
                    {formatListingType(listing.listingType)}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                    {listing.listedUnitCount} / {listing.unitCount} Leased
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {titleCase(listing.title)}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-zinc-500 dark:text-zinc-400 text-xs truncate">
                    <MapPin size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{titleCase(listing.area)}, {titleCase(listing.state)}</span>
                  </div>
                  {/* Stats Bar */}
                  <div className="flex items-center justify-between py-2 my-2.5 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Home size={12} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{listing.unitCount} Units</span>
                    </div>
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <div>{listing.units[0]?.bedrooms ?? '—'} Beds • {listing.units[0]?.bathrooms ?? '—'} Baths</div>
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <div>{listing.units[0]?.type ? titleCase(listing.units[0].type) : '—'}</div>
                  </div>
                </div>
                {/* Price & Verification */}
                <div className="pt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <ShieldCheckIcon size={12} />
                    <span>{listing.verification?.overallStatus === 'certified' ? 'Verified' : 'Pending Verification'}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(listing.price)}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">/ {listing.pricePeriod || 'annum'}</span>
                  </div>
                </div>
              </div>
              {/* Footer Actions */}
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <Link href={`/dashboard/landlord/properties/${listing.id}`} className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Eye size={14} />
                  <span>View Property</span>
                </Link>
                <Link href={`/dashboard/landlord/properties/${listing.id}`} className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Pencil size={14} />
                  <span>Edit</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <MoreVertical size={14} />
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
                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDelete(listing.id)}>
                      Delete Property
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((listing) => (
                <tr key={listing.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/landlord/properties/${listing.id}`} className="font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400">
                      {titleCase(listing.title)}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
                    {titleCase(listing.area)}, {titleCase(listing.state)}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {listing.unitCount} / {listing.listedUnitCount} listed
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(listing.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      listing.listedUnitCount > 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {listing.listedUnitCount > 0 ? 'Active' : titleCase(listing.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/landlord/properties/${listing.id}`} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-600 transition-colors">
                        <Eye size={14} />
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 transition-colors">
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/landlord/properties/${listing.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>Add Unit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(listing.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
