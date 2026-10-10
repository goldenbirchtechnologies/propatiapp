'use client';

import Link from 'next/link';
import { Grid3X3, List } from 'lucide-react';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { formatPriceForListing } from '@/lib/format';

export type RentalCard = {
  id: string;
  title: string;
  address: string;
  price: number | string;
  pricePeriod?: string;
  beds?: number;
  baths?: number;
  sqm?: number;
  image: string;
  verificationTier?: string;
  city?: string;
  state?: string;
};

type Props = {
  listings: RentalCard[];
  loading?: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (m: 'grid' | 'list') => void;
  sort: string;
  onSortChange: (s: string) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
};

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low'];

export default function RentalsList({ listings, loading, viewMode, onViewModeChange, sort, onSortChange, hoveredId, onHover }: Props) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm text-zinc-500">
          <span className="text-zinc-900 dark:text-white font-medium">{listings.length}</span> rentals
        </p>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 focus:outline-none">
            {sortOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
            <button onClick={() => onViewModeChange('grid')} className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'text-zinc-500'}`}>
              <Grid3X3 size={13} />
            </button>
            <button onClick={() => onViewModeChange('list')} className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'text-zinc-500'}`}>
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-sm">No rentals match your filters. Try adjusting price or beds.</div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-3'}>
          {listings.map((l) => (
            <div
              key={l.id}
              onMouseEnter={() => onHover?.(l.id)}
              onMouseLeave={() => onHover?.(null)}
              className={`transition-all ${hoveredId === l.id ? 'ring-2 ring-emerald-500/30 rounded-xl' : ''}`}
            >
              <Link href={`/rentals/${l.id}`}>
                <PropertyCard
                  id={l.id}
                  title={l.title}
                  location={l.address}
                  price={Number(l.price)}
                  pricePeriod={(l.pricePeriod as any) || 'month'}
                  category="residential"
                  verificationTier={(l.verificationTier as any) || 'basic'}
                  listingType="rent"
                  image={l.image}
                  specs={{ beds: l.beds, baths: l.baths, sqm: l.sqm }}
                />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
