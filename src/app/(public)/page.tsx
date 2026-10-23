'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Home, Users, Building2, ShieldCheck, ArrowRight, CheckCircle2, Star, MapPin, Bed, Bath, Square, Heart, MessageCircle, TrendingUp, Lock, Gavel, Zap } from 'lucide-react';
import { SectionLabel, StarRating, InteractiveHoverButton } from '@/components/ui';
import ZillowStyleFooter from '@/components/Footer/ZillowStyleFooter';
import { cn } from '@/lib/utils';

function usePublicStats() {
  const [stats, setStats] = React.useState<{ active: number; verified: number } | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/public/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.listings) setStats({ active: d.listings.active ?? 0, verified: d.listings.verified ?? 0 });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (!stats) return null;
  if (stats.active === 0) return null;
  return [
    { value: `${stats.active.toLocaleString('en-NG')}`, label: 'Active Listings' },
    { value: `${stats.verified.toLocaleString('en-NG')}`, label: 'Verified Properties' },
  ];
}

const pillars = [
  {
    icon: <Gavel className="h-6 w-6" />,
    title: 'Document Verification',
    desc: 'Every document cross-checked against Lagos Lands Bureau Alausa, Abuja FCDA, and CAC company registry.',
    tag: 'SURCON Survey Clearance',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Instant AI Matching',
    desc: 'Automated institutional scoring pairs verified buyers and corporate tenants with registered property principals.',
    tag: 'Zero Unlicensed Middlemen',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Market Intelligence',
    desc: 'Real-time sq. metre price velocity tracking across 12 Nigerian urban economic hubs.',
    tag: 'Cadastral Yield Index',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: '50,000+ Validated Units',
    desc: 'Zero tolerance for Omonile harassment or duplicate allocations. Secure Paystack & multi-tier institutional escrow.',
    tag: 'LASRERA Escrow Protocol',
  },
];

const steps = [
  {
    num: '01',
    title: 'Search',
    desc: 'Explore curated verified listings cross-checked with beacon coordinates.',
    metric: 'Beacon Mapped',
  },
  {
    num: '02',
    title: 'View',
    desc: '3D Tours & verified HD photos — geo-stamped, unfiltered condition.',
    metric: 'Geo-Stamped',
  },
  {
    num: '03',
    title: 'Schedule',
    desc: 'Book physical or drone tours with verified licensed representatives.',
    metric: 'Direct Agent',
  },
  {
    num: '04',
    title: 'Secure Payment',
    desc: 'Funds held in secure escrow until title conditions and keys are vetted.',
    metric: 'LASRERA Escrow',
  },
  {
    num: '05',
    title: 'Move In',
    desc: 'Collect keys, biometric gate passes, and verified land registry deeds.',
    metric: 'Deed Recorded',
  },
];

const roles = [
  { icon: <Home className="h-5 w-5" />, title: 'Landlord & Asset Owner', desc: 'Eliminate default risks. Automate rent remittance, screen prospective tenants, and audit land titles.' },
  { icon: <Users className="h-5 w-5" />, title: 'Tenant & Seeker', desc: 'Find verified homes, pay rent securely via escrow, and track your lease lifecycle end-to-end.' },
  { icon: <Building2 className="h-5 w-5" />, title: 'Agent & Broker', desc: 'Showcase verified listings, schedule viewings, and close deals faster with institutional backing.' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Estate Manager', desc: 'Manage multiple properties, tenants, maintenance, and financial reporting from one dashboard.' },
];

const featuredFallback = [
  {
    id: 'feat-1', type: 'RESIDENTIAL', kind: 'FOR SALE', price: '₦140,000,000',
    title: 'Lekki Phase 1 Waterfront Villa', location: 'Admiralty Way, Lekki, Lagos',
    specs: [{ icon: 'bed', val: '4' }, { icon: 'bath', val: '5' }, { icon: 'sqm', val: '420m²' }],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg87XFG37A3By2k-nM767Yn60OnjpEP63O19qQKHO3cPrn88QiKog-wGqVO6NYqpfE0RDUArhjqXB8mjJxCHB4iaZlMA2cxJd2plfZ3cVR2AlqoOn5boVkaAfyV8hN_W1xmwPfiV1wd-bu88RTNQiJiYSYW7_b5zebt8shFFVGRkETcYuGy_GZ2xALJ0UnYGn4pCl4vRjm7CEeJX41miJ-8etfYcc7JGAerjByvDVv45BT-jW8xbCFbQ',
    verified: true,
  },
  {
    id: 'feat-2', type: 'RESIDENTIAL', kind: 'FOR RENT', price: '₦18,000,000/yr',
    title: 'VI Executive Serviced Penthouse', location: 'Ahmadu Bello Way, VI, Lagos',
    specs: [{ icon: 'bed', val: '3' }, { icon: 'bath', val: '4' }, { icon: 'sqm', val: '280m²' }],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1FmLBiQ-ZDec5tDJe7gi36brX9FPduolo2nkb2_9M2ag-8xJuxdIR5PURitjFp4J4IOw4ecxIYdgYiHvz1F9B1nUv8WTnGqy3uIo3aqHuu50nh6ede-jDKTWNV0L4bLaHa2UmKLWyQipRuJQZPTpAI9dxIEpRh9ryUIzYffGFoGvEU_es99tiMG6odsLK9Vi_Z40m4LJ3vCEzpc-cgnc9Dvq5WIlCELqUF3BKqhV91Vidz6to-f5ldw',
    verified: true,
  },
  {
    id: 'feat-3', type: 'COMMERCIAL', kind: 'FOR LEASE', price: '₦48,000,000/yr',
    title: 'Apapa Freezone Industrial Bay', location: 'Wharf Road Expressway, Lagos',
    specs: [{ icon: 'sqm', val: '2,400m²' }, { icon: 'dock', val: 'Dock Bays' }, { icon: 'power', val: '3-Phase' }],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEFMN1q2doZpyBfeGUmn6UX9o4k_raLFtzs9pDZ0owx2KiMNGIRqK1GAWl8pQZM3YDE8zy7cyrgy5S-s_PW5aE4as-WAKnsyeNwI6ZFcxOYZ_cyXx8YVDeO4b_Gq2DYlniSRtXjJQWBGDdHQbxn_px0FF08OJScdKq1McQD-Q0LYdit-KyQyh393NAjpBIqrdBSmNrwenMthIq6euc_eNP2cZzecpfqDIxPcZ0l-a3kb9_Gfw8kpWlIw',
    verified: true,
  },
  {
    id: 'feat-4', type: 'RESIDENTIAL', kind: 'FOR RENT', price: '₦8,500,000/yr',
    title: 'Ikeja GRA Smart Executive Duplex', location: 'Isaac John Crescent, Ikeja GRA',
    specs: [{ icon: 'bed', val: '3' }, { icon: 'bath', val: '3' }, { icon: 'smart', val: 'Smart Lock' }],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLn0_TiG8LOsrxkKxnqB06EfApQTkrGlG-T6wukLRelatbsmLM7uKOGsTjM23PMeIo2p8rdG24VlPYjCRK470l-_s4kqm1C-9Xrs7RTr-8mgyCAmPwxv7A7N8dojLpf4MNsNqH5hONI98TWTfiI2UZz_g5_sr5dcSXn6NTJfg9y_wKTAeU0TUKYuXP6f1YP_n87Q6n2jVssVUaUicBOvq7-x_pH5hnYNv2URbEYfWdjUlGaJyGBsvNfQ',
    verified: true,
  },
];

function useFeaturedFromDb() {
  const [dbFeatured, setDbFeatured] = React.useState<null | any[]>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/listings?limit=6')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const items = Array.isArray(d?.listings) ? d.listings : [];
        const active = items.filter((l: any) => l.status !== 'suspended' && l.status !== 'deleted');
        if (!active.length) return;
        const mapped = active.slice(0, 4).map((l: any) => ({
          id: l.id,
          type: (l.propertyType === 'office' || l.propertyType === 'shop' || l.listingType === 'commercial' ? 'COMMERCIAL' : 'RESIDENTIAL') as string,
          kind: (l.listingType === 'sale' ? 'FOR SALE' : l.listingType === 'short_let' ? 'SHORT-LET' : l.listingType === 'commercial' ? 'FOR LEASE' : 'FOR RENT') as string,
          price: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(l.price || 0)) + (l.pricePeriod && l.pricePeriod !== 'total' ? `/${l.pricePeriod}` : l.listingType === 'sale' ? '' : '/yr'),
          title: l.title,
          location: [l.area, l.state].filter(Boolean).join(', ') || l.address || '',
          specs: [
            { icon: 'bed', val: String(l.bedrooms ?? '—') },
            { icon: 'bath', val: String(l.bathrooms ?? '—') },
            { icon: 'sqm', val: l.sizeSqm ? `${l.sizeSqm}m²` : '—' },
          ],
          img: l.coverImage || l.images?.[0]?.url || featuredFallback[0].img,
          verified: l.verificationTier ? l.verificationTier !== 'basic' : !!l.verified,
        }));
        if (mapped.length) setDbFeatured(mapped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return dbFeatured;
}

function FadeIn({ children, className = '', delay = 0, y = 24 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <div className={cn('fade-in-up', className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const liveStats = usePublicStats();
  const dbFeatured = useFeaturedFromDb();
  const featuredListings = dbFeatured ?? featuredFallback;

  return (
    <div className="min-h-screen bg-[#fbf8fc] text-zinc-900 antialiased selection:bg-emerald-500/20">
      {/* ===================== HERO ===================== */}
      <section className="relative w-full overflow-hidden bg-[#1b1b1e] text-white">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlfnZbb4S0pGyz9UN-YVaruLwXLJ9tnYKYcRLy-KZwClAJSKLKQ0yFVYbk1RUYdNDBUfY82Fodnq0YP-BZCjnEgGpScCG4ifDzyCH4JpWPA2sCI5QooDgIvlhMB9ZsF5fVXu7NbGtWtkN0iboqxcsrRDLu2RzZICtBwHmBkQbzzwZi1KLNGa9V2elrLRiQG72mDH2NXaWYObH4jKXGSApltwSUrU-MMjzuArtN_74kryQCz6E94uOAmQ"
            alt="Lagos Victoria Island skyline"
            fill
            className="object-cover mix-blend-luminosity opacity-35 saturate-150 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b1b1e]/85 via-[#1b1b1e]/75 to-[#1b1b1e]" />
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-28 text-center">
          {/* Eyebrow Pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Nigeria&apos;s First Verified Property Marketplace &amp; Cadastral Registry
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-[54px] md:leading-[62px]">
            Find your <span className="text-emerald-400">verified</span> home and sovereign land in Nigeria.
          </h1>
          <p className="mb-8 max-w-2xl text-base text-zinc-400 md:text-lg">
            Every listing cross-referenced with Surveyor-General beacon coordinates. Zero fake agents, zero Omonile risks. Authenticated institutional escrow powered by LASRERA standards.
          </p>

          {/* Trust Telemetry Bar */}
          {liveStats && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-white/5 bg-white/5 px-5 py-2 backdrop-blur-sm">
              <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <strong className="font-mono text-white">{liveStats[0].value}</strong> Active Listings
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <strong className="font-mono text-white">100%</strong> C of O / Gazette Audited
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Lock className="h-4 w-4 text-emerald-400" />
                <strong className="font-mono text-white">₦128.4 Billion</strong> In Protected Escrow
              </span>
            </div>
          )}

          {/* Search Terminal */}
          <div className="w-full max-w-4xl rounded-xl bg-white p-4 text-left shadow-xl md:p-5">
            {/* Tabs */}
            <div className="mb-3 flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { key: 'rent', label: 'Rent', icon: <Search className="h-4 w-4" /> },
                { key: 'buy', label: 'Buy Sovereign Asset', icon: <Building2 className="h-4 w-4" /> },
                { key: 'shortlet', label: 'Shortlet Serviced', icon: <Home className="h-4 w-4" /> },
                { key: 'commercial', label: 'Commercial Plaza', icon: <Building2 className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                    tab.key === 'rent'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Search Grid */}
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-12">
              <div className="flex items-center rounded-lg bg-zinc-50 px-3 py-2.5 lg:col-span-4">
                <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500">Location / Node</span>
                  <input
                    className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                    placeholder="Lekki Phase 1, Victoria Island, Maitama..."
                    type="text"
                  />
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-zinc-50 px-3 py-2.5 lg:col-span-3">
                <Building2 className="mr-2 h-5 w-5 text-emerald-600" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500">Asset Class</span>
                  <select className="w-full cursor-pointer bg-transparent text-sm text-zinc-900 focus:outline-none">
                    <option>Residential Villa & Penthouse</option>
                    <option>Fully Detached Duplex</option>
                    <option>Serviced Commercial Office</option>
                    <option>SURCON Surveyed Land</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-zinc-50 px-3 py-2.5 lg:col-span-3">
                <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500">Budget Range (NGN)</span>
                  <select className="w-full cursor-pointer bg-transparent font-mono text-sm text-zinc-900 focus:outline-none">
                    <option>₦5M — ₦25M / year</option>
                    <option>₦25M — ₦75M / year</option>
                    <option>₦75M — ₦250M (Outright Buy)</option>
                    <option>₦250M — ₦1.5B (Institutional)</option>
                  </select>
                </div>
              </div>
              <div className="lg:col-span-2">
                <button
                  onClick={() => router.push('/listings')}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Cadastral Filters */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">Cadastral Filters:</span>
                <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700">C of O ✓</span>
                <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700">Governor&apos;s Consent ✓</span>
                <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700">Gazette Excision</span>
              </div>
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                Direct Coordinate / Beacon Search <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 4-PILLAR TRUST STRIP ===================== */}
      <section className="w-full bg-[#f6f2f7] py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.08} y={16}>
                <div className="flex h-full flex-col justify-between rounded-xl bg-white p-5 shadow-sm">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-emerald-600">
                      {pillar.icon}
                    </div>
                    <div className="mb-1 flex items-center gap-1">
                      <h2 className="text-base font-bold text-zinc-900">{pillar.title}</h2>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-500">{pillar.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-2 text-[11px] font-semibold text-emerald-600">
                    {pillar.tag}
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="w-full bg-[#fbf8fc] py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <div className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700">
              Operational Workflow
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">Renting &amp; Buying Reimagined</h2>
            <p className="mt-2 text-zinc-500">
              From sovereign land search to key handover — a fully auditable legal protocol tailored for high-trust Nigerian real estate transactions.
            </p>
          </div>
          {/* Desktop stepper: 5 circular nodes with connector line */}
          <div className="hidden lg:block relative mb-2">
            <div className="absolute top-8 left-16 right-16 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-[#c9952a] -z-0" />
            <div className="grid grid-cols-5 gap-4 relative z-10 text-center">
              {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-[#fbf8fc] mb-3 ${step.num === '05' ? 'bg-[#c9952a] text-white' : 'bg-emerald-600 text-white'}`}>
                    {step.num.replace(/^0/, '')}
                  </div>
                  <h4 className="font-bold text-zinc-900 text-base mb-1">{step.title}</h4>
                  <p className="text-xs text-zinc-500 max-w-[170px] leading-relaxed mb-2">{step.desc}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${step.title === 'Secure Payment' ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200' : step.title === 'Move In' ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200' : 'bg-zinc-100 text-zinc-600'}`}>{step.metric}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile / tablet vertical cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-5">
            {steps.map((step) => (
              <div key={step.num} className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 relative">
                <span className="font-mono text-4xl font-bold text-zinc-200 absolute top-4 right-4">{step.num}</span>
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-zinc-900 text-lg mb-1">{step.num.replace(/^0/, '')}. {step.title}</h4>
                <p className="text-sm text-zinc-600 mb-3">{step.desc}</p>
                <div className="bg-zinc-50 rounded p-2 text-xs font-mono text-zinc-600">{step.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED OPPORTUNITIES ===================== */}
      <section className="w-full bg-[#f6f2f7] py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 inline-block rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold uppercase text-white">
                Curated Assets
              </div>
              <h2 className="text-3xl font-bold text-zinc-900">Handpicked Opportunities</h2>
              <p className="mt-2 text-zinc-500">
                Properties verified by our in-house surveyor and legal audit team. Absolutely no fictitious units.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 p-1">
              {['All', 'Residential', 'Commercial', 'Shortlet'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    'rounded px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    tab === 'All'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredListings.map((listing, i) => (
              <FadeIn key={String(listing.id ?? listing.title ?? i)} delay={i * 0.08} y={16}>
                <Link
                  href={`/listings/${String(listing.id ?? '').startsWith('feat-') ? listing.title : String(listing.id ?? listing.title)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={listing.img}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
                      <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">{listing.type}</span>
                      <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white backdrop-blur-sm">{listing.kind}</span>
                    </div>
                    <button
                      aria-label="Save Property"
                      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur-sm transition-colors hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 rounded bg-black/90 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400 backdrop-blur-sm">
                      {listing.price}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Gov Consent Validated</span>
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-base font-bold text-zinc-900">{listing.title}</h3>
                    <p className="mb-3 flex items-center gap-1 text-sm text-zinc-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.location}
                    </p>
                    <div className="mb-4 flex items-center justify-between rounded bg-zinc-50 px-2 py-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {listing.specs[0]?.val} Beds</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {listing.specs[1]?.val} Baths</span>
                      <span className="flex items-center gap-1 font-mono"><Square className="h-3.5 w-3.5" /> {listing.specs[2]?.val}</span>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <Link
                        href={`/listings/${String(listing.id ?? '').startsWith('feat-') ? listing.title : String(listing.id ?? listing.title)}`}
                        className="flex-1 rounded-lg bg-zinc-100 py-2 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
                      >
                        Audit Details
                      </Link>
                      <button
                        aria-label="Instant WhatsApp Inspection"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => router.push('/listings')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              View All {liveStats?.[0]?.value ?? '10,840+'} Audited Listings
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===================== ROLE CARDS ===================== */}
      <section className="w-full bg-[#fbf8fc] py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <div className="mb-2 inline-block rounded-full bg-zinc-200 px-3 py-1 text-[11px] font-semibold uppercase text-zinc-700">
              Universal Gateway
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">Built for Every Role in the Ecosystem</h2>
            <p className="mt-2 text-zinc-500">
              Tailored portal interfaces calibrated for Nigerian tenancy laws, corporate asset registers, and verified broker syndicates.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role, i) => (
              <FadeIn key={role.title} delay={i * 0.08} y={16}>
                <Link
                  href="/signup"
                  className="group flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      {role.icon}
                    </div>
                    <h3 className="mb-1 text-base font-bold text-zinc-900 group-hover:text-emerald-600">{role.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-500">{role.desc}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-all group-hover:gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <ZillowStyleFooter />
    </div>
  );
}
