'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSavedListings } from '@/hooks/useListings';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { HeartOffIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function getImageUrl(listing: unknown): string {
  if (typeof listing.images?.[0] === 'string') return listing.images[0];
  return listing.images?.[0]?.url || listing.coverImage || '/placeholder-property.jpg';
}

export default function SavedListingsPage() {
  const { data, isLoading, error, refetch } = useSavedListings({ page: 1, limit: 20 });

  const listings = (data as unknown)?.data || (data as unknown)?.listings || [];
  const listingItems = Array.isArray(listings) ? listings : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-surface-elevated border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <HeartOffIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Saved Listings
            </h1>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Browse your favourite properties. Revisit them anytime, compare options, and reach out to owners or agents when you&apos;re ready.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PropertyCardSkeleton count={6} />
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-16 bg-surface border border-outline-variant rounded-xl">
            <SearchIcon className="mx-auto h-10 w-10 text-on-surface-variant mb-4" />
            <h2 className="font-heading font-semibold text-xl text-on-surface mb-2">
              Something went wrong
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-6">
              We couldn&apos;t load your saved listings. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && listingItems.length === 0 && (
          <div className="text-center py-16 bg-surface border border-outline-variant rounded-xl">
            <HeartOffIcon className="mx-auto h-10 w-10 text-on-surface-variant mb-4" />
            <h2 className="font-heading font-semibold text-xl text-on-surface mb-2">
              No saved listings yet
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-6">
              Start exploring properties and save the ones you love. They&apos;ll appear here for easy access.
            </p>
            <Button asChild>
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </div>
        )}

        {!isLoading && !error && listingItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listingItems.map((listing: unknown) => {
              const isResidential = listing.propertyType !== 'land' && listing.propertyType !== 'office' && listing.propertyType !== 'shop' && listing.propertyType !== 'warehouse';
              return (
                <PropertyCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={`${listing.area ?? listing.address}, ${listing.state ?? ''}`}
                  price={listing.price}
                  pricePeriod={listing.listingType === 'sale' ? 'once' : 'year'}
                  category={isResidential ? 'residential' : 'commercial'}
                  verificationTier={listing.verificationTier || 'basic'}
                  listingType={listing.listingType || 'rent'}
                  image={getImageUrl(listing)}
                  specs={{
                    beds: listing.bedrooms ?? undefined,
                    baths: listing.bathrooms ?? undefined,
                    sqm: listing.sizeSqm ?? undefined,
                    parking: listing.amenities?.includes('Parking') ? 1 : undefined,
                  }}
                  isSaved
                  onClick={() => {
                    window.location.href = `/saved/${listing.id}`;
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
