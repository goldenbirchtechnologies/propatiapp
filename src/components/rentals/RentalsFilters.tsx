'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export type RentalsFilterState = {
  minPrice: string;
  maxPrice: string;
  beds: string; // Any | 1 | 2 | 3 | 4 | 5+
  baths: string;
  homeType: string; // Any | apartment | house | duplex
  petFriendly: boolean;
  city: string;
};

type Props = {
  value: RentalsFilterState;
  onChange: (next: RentalsFilterState) => void;
  onMoreClick?: () => void;
};

const bedOptions = ['Any', '1', '2', '3', '4', '5+'];
const bathOptions = ['Any', '1', '2', '3+'];
const homeTypes = ['Any', 'apartment', 'house', 'duplex'];

export default function RentalsFilters({ value, onChange, onMoreClick }: Props) {
  const set = (patch: Partial<RentalsFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
        {bedOptions.map((b) => (
          <button
            key={b}
            onClick={() => set({ beds: b })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${value.beds === b ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            {b === 'Any' ? 'Any beds' : `${b} bd`}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
        {bathOptions.map((b) => (
          <button
            key={b}
            onClick={() => set({ baths: b })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${value.baths === b ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            {b === 'Any' ? 'Any baths' : `${b} ba`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full px-2 py-1">
          <span className="text-xs text-zinc-500 px-1">₦</span>
          <input
            placeholder="Min"
            inputMode="numeric"
            value={value.minPrice}
            onChange={(e) => set({ minPrice: e.target.value.replace(/[^0-9,]/g, '') })}
            className="w-16 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
          />
          <span className="text-zinc-300">–</span>
          <input
            placeholder="Max"
            inputMode="numeric"
            value={value.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value.replace(/[^0-9,]/g, '') })}
            className="w-16 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        <select
          value={value.homeType}
          onChange={(e) => set({ homeType: e.target.value })}
          className="hidden sm:block px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 focus:outline-none"
        >
          {homeTypes.map((h) => (
            <option key={h} value={h}>
              {h === 'Any' ? 'Any home type' : h}
            </option>
          ))}
        </select>

        <label className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-2 bg-white dark:bg-zinc-950 cursor-pointer select-none">
          <input type="checkbox" checked={value.petFriendly} onChange={(e) => set({ petFriendly: e.target.checked })} className="w-3.5 h-3.5 rounded border-zinc-300 accent-emerald-600" />
          Pet-friendly
        </label>

        <Button variant="outline" size="sm" onClick={onMoreClick} className="rounded-full gap-1.5">
          <SlidersHorizontal size={14} /> More
        </Button>
      </div>
    </div>
  );
}
