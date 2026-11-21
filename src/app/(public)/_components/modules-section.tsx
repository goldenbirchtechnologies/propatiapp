import React from 'react';
import Link from 'next/link';
import { Building2, Gavel, Hotel, Network } from 'lucide-react';

const modules = [
  {
    icon: Building2,
    title: 'Property management',
    description:
      'Keep properties, tenants, payments, and maintenance tasks together in one workspace.',
    features: [
      'Rent and payment records',
      'Receipts and statements',
      'Maintenance requests and updates',
    ],
    link: 'Explore OS',
  href: '/dashboard/landlord',
  },
  {
    icon: Gavel,
    title: 'Rental agreements',
    description:
      'Create and manage residential and commercial agreements with the information relevant to your tenancy.',
    features: [
      'Agreement templates and schedules',
      'Digital signing',
      'Rent dates and renewal reminders',
    ],
    link: 'View Lease Tools',
  href: '/agreements',
  },
  {
    icon: Hotel,
    title: 'Shortlets',
    description:
      'Manage short-stay listings, availability, and booking requests.',
    features: [
      'Availability and booking requests',
      'Guest details',
      'Pricing and stay information',
    ],
    link: 'Discover Shortlet Sync',
  href: '/listings?listingType=short_let',
  },
  {
    icon: Network,
    title: 'Agents and brokers',
    description:
      'Help agents share listings, manage clients, and keep track of deals and commissions.',
    features: [
      'Listings and client enquiries',
      'Deal and commission records',
      'Profile and verification details',
    ],
    link: 'Join Syndication',
  href: '/find-agent',
  },
];

export default function ModulesSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#101513]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Tools for property work</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Everything you need in one place
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Simple tools for people who are looking for, renting, or managing property.
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
                  <Link className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:underline gap-1" href={mod.href}>
                    {mod.link}
                    <span className="text-[16px]">&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
