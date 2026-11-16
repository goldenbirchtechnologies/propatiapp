import React from 'react';

const hubs = [
  { city: 'Lagos State', areas: 'Ikoyi, Victoria Island, Lekki Phase 1, Ikeja GRA', units: '7,840+' },
  { city: 'Abuja FCT', areas: 'Maitama, Guzape, Wuse 2, Asokoro', units: '4,320+' },
  { city: 'Rivers State', areas: 'Port Harcourt GRA Phases 1-3, Peter Odili', units: '1,450+' },
  { city: 'Oyo State', areas: 'Bodija, Oluyole, Jericho, Ibadan Central', units: '610+' },
];

const expansions = [
  { country: 'GH', city: 'Accra, Ghana', areas: 'Airport Residential, Cantonments, East Legon', phase: 'Q3 Expansion' },
  { country: 'KE', city: 'Nairobi, Kenya', areas: 'Westlands, Kilimani, Karen, Upper Hill', phase: 'Q4 Expansion' },
  { country: 'RW', city: 'Kigali, Rwanda', areas: 'Nyarutarama, Kimihurura, Kiyovu', phase: 'Pre-registration' },
  { country: 'ZA', city: 'Johannesburg, South Africa', areas: 'Sandton, Rosebank, Melrose Arch', phase: 'Pre-registration' },
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
            Active operational clusters across high-yield Nigerian metros and our pan-African expansion pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 sm:p-8 flex flex-col gap-6 bg-[#171E1B] border border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full animate-ping bg-emerald-400" />
                <h3 className="text-lg font-bold text-white">Active Operational Hubs</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">LIVE DESKS</span>
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
                  <span className="text-xs font-bold text-emerald-400">{h.units} Units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-6 sm:p-8 flex flex-col gap-6 bg-[#171E1B] border border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-gray-400">&#9671;</span>
                <h3 className="text-lg font-bold text-white">Planned African Expansion</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101513] text-gray-400">ROADMAP</span>
            </div>
            <div className="space-y-3.5">
              {expansions.map((e) => (
                <div key={e.city} className="flex items-center justify-between p-3.5 rounded-lg bg-[#101513]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400">{e.country}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{e.city}</h4>
                      <p className="text-xs text-gray-400">{e.areas}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-white bg-white/[0.08]">{e.phase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
