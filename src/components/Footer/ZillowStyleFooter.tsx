'use client';

import Link from 'next/link';
import { Building2, Home, Clock3, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * City recommendations and property directory for key Nigerian hubs.
 * Clicking a city navigates to /listings with the location filtered
 * via the `q` query parameter.
 */

const realEstateCities = [
  { label: 'Browse all properties', state: '' },
  { label: 'Lagos prime real estate', state: 'Lagos' },
  { label: 'Victoria Island properties', state: 'Victoria Island' },
  { label: 'Ikoyi luxury residential', state: 'Ikoyi' },
  { label: 'Abuja FCT residential & land', state: 'Abuja' },
  { label: 'Lekki Phase 1 waterfront', state: 'Lekki' },
  { label: 'Ikeja GRA executive homes', state: 'Ikeja' },
];

const rentalCities = [
  { label: 'Browse all rental homes', state: '' },
  { label: 'Lagos serviced apartments', state: 'Lagos' },
  { label: 'Abuja executive rentals', state: 'Abuja' },
  { label: 'Port Harcourt corporate flats', state: 'Port Harcourt' },
  { label: 'Ibadan residential leases', state: 'Ibadan' },
  { label: 'Enugu serviced apartments', state: 'Enugu' },
  { label: 'Benin City residential homes', state: 'Benin City' },
];

const shortletCities = [
  { label: 'Browse all shortlets', state: '' },
  { label: 'Lekki Phase 1 shortlets', state: 'Lekki' },
  { label: 'Victoria Island luxury stays', state: 'Victoria Island' },
  { label: 'Ikoyi executive suites', state: 'Ikoyi' },
  { label: 'Abuja diplomatic shortlets', state: 'Abuja' },
  { label: 'Port Harcourt serviced stays', state: 'Port Harcourt' },
  { label: 'Calabar vacation apartments', state: 'Calabar' },
];

const jurisdictionHubs = [
  { label: 'Explore nationwide cadre', state: '' },
  { label: 'Lagos Mainland business hub', state: 'Lagos' },
  { label: 'Abuja Central Zone', state: 'Abuja' },
  { label: 'Epe & Ibeju-Lekki expansion', state: 'Lagos' },
  { label: 'Asokoro diplomatic district', state: 'Abuja' },
  { label: 'Trans-Amadi industrial zone', state: 'Port Harcourt' },
  { label: 'Ibadan Bodija commercial hub', state: 'Ibadan' },
];

export default function ZillowStyleFooter() {
  return (
    <section className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/70 py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recommendation Callout Banner */}
        <div className="mb-10 sm:mb-14 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 md:p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personalized Discovery</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-2.5 sm:mb-3 tracking-tight">
            About PropatiBox&apos;s Recommendations
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto">
            Recommendations are personalized based on your location, search activity, and viewed or saved homes so you never miss a verified listing in your preferred Nigerian city.
          </p>
        </div>

        {/* 4-Column Directory Grid with Strong Visual Separation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {/* Column 1: Real Estate */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 flex flex-col">
            <div className="flex items-center gap-2.5 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <Building2 className="h-4 w-4 text-primary dark:text-[#4edea3]" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                  Real Estate
                </h4>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Buy &amp; Outright Sale</span>
              </div>
            </div>
            <ul className="space-y-1">
              {realEstateCities.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.state ? `/listings?q=${encodeURIComponent(c.state)}` : '/listings'}
                    className="block text-sm font-medium text-zinc-600 hover:text-primary hover:translate-x-1 dark:text-zinc-400 dark:hover:text-[#4edea3] py-2 transition-all"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Rentals */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 flex flex-col">
            <div className="flex items-center gap-2.5 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <Home className="h-4 w-4 text-primary dark:text-[#4edea3]" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                  Rentals
                </h4>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Annual &amp; Commercial Lease</span>
              </div>
            </div>
            <ul className="space-y-1">
              {rentalCities.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.state ? `/listings?q=${encodeURIComponent(c.state)}` : '/listings?listingType=rent'}
                    className="block text-sm font-medium text-zinc-600 hover:text-primary hover:translate-x-1 dark:text-zinc-400 dark:hover:text-[#4edea3] py-2 transition-all"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Shortlets */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 flex flex-col">
            <div className="flex items-center gap-2.5 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <Clock3 className="h-4 w-4 text-primary dark:text-[#4edea3]" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                  Shortlets
                </h4>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Serviced &amp; Holiday Stays</span>
              </div>
            </div>
            <ul className="space-y-1">
              {shortletCities.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.state ? `/listings?listingType=short_let&q=${encodeURIComponent(c.state)}` : '/listings?listingType=short_let'}
                    className="block text-sm font-medium text-zinc-600 hover:text-primary hover:translate-x-1 dark:text-zinc-400 dark:hover:text-[#4edea3] py-2 transition-all"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Regional Hubs */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 flex flex-col">
            <div className="flex items-center gap-2.5 pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <MapPin className="h-4 w-4 text-primary dark:text-[#4edea3]" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                  Regional Hubs
                </h4>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Cadastre &amp; Jurisdictions</span>
              </div>
            </div>
            <ul className="space-y-1">
              {jurisdictionHubs.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.state ? `/listings?q=${encodeURIComponent(c.state)}` : '/find-agent'}
                    className="block text-sm font-medium text-zinc-600 hover:text-primary hover:translate-x-1 dark:text-zinc-400 dark:hover:text-[#4edea3] py-2 transition-all"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Essential Company Details & Compliance Summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-[#4edea3]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Nigeria&apos;s Verified Property Marketplace
                </h5>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  All listings verified via map surveys, deed validation, and secure payment trustee rails.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Business Registration RC: 1849204
              </span>
              <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Stamp Duty
              </span>
              <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                NDPA 2023 Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
