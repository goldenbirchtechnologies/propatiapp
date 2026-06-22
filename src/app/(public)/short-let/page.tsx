'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const MOCK_SHORTLETS = Array.from({ length: 8 }, (_, i) => ({
  id: `sl-${i + 1}`,
  title: i % 2 === 0 ? 'Lekki Short-Let Apartment — 2 Bed' : 'VI Studio with Pool Access',
  location: i % 3 === 0 ? 'Lekki Phase 1, Lagos' : i % 3 === 1 ? 'Victoria Island, Lagos' : 'Ikoyi, Lagos',
  pricePerNight: 25000 + i * 5000,
  rating: (4 + (i % 5) * 0.2).toFixed(1),
  reviews: 12 + i * 3,
  image: `https://picsum.photos/seed/shortlet${i + 1}/800/600`,
  beds: i % 3 === 0 ? 2 : 1,
  baths: i % 3 === 0 ? 2 : 1,
  verification: (['basic', 'verified', 'inspected', 'certified'][i % 4]) as 'basic' | 'verified' | 'inspected' | 'certified',
  amenities: ['WiFi', 'Parking', 'Pool', 'Gym'].slice(0, 2 + (i % 2)),
}));

export default function ShortLetListingsPage() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [nightCount, setNightCount] = useState(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Short-let stays</h1>
        <p className="mt-2 text-slate-600">Nightly stays, verified hosts, instant booking.</p>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Filters</h2>
              <button className="text-xs text-slate-500 hover:text-slate-700">Reset</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">Price per night</label>
                <div className="mt-2 space-y-2">
                  <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={200000} step={5000} />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Minimum nights</label>
                <Input
                  type="number"
                  min={1}
                  value={nightCount}
                  onChange={(e) => setNightCount(Number(e.target.value))}
                  className="mt-2 h-9"
                />
              </div>

              {['WiFi', 'Parking', 'Pool', 'Gym', 'Kitchen', 'AC', 'Security'].map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox /> {a}
                </label>
              ))}

              <Button className="w-full" variant="secondary">Apply filters</Button>
            </div>
          </div>
        </aside>

        {/* Listings */}
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">{MOCK_SHORTLETS.length} stays found</p>
            <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Filters</h2>
                <button onClick={() => setShowFilters(false)}><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              {/* Reuse filter sections for mobile */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Price per night</label>
                  <div className="mt-2 space-y-2">
                    <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={200000} step={5000} />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>₦{priceRange[0].toLocaleString()}</span>
                      <span>₦{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="secondary">Apply</Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {MOCK_SHORTLETS.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold capitalize text-slate-900">
                    {item.listingType || 'short_let'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <span>★ {item.rating}</span>
                      <span className="text-slate-400">({item.reviews})</span>
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <SearchIcon className="h-3.5 w-3.5" /> {item.location}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="text-lg font-semibold text-slate-900">₦{item.pricePerNight.toLocaleString()}</span>
                      <span className="text-sm text-slate-500"> / night</span>
                    </div>
                    <Button size="sm">Book now</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
