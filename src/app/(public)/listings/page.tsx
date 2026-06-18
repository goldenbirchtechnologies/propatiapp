'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchFilters, SearchFiltersData } from '@/components/listings/search-filters';
import { useListings, useToggleSaveListing } from '@/hooks/useListings';
import { ListingCard as ListingCardComponent, ListingSkeleton } from '@/components/listings/listing-card';
import type { ListingsFilters } from '@/lib/api';

// Convert SearchFiltersData to API ListingsFilters
function toAPIFilters(filters: SearchFiltersData): Omit<ListingsFilters, 'page'> {
  return {
    q: filters.query,
    listingType: filters.listingType !== 'all' ? filters.listingType : undefined,
    propertyType: filters.propertyType?.[0], // API expects single value, component uses array
    area: filters.area,
    state: filters.state,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minBedrooms: filters.bedrooms,
    verificationTier: filters.verificationTier?.[0], // API expects single value
    sortBy: filters.sortBy === 'relevance' ? 'newest' :
           filters.sortBy === 'price_asc' ? 'price_asc' :
           filters.sortBy === 'price_desc' ? 'price_desc' :
           filters.sortBy === 'verification' ? 'most_verified' : 'newest',
    limit: filters.limit || 20,
  };
}

// Parse URL params into SearchFiltersData
function parseURLParams(searchParams: URLSearchParams): SearchFiltersData {
  const propertyTypeParam = searchParams.get('propertyType');
  const verificationTierParam = searchParams.get('verificationTier');

  return {
    query: searchParams.get('q') || undefined,
    listingType: (searchParams.get('listingType') as any) || 'all',
    propertyType: propertyTypeParam ? [propertyTypeParam] : [],
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
    maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
    state: searchParams.get('state') || undefined,
    city: searchParams.get('city') || undefined,
    area: searchParams.get('area') || undefined,
    verificationTier: verificationTierParam ? [verificationTierParam as any] : [],
    amenities: searchParams.getAll('amenities') || [],
    furnished: searchParams.get('furnished') === 'true' || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    limit: 20,
  };
}

// Convert SearchFiltersData to URL params
function toURLParams(filters: SearchFiltersData): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (filters.listingType && filters.listingType !== 'all') params.set('listingType', filters.listingType);
  if (filters.propertyType && filters.propertyType.length > 0) params.set('propertyType', filters.propertyType[0]);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.bedrooms) params.set('minBedrooms', String(filters.bedrooms));
  if (filters.bathrooms) params.set('bathrooms', String(filters.bathrooms));
  if (filters.minArea) params.set('minArea', String(filters.minArea));
  if (filters.maxArea) params.set('maxArea', String(filters.maxArea));
  if (filters.state) params.set('state', filters.state);
  if (filters.city) params.set('city', filters.city);
  if (filters.area) params.set('area', filters.area);
  if (filters.verificationTier && filters.verificationTier.length > 0) {
    params.set('verificationTier', filters.verificationTier[0]);
  }
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach(a => params.append('amenities', a));
  }
  if (filters.furnished) params.set('furnished', 'true');
  if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);

  return params;
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Parse URL params into filters
  const [filters, setFilters] = useState<SearchFiltersData>(() => parseURLParams(searchParams));

  // Sync filters with URL params on mount and when URL changes
  useEffect(() => {
    const newFilters = parseURLParams(searchParams);
    setFilters(newFilters);
  }, [searchParams]);

  // Convert filters to API format
  const apiFilters = useMemo(() => toAPIFilters(filters), [filters]);

  // Fetch listings using the hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useListings(apiFilters);

  // Toggle save/unsave functionality
  const { save, unsave, isSaving, isUnsaving } = useToggleSaveListing();

  // Handle save/unsave
  const handleSaveListing = (listingId: string, shouldSave: boolean) => {
    if (shouldSave) {
      save(listingId);
    } else {
      unsave(listingId);
    }
  };

  // Flatten all pages of listings
  const allListings = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.listings || []) || [];
  }, [data]);

  // Get total count from first page
  const totalResults = data?.pages[0]?.pagination?.total || 0;

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFiltersData>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL
    const params = toURLParams(updatedFilters);
    router.push(`/listings?${params.toString()}`, { scroll: false });
  };

  // Handle reset
  const handleReset = () => {
    const resetFilters: SearchFiltersData = {
      listingType: 'all',
      propertyType: [],
      verificationTier: [],
      amenities: [],
      sortBy: 'relevance',
      limit: 20,
    };
    setFilters(resetFilters);
    router.push('/listings', { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Perfect Property</h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? 'Loading...' : `${totalResults} ${totalResults === 1 ? 'property' : 'properties'} found`}
        </p>
      </div>

      {/* Filters - Desktop Sidebar + Mobile Inline */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Sidebar Filters - Hidden on mobile */}
        <aside className="hidden lg:block lg:w-80 shrink-0">
          <div className="sticky top-4">
            <SearchFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              variant="sidebar"
              isLoading={isLoading}
              totalResults={totalResults}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Inline Filters - Mobile only */}
          <div className="lg:hidden mb-6">
            <SearchFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              variant="inline"
              isLoading={isLoading}
              totalResults={totalResults}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </Button>
          </div>

          {/* Error State */}
          {isError && (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto text-destructive/50" />
              <h3 className="mt-4 text-lg font-semibold text-destructive">Error Loading Listings</h3>
              <p className="mt-2 text-muted-foreground">
                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <ListingSkeleton variant={viewMode} count={6} />
          )}

          {/* Results */}
          {!isLoading && !isError && (
            <>
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                {allListings.length > 0 ? (
                  allListings.map((listing: any) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <ListingCardComponent
                        listing={listing}
                        variant={viewMode}
                        onSave={handleSaveListing}
                        showAgent={true}
                        showVerification={true}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
                    <p className="mt-2 text-muted-foreground">Try adjusting your filters or search criteria</p>
                    <Button variant="outline" onClick={handleReset} className="mt-4">
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
