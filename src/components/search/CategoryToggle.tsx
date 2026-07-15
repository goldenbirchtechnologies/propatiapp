'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';


export type PropertyCategory = 'residential' | 'commercial';

export interface CategoryToggleProps {
  value: PropertyCategory;
  onChange: (category: PropertyCategory) => void;
  className?: string;
  disabled?: boolean;
}
import MaterialIcon from '@/components/icons/material-icon';

/**
 * CategoryToggle - Residential/Commercial category selector
 *
 * Extracted from Stitch landing page design system.
 * Uses Material Symbols icons (home, business) and Tailwind color tokens.
 *
 * @example
 * ```tsx
 * <CategoryToggle
 *   value={category}
 *   onChange={setCategory}
 * />
 * ```
 */
export function CategoryToggle({
  value,
  onChange,
  className,
  disabled = false,
}: CategoryToggleProps) {
  const handleCategoryChange = (category: PropertyCategory) => {
    if (!disabled && category !== value) {
      onChange(category);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 p-1',
        'bg-surface-container-low rounded-full',
        'border border-outline-variant',
        className
      )}
      role="radiogroup"
      aria-label="Property category"
    >
      {/* Residential Button */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'residential'}
        disabled={disabled}
        onClick={() => handleCategoryChange('residential')}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-full',
          'font-sans font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-residential-teal focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'residential'
            ? 'bg-residential-teal text-white shadow-md'
            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined text-[20px]',
            'select-none'
          )}
          aria-hidden="true"
        >
          home
        </span>
        <MaterialIcon name="Residential" className="material-symbols-outlined" />
      </button>

      {/* Commercial Button */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'commercial'}
        disabled={disabled}
        onClick={() => handleCategoryChange('commercial')}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-full',
          'font-sans font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-commercial-gold focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'commercial'
            ? 'bg-commercial-gold text-white shadow-md'
            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined text-[20px]',
            'select-none'
          )}
          aria-hidden="true"
        >
          business
        </span>
        <MaterialIcon name="Commercial" className="material-symbols-outlined" />
      </button>
    </div>
  );
}
