'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, BedDouble, Bath, Square, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';

const RentalsMap = dynamic(() => import('@/components/rentals/RentalsMap'), { ssr: false });

const isPilotEnabled = process.env.NEXT_PUBLIC_ZILLOW_PILOT === '1';

export default function RentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/listings/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        const l = data.listing || data;
        setListing(l);
      })
      .catch(() => setListing(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!isPilotEnabled) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center pt-16">
        <p className="text-sm text-zinc-500">Rentals (Pilot) disabled. Set NEXT_PUBLIC_ZILLOW_PILOT=1.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="pt-20 px-6 max-w-6xl mx-auto space-y-4"><div className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" /><div className="h-32 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" /></div>;
  }

  if (!listing) {
    return (
      <div className="pt-20 text-center">
        <p className="text-zinc-500">Rental not found.</p>
        <Link href="/rentals" className="text-emerald-600 text-sm mt-2 inline-block">← Back to rentals</Link>
      </div>
    );
  }

  const priceLabel = `${formatNaira(Number(listing.price))}${listing.pricePeriod ? `/${listing.pricePeriod === 'year' ? 'yr' : listing.pricePeriod}` : ''}`;
  const image = listing.coverImage || listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200';
  const hasCoords = listing.latitude != null && listing.longitude != null;

  return (
    <div className="bg-[#F8FAFC] dark:bg-black min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/rentals" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">← Back to rentals</Link>

        <div className="mt-4 grid lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950">
              <img src={image} alt={listing.title} className="w-full h-[380px] object-cover" />
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{listing.title}</h1>
              <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1"><MapPin size={14} />{listing.address} {listing.city ? `· ${listing.city}` : ''} {listing.zipCode ? `· ${listing.zipCode}` : ''}</p>

              <div className="flex items-center gap-4 mt-4 text-sm text-zinc-700 dark:text-zinc-300 border-y border-zinc-100 dark:border-white/[0.06] py-3">
                {listing.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={14} />{listing.bedrooms} bd</span>}
                {listing.bathrooms != null && <span className="flex items-center gap-1"><Bath size={14} />{listing.bathrooms} ba</span>}
                {listing.sizeSqm && <span className="flex items-center gap-1"><Square size={14} />{listing.sizeSqm} m²</span>}
                {listing.state && <span className="text-zinc-500">· {listing.state}</span>}
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed">{listing.description || 'Pilot US rental — Zillow-style demo listing with MapLibre split-view.'}</p>

              <div className="flex gap-2 mt-5">
                <Button size="sm" className="gap-1"><Heart size={14} /> Save</Button>
                <Button size="sm" variant="outline" className="gap-1"><Share2 size={14} /> Share</Button>
              </div>
            </div>

            {hasCoords && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/[0.06] text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5"><MapPin size={14} /> Location</div>
                <div className="h-[280px]">
                  <RentalsMap points={[{ id: listing.id, latitude: Number(listing.latitude), longitude: Number(listing.longitude), price: listing.price }]} initialCenter={{ lat: Number(listing.latitude), lng: Number(listing.longitude) }} initialZoom={14} />
                </div>
                <p className="text-xs text-zinc-500 px-4 py-2">{listing.address}, {listing.city}, {listing.state} {listing.zipCode}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 sticky top-20">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{priceLabel}</p>
              <p className="text-xs text-zinc-500 mt-1">{listing.pricePeriod === 'month' ? 'per month' : listing.pricePeriod || ''} · {listing.verificationTier !== 'basic' ? 'Verified' : 'Basic'}</p>

              <div className="mt-4 space-y-2">
                <Button className="w-full">Contact owner</Button>
                <Button variant="outline" className="w-full">Schedule tour</Button>
              </div>

              <div className="mt-4 text-xs text-zinc-500 space-y-1">
                {listing.bedrooms != null && <div>Beds: {listing.bedrooms}</div>}
                {listing.bathrooms != null && <div>Baths: {listing.bathrooms}</div>}
                {listing.amenities && Array.isArray(listing.amenities) && listing.amenities.length > 0 && <div>Amenities: {listing.amenities.join(', ')}</div>}
                {listing.zipCode && <div>ZIP: {listing.zipCode}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
