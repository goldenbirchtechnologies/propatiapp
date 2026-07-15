'use client'

import MaterialIcon from '@/components/icons/material-icon';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';



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
    accent: 'text-primary',
    bg: 'bg-primary/10',
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
    accent: 'text-commercial-gold',
    bg: 'bg-commercial-gold/10',
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
    accent: 'text-primary',
    bg: 'bg-primary/10',
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
    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-wide rounded-full mb-5">
      {children}
    </span>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/90 backdrop-blur-xl shadow-sm border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-heading font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              PROPATI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '/listings', label: 'Listings' },
              { href: '/insights', label: 'Insights' },
              { href: '/valuation', label: 'Valuation' },
              { href: '/agency', label: 'Agency' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-full hover:brightness-110 transition-all shadow-md shadow-primary/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-foreground"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="px-4 py-4 flex flex-col gap-3">
              {[
                { href: '/listings', label: 'Listings' },
                { href: '/insights', label: 'Insights' },
                { href: '/valuation', label: 'Valuation' },
                { href: '/agency', label: 'Agency' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 mt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center px-5 py-2.5 rounded-full text-sm font-semibold border border-border"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white shadow-md"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

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
              <p className="text-lg sm:text-xl text-white/85 max-w-2xl mb-10 leading-relaxed">
                Verified listings, licensed agents, escrow payments, and digital agreements — built for how Nigerians actually transact property.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-foreground font-bold rounded-full hover:scale-[1.02] transition-all shadow-xl"
                >
                  Start Free — it takes 2 minutes
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  Browse Listings
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 mt-8 text-white/70 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs">✓</span>
                  5-Layer Verification
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs">✓</span>
                  Escrow Protected
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs">✓</span>
                  Legally Compliant
                </span>
              </div>
            </div>

            <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/60">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <span className="w-px h-8 bg-white/30 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative -mt-12 z-20"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} y={16}>
                <div className="bg-card rounded-2xl p-6 shadow-elevated border-border text-center">
                  <div className="text-3xl font-heading font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="max-w-2xl mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground leading-tight">
              From first click to keys in hand — without the drama.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              We built PROPATI to remove the uncertainty from Nigerian real estate. Here is the simple path.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12} y={20}>
                <div className="h-full rounded-2xl bg-card border-border p-8 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="text-5xl font-heading font-extrabold text-primary/15 mb-4">{step.num}</div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Featured listings */}
        <section className="py-16 bg-card"><div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full">
              <div>
                <SectionLabel>Featured</SectionLabel>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground leading-tight">
                  Handpicked opportunities
                </h2>
                <p className="mt-3 text-muted-foreground text-lg max-w-xl">
                  Properties that passed our verification checks. No unfinished buildings, no fake listings.
                </p>
              </div>
              <div className="flex bg-muted p-1 rounded-full border border-border">
                {['All', 'Residential', 'Commercial'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      tab === 'All'
                        ? 'bg-card shadow-sm text-primary'
                        : 'text-muted-foreground hover:text-primary'
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
                  <article className="group bg-card rounded-2xl overflow-hidden border-border hover:shadow-card-hover transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={listing.img}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                          {listing.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/95 text-primary text-xs font-bold rounded-full shadow-lg">
                          {listing.kind}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow">
                        {listing.price}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        </svg>
                        {listing.location}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border mt-auto">
                        {listing.specs.map((s) => (
                          <div key={s.icon} className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                            <MaterialIcon name={s.icon} className="material-symbols-outlined text-[16px]" />
                            {s.val}
                          </div>
                        ))}
                        <button className="ml-auto w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                          <MaterialIcon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
                        </button>
                      </div>
                    </div>
                    {listing.verified && (
                      <div className="px-6 pb-4">
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Verified Property
                        </span>
                      </div>
                    )}
                  </article>
                </FadeIn>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                View all listings
                <MaterialIcon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <SectionLabel>Voices</SectionLabel>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground leading-tight">
                Nigerians choosing PROPATI every day
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Real stories from tenants, landlords, and estate managers across the country.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <FadeIn key={t.name} delay={i * 0.12} y={20}>
                  <div className="bg-card rounded-2xl p-8 border-border shadow-sm hover:shadow-card-hover transition-all h-full flex flex-col">
                    <div className="flex gap-1 text-primary mb-5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <div className="font-heading font-bold text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
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
                    <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{item.text}</p>
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
              <h2 className="font-heading font-extrabold text-3xl text-foreground leading-tight">Popular listings</h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {categories.map((cat, i) => (
              <FadeIn key={cat.label} delay={i * 0.06} y={16}>
                <Link
                  href={`/properties?type=${cat.label.toLowerCase()}`}
                  className="group bg-card rounded-xl p-5 text-center border-border hover:border-primary hover:shadow-card-hover transition-all"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-heading font-bold text-sm text-foreground">{cat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cat.count} listings</div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-inverse-surface text-inverse-on-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-commercial-gold/20" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <FadeIn y={20}>
              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight mb-6">
                Ready to find your next home — or tenant?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Nigerians who trust PROPATI for verified listings, secure payments, and legally sound agreements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-foreground font-bold rounded-full hover:scale-[1.02] transition-all shadow-xl"
                >
                  Create free account
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  Start by browsing
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <span className="text-xl font-heading font-extrabold tracking-tight text-foreground">PROPATI</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Nigeria's first verified property operating system. Professional standards, legal compliance, and people-first service.
              </p>
              <div className="flex gap-4">
                {[
                  { href: '#', label: 'Twitter / X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { href: '#', label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  { href: '#', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266-.057 1.644-.07 4.849-.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                ].map((soc) => (
                  <Link
                    key={soc.label}
                    href={soc.href}
                    aria-label={soc.label}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d={soc.path} />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-foreground mb-4">Tenants</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/properties?purpose=rent" className="hover:text-primary transition-colors">Rent a Property</Link></li>
                <li><Link href="/properties?purpose=buy" className="hover:text-primary transition-colors">Buy a Property</Link></li>
                <li><Link href="/properties?purpose=short-let" className="hover:text-primary transition-colors">Short-let Stays</Link></li>
                <li><Link href="/screening" className="hover:text-primary transition-colors">Tenant Screening</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-foreground mb-4">Landlords</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/dashboard/landlord" className="hover:text-primary transition-colors">List Property</Link></li>
                <li><Link href="/verification" className="hover:text-primary transition-colors">Property Verification</Link></li>
                <li><Link href="/rent-collection" className="hover:text-primary transition-colors">Rent Collection</Link></li>
                <li><Link href="/agreements" className="hover:text-primary transition-colors">Digital Agreements</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-primary transition-colors">Press</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 PROPATI Technologies Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Material Symbols */}
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
