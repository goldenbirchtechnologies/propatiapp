'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown, Search } from 'lucide-react';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { SectionLabel, InteractiveHoverButton } from '@/components/ui';
import { AdvancedSearchMapView } from '@/components/search/AdvancedSearchMapView';

const categories = ['All', 'Rent', 'Shortlet', 'Commercial', 'Share'];
const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
const sortOptions = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Most Verified'];

export default function ListingsPage() {
  const router = useRouter();
  const [category, setCategory] = useState('All');
  const [bedrooms, setBedrooms] = useState('Any');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState('Newest First');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/listings?limit=50')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data.listings) ? data.listings : [];
        // Map API shape to card shape — coverImage is derived from images relation server-side
        setListings(
          items.map((l: any, idx: number) => ({
            id: String(l.id ?? l._id ?? `listing-${idx}-${(l.title || 'untitled').slice(0, 8)}`),
            title: l.title,
            address: l.address || l.area || '',
            price: Number(l.price),
            type: l.listingType || l.type || 'rent',
            beds: l.bedrooms,
            baths: l.bathrooms,
            sqm: l.sizeSqm ?? l.sqm,
            image: l.coverImage || l.images?.[0]?.url || '',
            verified: l.verificationTier ? l.verificationTier !== 'basic' : !!l.verified,
            verificationTier: l.verificationTier || (l.verified ? 'verified' : 'basic'),
            pricePeriod: l.pricePeriod || 'year',
            listingType: l.listingType || l.type || 'rent',
            category: l.propertyType ? 'residential' : 'residential',
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryMap: Record<string, string> = { Rent: 'rent', Shortlet: 'short_let', Commercial: 'commercial', Share: 'share' };
  const filtered = listings.filter((l) => {
    const type = (l.listingType || l.type || '').toLowerCase();
    const wanted = category === 'All' ? null : (categoryMap[category] || category.toLowerCase());
    const matchesCategory = !wanted || type === wanted;
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase());
    const price = Number(l.price) || 0;
    const min = minPrice ? Number(minPrice.replace(/,/g, '')) : undefined;
    const max = maxPrice ? Number(maxPrice.replace(/,/g, '')) : undefined;
    const matchesPrice = (min === undefined || price >= min) && (max === undefined || price <= max);
    const matchesVerified = !verifiedOnly || l.verificationTier !== 'basic';
    return matchesCategory && matchesSearch && matchesPrice && matchesVerified;
  });

  const activeFilters = [
    category !== 'All' ? { label: category, clear: () => setCategory('All') } : null,
    minPrice ? { label: `Min ${minPrice}`, clear: () => setMinPrice('') } : null,
    maxPrice ? { label: `Max ${maxPrice}`, clear: () => setMaxPrice('') } : null,
    verifiedOnly ? { label: 'Verified only', clear: () => setVerifiedOnly(false) } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="bg-[#F8FAFC] dark:bg-black min-h-screen pt-16">
      {/* Sticky filter bar — Zillow pill bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Search — Zillow pill */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search location or property…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Category tabs — Zillow pills */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  category === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none cursor-pointer"
              >
                {sortOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <List size={13} />
              </button>
            </div>

            {/* Filter drawer toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 border border-zinc-800 bg-zinc-950 rounded-lg hover:border-zinc-600 transition-colors"
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar filters — desktop (Type lives in the top bar only — single source of truth) */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Min (₦)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9,]/g, ''))}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max (₦)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9,]/g, ''))}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Bedrooms</h3>
              <div className="flex flex-wrap gap-1.5">
                {bedroomOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBedrooms(b)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      bedrooms === b
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Verification</h3>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={verifiedOnly}
                  onClick={() => setVerifiedOnly((v) => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${verifiedOnly ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  {verifiedOnly && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm ${verifiedOnly ? 'text-zinc-300' : 'text-zinc-400'}`}>Verified only</span>
              </label>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Amenities</h3>
              <div className="space-y-2">
                {['Swimming Pool', 'Gym', '24/7 Security', 'Generator', 'Car Park', 'Smart Home'].map((a) => (
                  <label key={a} className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-950 flex-shrink-0" />
                    <span className="text-sm text-zinc-400 hover:text-zinc-200">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content — Zillow split: Left scroll list (white F8FAFC + shadow-sm), Right sticky Mapbox (emerald pins) */}
          <div className="flex-1 min-w-0 lg:flex gap-6">
            <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">
                Showing <span className="text-white font-medium">{filtered.length}</span> properties
                {category !== 'All' && ` · ${category}`}
              </p>
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilters.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300">
                    {f.label}
                    <button onClick={f.clear} className="ml-1 text-zinc-500 hover:text-white leading-none" aria-label={`Clear ${f.label}`}>
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setCategory('All');
                    setMinPrice('');
                    setMaxPrice('');
                    setVerifiedOnly(false);
                    setSearch('');
                  }}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-zinc-900 border border-white/[0.06] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                {filtered.map((listing) => {
                  const isCompared = compareIds.includes(listing.id);
                  const isHovered = hoveredId === listing.id;
                  return (
                    <div
                      key={listing.id}
                      className={`relative transition-all duration-200 ${isHovered ? 'scale-[1.02] z-10' : ''}`}
                      onMouseEnter={() => setHoveredId(listing.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Link href={`/listings/${listing.id}`}>
                        <PropertyCard
                          id={listing.id}
                          title={listing.title}
                          location={listing.address}
                          price={listing.price}
                          pricePeriod={listing.pricePeriod}
                          category={(listing.category as 'residential' | 'commercial' | 'short_let') || 'residential'}
                          verificationTier={(listing.verificationTier as 'basic' | 'verified' | 'inspected' | 'certified') || 'basic'}
                          listingType={listing.listingType as 'rent' | 'sale' | 'short_let' | 'share' | 'commercial'}
                          image={listing.image}
                          specs={{ beds: listing.beds, baths: listing.baths, sqm: listing.sqm, parking: listing.parking }}
                        />
                      </Link>
                      <label className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 text-xs text-white cursor-pointer hover:bg-black/80">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={(e) => {
                            e.stopPropagation();
                            setCompareIds((prev) =>
                              e.target.checked ? (prev.length < 3 ? [...prev, listing.id] : prev) : prev.filter((x) => x !== listing.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 accent-emerald-500"
                        />
                        Compare
                      </label>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-3 py-20 text-center text-zinc-600">No properties match your filters. Try adjusting your search.</div>
                )}
              </div>
            )}

            {/* Compare bar */}
            {compareIds.length > 0 && (
              <div className="sticky bottom-4 mt-6 z-20">
                <div className="glass-card p-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">
                    <span className="text-white font-semibold">{compareIds.length}/3</span> selected for comparison
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCompareIds([])} className="border-white/15 text-white hover:bg-white/10">
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/compare?ids=${compareIds.join(',')}`)}>
                      Compare
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Load more */}
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" className="border-zinc-200 dark:border-white/15 bg-white dark:bg-transparent text-zinc-700 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/10">
                Load more listings
              </Button>
            </div>
          </div>
          {/* Right: sticky Mapbox — emerald pins + price label, hover sync */}
          <div className="hidden lg:block w-[480px] xl:w-[560px] shrink-0">
            <div className="sticky top-[112px] h-[calc(100vh-112px)] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm">
              <AdvancedSearchMapView
                properties={filtered.map((l) => ({
                  id: l.id,
                  title: l.title,
                  address: l.address,
                  area: l.address,
                  price: l.price,
                  priceFormatted: `₦${Number(l.price).toLocaleString()}`,
                  listingType: l.listingType,
                  propertyType: l.category === 'commercial' ? 'office' : 'apartment',
                  bedrooms: l.beds,
                  bathrooms: l.baths,
                  coverImage: l.image,
                  images: l.image ? [{ url: l.image }] : [],
                  // mock position will be jittered around Lagos in the map component
                })) as any}
                onPropertyHover={(p) => setHoveredId((p as any)?.id || null)}
                onPropertyClick={(p) => router.push(`/listings/${(p as any).id}`)}
                initialCenter={{ lat: 6.5244, lng: 3.3792 }}
                initialZoom={11}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-[320px] h-full bg-zinc-950 border-l border-white/[0.08] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <span className="text-white font-semibold">Filters</span>
              <button onClick={() => setFilterOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Bedrooms</h3>
                <div className="flex flex-wrap gap-2">
                  {bedroomOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        bedrooms === b ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input type="text" placeholder="Min (₦)" className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none" />
                  <input type="text" placeholder="Max (₦)" className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.08] flex gap-2">
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:text-white transition-colors"
              >
                Reset
              </button>
              <InteractiveHoverButton
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Apply Filters
              </InteractiveHoverButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
