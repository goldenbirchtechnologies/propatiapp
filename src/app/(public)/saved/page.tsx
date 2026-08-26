'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSavedListings } from '@/hooks/useListings';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { HeartOffIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';

function getImageUrl(listing: unknown): string {
  if (typeof listing.images?.[0] === 'string') return listing.images[0];
  return listing.images?.[0]?.url || listing.coverImage || '/placeholder-property.jpg';
}

export default function SavedListingsPage() {
  const { data, isLoading, error, refetch } = useSavedListings({ page: 1, limit: 20 });

  const listings = (data as unknown)?.data || (data as unknown)?.listings || [];
  const listingItems = Array.isArray(listings) ? listings : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 py-8">
        <PageHeader
          title="Saved Properties"
          description="Your saved listings — revisit, compare, and reach out when you're ready."
        />

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PropertyCardSkeleton count={6} />
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-16 glass-card">
            <SearchIcon className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
            <h2 className="font-semibold text-xl text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              We couldn&apos;t load your saved listings. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && listingItems.length === 0 && (
          <div className="text-center py-16 glass-card">
            <HeartOffIcon className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
            <h2 className="font-semibold text-xl text-white mb-2">
              No saved listings yet
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
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
