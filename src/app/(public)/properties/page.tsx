'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <main className="flex-1">
        {/* Sticky Filter Bar */}
        <section className="sticky top-[64px] z-40 bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-4">
            {/* Property Type */}
            <div className="relative group">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Property Type
              </label>
              <select className="appearance-none bg-muted border border-outline-variant rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[160px]">
                <option>Apartments</option>
                <option>Duplexes</option>
                <option>Townhouses</option>
                <option>Land</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 bottom-2 pointer-events-none text-muted-foreground text-[18px]">
                expand_more
              </span>
            </div>

            {/* Location */}
            <div className="relative group flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Location
              </label>
              <div className="flex items-center bg-muted border border-outline-variant rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-muted-foreground mr-2 text-[18px]">
                  location_on
                </span>
                <input
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full"
                  placeholder="Lekki, VI, Ikeja..."
                  type="text"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="relative group min-w-[180px]">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Price (₦)
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="bg-muted border border-outline-variant rounded-lg px-2 py-2 text-sm w-20"
                  placeholder="Min"
                  type="number"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  className="bg-muted border border-outline-variant rounded-lg px-2 py-2 text-sm w-24"
                  placeholder="Max"
                  type="number"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-[1px] bg-border hidden sm:block" />
              <button className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span className="text-sm font-medium">All Filters</span>
              </button>
              <div className="h-10 w-[1px] bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden lg:inline">Sort by:</span>
                <select className="bg-transparent border-none font-bold text-sm focus:ring-0 cursor-pointer">
                  <option>Verification Tier</option>
                  <option>Newest</option>
                  <option>Price: High to Low</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Results & Map View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Results Column */}
          <aside className="w-full lg:w-[60%] xl:w-[55%] overflow-y-auto bg-background px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Properties in Lagos</h1>
                  <p className="text-sm text-muted-foreground">Showing 1,248 verified results</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md material-symbols-outlined ${
                      view === 'grid'
                        ? 'bg-primary-container text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    grid_view
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md material-symbols-outlined ${
                      view === 'list'
                        ? 'bg-primary-container text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    format_list_bulleted
                  </button>
                </div>
              </div>

              {/* Property Cards Grid */}
              <div className={`grid gap-6 pb-8 ${
                view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}>
                {[
                  {
                    title: 'The Obsidian Penthouse',
                    price: '₦450,000,000',
                    location: 'Lekki Phase 1, Lagos',
                    beds: 5,
                    baths: 6,
                    area: '1,200',
                    tier: 'Certified',
                    tierColor: 'bg-primary-container text-white',
                    inspected: 'Inspected May 2024',
                  },
                  {
                    title: 'Vantage Terrace',
                    price: '₦210,000,000',
                    location: 'Victoria Island, Lagos',
                    beds: 4,
                    baths: 4,
                    area: '850',
                    tier: 'Verified',
                    tierColor: 'bg-green-600 text-white',
                    inspected: null,
                  },
                ].map((listing, i) => (
                  <article
                    key={i}
                    className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-card-hover transition-all cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div className="w-full h-full bg-muted group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${listing.tierColor}`}>
                          {listing.tier}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>

          {/* Map placeholder - kept as static component for QA */}
        </div>
    </main>
  );
}
