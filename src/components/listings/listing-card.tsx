'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Square, Heart, Tag, Shield, CheckCircle, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiedIconBadge } from '@/components/ui/badges';
import { formatCurrency, getInitials } from '@/lib/utils';

export interface ListingData {
  id: string;
  title: string;
  description?: string | null;
  price: number; // in kobo (API returns base price, not in kobo)
  priceFormatted?: string; // From API response
  listingType: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
  propertyType?: 'apartment' | 'house' | 'duplex' | 'land' | 'office' | 'shop' | 'warehouse' | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null; // API uses sizeSqm, not areaSqm
  address: string;
  area: string; // API uses 'area' for city/location
  state: string;
  images: Array<{ id: string; url: string; isCover?: boolean; order?: number }> | string[]; // Support both API response and simple array
  coverImage?: string | null; // From API response
  verificationTier: 'basic' | 'verified' | 'inspected' | 'certified';
  status?: string;
  owner?: {
    id: string;
    fullName: string;
    phone?: string;
    phoneVerified?: boolean;
    email?: string;
    profileImage?: string | null;
  };
  agent?: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    profileImage?: string | null;
  } | null;
  verification?: {
    overallStatus: string;
    currentLayer: number;
    rejectedAt?: string | null;
    completedAt?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  amenities?: string[] | null;
  // Client-side only fields
  isSaved?: boolean;
  savedByCurrentUser?: boolean;
}

interface ListingCardProps {
  listing: ListingData;
  variant?: 'grid' | 'list' | 'compact';
  onSave?: (listingId: string, isSaved: boolean) => void;
  onClick?: (listing: ListingData) => void;
  showAgent?: boolean;
  showVerification?: boolean;
  className?: string;
}

const propertyTypeIcons: Record<NonNullable<ListingData['propertyType']>, React.ReactNode> = {
  apartment: <Square className="h-4 w-4" />,
  house: <Home className="h-4 w-4" />,
  duplex: <LayoutDashboard className="h-4 w-4" />,
  land: <MapPin className="h-4 w-4" />,
  office: <Building className="h-4 w-4" />,
  shop: <Store className="h-4 w-4" />,
  warehouse: <Warehouse className="h-4 w-4" />,
};

const listingTypeLabels: Record<ListingData['listingType'], string> = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Shared',
  commercial: 'Commercial',
};

const verificationTierLabels: Record<ListingData['verificationTier'], string> = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
};

const verificationTierColors: Record<NonNullable<ListingData['verificationTier']>, 'default' | 'success' | 'warning' | 'verification'> = {
  basic: 'default',
  verified: 'success',
  inspected: 'warning',
  certified: 'verification',
};

import { Home, LayoutDashboard, Building, Store, Warehouse } from 'lucide-react';

function ListingImage({
  images,
  coverImage,
  alt,
  variant,
  verificationTier,
  verification,
  onSaveClick,
  isSaved,
}: {
  images: Array<{ id: string; url: string; isCover?: boolean; order?: number }> | string[];
  coverImage?: string | null;
  alt: string;
  variant: 'grid' | 'list' | 'compact';
  verificationTier: ListingData['verificationTier'];
  verification?: ListingData['verification'];
  onSaveClick?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
}) {
  // Extract primary image: prefer coverImage from API, fallback to first image
  const getPrimaryImage = () => {
    if (coverImage) return coverImage;

    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      // Find cover image or return first image
      const cover = images.find((img) => typeof img === 'object' && img.isCover);
      return cover ? (cover as { url: string }).url : (firstImage as { url: string }).url;
    }

    return null;
  };

  const primaryImage = getPrimaryImage() || '/placeholder-property.jpg';
  const imageCount = Array.isArray(images) ? images.length : 0;
  const aspectRatio = variant === 'list' ? 'w-full h-48' : variant === 'compact' ? 'w-24 h-24' : 'aspect-video';

  // Determine verification badge based on verification object or tier
  const isVerified = verification?.overallStatus === 'certified' || (verification?.currentLayer != null && verification.currentLayer >= 3);

  return (
    <div className={cn('relative overflow-hidden bg-zinc-900', aspectRatio)}>
      {primaryImage && primaryImage !== '/placeholder-property.jpg' ? (
        <Image
          src={primaryImage}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes={variant === 'list' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-400">
          <Home className="h-8 w-8" />
        </div>
      )}
      <div className="absolute top-2 left-2 flex gap-1.5">
        <Badge variant={verificationTierColors[verificationTier]} className="tag-capitalize">
          {verificationTierLabels[verificationTier]}
        </Badge>
        {isVerified && <VerifiedIconBadge size="sm" />}
      </div>
      {onSaveClick && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSaveClick}
            className={cn(
              'bg-zinc-900/90 backdrop-blur-sm hover:bg-zinc-900',
              isSaved && 'text-red-500'
            )}
            aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
          </Button>
        </div>
      )}
      {imageCount > 1 && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          +{imageCount - 1} more
        </div>
      )}
    </div>
  );
}

function ListingDetails({
  listing,
  variant,
}: {
  listing: ListingData;
  variant: 'grid' | 'list' | 'compact';
}) {
  // Use priceFormatted if available, otherwise format the price
  const displayPrice = listing.priceFormatted || formatCurrency(listing.price);

  if (variant === 'compact') {
    return (
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-base truncate" style={{ color: 'var(--text)' }}>
          {listing.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{listing.address}, {listing.area}</span>
        </div>
        <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--accent)' }}>
          <span className="font-heading font-bold text-lg">{displayPrice}</span>
          {listing.listingType === 'rent' && <span className="text-sm font-normal">/month</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={variant === 'list' ? 'flex-1' : 'flex-1 min-w-0'}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-heading font-semibold truncate',
            variant === 'grid' ? 'text-base' : 'text-lg'
          )} style={{ color: 'var(--text)' }}>
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{listing.address}, {listing.area}, {listing.state}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1" style={{ color: 'var(--accent)' }}>
          <span className={cn(
            'font-heading font-bold',
            variant === 'grid' ? 'text-lg' : 'text-xl'
          )}>
            {displayPrice}
          </span>
          {listing.listingType === 'rent' && (
            <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>per month</span>
          )}
        </div>
      </div>

      {/* Only show details if we have valid data */}
      {(listing.bedrooms || listing.bathrooms || listing.sizeSqm || listing.propertyType) && (
        <div className="flex flex-wrap items-center gap-3 mt-3" style={{ color: 'var(--muted)' }}>
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Bed className="h-4 w-4" />
              {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Bath className="h-4 w-4" />
              {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          {listing.sizeSqm != null && (
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Square className="h-4 w-4" />
              {listing.sizeSqm.toLocaleString()} sqm
            </span>
          )}
          <Badge variant="outline" className="text-xs">
            {listingTypeLabels[listing.listingType]}
          </Badge>
          {listing.propertyType && (
            <Badge variant="outline" className="text-xs capitalize">
              {listing.propertyType}
            </Badge>
          )}
        </div>
      )}

      {listing.amenities && listing.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {listing.amenities.slice(0, 5).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs capitalize">
              {amenity.replace(/_/g, ' ')}
            </Badge>
          ))}
          {listing.amenities.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{listing.amenities.length - 5} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

function AgentInfo({
  agent,
  owner,
}: {
  agent?: ListingData['agent'];
  owner?: ListingData['owner'];
}) {
  // Prefer agent over owner for display
  const displayPerson = agent || owner;
  if (!displayPerson) return null;

  const name = displayPerson.fullName;
  const avatar = displayPerson.profileImage;
  const isAgent = !!agent;
  const isVerified = owner?.phoneVerified || false;

  return (
    <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
      <div className="relative">
        {avatar ? (
          <Image src={avatar} alt={name} width={40} height={40} className="rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            {getInitials(name)}
          </div>
        )}
        {isVerified && (
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3 text-white" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{name}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {isAgent ? 'Verified Agent' : 'Property Owner'}
        </p>
      </div>
    </div>
  );
}

function ListingActions({
  listing,
  onSave,
  variant,
}: {
  listing: ListingData;
  onSave?: (listingId: string, isSaved: boolean) => void;
  variant: 'grid' | 'list' | 'compact';
}) {
  const isSaved = listing.isSaved || listing.savedByCurrentUser || false;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(listing.id, !isSaved);
  };

  return (
    <div className={cn(
      'flex items-center gap-2 pt-3 border-t border-border',
      variant === 'list' && 'flex-1 justify-end'
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSave}
        className={cn(
          'rounded-full transition-colors',
          isSaved && 'text-red-500 bg-red-50 dark:bg-red-900/20'
        )}
        aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
        aria-pressed={isSaved}
      >
        <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
      </Button>
      {variant !== 'compact' && (
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
          View Details
        </Button>
      )}
    </div>
  );
}

export function ListingCard({
  listing,
  variant = 'grid',
  onSave,
  onClick,
  showAgent = true,
  showVerification = true,
  className,
}: ListingCardProps) {
  const isSaved = listing.isSaved || listing.savedByCurrentUser || false;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(listing.id, !isSaved);
  };

  const cardContent = (
    <>
      <ListingImage
        images={listing.images}
        coverImage={listing.coverImage}
        alt={listing.title}
        variant={variant}
        verificationTier={listing.verificationTier}
        verification={listing.verification}
        onSaveClick={variant !== 'compact' ? handleSaveClick : undefined}
        isSaved={isSaved}
      />
      <div className={cn('p-4', variant === 'list' && 'py-4')}>
        <ListingDetails listing={listing} variant={variant} />
        {showAgent && (listing.agent || listing.owner) && (
          <AgentInfo agent={listing.agent} owner={listing.owner} />
        )}
        <ListingActions listing={listing} onSave={onSave} variant={variant} />
      </div>
    </>
  );

  const baseClasses = cn(
    'relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200',
    'hover:shadow-lg hover:border-accent/50',
    variant === 'grid' && 'flex flex-col h-full',
    variant === 'list' && 'flex flex-row items-start gap-4',
    variant === 'compact' && 'flex items-center gap-3 p-3',
    className
  );

  if (onClick) {
    return (
      <article className={baseClasses} onClick={() => onClick(listing)} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick(listing)}>
        {cardContent}
      </article>
    );
  }

  return <article className={baseClasses}>{cardContent}</article>;
}

export function ListingSkeleton({ variant = 'grid', count = 3 }: { variant?: 'grid' | 'list' | 'compact'; count?: number }) {
  return (
    <div className={cn('grid gap-4', variant === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(
          'bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse',
          variant === 'grid' && 'flex flex-col h-full',
          variant === 'list' && 'flex flex-row items-start gap-4',
          variant === 'compact' && 'flex items-center gap-3 p-3'
        )}>
          <div className={cn('bg-zinc-900', variant === 'list' ? 'w-64 h-48 flex-shrink-0' : variant === 'compact' ? 'w-24 h-24 flex-shrink-0' : 'aspect-video')} />
          <div className={cn('p-4', variant === 'list' && 'flex-1', variant === 'compact' && 'flex-1')}>
            <div className="h-4 w-3/4 bg-zinc-900 rounded mb-2" />
            <div className="h-3 w-1/2 bg-zinc-900 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-zinc-900 rounded-full" />
              <div className="h-6 w-16 bg-zinc-900 rounded-full" />
              <div className="h-6 w-16 bg-zinc-900 rounded-full" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-20 bg-zinc-900 rounded-full" />
              <div className="h-5 w-20 bg-zinc-900 rounded-full" />
            </div>
            <div className="mt-3 h-8 bg-zinc-900 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}