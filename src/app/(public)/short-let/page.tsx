'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import PublicNav from '@/components/navigation/public-nav';
import MaterialIcon from '@/components/icons/material-icon';


type ShortletItem = {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  rating?: number;
  reviews?: number;
  image?: string | null;
  beds?: number;
  baths?: number;
  verification?: string;
  amenities?: string[];
  owner?: { fullName?: string | null };
};

export default function ShortLetListingsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [nightCount, setNightCount] = useState(1);
  const [listings, setListings] = useState<ShortletItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlets = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/shortlets');
        const json = await res.json();
        setListings(json.listings || []);
      } catch (e) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlets();
  }, []);

  return (
    <>
      <PublicNav />
      <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Short-let stays</h1>
          <p className="text-sm text-slate-600">Verified properties approved for short-let by their owners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
                    <MaterialIcon name="₦{priceRange[0].toLocaleString()}" className="material-symbols-outlined" />
                    <MaterialIcon name="₦{priceRange[1].toLocaleString()}" className="material-symbols-outlined" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Minimum nights</label>
                <Input type="number" min={1} value={nightCount} onChange={(e) => setNightCount(Number(e.target.value))} className="mt-2 h-9" />
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

        <section className="min-w-0 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">{listings.length} stays found</p>
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Price per night</label>
                  <div className="mt-2 space-y-2">
                    <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={200000} step={5000} />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <MaterialIcon name="₦{priceRange[0].toLocaleString()}" className="material-symbols-outlined" />
                      <MaterialIcon name="₦{priceRange[1].toLocaleString()}" className="material-symbols-outlined" />
                    </div>
                  </div>
                </div>
                <Button className="mt-4 w-full" variant="secondary">Apply</Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 h-40 w-full animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">No short-let listings available yet.</p>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold capitalize text-slate-900">short let</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <SearchIcon className="h-3.5 w-3.5" /> {item.location}
                    </p>
                    {(item.beds || item.baths) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {(item.beds ? `${item.beds} bed` : '')}{(item.beds && item.baths) ? ' · ' : ''}{item.baths ? `${item.baths} bath` : ''}
                      </p>
                    )}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <span className="text-lg font-semibold text-slate-900">₦{Number(item.pricePerNight).toLocaleString()}</span>
                        <span className="text-sm text-slate-500"> / night</span>
                      </div>
                      <Button size="sm">Book now</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
}
