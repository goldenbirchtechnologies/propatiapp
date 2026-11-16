'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, MapPin, Building2 } from 'lucide-react';

const bgImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80';

function usePublicStats() {
  const [stats, setStats] = React.useState<{ active: number; verified: number } | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/public/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.listings) setStats({ active: d.listings.active ?? 0, verified: d.listings.verified ?? 0 });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return stats;
}

const tabs = ['Rent', 'Buy', 'Shortlet', 'Commercial'] as const;
type Tab = (typeof tabs)[number];

export default function HeroSection() {
  const stats = usePublicStats();
  const [activeTab, setActiveTab] = useState<Tab>('Rent');

  return (
    <section className="relative w-full bg-[#0a0a0a] overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-[580px] h-[580px] rounded-full blur-[140px] pointer-events-none bg-emerald-400/20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[420px] h-[420px] rounded-full blur-[120px] pointer-events-none bg-emerald-500/10" />

      <div className="absolute inset-0">
        <Image src={bgImage} alt="Nigeria property landscape" fill className="object-cover opacity-20" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-16 lg:pb-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          <div className="lg:w-[58%] flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="inline-block">&#9889;</span>
              <span>Nigeria&apos;s First Verified Property Marketplace &amp; Cadastral Registry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
              Nigeria&apos;s Most Trusted{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-300 bg-clip-text text-transparent">
                Property
              </span>{' '}
              Marketplace
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
              Discover verified properties, manage rentals, automate leasing, and streamline institutional property operations across Nigeria with algorithmic verification.
            </p>

            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">&#8358;4.8B+</span>
                  <span className="text-xs text-gray-400 mt-0.5">Transacted Volume</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">{stats.active.toLocaleString()}+</span>
                  <span className="text-xs text-gray-400 mt-0.5">Verified Units</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">99.4%</span>
                  <span className="text-xs text-gray-400 mt-0.5">On-time Collections</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">6 Hubs</span>
                  <span className="text-xs text-gray-400 mt-0.5">Pan-African Presence</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-[42%] w-full">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center gap-1 mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Location</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                    <input
                      className="bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-full"
                      placeholder="Ikoyi, Lekki, Maitama..."
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Asset Class</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <Building2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <select className="bg-transparent text-sm text-gray-800 focus:outline-none w-full appearance-none cursor-pointer">
                      <option>All Property Types</option>
                      <option>Luxury Penthouse</option>
                      <option>Detached Duplex</option>
                      <option>Serviced Flat</option>
                      <option>Commercial Office</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Budget Range</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <span className="text-sm font-bold text-emerald-600">&#8358;</span>
                    <select className="bg-transparent text-sm text-gray-800 focus:outline-none w-full appearance-none cursor-pointer">
                      <option>&#8358;1.5M - &#8358;5M / yr</option>
                      <option>&#8358;5M - &#8358;15M / yr</option>
                      <option>&#8358;15M - &#8358;35M / yr</option>
                      <option>&#8358;35M+ / yr</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="w-full h-11 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Search className="h-4 w-4" />
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
