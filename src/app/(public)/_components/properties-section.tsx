'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function useFeaturedFromDb() {
  const [data, setData] = useState<any[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/listings?limit=6')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d) setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return data;
}

const featuredFallback = [
  {
    id: 'feat-1', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    alt: 'Lekki Phase 1 Waterfront Villa',
    badges: [{ text: 'Verified Deed', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Admiralty Way, Lekki, Lagos',
    title: 'Lekki Phase 1 Waterfront Villa',
    specs: [{ icon: 'bed', label: '4 Beds' }, { icon: 'bath', label: '5 Baths' }, { icon: 'sqm', label: '420m²' }],
    price: '₦140,000,000', period: '/ yr', action: 'Schedule Inspection',
  },
  {
    id: 'feat-2', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
    alt: 'VI Executive Serviced Penthouse',
    badges: [{ text: 'Verified Deed', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Ahmadu Bello Way, VI, Lagos',
    title: 'VI Executive Serviced Penthouse',
    specs: [{ icon: 'bed', label: '3 Beds' }, { icon: 'bath', label: '4 Baths' }, { icon: 'sqm', label: '280m²' }],
    price: '₦18,000,000', period: '/ yr', action: 'Schedule Inspection',
  },
  {
    id: 'feat-3', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    alt: 'Apapa Freezone Industrial Bay',
    badges: [{ text: 'Commercial Grade-A', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Wharf Road Expressway, Apapa, Lagos',
    title: 'Apapa Freezone Industrial Bay',
    specs: [{ icon: 'sqm', label: '2,400m²' }, { icon: 'dock', label: 'Dock Bays' }, { icon: 'power', label: '3-Phase' }],
    price: '₦48,000,000', period: '/ yr', action: 'Schedule Inspection',
  },
  {
    id: 'feat-4', img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80',
    alt: 'Maitama Diplomatic Luxury Suite',
    badges: [{ text: 'Shortlet Active', bg: '#25D99A', color: '#080B0A' }],
    location: 'Gana Street, Maitama, Abuja FCT',
    title: 'Maitama Diplomatic Luxury Suite',
    specs: [{ icon: 'bed', label: '2 Beds' }, { icon: 'bath', label: '2 Baths' }, { icon: 'sqm', label: '150m²' }],
    price: '₦175,000', period: '/ night', action: 'Book Shortlet',
  },
  {
    id: 'feat-5', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
    alt: 'Asokoro Diplomatic Bungalow',
    badges: [{ text: 'Verified Deed', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Asokoro Extension, Abuja FCT',
    title: 'Asokoro Diplomatic Bungalow',
    specs: [{ icon: 'bed', label: '5 Beds' }, { icon: 'bath', label: '4 Baths' }, { icon: 'sqm', label: '680m²' }],
    price: '₦95,000,000', period: '/ yr', action: 'Schedule Inspection',
  },
  {
    id: 'feat-6', img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80',
    alt: 'Wuse II Office Tower',
    badges: [{ text: 'Commercial Grade-A', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Ahmadu Bello Way, Wuse II, Abuja FCT',
    title: 'Wuse II Office Tower',
    specs: [{ icon: 'sqm', label: '1,200m²' }, { icon: 'elevator', label: '2 Lifts' }, { icon: 'power', label: '3-Phase' }],
    price: '₦32,000,000', period: '/ yr', action: 'Schedule Inspection',
  },
];

interface Property {
  id: string;
  img: string;
  alt: string;
  badges: { text: string; bg: string; color: string }[];
  location: string;
  title: string;
  specs: { icon: string; label: string }[];
  price: string;
  period: string;
  action: string;
	category: 'luxury' | 'abuja' | 'commercial';
}

const properties: Property[] = [
  {
    id: 'p1',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    alt: 'The Glasshouse Penthouse - Admiralty Way, Lekki',
    badges: [
      { text: 'Verified Deed', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' },
      { text: 'Instant Tour', bg: '#25D99A', color: '#080B0A' },
    ],
    location: 'Admiralty Way, Lekki 1, Lagos',
    title: 'The Glasshouse Penthouse',
    specs: [
      { icon: 'bed', label: '4 Beds' },
      { icon: 'bathtub', label: '5 Baths' },
      { icon: 'square_foot', label: '480 sqm' },
    ],
    price: '₦18,500,000',
    period: '/ yr',
    action: 'Schedule Inspection',
  category: 'luxury',
  },
  {
    id: 'p2',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
    alt: 'Sovereign Crest 4-Bed Duplex - Maitama, Abuja',
    badges: [{ text: 'C of O Verified', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Maitama District, Abuja FCT',
    title: 'Sovereign Crest 4-Bed Duplex',
    specs: [
      { icon: 'bed', label: '4 Beds' },
      { icon: 'bathtub', label: '5 Baths' },
      { icon: 'square_foot', label: '620 sqm' },
    ],
    price: '₦35,000,000',
    period: '/ yr',
    action: 'Schedule Inspection',
  category: 'abuja',
  },
  {
    id: 'p3',
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    alt: 'Oceanview Executive Villa - Eko Atlantic City',
    badges: [{ text: 'Shortlet Active', bg: '#25D99A', color: '#080B0A' }],
    location: 'Eko Atlantic City, Lagos',
    title: 'Oceanview Executive Villa',
    specs: [
      { icon: 'bed', label: '3 Beds' },
      { icon: 'bathtub', label: '3 Baths' },
      { icon: 'wifi', label: 'Fiber 500Mbps' },
    ],
    price: '₦120,000',
    period: '/ night',
    action: 'Book Shortlet',
  category: 'luxury',
  },
  {
    id: 'p4',
    img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80',
    alt: 'The Cube Commercial Plaza - VI, Lagos',
    badges: [{ text: 'Commercial Grade-A', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Ahmadu Bello Way, Victoria Island',
    title: 'The Cube Commercial Plaza',
    specs: [
      { icon: 'corporate_fare', label: '8 Floors' },
      { icon: 'local_parking', label: '120 Cars' },
      { icon: 'square_foot', label: '1,850 sqm' },
    ],
    price: '₦65,000,000',
    period: '/ yr',
    action: 'Schedule Inspection',
  category: 'commercial',
  },
  {
    id: 'p5',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
    alt: 'Emerald Terraces - Guzape, Abuja',
    badges: [{ text: 'Governor Consent', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Guzape District, Abuja FCT',
    title: 'Emerald Terraces',
    specs: [
      { icon: 'bed', label: '4 Beds' },
      { icon: 'bathtub', label: '4 Baths' },
      { icon: 'bolt', label: '24/7 Power' },
    ],
    price: '₦22,000,000',
    period: '/ yr',
    action: 'Schedule Inspection',
  category: 'abuja',
  },
  {
    id: 'p6',
    img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80',
    alt: 'Pinecrest Luxury Suites - Old Ikoyi, Lagos',
    badges: [{ text: 'Verified Deed', bg: 'rgba(0, 108, 73, 0.85)', color: '#ffffff' }],
    location: 'Alexander Avenue, Old Ikoyi',
    title: 'Pinecrest Luxury Suites',
    specs: [
      { icon: 'bed', label: '3 Beds' },
      { icon: 'bathtub', label: '3 Baths' },
      { icon: 'pool', label: 'Infinity Pool' },
    ],
    price: '₦14,000,000',
    period: '/ yr',
    action: 'Schedule Inspection',
  category: 'luxury',
  },
];

const filterCategories: Record<string, string> = {
  'All Listings': '',
  'Lekki & Ikoyi Luxury': 'luxury',
  'Abuja Diplomats': 'abuja',
  'Commercial Hubs': 'commercial',
};

export default function PropertiesSection() {
  const dbData = useFeaturedFromDb();
  const properties: Property[] = Array.isArray(dbData) ? dbData : featuredFallback;
  const filters = ['All Listings', 'Lekki & Ikoyi Luxury', 'Abuja Diplomats', 'Commercial Hubs'];
  const [activeFilter, setActiveFilter] = React.useState(filters[0]);

  return (
    <section className="w-full py-20 lg:py-24 bg-[#101513]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Verified Real Estate</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Featured Verified Properties
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Curated listings with authentic deeds, surveyed coordinates, and instant inspection booking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-emerald-400 text-[#0a0a0a] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-[#171E1B] border border-white/[0.06]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.filter((p) => {
          const cat = filterCategories[activeFilter];
          return !cat || p.category === cat;
        }).map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/listings/${property.id}`} className="rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-1 bg-[#171E1B] border border-white/[0.07]">
      <div className="relative h-56 w-full">
        <Image
          src={property.img}
          alt={property.alt}
          width={600}
          height={320}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {property.badges.map((b) => (
            <span
              key={b.text}
              className="px-2 py-0.5 rounded text-[11px] font-semibold backdrop-blur-md"
              style={{ backgroundColor: b.bg, color: b.color }}
            >
              {b.text}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Save to favorites"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-white hover:text-emerald-400 transition-colors"
          style={{ backgroundColor: 'rgba(8, 11, 10, 0.6)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.8-1.8-4.6-1.8-6.4 0L12 6.2l-2.4-1.6c-1.8-1.8-4.6-1.8-6.4 0s-1.8 4.6 0 6.4l8.8 8.8 8.8-8.8c1.8-1.8 1.8-4.6 0-6.4z"/></svg>
        </button>
      </div>
      <div className="p-5 flex flex-col gap-3.5 flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{property.location}</span>
          </div>
          <h3 className="text-base font-bold text-white">{property.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 py-2 border-y border-white/[0.06]">
          {property.specs.map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <span className="text-gray-300">&#9632;</span>
              {s.label}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-base font-extrabold text-white">{property.price}</span>
            <span className="text-xs text-gray-400"> {property.period}</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-emerald-400 hover:text-[#0a0a0a] transition-colors border border-emerald-400/40">
            {property.action}
          </button>
        </div>
      </div>
    </Link>
  );
}
