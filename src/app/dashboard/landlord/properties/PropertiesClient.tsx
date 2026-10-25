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
import {
  Building2,
  ShieldCheck,
  MoreVertical,
  Search,
  Plus,
  ChevronDown,
  Heart,
  MapPin,
  Home,
  Eye,
  Pencil,
  LayoutGrid,
  List,
  Upload,
  PieChart,
  BadgeCheck,
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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => {
    const totalProperties = listings.length;
    const totalUnits = listings.reduce((sum, l) => sum + (l.unitCount || 0), 0);
    const activeListings = listings.reduce((sum, l) => sum + (l.listedUnitCount || 0), 0);
    const verified = listings.filter((l) => l.verification?.overallStatus === 'certified').length;
    const occupancy = totalUnits > 0 ? Math.round((activeListings / totalUnits) * 100) : 0;
    return { totalProperties, totalUnits, activeListings, verified, occupancy };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && (listing.listedUnitCount || 0) === 0) return false;
        if (statusFilter !== 'active' && listing.status !== statusFilter) return false;
      }
      if (typeFilter !== 'all') {
        const pt = (listing.propertyType || '').toLowerCase();
        if (!pt.includes(typeFilter.toLowerCase())) return false;
      }
      if (!q) return true;
      const haystack = [listing.title, listing.area, listing.state, listing.propertyType || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query, statusFilter, typeFilter]);

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

  const cardBase = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm';

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Context & Page Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Institutional Portfolio
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Property Management</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">My Properties</h1>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage all your property listings, units, verification tiers, and leasing status
              </span>
            </div>
            {/* Live Stat Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.08] px-3 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-zinc-900 dark:text-white">{counts.totalProperties}</span> Properties
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.08] px-3 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <Building2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-zinc-900 dark:text-white">{counts.totalUnits}</span> Total Units
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.08] px-3 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <PieChart size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.occupancy}%</span> Occupancy
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.08] px-3 py-1 rounded-md text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <BadgeCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tier {counts.verified > 0 ? '4' : '—'}</span> Certified
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start xl:self-center">
            <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Upload size={16} />
              <span>Import Properties</span>
            </button>
            <Link
              href="/dashboard/landlord/properties/new"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus size={16} />
              <span>Add Property</span>
            </Link>
          </div>
        </div>

        {/* Filter & View Controls Bar */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-4 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties by title, address, or tag..."
                className="pl-9 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08]"
              />
            </div>
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium px-3 py-2 pr-8 rounded-lg shadow-sm border border-zinc-200 dark:border-white/[0.08] outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown className="size-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium px-3 py-2 pr-8 rounded-lg shadow-sm border border-zinc-200 dark:border-white/[0.08] outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed Use</option>
              </select>
              <ChevronDown className="size-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {/* Verification Pill */}
            <button className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              <ShieldCheck size={14} />
              <span>Tier 3–5 Verified</span>
            </button>
          </div>
          <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium px-3 py-2 pr-8 rounded-lg shadow-sm border border-zinc-200 dark:border-white/[0.08] outline-none cursor-pointer"
                >
                  <option>Recently Added</option>
                  <option>Highest Revenue</option>
                  <option>Occupancy Rate</option>
                </select>
                <ChevronDown className="size-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-100 dark:bg-white/[0.08] p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Showing {filtered.length} properties</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className={`${cardBase} p-12 flex flex-col items-center justify-center text-center`}>
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/[0.08] flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">No properties yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
              Get started by anchoring your first property or importing portfolio deeds for verification.
            </p>
            <Link
              href="/dashboard/landlord/properties/new"
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Plus size={18} />
              <span>Add Property</span>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => {
              const img = listing.images?.[0]?.url;
              return (
                <div key={listing.id} className={`${cardBase} overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group`}>
                  {/* Image Cover */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {img ? (
                      <img src={img} alt={titleCase(listing.title)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {listing.listedUnitCount > 0 ? 'Active' : titleCase(listing.status)}
                    </div>
                    {/* Favorite */}
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Heart size={16} className={favorites[listing.id] ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                    {/* Bottom overlays */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded text-[10px] font-medium">
                        {formatListingType(listing.listingType)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-emerald-600/90 text-white backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium">
                        {listing.listedUnitCount} / {listing.unitCount} Leased
                      </span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {titleCase(listing.title)}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-zinc-500 dark:text-zinc-400 text-xs truncate">
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
                        <div>{listing.units?.[0]?.bedrooms ?? '—'} Beds • {listing.units?.[0]?.bathrooms ?? '—'} Baths</div>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <div>{listing.units?.[0]?.type ? titleCase(listing.units[0].type) : '—'}</div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/[0.08] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          {(listing.assignedAgent?.fullName || 'BA').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Managed by {listing.assignedAgent?.fullName || 'You'}
                        </span>
                      </div>
                    </div>
                    {/* Price & Verification */}
                    <div className="pt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        <BadgeCheck size={12} />
                        <span>{listing.verification?.overallStatus === 'certified' ? 'Verified' : 'Pending Verification'}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(listing.price)}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">/ {listing.pricePeriod || 'annum'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Footer Actions */}
                  <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-zinc-700 dark:text-zinc-300 text-xs font-medium border-t border-zinc-100 dark:border-white/[0.06]">
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
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className={`${cardBase} overflow-hidden`}>
            <div className="grid grid-cols-12 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              <div className="col-span-4">Property &amp; Address</div>
              <div className="col-span-2">Type &amp; Units</div>
              <div className="col-span-2">Verification</div>
              <div className="col-span-2 text-right">Annual Rent</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.map((listing) => {
                const img = listing.images?.[0]?.url;
                return (
                  <div key={listing.id} className="grid grid-cols-12 items-center px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden">
                        {img ? (
                          <img src={img} alt={titleCase(listing.title)} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-5 w-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link href={`/dashboard/landlord/properties/${listing.id}`} className="text-sm font-semibold text-zinc-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400">
                          {titleCase(listing.title)}
                        </Link>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {titleCase(listing.area)}, {titleCase(listing.state)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{formatListingType(listing.listingType)}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{listing.listedUnitCount}/{listing.unitCount} Units</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                      <BadgeCheck size={14} />
                      <span>{listing.verification?.overallStatus === 'certified' ? 'Verified' : 'Pending'}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(listing.price)}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Link href={`/dashboard/landlord/properties/${listing.id}`} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-600 transition-colors">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/dashboard/landlord/properties/${listing.id}`} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-600 transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}