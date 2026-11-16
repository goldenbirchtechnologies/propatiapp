import React from 'react';
import { TrendingUp, KeyRound, BedDouble, MapPin } from 'lucide-react';

const directories = [
  {
    icon: TrendingUp,
    title: 'Real Estate Sales',
    items: [
      'Residential Developments',
      'Commercial Office Parks',
      'Industrial Logistics Hubs',
      'Off-Plan Investment Mandates',
    ],
  },
  {
    icon: KeyRound,
    title: 'Long-Term Rentals',
    items: [
      'Self-contained Studios',
      'Luxury Serviced Flats',
      'Gated Estate Townhouses',
      'Corporate Expatriate Leases',
    ],
  },
  {
    icon: BedDouble,
    title: 'Shortlets & Serviced',
    items: [
      'Vacation Waterfront Stays',
      'Executive Business Suites',
      'Weekend Getaways & Lofts',
      'Serviced Penthouses',
    ],
  },
  {
    icon: MapPin,
    title: 'Regional Hubs & Guides',
    items: [
      'Lagos Property Yield Index',
      'Abuja Diplomatic Report',
      'Port Harcourt Industrial Desk',
      'Real Estate Legal Handbook',
    ],
  },
];

export default function DirectoriesSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#101513]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Resource Directories</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Explore by Category &amp; Territory
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {directories.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 bg-[#171E1B] border border-white/[0.07]"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">{d.title}</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                  {d.items.map((item) => (
                    <li key={item} className="hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 transition-colors">
                      <span className="text-gray-500">&rsaquo;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
