'use client';

import * as React from 'react';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CategoryToggle, type PropertyCategory } from '@/components/search/CategoryToggle';
import SearchFiltersComponent, { type SearchFilters } from '@/components/search/SearchFilters';
import MobileFilterSheet from '@/components/search/MobileFilterSheet';
import EmptySearchState from '@/components/search/EmptySearchState';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FailureState } from '@/components/feedback/FailureState';
import { ListingsFilters } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

type VerificationTier = 'basic' | 'verified' | 'inspected' | 'certified';
type ListingType = 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  pricePeriod?: 'month' | 'year' | 'once';
  category: 'residential' | 'commercial';
  verificationTier: VerificationTier;
  listingType: ListingType;
  image: string;
  specs?: { beds?: number; baths?: number; sqm?: number; parking?: number };
  isSaved?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function SearchPageInner() {
  const [category, setCategory] = React.useState<PropertyCategory>('residential');
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [displayedCount, setDisplayedCount] = React.useState(8);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const { data: listingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', 'public-search'],
    queryFn: async () => {
      const res = await apiEndpoints.listings.getAll({ page: 1, limit: 100, ...filters } as ListingsFilters);
      return res as unknown as { listings: unknown[]; pagination: unknown };
    },
    staleTime: 60 * 1000,
  });

  const listings = listingsData?.listings ?? [];

  const mappedProperties: Property[] = React.useMemo(() => {
    return listings.map((l) => {
      const cover = l.images?.find((img: unknown) => img.isCover) || l.images?.[0];
      return {
        id: l.id,
        title: l.title,
        description: l.description || '',
        price: Number(l.price),
        pricePeriod: l.listingType === 'sale' ? 'once' : 'year',
        location: `${l.city || l.area}, ${l.state}`,
        category: l.propertyType === 'commercial' ? 'commercial' : 'residential',
        verificationTier: l.verificationTier,
        listingType: l.listingType,
        image: cover?.url || '',
        specs: {
          beds: l.bedrooms ?? undefined,
          baths: l.bathrooms ?? undefined,
          sqm: l.area ?? undefined,
          parking: l.parkingSpaces ?? undefined,
        },
        isSaved: false,
      };
    });
  }, [listings]);

  // Client-side filtering of category because the API may return mixed results
  const filteredProperties = React.useMemo(() => {
    return mappedProperties.filter((p) => p.category === category);
  }, [mappedProperties, category]);

  const visibleProperties = filteredProperties.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProperties.length;

  // ==========================================================================
  // INFINITE SCROLL
  // ==========================================================================

  const loadMore = React.useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 6, filteredProperties.length));
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, hasMore, filteredProperties.length]);

  React.useEffect(() => {
    setDisplayedCount(8);
  }, [category, filters]);

  React.useEffect(() => {
    const node = observerTarget.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleCategoryChange = (next: PropertyCategory) => {
    setCategory(next);
  };

  const handleFiltersChange = (next: SearchFilters) => {
    setFilters(next);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleSave = (_id: string) => {
    // TODO: implement save
  };

  if (error) {
    return (
      <FailureState
        title="Unable to load listings"
        description={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Intro section */}
      <div className="bg-surface-elevated border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-headline-lg font-bold text-on-surface">
                Discover Properties
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Browse verified residential and commercial listings across Nigeria.
              </p>
            </div>

            <CategoryToggle value={category} onChange={handleCategoryChange} />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-6">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-[164px] bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
              <SearchFiltersComponent category={category} onFilterChange={handleFiltersChange} filters={filters} />
              {Object.keys(filters).length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">
                  {filteredProperties.length}{' '}
                  {filteredProperties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-surface text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[18px]"><MaterialIcon name=filter_list className="material-symbols-outlined" />
                Filters
              </button>
            </div>

            {/* Empty State */}
            {filteredProperties.length === 0 && !isLoadingMore && !isLoading && (
              <EmptySearchState onResetFilters={handleResetFilters} />
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 pb-xl">
                <PropertyCardSkeleton count={6} />
              </div>
            )}

            {/* Property Grid */}
            {filteredProperties.length > 0 && !isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 pb-xl">
                {visibleProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    onSave={handleSave}
                  />
                ))}
              </div>
            )}

            {/* Loading skeletons for infinite scroll */}
            {isLoadingMore && (
              <div className="grid gap-6 sm:grid-cols-2 pb-xl">
                <PropertyCardSkeleton count={4} />
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            {hasMore && !isLoading && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                <span className="text-sm text-on-surface-variant">Loading more properties…</span>
              </div>
            )}

            {!hasMore && filteredProperties.length > 8 && (
              <div className="py-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  You&apos;ve seen all {filteredProperties.length} properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        category={category}
        initialFilters={filters}
        onApplyFilters={handleFiltersChange}
      />
    </div>
  );
}

// ============================================================================
// PAGE
// ==========================================================================

export default function SearchPage() {
  return <SearchPageInner />;
}
