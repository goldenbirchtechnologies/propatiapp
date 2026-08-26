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
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyb0_8AiXYjkWOvrsX6HKuCTBTF-B13KXmbZe5bAP1hmhDGL9RuD8j76Iav5tzCSZArlSJYJnuXQcbqOpqOZHonaHU8bjq5ObRDzvQZhc3UIxTadhK_79Hd6w1HrrKjVqPSXW-kHMteFwkQV83tZmLF02BTqc8sUDd9oh6pVT98cFHhGuL81_GwnzbP0cj70-QkU9histim_P_kC3Pj6zxycSpIWcJ7CL8W2OzJeizckcrR8GWKn3G"
            alt="Luxury Nigerian property exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-6">
              <SectionLabel>
                <CheckCircle2 size={11} className="text-emerald-400" />
                Nigeria&apos;s First Verified Property Marketplace
              </SectionLabel>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
              Find your{' '}
              <span className="text-emerald-400">verified</span>{' '}
              home in Lagos.
            </h1>

            <p className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-2xl leading-relaxed">
              Every listing verified. Every landlord authenticated. Every payment protected.
              Stop viewing fake listings and start finding real homes.
            </p>

            {/* Search widget */}
            <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              {/* Type tabs */}
              <div className="flex gap-1 p-1 mb-3">
                {['rent', 'buy', 'shortlet', 'commercial'].map((t) => (
                  <button
                    key={t}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-lg capitalize transition-colors ${
                      t === 'rent' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by location, property type, or keyword…"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <Link
                  href="/listings"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span>Search</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-emerald-400 font-bold text-lg">{s.value}</span>
                  <span className="text-zinc-500 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section className="border-y border-white/[0.06] bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'Document Verification', desc: 'Every property and landlord verified by our compliance team' },
              { icon: Star, label: 'Instant Matching', desc: 'AI-powered matching connects tenants with the right properties' },
              { icon: Users, label: 'Market Intelligence', desc: 'Real-time pricing data for 12 Nigerian cities' },
              { icon: Building2, label: '50,000+ Properties', desc: 'The largest verified property database in Nigeria' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{item.label}</div>
                  <div className="text-zinc-600 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
              Renting reimagined
            </h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">
              From search to keys in hand — a seamless, transparent process built for Nigeria.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="glass-card p-8 relative overflow-hidden hover:border-white/15 transition-colors">
                <div className="text-[80px] font-black text-white/[0.04] absolute -top-4 -right-2 leading-none select-none">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
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
                      ? 'bg-zinc-950 text-emerald-400'
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
                        <span className="px-3 py-1 bg-emerald-500 text-emerald-400 text-xs font-bold rounded-full">
                          {listing.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-zinc-800 text-emerald-400 text-xs font-bold rounded-full">
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-emerald-500/20"
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
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:brightness-110 transition-all shadow-emerald-500/20"
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
