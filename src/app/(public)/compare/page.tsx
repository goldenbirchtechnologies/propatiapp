'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api';
import type { ListingsFilters } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { SearchIcon, XIcon, PlusIcon, GitCompareArrowsIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PropertyCard, type PropertyCardProps } from '@/components/listings/PropertyCard';
import {
  PropertyComparison,
} from '@/components/comparison/property-comparison';
import type { ListingData } from '@/components/listings/listing-card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FailureState } from '@/components/feedback/FailureState';

// ============================================================================
// PAGE
// ============================================================================

export default function ComparePage() {
  const [compareList, setCompareList] = React.useState<ListingData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: listingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', 'compare'],
    queryFn: async () => {
      const res = await apiEndpoints.listings.getAll({ page: 1, limit: 100 } as ListingsFilters);
      return res as unknown as { listings: unknown[]; pagination: unknown };
    },
    staleTime: 60 * 1000,
  });

  const listings = listingsData?.listings ?? [];

  const allProperties: ListingData[] = React.useMemo(() => {
    return listings.map((l) => {
      const cover = l.images?.find((img: unknown) => img.isCover) || l.images?.[0];
      return {
        id: l.id,
        title: l.title,
        description: l.description || '',
        price: Number(l.price),
        priceFormatted: formatCurrency(Number(l.price)),
        listingType: l.listingType,
        propertyType: l.propertyType,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        sizeSqm: l.area,
        address: l.address,
        area: l.city || l.area,
        state: l.state,
        images: l.images || (cover ? [cover] : []),
        coverImage: cover?.url || null,
        verificationTier: l.verificationTier,
        status: l.status,
        owner: l.owner
          ? {
              id: l.owner.id,
              fullName: l.owner.fullName || '',
              phone: '',
              profileImage: l.owner.avatarUrl,
            }
          : undefined,
        agent: l.agent
          ? {
              id: l.agent.id,
              fullName: l.agent.fullName || '',
              phone: '',
              profileImage: l.agent.avatarUrl,
            }
          : undefined,
        amenities: l.amenities?.map((a: unknown) => a.name),
        isSaved: false,
        savedByCurrentUser: false,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      };
    });
  }, [listings]);

  const MAX_COMPARE = 3;

  if (error) {
    return (
      <FailureState
        title="Unable to load properties"
        description={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-surface-elevated border-b border-outline-variant">
          <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <GitCompareArrowsIcon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-headline-lg font-bold text-on-surface">Compare Properties</h1>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Loading available listings...
            </p>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="h-40 bg-muted rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter search results: exclude already-selected, match query
  const searchResults = React.useMemo(() => {
    const excludedIds = new Set(compareList.map((p) => p.id));
    const q = searchQuery.trim().toLowerCase();
    let results = allProperties.filter((p) => !excludedIds.has(p.id));
    if (q) {
      results = results.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        `${p.area}, ${p.state}`.toLowerCase().includes(q) ||
        p.propertyType?.toLowerCase().includes(q)
      );
    }
    return results;
  }, [compareList, searchQuery, allProperties]);

  // Helper: get single image URL from ListingData.images union type
  const getImageUrl = (property: ListingData): string =>
    typeof property.images?.[0] === 'string'
      ? property.images[0]
      : property.images?.[0]?.url
        ? property.images[0].url
        : property.coverImage || '/placeholder-property.jpg';

  // Convert ListingData → PropertyCardProps
  const toCardProps = (property: ListingData): PropertyCardProps => ({
    id: property.id,
    title: property.title,
    location: `${property.area}, ${property.state}`,
    price: property.price,
    pricePeriod: property.listingType === 'sale' ? 'once' : 'year',
    category: property.propertyType === 'land' ? 'commercial' : 'residential',
    verificationTier: property.verificationTier,
    listingType: property.listingType,
    image: getImageUrl(property),
    specs: {
      beds: property.bedrooms ?? undefined,
      baths: property.bathrooms ?? undefined,
      sqm: property.sizeSqm ?? undefined,
      parking: property.amenities?.includes('Parking') ? 1 : undefined,
    },
    isSaved: property.isSaved,
    onClick: () => {}, // no-op on search card
  });

  const handleAddProperty = React.useCallback(
    (property: ListingData) => {
      if (compareList.length >= MAX_COMPARE) return;
      if (compareList.some((p) => p.id === property.id)) return;
      setCompareList((prev) => [...prev, property]);
    },
    [compareList]
  );

  const handleRemoveProperty = React.useCallback(
    (propertyId: string) => {
      setCompareList((prev) => prev.filter((p) => p.id !== propertyId));
    },
    []
  );

  const handleClearAll = React.useCallback(() => {
    setCompareList([]);
  }, []);

  const handleCompareProperty = React.useCallback(() => {
    // Focus the search input
    setTimeout(() => {
      const searchInput = document.getElementById('compare-search-input');
      searchInput?.focus();
    }, 50);
  }, [searchQuery]);

  const isFull = compareList.length >= MAX_COMPARE;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-surface-elevated border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <GitCompareArrowsIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Compare Properties
            </h1>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Select up to {MAX_COMPARE} properties to compare features, pricing,
            and amenities side-by-side. Find the perfect match for your needs.
          </p>

          {/* Active comparison chips */}
          {compareList.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-on-surface-variant mr-1">
                Comparing ({compareList.length}/{MAX_COMPARE}):
              </span>
              {compareList.map((property) => (
                <span
                  key={property.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-sm shadow-sm"
                >
                  <span className="max-w-[180px] truncate">{property.title}</span>
                  <button
                    onClick={() => handleRemoveProperty(property.id)}
                    className="rounded-full p-0.5 hover:bg-outline-variant/50 transition-colors"
                    aria-label={`Remove ${property.title}`}
                  >
                    <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </span>
              ))}
              {compareList.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-muted-foreground hover:text-error ml-1"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {/* Search / Add Properties panel (shown when not full) */}
        {!isFull && (
          <div className="mb-8 space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <Input
                id="compare-search-input"
                type="text"
                placeholder="Search by title, location, or property type…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-surface border-outline-variant text-body-md placeholder:text-on-surface-variant/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-outline-variant/50"
                  aria-label="Clear search"
                >
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchQuery && searchResults.length > 0 && (
              <p className="text-sm text-on-surface-variant">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                &nbsp;·&nbsp;
                Click <span className="font-medium text-primary">Add</span> to compare
              </p>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-10 bg-surface border border-outline-variant rounded-xl">
                <p className="text-on-surface-variant text-body-md">
                  No properties found matching "{searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((property) => {
                  const cardProps = toCardProps(property);
                  return (
                    <div key={property.id} className="relative group">
                      <PropertyCard {...cardProps} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <Button
                          onClick={() => handleAddProperty(property)}
                          size="sm"
                          className="gap-2 bg-surface-elevated text-on-surface hover:bg-surface font-semibold shadow-lg"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add to Compare
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Slots prompting user to search when compare list is empty */}
        {compareList.length === 0 && !isFull && !searchQuery && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-elevated border border-outline-variant mb-5">
              <GitCompareArrowsIcon className="h-7 w-7 text-on-surface-variant" />
            </div>
            <h2 className="font-heading font-semibold text-xl text-on-surface mb-2">
              No Properties Selected
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-6">
              Search for properties above to add them to your comparison list.
              Select at least 2 to see the side-by-side comparison.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-full border font-bold text-xs',
                  compareList.length >= 2
                    ? 'bg-primary text-white border-primary'
                    : 'border-outline-variant'
                )}
              >
                2
              </span>
              {' — '}
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-full border font-bold text-xs',
                  compareList.length >= 3
                    ? 'bg-primary text-white border-primary'
                    : 'border-outline-variant'
                )}
              >
                3
              </span>
              {' properties required'}
            </div>
          </div>
        )}

        {/* Full-state: all slots filled */}
        {isFull && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">
              {compareList.length}/{MAX_COMPARE} slots filled
            </span>
            <span className="text-xs text-on-surface-variant">
              Remove properties above to add others
            </span>
          </div>
        )}

        {/* Comparison View */}
        {compareList.length >= 2 && (
          <PropertyComparison
            properties={compareList}
            maxProperties={MAX_COMPARE}
            onRemoveProperty={handleRemoveProperty}
            onAddProperty={handleCompareProperty}
          />
        )}
      </div>
    </div>
  );
}
