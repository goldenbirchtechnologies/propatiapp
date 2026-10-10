'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search } from 'lucide-react';
import RentalsFilters, { RentalsFilterState } from '@/components/rentals/RentalsFilters';
import RentalsList from '@/components/rentals/RentalsList';
import { Button } from '@/components/ui/button';

const RentalsMap = dynamic(() => import('@/components/rentals/RentalsMap'), { ssr: false });

const isPilotEnabled = process.env.NEXT_PUBLIC_ZILLOW_PILOT === '1';

export default function RentalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';

  const [q, setQ] = useState(qParam);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sort, setSort] = useState('Newest');
  const [bbox, setBbox] = useState<{ swLat: number; swLng: number; neLat: number; neLng: number } | null>(null);

  const [filters, setFilters] = useState<RentalsFilterState>({
    minPrice: '',
    maxPrice: '',
    beds: 'Any',
    baths: 'Any',
    homeType: 'Any',
    petFriendly: false,
    city: '',
  });

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set('countryId', 'NG');
    p.set('listingType', 'rent');
    p.set('limit', '50');
    if (q) p.set('q', q);
    if (filters.minPrice) p.set('minPrice', filters.minPrice.replace(/,/g, ''));
    if (filters.maxPrice) p.set('maxPrice', filters.maxPrice.replace(/,/g, ''));
    if (filters.beds !== 'Any') {
      const n = filters.beds === '5+' ? 5 : Number(filters.beds);
      p.set('minBedrooms', String(n));
    }
    if (filters.baths !== 'Any') {
      const n = filters.baths === '3+' ? 3 : Number(filters.baths);
      p.set('minBathrooms', String(n));
    }
    if (filters.homeType !== 'Any') p.set('propertyType', filters.homeType);
    if (filters.city) p.set('city', filters.city);
    if (bbox) {
      p.set('swLat', String(bbox.swLat));
      p.set('swLng', String(bbox.swLng));
      p.set('neLat', String(bbox.neLat));
      p.set('neLng', String(bbox.neLng));
    }
    const sortMap: Record<string, string> = {
      'Price: Low to High': 'price_asc',
      'Price: High to Low': 'price_desc',
    };
    if (sortMap[sort]) p.set('sortBy', sortMap[sort]);
    return p.toString();
  }, [q, filters, sort, bbox]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings?${queryString}`);
      const data = await res.json();
      const items = Array.isArray(data.listings) ? data.listings : [];
      setListings(
        items.map((l: any, idx: number) => ({
          id: String(l.id ?? `us-${idx}`),
          title: l.title,
          address: l.address || l.area || '',
          price: Number(l.price),
          pricePeriod: l.pricePeriod || 'month',
          beds: l.bedrooms,
          baths: l.bathrooms,
          sqm: l.sizeSqm ?? l.sqm,
          image: l.coverImage || l.images?.[0]?.url || '',
          verificationTier: l.verificationTier || 'basic',
          city: l.city,
          state: l.state,
          latitude: l.latitude != null ? Number(l.latitude) : null,
          longitude: l.longitude != null ? Number(l.longitude) : null,
          zipCode: l.zipCode,
        }))
      );
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (q) p.set('q', q);
      else p.delete('q');
      router.replace(`/rentals?${p.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  if (!isPilotEnabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center bg-[#F8FAFC] dark:bg-black pt-16">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Rentals (Pilot) is coming soon</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-md">The Nigeria rentals pilot is flag-gated. Set NEXT_PUBLIC_ZILLOW_PILOT=1 to enable /rentals.</p>
        <Link href="/listings" className="mt-6">
          <Button>Browse listings</Button>
        </Link>
      </div>
    );
  }

  const mapPoints = listings
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, price: l.price, title: l.title }));

  return (
    <div className="bg-[#F8FAFC] dark:bg-black min-h-screen pt-16">
      {/* Top bar */}
      <div className="sticky top-16 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Lekki, Ikoyi, VI, Yaba, Abuja…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="hidden lg:flex">
            <RentalsFilters value={filters} onChange={setFilters} />
          </div>

          <div className="flex lg:hidden gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setMobileTab(mobileTab === 'list' ? 'map' : 'list')} className="rounded-full">
              {mobileTab === 'list' ? 'Map' : 'List'}
            </Button>
          </div>
        </div>
        <div className="lg:hidden px-4 pb-3">
          <RentalsFilters value={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Split view */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          {/* List */}
          <div className={`${mobileTab === 'map' ? 'hidden lg:block' : 'block'} flex-1 overflow-y-auto pr-1`}>
            <RentalsList listings={listings} loading={loading} viewMode={viewMode} onViewModeChange={setViewMode} sort={sort} onSortChange={setSort} hoveredId={hoveredId} onHover={setHoveredId} />
            <p className="text-xs text-zinc-500 mt-6 text-center">Pilot: {listings.length} NG rentals (Lekki/Ikoyi/VI/Yaba/Abuja) • MapLibre Lagos • Paystack • 5-layer verification • Flag: NEXT_PUBLIC_ZILLOW_PILOT=1</p>
          </div>

          {/* Map */}
          <div className={`${mobileTab === 'list' ? 'hidden lg:block' : 'block'} w-full lg:w-[45%] lg:sticky lg:top-[7.5rem] h-full lg:h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] flex-shrink-0`}>
            <RentalsMap points={mapPoints} hoveredId={hoveredId} onBoundsChange={setBbox} onMarkerClick={(id) => router.push(`/rentals/${id}`)} />
          </div>
        </div>
      </div>
    </div>
  );
}
