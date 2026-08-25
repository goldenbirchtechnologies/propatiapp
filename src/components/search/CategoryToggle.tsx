'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Home, Building2, Waves } from 'lucide-react';


export type PropertyCategory = 'residential' | 'commercial' | 'short_let';

export interface CategoryToggleProps {
  value: PropertyCategory;
  onChange: (category: PropertyCategory) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * CategoryToggle - Residential/Commercial/Short Let category selector
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
        'bg-zinc-900 rounded-full',
        'border border-zinc-800',
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
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-full',
          'font-sans font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'residential'
            ? 'bg-emerald-500 text-white shadow-md'
            : 'bg-zinc-800 text-white hover:bg-zinc-900'
        )}
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Residential
      </button>

      {/* Commercial Button */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'commercial'}
        disabled={disabled}
        onClick={() => handleCategoryChange('commercial')}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-full',
          'font-sans font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'commercial'
            ? 'bg-amber-500 text-white shadow-md'
            : 'bg-zinc-800 text-white hover:bg-zinc-900'
        )}
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        Commercial
      </button>

      {/* Short Let Button */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'short_let'}
        disabled={disabled}
        onClick={() => handleCategoryChange('short_let')}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-full',
          'font-sans font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'short_let'
            ? 'bg-emerald-500 text-white shadow-md'
            : 'bg-zinc-800 text-white hover:bg-zinc-900'
        )}
      >
        <Waves className="h-4 w-4" aria-hidden="true" />
        Short Let
      </button>
    </div>
  );
}
