'use client';

import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Building, MapPin, Home, Waves, Users, Search, Filter, ChevronDown, Heart, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';

const purposes = [
  { value: 'rent', label: 'Rent', icon: <Home className="w-5 h-5" />, description: 'Long-term rentals' },
  { value: 'sale', label: 'Buy', icon: <Building className="w-5 h-5" />, description: 'Properties for sale' },
  { value: 'short_let', label: 'Short Let', icon: <Waves className="w-5 h-5" />, description: 'Short stays & vacation' },
  { value: 'share', label: 'Share', icon: <Users className="w-5 h-5" />, description: 'Shared accommodation' },
];

export default function TenantSearchPage() {
  const [activePurpose, setActivePurpose] = useState('rent');
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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListings({
    listingType: activePurpose as any,
    state: filters.state || undefined,
    area: filters.area || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minBedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
    propertyType: filters.propertyType as any,
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
          <h2 className="font-heading font-bold" style={{ color: 'var(--text)' }}>What are you looking for?</h2>
          <div className="flex items-center gap-2">
            <Tabs value={activePurpose} onValueChange={setActivePurpose} className="flex gap-2">
              <TabsList className="grid grid-cols-4 bg-transparent p-1">
                {purposes.map((purpose) => (
                  <TabsTrigger
                    key={purpose.value}
                    value={purpose.value}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 text-sm',
                      activePurpose === purpose.value && 'bg-white shadow-sm'
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
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{purposeConfig.description}</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
            <Input
              type="text"
              placeholder={`Search ${purposeConfig.label.toLowerCase()} properties...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <Input placeholder="State" value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} />
            <Input placeholder="Area" value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
            <Input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
            <Input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            <select className="inp-field" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
              <option value="">Any Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <select className="inp-field" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
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
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {listings.length} {purposeConfig.label.toLowerCase()} propert{listings.length === 1 ? 'y' : 'ies'} found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Sort by:</span>
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
          {[...Array(8)].map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
          <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No properties found</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Try adjusting your search or filters.</p>
          <Button variant="ghost" onClick={() => setFilters({ state: '', area: '', minPrice: '', maxPrice: '', bedrooms: '', propertyType: '' })}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
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

function ListingCard({ listing, purpose }: { listing: any; purpose: string }) {
  const coverImage = listing.images?.find((img: any) => img.isCover) || listing.images?.[0];
  const verificationTier = listing.verificationTier || 'basic';
  const isVerified = verificationTier !== 'basic';

  return (
    <Link href={`/listings/${listing.id}`} className="card overflow-hidden hover:border-[var(--accent)] transition-colors h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        {coverImage ? (
          <img src={coverImage.url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--border)' }}>
            <Home className="w-12 h-12" style={{ color: 'var(--muted)' }} />
          </div>
        )}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <span className={`tag ${isVerified ? 'tag-green' : 'tag-amber'}`}>
            {verificationTier.charAt(0).toUpperCase() + verificationTier.slice(1)}
          </span>
          <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex justify-end gap-2">
          <Badge variant="secondary" className="capitalize">{listing.propertyType}</Badge>
          <Badge variant="outline">{listing.listingType}</Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">{listing.area}, {listing.state}</Badge>
          <p className="font-heading font-bold" style={{ color: 'var(--text)' }}>
            {purpose === 'sale' ? '₦' + Number(listing.price).toLocaleString() : '₦' + Number(listing.price).toLocaleString() + '/yr'}
          </p>
        </div>
        <h3 className="font-heading font-bold mb-1 line-clamp-1" style={{ color: 'var(--text)' }}>{listing.title}</h3>
        <p className="text-sm mb-3 flex-1" style={{ color: 'var(--muted)' }}>
          {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sizeSqm ? listing.sizeSqm + ' sqm' : 'Size not specified'}
        </p>
        <div className="flex items-center gap-3 text-xs pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.area}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {listing.viewsCount} views
          </span>
        </div>
      </div>
    </Link>
  );
}

function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-video" style={{ background: 'var(--border)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4" style={{ background: 'var(--border)' }} />
        <div className="h-4 w-1/2" style={{ background: 'var(--border)' }} />
        <div className="h-3 w-full" style={{ background: 'var(--border)' }} />
        <div className="h-3 w-2/3" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  );
}

