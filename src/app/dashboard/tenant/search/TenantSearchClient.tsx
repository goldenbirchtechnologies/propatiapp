'use client';

import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  MapPin,
  Home,
  Waves,
  Users,
  Search,
  Filter,
  Heart,
  Tag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface TenantSearchClientProps {
  initialPurpose?: string;
}

const purposes = [
  { value: 'rent', label: 'Rent', icon: <Home className="w-5 h-5" />, description: 'Long-term rentals' },
  { value: 'sale', label: 'Buy', icon: <Building className="w-5 h-5" />, description: 'Properties for sale' },
  { value: 'short_let', label: 'Short Let', icon: <Waves className="w-5 h-5" />, description: 'Short stays & vacation' },
  { value: 'share', label: 'Share', icon: <Users className="w-5 h-5" />, description: 'Shared accommodation' },
];

export default function TenantSearchClient({ initialPurpose = 'rent' }: TenantSearchClientProps) {
  const [activePurpose, setActivePurpose] = useState(initialPurpose);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    area: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const handleSave = (id: string) => {
    setSavedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListings({
    listingType: activePurpose as unknown,
    state: filters.state || undefined,
    area: filters.area || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minBedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
    propertyType: filters.propertyType as unknown,
    status: 'active',
  });

  const listings = data?.pages.flatMap(page => page.data || []) || [];

  const purposeConfig = purposes.find(p => p.value === activePurpose) || purposes[0];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Purpose Switcher */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-sm text-primary">What are you looking for?</h2>
          <div className="flex items-center gap-2">
            <Tabs value={activePurpose} onValueChange={setActivePurpose} className="flex gap-2">
              <TabsList className="grid grid-cols-4 bg-transparent p-1">
                {purposes.map(purpose => (
                  <TabsTrigger
                    key={purpose.value}
                    value={purpose.value}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 text-sm',
                      activePurpose === purpose.value && 'bg-surface-container-lowest shadow-sm'
                    )}
                  >
                    <span className="flex items-center justify-center">{purpose.icon}</span>
                    <span className="font-medium">{purpose.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">{purposeConfig.description}</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <Input
              type="text"
              placeholder={`Search ${purposeConfig.label.toLowerCase()} properties...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pb-4 border-b border-border">
            <Input
              placeholder="State"
              value={filters.state}
              onChange={e => setFilters({ ...filters, state: e.target.value })}
            />
            <Input
              placeholder="Area"
              value={filters.area}
              onChange={e => setFilters({ ...filters, area: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
            />
            <select
              className="inp-field"
              value={filters.bedrooms}
              onChange={e => setFilters({ ...filters, bedrooms: e.target.value })}
            >
              <option value="">Any Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <select
              className="inp-field"
              value={filters.propertyType}
              onChange={e => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <option value="">Any Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="duplex">Duplex</option>
              <option value="land">Land</option>
              <option value="office">Office</option>
              <option value="shop">Shop</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {listings.length} {purposeConfig.label.toLowerCase()} propert{listings.length === 1 ? 'y' : 'ies'} found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant">Sort by:</span>
          <select className="inp-field py-1.5" style={{ width: 'auto' }}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-12 h-12 text-on-surface-variant" style={{ opacity: 0.5 }} />
          <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">No properties found</h3>
          <p className="text-on-surface-variant" style={{ marginBottom: 'var(--space-lg)' }}>
            Try adjusting your search or filters.
          </p>
          <Button
            variant="ghost"
            onClick={() =>
              setFilters({
                state: '',
                area: '',
                minPrice: '',
                maxPrice: '',
                bedrooms: '',
                propertyType: '',
              })
            }
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} purpose={activePurpose} />
            ))}
          </div>
          {(hasNextPage || isFetchingNextPage) && (
            <div className="text-center pt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="w-full max-w-xs"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading more...
                  </>
                ) : (
                  'Load More Properties'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListingCard({ listing, purpose }: { listing: unknown; purpose: string }) {
  const coverImage =
    (listing as { images?: { url: string; isCover?: boolean }[] }).images?.find(
      (img: { isCover?: boolean }) => img.isCover
    ) || (listing as { images?: { url: string }[] }).images?.[0];
  const verificationTier = (listing as { verificationTier?: string }).verificationTier || 'basic';
  const isVerified = verificationTier !== 'basic';

  return (
    <Link href={`/listings/${(listing as { id: string }).id}`} className="card overflow-hidden hover:border-[var(--accent)] transition-colors h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        {coverImage ? (
          <img
            src={(coverImage as { url: string }).url}
            alt={(listing as { title: string }).title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <Home className="w-12 h-12 text-on-surface-variant" />
          </div>
        )}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <span
            className={`tag ${isVerified ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}
          >
            {verificationTier.charAt(0).toUpperCase() + verificationTier.slice(1)}
          </span>
          <Button variant="ghost" size="icon" className="bg-surface-container-lowest/90 hover:bg-surface-container-lowest">
            <Heart
              className="w-4 h-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave((listing as { id: string }).id);
              }}
            />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex justify-end gap-2">
          <Badge variant="secondary" className="capitalize">
            {(listing as { propertyType?: string }).propertyType}
          </Badge>
          <Badge variant="outline">{(listing as { listingType?: string }).listingType}</Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {(listing as { area?: string }).area}, {(listing as { state?: string }).state}
          </Badge>
          <p className="text-headline-sm text-primary">
            {purpose === 'sale'
              ? '₦' + Number((listing as { price?: number }).price).toLocaleString()
              : '₦' + Number((listing as { price?: number }).price).toLocaleString() + '/yr'}
          </p>
        </div>
        <h3 className="text-headline-sm mb-1 line-clamp-1 text-primary">
          {(listing as { title?: string }).title}
        </h3>
        <p className="text-sm mb-3 flex-1 text-on-surface-variant">
          {(listing as { bedrooms?: number }).bedrooms} bed •{' '}
          {(listing as { bathrooms?: number }).bathrooms} bath •{' '}
          {(listing as { sizeSqm?: number }).sizeSqm
            ? (listing as { sizeSqm: number }).sizeSqm + ' sqm'
            : 'Size not specified'}
        </p>
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {(listing as { area?: string }).area}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />{(listing as { viewsCount?: number }).viewsCount ?? 0} views
          </span>
        </div>
      </div>
    </Link>
  );
}

function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-container" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-surface-container" />
        <div className="h-4 w-1/2 bg-surface-container" />
        <div className="h-3 w-full bg-surface-container" />
        <div className="h-3 w-2/3 bg-surface-container" />
      </div>
    </div>
  );
}
