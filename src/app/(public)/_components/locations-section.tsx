import React from 'react';

const hubs = [
  { city: 'Lagos State', areas: 'Search available listings across Lagos.' },
  { city: 'Abuja FCT', areas: 'Search available listings across Abuja.' },
  { city: 'Other areas', areas: 'More locations appear as properties are added.' },
];

export default function LocationsSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Regional Footprint</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Geographic Coverage &amp; Expansion
          </h2>
          <p className="text-sm text-gray-400">
            Browse the areas where properties are currently listed. Availability changes as owners publish new listings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 sm:p-8 flex flex-col gap-6 bg-[#171E1B] border border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full animate-ping bg-emerald-400" />
                <h3 className="text-lg font-bold text-white">Where to search</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">LISTINGS</span>
            </div>
            <div className="space-y-3.5">
              {hubs.map((h) => (
                <div key={h.city} className="flex items-center justify-between p-3.5 rounded-lg bg-[#101513]">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">&#9679;</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{h.city}</h4>
                      <p className="text-xs text-gray-400">{h.areas}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-6 sm:p-8 flex flex-col gap-6 bg-[#171E1B] border border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-gray-400">&#9671;</span>
                <h3 className="text-lg font-bold text-white">New listings</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101513] text-gray-400">UPDATED AS ADDED</span>
            </div>
            <div className="space-y-3.5">
              <div className="rounded-lg bg-[#101513] p-5">
                <h4 className="text-sm font-semibold text-white">Check the marketplace for current availability</h4>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">Listings are added by property owners and agents. Use the search filters to find a suitable area, price, and property type.</p>
                <a href="/listings" className="mt-4 inline-flex text-xs font-semibold text-emerald-400 hover:underline">Browse listings <span className="ml-1">→</span></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
