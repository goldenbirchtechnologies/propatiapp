'use client';

import * as React from 'react';
import MaterialIcon from '@/components/icons/material-icon';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export interface Agent {
  id: string;
  name: string;
  role: string;
  location: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  verificationTier: 'basic' | 'verified' | 'inspected' | 'certified';
  image: string;
  experience: number;
  listingsSold: number;
  clientsServed: number;
  bio: string;
}

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

const verificationColors = {
  basic: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inspected: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  certified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
} as const;

const verificationLabels = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
} as const;

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-warning text-warning" />
      ))}
      {hasHalf && (
        <span className="relative inline-flex">
          <Star className="h-4 w-4 text-muted" />
          <span className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-4 w-4 fill-warning text-warning" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted" />
      ))}
      <span className="ml-1 text-sm font-semibold text-on-surface">{rating.toFixed(1)}</span>
    </span>
  );
}

export function AgentCard({ agent, className }: AgentCardProps) {
  const initials = agent.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        'group relative bg-white dark:bg-card rounded-xl overflow-hidden border border-outline-variant',
        'transition-all duration-200 card-hover flex flex-col',
        className
      )}
    >
      <Link href={`/agents/${agent.id}`} className="flex flex-col flex-1">
        {/* Image / Avatar Area */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Verification Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <Badge className={cn('capitalize font-semibold', verificationColors[agent.verificationTier])}>
              {verificationLabels[agent.verificationTier]}
            </Badge>
          </div>

          {/* Role Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border border-outline bg-white/90 backdrop-blur-sm text-on-surface">
              {agent.role}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Name & Rating */}
          <h3 className="text-lg font-semibold text-on-surface mb-1 line-clamp-1 font-display">
            {agent.name}
          </h3>
          <div className="mb-3">
            <StarRating rating={agent.rating} />
            <span className="text-xs text-on-surface-variant ml-1">
              ({agent.reviewCount} reviews)
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-3">
            <MaterialIcon name="location_on" className="material-symbols-outlined" />
            <span className="text-sm line-clamp-1">{agent.location}</span>
          </div>

          {/* Specialty Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.specialty.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-auto grid grid-cols-3 gap-3 border-t border-outline-variant pt-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-on-surface">{agent.experience}y</p>
              <p className="text-xs text-on-surface-variant">Exp.</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-on-surface">{agent.listingsSold}</p>
              <p className="text-xs text-on-surface-variant">Sold</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-on-surface">{agent.clientsServed}</p>
              <p className="text-xs text-on-surface-variant">Clients</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function AgentCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-card rounded-xl overflow-hidden border border-outline-variant animate-pulse flex flex-col"
        >
          {/* Skeleton image */}
          <div className="relative w-full aspect-[4/3] bg-surface-container-low" />

          {/* Skeleton badges */}
          <div className="absolute top-3 left-3 h-6 w-20 bg-surface-container-low rounded-full" />
          <div className="absolute top-3 right-3 h-6 w-24 bg-surface-container-low rounded-full" />

          {/* Content skeleton */}
          <div className="p-4 flex flex-col flex-1">
            <div className="h-5 w-32 bg-surface-container-low rounded mb-2" />
            <div className="h-4 w-24 bg-surface-container-low rounded mb-3" />
            <div className="h-4 w-40 bg-surface-container-low rounded mb-3" />
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-5 w-16 bg-surface-container-low rounded-full" />
              <div className="h-5 w-20 bg-surface-container-low rounded-full" />
              <div className="h-5 w-14 bg-surface-container-low rounded-full" />
            </div>
            <div className="mt-auto grid grid-cols-3 gap-3 border-t border-outline-variant pt-3">
              <div className="h-6 w-8 mx-auto bg-surface-container-low rounded" />
              <div className="h-6 w-8 mx-auto bg-surface-container-low rounded" />
              <div className="h-6 w-8 mx-auto bg-surface-container-low rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
