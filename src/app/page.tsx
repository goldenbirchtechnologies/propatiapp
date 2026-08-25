'use client';

import AppIcon from '@/components/icons/app-icon';

import Image from 'next/image';
import Link from 'next/link';



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
  },
  {
    name: 'Emeka N.',
    role: 'Landlord — Abuja',
    text: 'Listing on PROPATI meant I got verified tenants fast. The five-layer verification gave me confidence, and rent collection is automatic now.',
  },
  {
    name: 'Fatima A.',
    role: 'Estate Manager — Ikeja',
    text: "Managing 120 units used to mean three spreadsheets. Now it's one dashboard with receipts, maintenance tickets, and occupancy reports.",
  },
];

const featuredListings = [
  {
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
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
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
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
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
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

function FadeIn({ children, className = '', delay = 0, y = 24 }) {
  return (
    <div
      className={`fade-in-up ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide rounded-full mb-5">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen theme-landing app-layout bg-black text-white antialiased selection:bg-emerald-500/20 w-full container">

      <main>
        {/* Hero Section */}
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
              <SectionLabel>Nigeria's First Verified Property OS</SectionLabel>
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.05] mb-6 tracking-tight">
                Rent, buy, or list with people you can trust.
              </h1>
              <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mb-10 leading-relaxed">
                Verified listings, licensed agents, escrow payments, and digital agreements — built for how Nigerians actually transact property.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:scale-[1.02] transition-all shadow-xl"
                >
                  Start Free — it takes 2 minutes
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900/60 text-white font-semibold rounded-full border border-zinc-800 hover:bg-zinc-800/70 transition-all"
                >
                  Browse Listings
                </Link>
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

            <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-zinc-500/80">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <span className="w-px h-8 bg-border animate-pulse"></span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative -mt-12 z-20"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} y={16}>
                <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg border-zinc-800 text-center">
                  <div className="text-3xl font-heading font-bold text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-white">{stat.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{stat.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="max-w-2xl mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              From first click to keys in hand — without the drama.
            </h2>
            <p className="mt-4 text-zinc-500 text-lg leading-relaxed">
              We built PROPATI to remove the uncertainty from Nigerian real estate. Here is the simple path.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12} y={20}>
                <div className="h-full rounded-2xl bg-zinc-900 border-zinc-800 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-5xl font-heading font-extrabold text-emerald-400/15 mb-4">{step.num}</div>
                  <h3 className="font-heading font-bold text-xl text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Featured listings */}
        <section className="py-16 bg-zinc-900"><div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full">
              <div>
                <SectionLabel>Featured</SectionLabel>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                  Handpicked opportunities
                </h2>
                <p className="mt-3 text-zinc-500 text-lg max-w-xl">
                  Properties that passed our verification checks. No unfinished buildings, no fake listings.
                </p>
              </div>
              <div className="flex bg-muted p-1 rounded-full border border-zinc-800">
                {['All', 'Residential', 'Commercial'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      tab === 'All'
                        ? 'bg-zinc-900 shadow-sm text-emerald-400'
                        : 'text-zinc-500 hover:text-emerald-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredListings.map((listing, i) => (
                <FadeIn key={listing.title} delay={i * 0.1} y={20}>
                  <Link key={listing.title} href={`/listings/${listing.id}`} className="contents">
                    <article className="group bg-zinc-900 rounded-2xl overflow-hidden border-zinc-800 hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
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
                        <h3 className="font-heading font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          {listing.location}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-800 mt-auto">
                          {listing.specs.map((s) => (
                            <div key={s.icon} className="flex items-center gap-1 text-zinc-500 text-xs font-medium">
                              <AppIcon name={s.icon} className="lucide text-[16px]" />
                              {s.val}
                            </div>
                          ))}
                          <button className="ml-auto w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-emerald-400 transition-all">
                            <AppIcon name="arrow_forward" className="lucide text-[18px]" />
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
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-emerald-400 font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                View all listings
                <AppIcon name="arrow_forward" className="lucide text-[18px]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <SectionLabel>Voices</SectionLabel>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                Nigerians choosing PROPATI every day
              </h2>
              <p className="mt-4 text-zinc-500 text-lg">
                Real stories from tenants, landlords, and estate managers across the country.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <FadeIn key={t.name} delay={i * 0.12} y={20}>
                  <div className="bg-zinc-900 rounded-2xl p-8 border-zinc-800 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="flex gap-1 text-emerald-400 mb-5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-white leading-relaxed mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <div className="font-heading font-bold text-white">{t.name}</div>
                      <div className="text-sm text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / value props */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: '5-Layer Verification',
                  text: 'Documents, identity, video proof, physical inspection, and admin certification — every participant is checkable.',
                },
                {
                  title: 'Escrow & Legal Compliance',
                  text: 'Funds are held until obligations are met. Digital agreements carry FIRS-compliant stamp duty and legal audit trails.',
                },
                {
                  title: 'Built for Nigeria',
                  text: 'Naira pricing, Paystack payments, Nigerian ID types, state-by-state jurisdiction awareness, and mobile-first design.',
                },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1} y={20}>
                  <div className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed text-sm">{item.text}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
            <div>
              <SectionLabel>Categories</SectionLabel>
              <h2 className="font-heading font-extrabold text-3xl text-white leading-tight">Popular listings</h2>
            </div>
            <Link href="/listings" className="text-sm font-semibold text-emerald-400 hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {categories.map((cat, i) => (
              <FadeIn key={cat.label} delay={i * 0.06} y={16}>
                <Link
                  href={`/properties?type=${cat.label.toLowerCase()}`}
                  className="group bg-zinc-900 rounded-xl p-5 text-center border-zinc-800 hover:border-primary hover:shadow-xl transition-all"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-heading font-bold text-sm text-white">{cat.label}</div>
                  <div className="text-xs text-zinc-500 mt-1">{cat.count} listings</div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-inverse-surface text-inverse-on-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 via-transparent to-amber-500/20" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <FadeIn y={20}>
              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight mb-6">
                Ready to find your next home — or tenant?
              </h2>
              <p className="text-zinc-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Nigerians who trust PROPATI for verified listings, secure payments, and legally sound agreements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:scale-[1.02] transition-all shadow-xl"
                >
                  Create free account
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900/60 text-white font-semibold rounded-full border border-zinc-800 hover:bg-zinc-800/70 transition-all"
                >
                  Start by browsing
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Material Symbols */}
      <style jsx global>{`
        .lucide {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
