'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, CheckCircle, MapPin, Bed, Bath, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicCard } from '@/components/magic-card';

export interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePeriod?: 'month' | 'year' | 'once' | 'night';
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
  residential: 'bg-emerald-500/90 text-white',
  commercial: 'bg-amber-500/90 text-white',
  short_let: 'bg-emerald-500/90 text-white',
} as const;

const verificationChips = {
  basic: 'bg-zinc-900/90 text-zinc-200 border border-white/10',
  verified: 'bg-emerald-500/90 text-white border border-white/10',
  inspected: 'bg-amber-500/90 text-white border border-white/10',
  certified: 'bg-purple-600/90 text-white border border-white/10',
} as const;

const listingTypeChips = {
  rent: 'bg-sky-500/90 text-white border border-white/10',
  sale: 'bg-emerald-500/90 text-white border border-white/10',
  short_let: 'bg-teal-500/90 text-white border border-white/10',
  share: 'bg-emerald-500/90 text-white border border-white/10',
  commercial: 'bg-amber-600/90 text-white border border-white/10',
} as const;

const listingTypeLabels = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Room Share',
  commercial: 'Commercial',
} as const;

const typeColors: Record<string, string> = {
  residential: '#10b981',
  commercial: '#c9952a',
  short_let: '#f59e0b',
};

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
    <MagicCard
      className={cn(
        'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-zinc-900">
        <Image
          src={image}
          alt={title}
          width={800}
          height={600}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating Badges - Top Left */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="px-2 py-0.5 text-xs font-semibold rounded text-white capitalize"
            style={{ background: typeColors[category] || '#10b981' }}
          >
            {category.replace('_', ' ')}
          </span>
          {listingType === 'sale' && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-black/70 text-white backdrop-blur-sm">
              For Sale
            </span>
          )}
        </div>

        {/* Verified badge - top right */}
        {verificationTier === 'verified' && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
              <CheckCircle size={10} />
              Verified
            </span>
          </div>
        )}

        {/* Price - bottom left */}
        <div className="absolute bottom-3 left-3">
          <div className="text-white font-bold text-lg leading-none">
            {formatPrice(price)}
          </div>
          {getPricePeriodText() && (
            <div className="text-white/70 text-xs">{getPricePeriodText()}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-zinc-500 text-xs mb-3">
          <MapPin size={10} />
          <span className="line-clamp-1">{location}</span>
        </div>
        {specs && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            {specs.beds !== undefined && specs.beds > 0 && (
              <span className="flex items-center gap-1">
                <Bed size={12} />
                {specs.beds} bd
              </span>
            )}
            {specs.baths !== undefined && specs.baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath size={12} />
                {specs.baths} ba
              </span>
            )}
            {specs.sqm !== undefined && specs.sqm > 0 && (
              <span className="flex items-center gap-1">
                <Square size={12} />
                {specs.sqm} sqm
              </span>
            )}
          </div>
        )}
      </div>
    </MagicCard>
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
          className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="relative w-full aspect-[4/3] bg-zinc-950" />

          {/* Content skeleton */}
          <div className="p-4">
            {/* Badge skeleton */}
            <div className="h-6 w-24 bg-zinc-950 rounded-full mb-3" />

            {/* Price skeleton */}
            <div className="h-8 w-32 bg-zinc-950 rounded mb-2" />

            {/* Title skeleton */}
            <div className="h-6 w-full bg-zinc-950 rounded mb-2" />
            <div className="h-6 w-3/4 bg-zinc-950 rounded mb-2" />

            {/* Location skeleton */}
            <div className="h-5 w-2/3 bg-zinc-950 rounded mb-4" />

            {/* Specs skeleton */}
            <div className="flex gap-4">
              <div className="h-5 w-16 bg-zinc-950 rounded" />
              <div className="h-5 w-16 bg-zinc-950 rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
