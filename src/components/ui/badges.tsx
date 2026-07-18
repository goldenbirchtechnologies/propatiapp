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
    colorClass: 'bg-type-rent/10 text-type-rent dark:bg-type-rent/20 dark:text-type-rent',
  },
  sale: {
    label: 'For Sale',
    colorClass: 'bg-type-sale/10 text-type-sale dark:bg-type-sale/20 dark:text-type-sale',
  },
  short_let: {
    label: 'Short Let',
    colorClass: 'bg-type-shortlet/10 text-type-shortlet dark:bg-type-shortlet/20 dark:text-type-shortlet',
  },
  share: {
    label: 'Room Share',
    colorClass: 'bg-type-roomshare/10 text-type-roomshare dark:bg-type-roomshare/20 dark:text-type-roomshare',
  },
  commercial: {
    label: 'Commercial',
    colorClass: 'bg-commercial-gold/10 text-commercial-gold dark:bg-commercial-gold/20 dark:text-commercial-gold',
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
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground dark:text-muted-foreground border border-border',
  },
  verified: {
    label: 'VERIFIED',
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-verification-verified/10 px-2.5 py-0.5 text-xs font-bold text-verification-verified border border-verification-verified/20 dark:bg-verification-verified/20 dark:text-verification-verified dark:border-verification-verified/40',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-verification-verified text-white">
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
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-verification-inspected/10 px-2.5 py-0.5 text-xs font-bold text-verification-inspected border border-verification-inspected/20 dark:bg-verification-inspected/20 dark:text-verification-inspected dark:border-verification-inspected/40',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-verification-inspected text-white">
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
    colorClass: 'inline-flex items-center gap-1 rounded-full bg-verification-certified/10 px-2.5 py-0.5 text-xs font-bold text-verification-certified border border-verification-certified/20 dark:bg-verification-certified/20 dark:text-verification-certified dark:border-verification-certified/40',
    icon: (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-verification-certified text-white">
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
          'relative inline-flex items-center justify-center text-verification-verified dark:text-verification-verified',
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
