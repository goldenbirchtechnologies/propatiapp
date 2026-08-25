'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Home, Users, Building2, ShieldCheck, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { SectionLabel, StarRating } from '@/components/ui';
import { cn } from '@/lib/utils';

const stats = [
  { value: '12,500+', label: 'Active Listings', sub: 'across 18 states' },
  { value: '2,300+', label: 'Verified Agents', sub: 'NBA-compliant' },
  { value: '45,000+', label: 'Happy Tenants', sub: 'and counting' },
  { value: '18+', label: 'Cities Covered', sub: 'Lagos to Maiduguri' },
];

const categories = [
  { label: 'Apartments', icon: '🏢', count: '5,200' },
  { label: 'Houses', icon: '🏠', count: '3,100' },
  { label: 'Short-lets', icon: '🏖️', count: '1,800' },
  { label: 'Land', icon: '🌿', count: '950' },
  { label: 'Commercial', icon: '🏗️', count: '680' },
  { label: 'Shared', icon: '🤝', count: '420' },
];

const steps = [
  {
    num: '01',
    title: 'Search & Discover',
    desc: 'Browse thousands of verified properties with photos, floor plans, and virtual tours. Filter by budget, neighborhood, and amenity.',
  },
  {
    num: '02',
    title: 'Connect & Apply',
    desc: 'Message landlords or agents directly, schedule viewings, and submit applications securely. No middlemen confusion.',
  },
  {
    num: '03',
    title: 'Sign & Move In',
    desc: 'Digital agreements with stamp duty, escrow protection, and a seamless move-in experience — all in one app.',
  },
];

const testimonials = [
  {
    name: 'Chidinma O.',
    role: 'Tenant — Lekki',
    text: "I spent weeks searching until I found PROPATI. Within three days, I'd viewed three apartments in Lekki and signed my tenancy digitally. No stress.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6sJMd5M3QqXyjN7w7k7V3H4X8vF3xN9zR5T1wE4yU8iO2pL6mQ9sA0bC3dE6fG7hI8jK9lM0nP1qR2sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0',
    rating: 5,
  },
  {
    name: 'Emeka N.',
    role: 'Landlord — Abuja',
    text: 'Listing on PROPATI meant I got verified tenants fast. The five-layer verification gave me confidence, and rent collection is automatic now.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6sJMd5M3QqXyjN7w7k7V3H4X8vF3xN9zR5T1wE4yU8iO2pL6mQ9sA0bC3dE6fG7hI8jK9lM0nP1qR2sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0',
    rating: 5,
  },
  {
    name: 'Fatima A.',
    role: 'Estate Manager — Ikeja',
    text: "Managing 120 units used to mean three spreadsheets. Now it's one dashboard with receipts, maintenance tickets, and occupancy reports.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6sJMd5M3QqXyjN7w7k7V3H4X8vF3xN9zR5T1wE4yU8iO2pL6mQ9sA0bC3dE6fG7hI8jK9lM0nP1qR2sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0',
    rating: 5,
  },
];

const featuredListings = [
  {
    id: 'feat-1',
    type: 'RESIDENTIAL',
    kind: 'FOR SALE',
    price: '₦125,000,000',
    title: 'The Emerald Heights Penthouse',
    location: 'Ikoyi, Lagos State',
    specs: [
      { icon: 'bed', val: '4' },
      { icon: 'bathtub', val: '5' },
      { icon: 'square_foot', val: '450m²' },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd5-x5XSuD07lQq6ik0pXMxCimmUDW0GS-60ev8nygMkfARM_DljZDhDKgNY8hskF4HPBermPzpn2AgHQxNVDLZtJfy_jsxPyrfO86P10E6wt4NBaK-5_pVlQHMQ4ufgLA4xdf_t1ETubPd2d_T7KOzSuCfZQ83QFnKCygE5Pmm-txZ8eprWRPepNgcNQmxTh1yt1E2QDqm8NNRUoxHufHFBbtgqylNlWZNI5zkemCvCzVo7RtdArv',
    verified: true,
  },
  {
    type: 'COMMERCIAL',
    kind: 'FOR LEASE',
    price: '₦8,500,000/yr',
    title: 'Apex Tower Corporate Hub',
    location: 'Victoria Island, Lagos',
    specs: [
      { icon: 'meeting_room', val: '12' },
      { icon: 'local_parking', val: '20' },
      { icon: 'square_foot', val: '1200m²' },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfqMDKHi4JwIPQDIw3dxaVj6Xs92UxO9c3wvgz0kmRZ6b4Cv77d9tpdPLJ6TeppTKbDa7yh1LBQxnfT6sFv0kg5MyP9i1GVIgvpgk_rlaw_rjG5uxb5kTTK3EGZX2Yr1ExhgjqY5_oyulsejlQ6CE2gxtAKutX1FafjKDk2Mn4I5OmZ8sNBySHANNH82nF2Z2mP2QztGGznx7woQiV8p9RHkxkUb1dX5pmd88EfBWT1M9qysJlccEp',
    verified: true,
  },
  {
    type: 'RESIDENTIAL',
    kind: 'FOR RENT',
    price: '₦4,200,000/yr',
    title: 'Oakwood Garden Duplex',
    location: 'Lekki Phase 1, Lagos',
    specs: [
      { icon: 'bed', val: '3' },
      { icon: 'bathtub', val: '4' },
      { icon: 'pool', val: 'Yes' },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_zSArSuecOv0eGbbb3ZV0K2EovHLqoAB29ytOppsaRlx5pQz98hjzqbLMVHGjOAXtxr1g9J9iylmS38eFbAjirM8VaWlN2VhdbpEt7wlaUWLKTjrwgxMXlCdEIWPumsFOeSgtzDDZgDufLR8qaL_pE1_-oHEr73Ab5xzZ0K0wdcVCBaiKBF3Lq0it0WgvnKejX-0auJ30Usv00LFD63t58qrY_WYRnYiKfRQsRD8eeglTnINwg1Xn',
    verified: true,
  },
];

function FadeIn({ children, className = '', delay = 0, y = 24 }) {
  return (
    <div
      className={cn('fade-in-up', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-emerald-500/20 w-full">
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyb0_8AiXYjkWOvrsX6HKuCTBTF-B13KXmbZe5bAP1hmhDGL9RuD8j76Iav5tzCSZArlSJYJnuXQcbqOpqOZHonaHU8bjq5ObRDzvQZhc3UIxTadhK_79Hd6w1HrrKjVqPSXW-kHMteFwkQV83tZmLF02BTqc8sUDd9oh6pVT98cFHhGuL81_GwnzbP0cj70-QkU9histim_P_kC3Pj6zxycSpIWcJ7CL8W2OzJeizckcrR8GWKn3G"
            alt="Luxury Nigerian property exterior"
            fill
            className="object-cover brightness-[0.55]"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <SectionLabel>Nigeria&apos;s First Verified Property OS</SectionLabel>
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.05] mb-6 tracking-tight">
              Rent, buy, or list with people you can trust.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mb-10 leading-relaxed">
              Verified listings, licensed agents, escrow payments, and digital agreements — built for how Nigerians actually transact property.
            </p>

            {/* Embedded search widget */}
            <div className="glass-card p-2 max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by location, property type..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors">
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 px-1">
                {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Calabar', 'Enugu'].map((city) => (
                  <button
                    key={city}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-8 text-zinc-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                5-Layer Verification
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                Escrow Protected
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                Legally Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section className="py-6 border-y border-white/[0.06] bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-zinc-600 text-sm">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified Agents</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Escrow Payments</span>
            <span className="flex items-center gap-2"><Home className="h-4 w-4 text-emerald-500" /> Digital Agreements</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-500" /> 45k+ Tenants</span>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              From first click to keys in hand — without the drama.
            </h2>
            <p className="mt-4 text-zinc-500 text-lg leading-relaxed">
              We built PROPATI to remove the uncertainty from Nigerian real estate. Here is the simple path.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12} y={20}>
                <div className="glass-card p-8 h-full flex flex-col">
                  <div className="text-5xl font-extrabold text-emerald-400/15 mb-4">{step.num}</div>
                  <h3 className="font-bold text-xl text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed flex-1">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED LISTINGS ===================== */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel>Featured</SectionLabel>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                Handpicked opportunities
              </h2>
              <p className="mt-3 text-zinc-500 text-lg max-w-xl">
                Properties that passed our verification checks. No unfinished buildings, no fake listings.
              </p>
            </div>
            <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
              {['All', 'Residential', 'Commercial'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-bold transition-all',
                    tab === 'All'
                      ? 'bg-zinc-950 shadow-sm text-emerald-400'
                      : 'text-zinc-500 hover:text-emerald-400'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredListings.map((listing, i) => (
              <FadeIn key={listing.title} delay={i * 0.1} y={20}>
                <Link key={listing.title} href={`/listings/${encodeURIComponent(listing.title)}`} className="contents">
                  <article className="group glass-card overflow-hidden hover:border-white/15 transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={listing.img}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-emerald-500 text-emerald-400 text-xs font-bold rounded-full shadow-lg">
                          {listing.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-zinc-800 text-emerald-400 text-xs font-bold rounded-full shadow-lg">
                          {listing.kind}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-zinc-800/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 shadow">
                        {listing.price}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        </svg>
                        {listing.location}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/[0.08] mt-auto">
                        {listing.specs.map((s) => (
                          <span key={s.icon} className="flex items-center gap-1 text-zinc-500 text-xs font-medium">
                            {s.icon === 'bed' && <span className="text-sm">🛏</span>}
                            {s.icon === 'bathtub' && <span className="text-sm">🛁</span>}
                            {s.icon === 'square_foot' && <span className="text-sm">📐</span>}
                            {s.icon === 'meeting_room' && <span className="text-sm">🏢</span>}
                            {s.icon === 'local_parking' && <span className="text-sm">🅿️</span>}
                            {s.icon === 'pool' && <span className="text-sm">🏊</span>}
                            {s.val}
                          </span>
                        ))}
                        <button className="ml-auto w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-emerald-400 transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {listing.verified && (
                      <div className="px-6 pb-4">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Verified Property
                        </span>
                      </div>
                    )}
                  </article>
                </Link>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
            >
              View all listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== ROLE CARDS ===================== */}
      <section className="py-24 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel>I am a...</SectionLabel>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              Built for every role in the property ecosystem
            </h2>
            <p className="mt-4 text-zinc-500 text-lg">
              Whether you own, rent, manage, or transact — there is a dashboard built for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Landlord', desc: 'Manage properties, tenants, leases, and rent collection in one place.', icon: Home, href: '/signup' },
              { label: 'Tenant', desc: 'Find verified homes, pay rent securely, and track your lease lifecycle.', icon: Users, href: '/signup' },
              { label: 'Agent', desc: 'Showcase listings, schedule viewings, and close deals faster.', icon: Building2, href: '/signup' },
              { label: 'Estate Manager', desc: 'Run multiple buildings, units, maintenance, and occupancy from a single dashboard.', icon: ShieldCheck, href: '/signup' },
            ].map((role, i) => (
              <FadeIn key={role.label} delay={i * 0.08} y={16}>
                <Link
                  to={role.href}
                  href={role.href}
                  className="glass-card p-6 flex flex-col items-start gap-4 hover:border-white/15 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <role.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{role.label}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{role.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-auto">
                    Get started <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel>Voices</SectionLabel>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              Nigerians choosing PROPATI every day
            </h2>
            <p className="mt-4 text-zinc-500 text-lg">
              Real stories from tenants, landlords, and estate managers across the country.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.12} y={20}>
                <div className="glass-card p-8 h-full flex flex-col">
                  <StarRating count={t.rating} className="mb-5" />
                  <p className="text-white leading-relaxed mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 flex-shrink-0">
                      {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-xs text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn y={20}>
            <h2 className="font-extrabold text-3xl sm:text-5xl leading-tight mb-6 text-white">
              Ready to find your next home — or tenant?
            </h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of Nigerians who trust PROPATI for verified listings, secure payments, and legally sound agreements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
              >
                Create free account
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 text-white font-semibold rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all"
              >
                Start by browsing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
