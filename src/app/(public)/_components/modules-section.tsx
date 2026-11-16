import React from 'react';
import { Building2, Gavel, Hotel, Network } from 'lucide-react';

const modules = [
  {
    icon: Building2,
    title: 'Property Management OS',
    description:
      'Centralize portfolio operations with automated Naira accounting, facility SLAs, and end-to-end service charge apportionments.',
    features: [
      'Multi-tenant accounting & automated Naira (₦) ledger',
      'Automated official digital receipting & VAT tracking',
      'Intelligent maintenance ticket routing & vendor escrow',
    ],
    link: 'Explore OS',
  },
  {
    icon: Gavel,
    title: 'Automated Lease Engine',
    description:
      'Eliminate legal bottlenecks with compliant, digitally validated residential and commercial agreements tailored to Nigerian tenancy laws.',
    features: [
      'Legally binding Nigerian tenancy templates & schedules',
      'Tamper-proof digital signatures & CAC verification checks',
      'Automated annual rent escalation & expiry alerts',
    ],
    link: 'View Lease Tools',
  },
  {
    icon: Hotel,
    title: 'Shortlet Sync',
    description:
      'Unified availability, instant multi-channel rate parity, and automatic gate security dispatch for premium serviced apartments.',
    features: [
      'Multi-channel two-way sync with Airbnb and Booking.com',
      'Automated guest identity KYC & digital gate passes',
      'Integrated dynamic pricing & electricity token reload',
    ],
    link: 'Discover Shortlet Sync',
  },
  {
    icon: Network,
    title: 'Agent & Broker Syndication',
    description:
      'Equip verified agency networks with direct developer mandates, shared inventory feeds, and contract-secured commission disbursements.',
    features: [
      'Direct MLS syndication with verified title authenticity',
      'Automated commission escrow splitting via Paystack',
      'NIESV & REDAN accredited broker credential badges',
    ],
    link: 'Join Syndication',
  },
];

export default function ModulesSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#101513]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Enterprise Infrastructure</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Specialized Ecosystem Modules
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Purpose-built infrastructure for institutional landlords, property managers, and independent brokers operating across complex African markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="rounded-xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 bg-[#171E1B] border border-white/[0.07]"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-500/10">
                    <Icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{mod.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{mod.description}</p>
                  <ul className="space-y-2.5 pt-2">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-xs text-white/90">
                        <span className="text-emerald-400">&#10003;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 mt-6 border-t border-white/[0.06]">
                  <a className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:underline gap-1" href="#">
                    {mod.link}
                    <span className="text-[16px]">&rarr;</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
