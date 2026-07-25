'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePeriod?: 'month' | 'year' | 'once';
  category: 'residential' | 'commercial' | 'short_let';
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

const categoryChips = {
  residential: 'bg-residential-teal/90 text-white',
  commercial: 'bg-commercial-gold/90 text-white',
  short_let: 'bg-emerald-600/90 text-white',
} as const;

const verificationChips = {
  basic: 'bg-slate-800/90 text-slate-200 border border-white/10',
  verified: 'bg-emerald-600/90 text-white border border-white/10',
  inspected: 'bg-amber-500/90 text-white border border-white/10',
  certified: 'bg-purple-600/90 text-white border border-white/10',
} as const;

const listingTypeChips = {
  rent: 'bg-sky-600/90 text-white border border-white/10',
  sale: 'bg-emerald-600/90 text-white border border-white/10',
  short_let: 'bg-teal-600/90 text-white border border-white/10',
  share: 'bg-orange-600/90 text-white border border-white/10',
  commercial: 'bg-amber-700/90 text-white border border-white/10',
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
    if (listingType === 'short_let') return '/night';
    if (pricePeriod === 'month') return '/month';
    if (pricePeriod === 'year') return '/year';
    return '';
  };

  const cardContent = (
    <article
      className={cn(
        'group relative bg-background dark:bg-card rounded-xl overflow-hidden border border-outline-variant',
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

        {/* Floating Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={cn('ui-chip capitalize font-semibold px-2.5 py-1 rounded-full text-xs backdrop-blur-md', categoryChips[category])}>
            {category.replace('_', ' ')}
          </span>
          <span className={cn('ui-chip capitalize font-semibold px-2.5 py-1 rounded-full text-xs backdrop-blur-md border border-white/10', listingTypeChips[listingType])}>
            {listingTypeLabels[listingType]}
          </span>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={cn('ui-chip capitalize font-semibold px-2.5 py-1 rounded-full text-xs backdrop-blur-md border border-white/10', verificationChips[verificationTier])}>
            {verificationLabels[verificationTier]}
          </span>
          <button
            onClick={handleSave}
            className={cn(
              'inline-flex items-center justify-center p-2 rounded-full',
              'bg-slate-900/80 backdrop-blur-md border border-white/10',
              'transition-colors duration-200 hover:bg-slate-900',
              'shadow-sm hover:shadow-md',
              isSaved && 'text-red-500'
            )}
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold text-emerald-400 font-display">
            {formatPrice(price)}
          </span>
          {getPricePeriodText() && (
            <span className="text-sm text-slate-400">{getPricePeriodText()}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-on-surface mb-2 line-clamp-2 font-display">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-on-surface-variant mb-4">
          <AppIcon name="location_on" className="lucide text-[20px]" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* Specs */}
        {specs && (
          <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-5">
            {category === 'residential' || category === 'short_let' ? (
              <>
                {specs.beds !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <AppIcon name="bed" className="lucide text-[18px]" />
                    <span className="font-medium">{specs.beds} bed{specs.beds !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {specs.baths !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <AppIcon name="bathtub" className="lucide text-[18px]" />
                    <span className="font-medium">{specs.baths} bath{specs.baths !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {specs.sqm !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <AppIcon name="square_foot" className="lucide text-[18px]" />
                    <span className="font-medium">{specs.sqm.toLocaleString()} sqm</span>
                  </div>
                )}
                {specs.parking !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <AppIcon name="local_parking" className="lucide text-[18px]" />
                    <span className="font-medium">{specs.parking} parking</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action */}
        <Button size="sm" className="w-full" variant="default" onClick={(event) => event.stopPropagation()}>
          View Details
        </Button>
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
          className="bg-background dark:bg-card rounded-xl overflow-hidden border border-outline-variant animate-pulse"
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
