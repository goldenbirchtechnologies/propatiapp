import * as React from 'react';
import { cn } from '@/lib/utils';

// ListingTypeBadge Component
export type ListingType = 'rent' | 'lease' | 'sale' | 'short_let' | 'room_share';

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
  lease: {
    label: 'For Lease',
    colorClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  sale: {
    label: 'For Sale',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  short_let: {
    label: 'Short Let',
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  room_share: {
    label: 'Room Share',
    colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
  { label: string; colorClass: string }
> = {
  basic: {
    label: 'Basic',
    colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
  verified: {
    label: 'Verified',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  inspected: {
    label: 'Inspected',
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  certified: {
    label: 'Certified ✓',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
};

export const VerificationBadge = React.forwardRef<HTMLDivElement, VerificationBadgeProps>(
  ({ tier, className, ...props }, ref) => {
    const config = verificationTierConfig[tier];

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
VerificationBadge.displayName = 'VerificationBadge';
