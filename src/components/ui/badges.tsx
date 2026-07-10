import * as React from 'react';

import { cn } from '@/lib/utils';

// ListingTypeBadge Component
export type ListingType = 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';

interface ListingTypeBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: ListingType;
}

const listingTypeConfig: Record<
  ListingType,
  { label: string; colorClass: string }
> = {
  rent: {
    label: 'For Rent',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  sale: {
    label: 'For Sale',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  short_let: {
    label: 'Short Let',
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  share: {
    label: 'Room Share',
    colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  commercial: {
    label: 'Commercial',
    colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
};

export const ListingTypeBadge = React.forwardRef<HTMLDivElement, ListingTypeBadgeProps>(
  ({ type, className, ...props }, ref) => {
    const config = listingTypeConfig[type];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          config.colorClass,
          className
        )}
        {...props}
      >
        {config.label}
      </div>
    );
  }
);
ListingTypeBadge.displayName = 'ListingTypeBadge';

// VerificationBadge Component
export type VerificationTier = 'basic' | 'verified' | 'inspected' | 'certified';

interface VerificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier: VerificationTier;
}

const verificationTierConfig: Record<
  VerificationTier,
  { label: string; colorClass: string; icon?: React.ReactNode }
> = {
  basic: {
    label: 'Basic',
    colorClass: 'bg-muted text-muted-foreground border border-border',
  },
  verified: {
    label: 'VERIFIED',
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    ),
  },
  inspected: {
    label: 'INSPECTED',
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    ),
  },
  certified: {
    label: 'CERTIFIED',
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    ),
  },
};

export const VerificationBadge = React.forwardRef<HTMLDivElement, VerificationBadgeProps>(
  ({ tier, className, ...props }, ref) => {
    const config = verificationTierConfig[tier];

    return (
      <div
        ref={ref}
        className={cn(config.colorClass, className)}
        {...props}
      >
        {config.icon}
        {config.label}
      </div>
    );
  }
);
VerificationBadge.displayName = 'VerificationBadge';

// VerifiedIconBadge Component
interface VerifiedIconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export const VerifiedIconBadge = React.forwardRef<HTMLDivElement, VerifiedIconBadgeProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400',
          className
        )}
        {...props}
      >
        <svg
          className={sizeClasses[size]}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
          <svg
            className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>
    );
  }
);
VerifiedIconBadge.displayName = 'VerifiedIconBadge';
