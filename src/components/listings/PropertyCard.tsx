'use client'

import MaterialIcon from '@/components/icons/material-icon';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePeriod?: 'month' | 'year' | 'once';
  category: 'residential' | 'commercial';
  verificationTier: 'basic' | 'verified' | 'inspected' | 'certified';
  listingType: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
  image: string;
  specs?: {
    beds?: number;
    baths?: number;
    sqm?: number;
    parking?: number;
  };
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onClick?: () => void;
  className?: string;
}

const categoryColors = {
  residential: 'bg-residential-teal text-white',
  commercial: 'bg-commercial-gold text-white',
} as const;

const verificationColors = {
  basic: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inspected: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  certified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
} as const;

const listingTypeColors = {
  rent: 'bg-blue-50 text-type-rent border-type-rent/20',
  sale: 'bg-green-50 text-type-sale border-type-sale/20',
  short_let: 'bg-purple-50 text-type-short-let border-type-short-let/20',
  share: 'bg-orange-50 text-type-share border-type-share/20',
  commercial: 'bg-yellow-50 text-type-commercial border-type-commercial/20',
} as const;

const listingTypeLabels = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Room Share',
  commercial: 'Commercial',
} as const;

const verificationLabels = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
} as const;

export function PropertyCard({
  id,
  title,
  location,
  price,
  pricePeriod = 'year',
  category,
  verificationTier,
  listingType,
  image,
  specs,
  isSaved = false,
  onSave,
  onClick,
  className,
}: PropertyCardProps) {
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(id);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPricePeriodText = () => {
    if (listingType === 'sale') return '';
    if (pricePeriod === 'month') return '/month';
    if (pricePeriod === 'year') return '/year';
    return '';
  };

  const cardContent = (
    <article
      className={cn(
        'group relative bg-white dark:bg-card rounded-xl overflow-hidden border border-outline-variant',
        'transition-all duration-200 card-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="pressable relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
        <Image
          src={image}
          alt={title}
          width={800}
          height={600}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge className={cn('capitalize font-semibold', categoryColors[category])}>
            {category}
          </Badge>
        </div>

        {/* Verification Badge - Top Right (next to save button) */}
        <div className="absolute top-3 right-14">
          <Badge className={cn('capitalize font-semibold', verificationColors[verificationTier])}>
            {verificationLabels[verificationTier]}
          </Badge>
        </div>

        {/* Save Button - Top Right */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full bg-surface-elevated/90 backdrop-blur-sm',
            'transition-colors duration-200 hover:bg-surface',
            'shadow-sm hover:shadow-md',
            isSaved && 'text-red-500'
          )}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Listing Type Badge */}
        <div className="mb-3">
          <Badge
            variant="outline"
            className={cn('border font-semibold', listingTypeColors[listingType])}
          >
            {listingTypeLabels[listingType]}
          </Badge>
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-on-surface font-display">
            {formatPrice(price)}
          </span>
          {getPricePeriodText() && (
            <span className="text-sm text-on-surface-variant ml-1">{getPricePeriodText()}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-on-surface mb-2 line-clamp-2 font-display">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-on-surface-variant mb-4">
          <MaterialIcon name="location_on" className="material-symbols-outlined text-[20px]" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* Specs */}
        {specs && (
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            {category === 'residential' ? (
              <>
                {specs.beds !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="bed" className="material-symbols-outlined text-[18px]" />
                    <span className="font-medium">{specs.beds} bed{specs.beds !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {specs.baths !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="bathtub" className="material-symbols-outlined text-[18px]" />
                    <span className="font-medium">{specs.baths} bath{specs.baths !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {specs.sqm !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="square_foot" className="material-symbols-outlined text-[18px]" />
                    <span className="font-medium">{specs.sqm.toLocaleString()} sqm</span>
                  </div>
                )}
                {specs.parking !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MaterialIcon name="local_parking" className="material-symbols-outlined text-[18px]" />
                    <span className="font-medium">{specs.parking} parking</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );

  return cardContent;
}

// Skeleton loader for PropertyCard
export function PropertyCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-card rounded-xl overflow-hidden border border-outline-variant animate-pulse"
        >
          {/* Image skeleton */}
          <div className="relative w-full aspect-[4/3] bg-surface-container-low" />

          {/* Content skeleton */}
          <div className="p-4">
            {/* Badge skeleton */}
            <div className="h-6 w-24 bg-surface-container-low rounded-full mb-3" />

            {/* Price skeleton */}
            <div className="h-8 w-32 bg-surface-container-low rounded mb-2" />

            {/* Title skeleton */}
            <div className="h-6 w-full bg-surface-container-low rounded mb-2" />
            <div className="h-6 w-3/4 bg-surface-container-low rounded mb-2" />

            {/* Location skeleton */}
            <div className="h-5 w-2/3 bg-surface-container-low rounded mb-4" />

            {/* Specs skeleton */}
            <div className="flex gap-4">
              <div className="h-5 w-16 bg-surface-container-low rounded" />
              <div className="h-5 w-16 bg-surface-container-low rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
