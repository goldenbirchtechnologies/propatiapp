'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Home, Users, Building2, ShieldCheck, ArrowRight, CheckCircle2, MapPin, Bed, Bath, Square,
  Heart, MessageCircle, Lock, Layers, FileText, Clock3, Handshake, Compass, Radio, Globe2, Fingerprint
} from 'lucide-react';
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
  return stats;
}

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
    title: 'Apapa Freezone Industrial Bay', location: 'Wharf Road Expressway, Apapa, Lagos',
    specs: [{ icon: 'sqm', val: '2,400m²' }, { icon: 'dock', val: 'Dock Bays' }, { icon: 'power', val: '3-Phase' }],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEFMN1q2doZpyBfeGUmn6UX9o4k_raLFtzs9pDZ0owx2KiMNGIRqK1GAWl8pQZM3YDE8zy7cyrgy5S-s_PW5aE4as-WAKnsyeNwI6ZFcxOYZ_cyXx8YVDeO4b_Gq2DYlniSRtXjJQWBGDdHQbxn_px0FF08OJScdKq1McQD-Q0LYdit-KyQyh393NAjpBIqrdBSmNrwenMthIq6euc_eNP2cZzecpfqDIxPcZ0l-a3kb9_Gfw8kpWlIw',
    verified: true,
  },
  {
    id: 'feat-4', type: 'HOSPITALITY', kind: 'SHORT-STAY', price: '₦175,000/night',
    title: 'Maitama Diplomatic Luxury Suite', location: 'Gana Street, Maitama, Abuja FCT',
    specs: [{ icon: 'bed', val: '2' }, { icon: 'bath', val: '2' }, { icon: 'sqm', val: '150m²' }],
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
        const mapped = active.slice(0, 4).map((l: any, idx: number) => ({
          id: l.id,
          type: (l.propertyType === 'office' || l.propertyType === 'shop' || l.listingType === 'commercial' ? 'COMMERCIAL' : l.listingType === 'short_let' ? 'HOSPITALITY' : 'RESIDENTIAL') as string,
          kind: (l.listingType === 'sale' ? 'FOR SALE' : l.listingType === 'short_let' ? 'SHORT-STAY' : l.listingType === 'commercial' ? 'FOR LEASE' : 'FOR RENT') as string,
          price: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(l.price || 0)) + (l.pricePeriod && l.pricePeriod !== 'total' ? `/${l.pricePeriod}` : l.listingType === 'sale' ? '' : l.listingType === 'short_let' ? '/night' : '/yr'),
          title: l.title,
          location: [l.area, l.state].filter(Boolean).join(', ') || l.address || '',
          specs: [
            { icon: 'bed', val: String(l.bedrooms ?? '—') },
            { icon: 'bath', val: String(l.bathrooms ?? '—') },
            { icon: 'sqm', val: l.sizeSqm ? `${l.sizeSqm}m²` : '—' },
          ],
          img: l.coverImage || l.images?.[0]?.url || featuredFallback[idx % featuredFallback.length].img,
          verified: l.verificationTier ? l.verificationTier !== 'basic' : !!l.verified,
        }));
        if (mapped.length) setDbFeatured(mapped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return dbFeatured;
}

export default function HomePage() {
  const router = useRouter();
  const liveStats = usePublicStats();
  const dbFeatured = useFeaturedFromDb();
  const featuredListings = dbFeatured ?? featuredFallback;
  const [searchTab, setSearchTab] = React.useState('rent');
  const [locationQuery, setLocationQuery] = React.useState('');
  const [assetClass, setAssetClass] = React.useState('Residential Villa, Penthouse, Commercial Space');
  const [budgetRange, setBudgetRange] = React.useState('₦5M — ₦25M / year');

  const tabToListingType: Record<string, string> = {
    rent: 'rent',
    buy: 'sale',
    shortlet: 'short_let',
    commercial: 'commercial',
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    const lt = tabToListingType[searchTab];
    if (lt) params.set('listingType', lt);
    if (locationQuery.trim()) params.set('q', locationQuery.trim());
    if (assetClass) params.set('assetClass', assetClass);
    if (budgetRange) params.set('budget', budgetRange);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  };

  const vitalStats = [
    { value: liveStats ? `${liveStats.active.toLocaleString('en-NG')}` : '—', label: 'Curated Live Listings', sub: 'Title-cleared inventory' },
    { value: '100%', label: 'Title & Document Audited', sub: 'Location-verified deeds' },
    { value: '₦1.2B+', label: 'Secure Payments Managed', sub: 'Bank-backed pipeline' },
  ];

  return (
    <div className="min-h-screen bg-[#fbf8fc] dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-primary/20 overflow-x-hidden">

      {/* Scroll Progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ===================== HERO — OPERATING SYSTEM ===================== */}
      <section className="relative w-full overflow-hidden bg-[#0e1113] text-white">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlfnZbb4S0pGyz9UN-YVaruLwXLJ9tnYKYcRLy-KZwClAJSKLKQ0yFVYbk1RUYdNDBUfY82Fodnq0YP-BZCjnEgGpScCG4ifDzyCH4JpWPA2sCI5QooDgIvlhMB9ZsF5fVXu7NbGtWtkN0iboqxcsrRDLu2RzZICtBwHmBkQbzzwZi1KLNGa9V2elrLRiQG72mDH2NXaWYObH4jKXGSApltwSUrU-MMjzuArtN_74kryQCz6E94uOAmQ"
            alt=""
            fill
            className="object-cover opacity-[0.28] mix-blend-luminosity saturate-150 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e1113]/60 via-[#0e1113]/80 to-[#0e1113]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute -top-32 right-[18%] h-[520px] w-[520px] rounded-full bg-primary/20 blur-[90px]" />
          <div className="absolute -bottom-40 left-[10%] h-[400px] w-[400px] rounded-full bg-[#4edea3]/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col px-4 sm:px-6 pb-14 pt-16 sm:pb-16 sm:pt-20 md:pb-20 md:pt-28">
          {/* Eyebrow — OS positioning */}
          <div className="mb-4 sm:mb-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 sm:px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#4edea3]" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#4edea3]">
              The Property Operating System for Africa
            </span>
            <span className="hidden sm:inline text-[11px] text-white/40">— Launching in Nigeria · Engineered for Africa</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-[30px] sm:text-[42px] md:text-[56px] font-bold leading-[1.08] tracking-tight text-white">
            Streamline property management,<br className="hidden sm:inline" />
            <span className="text-[#4edea3]">automate</span> leasing,<br className="hidden sm:inline" />
            power shortlet operations.
          </h1>
          <p className="mt-3.5 sm:mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            One unified platform to eliminate market fragmentation and operational risk.
            Secure payment processing, straightforward verification, and end-to-end automation —
            <span className="text-zinc-200"> sync with vetted agent networks on a single core.</span>
          </p>

          {/* Search Terminal — the OS command bar */}
          <div className="mt-6 sm:mt-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-white p-3 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 md:p-4">
            {/* Tabs */}
            <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: 'rent', label: 'Rent', icon: <Layers className="h-3.5 w-3.5" /> },
                { key: 'buy', label: 'Buy', icon: <Home className="h-3.5 w-3.5" /> },
                { key: 'shortlet', label: 'Shortlet Stays', icon: <Clock3 className="h-3.5 w-3.5" /> },
                { key: 'commercial', label: 'Commercial Lease', icon: <Building2 className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSearchTab(tab.key)}
                  className={cn(
                    'flex shrink-0 min-h-[44px] items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 text-xs md:text-sm font-semibold transition-colors',
                    searchTab === tab.key
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1.5 pl-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 md:flex">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> Payment Network Ready
              </span>
            </div>

            {/* Search Grid */}
            <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 lg:col-span-4 dark:bg-zinc-900 dark:border-zinc-800 cursor-text focus-within:border-primary">
                <MapPin className="mr-2.5 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Region / City</span>
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                    placeholder="Lekki Phase 1, Victoria Island, Maitama..."
                    type="text"
                  />
                </span>
              </label>
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 lg:col-span-3 dark:bg-zinc-900 dark:border-zinc-800 focus-within:border-primary">
                <Building2 className="mr-2.5 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Property Type</span>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-sm font-medium text-zinc-900 focus:outline-none dark:text-white"
                  >
                    <option>Residential Villa, Penthouse, Commercial Space</option>
                    <option>Residential Villa &amp; Penthouse</option>
                    <option>Fully Detached Duplex</option>
                    <option>Serviced Commercial Office</option>
                    <option>Surveyed Land</option>
                    <option>Industrial &amp; Warehouse</option>
                  </select>
                </span>
              </label>
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 lg:col-span-3 dark:bg-zinc-900 dark:border-zinc-800 focus-within:border-primary">
                <Layers className="mr-2.5 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Budget Range</span>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full cursor-pointer bg-transparent font-mono text-sm font-medium text-zinc-900 focus:outline-none dark:text-white"
                  >
                    <option>₦5M — ₦25M / year</option>
                    <option>₦25M — ₦75M / year</option>
                    <option>₦75M — ₦250M (Outright Buy)</option>
                    <option>₦250M — ₦1.5B</option>
                  </select>
                </span>
              </label>
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-[54px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--sovereign-hover)] lg:col-span-2"
              >
                <Search className="h-4 w-4" />
                Search Properties
              </button>
            </div>
          </div>

          {/* System Vital Statistics — 1 col on mobile, 3 cols on sm+ */}
          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            {vitalStats.map((s) => (
              <div key={s.label} className="flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center px-4 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 text-left sm:text-center">
                <div>
                  <div className="font-mono text-lg font-bold text-white md:text-xl">{s.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#4edea3]">{s.label}</div>
                </div>
                <div className="text-xs text-white/50 text-right sm:text-center mt-0 sm:mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ONE UNIFIED CORE — FOUR MODULES ===================== */}
      <section className="w-full bg-white dark:bg-[#0a0a0a] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white dark:bg-white dark:text-zinc-900">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" /> System Architecture
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              One Unified Core. Four Specialized Modules.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Pick the operating mode that matches your mandate — every module shares the same verification and payment core.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Module 1 — Property Management OS */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">For Property Managers & Landlords</div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Property Management OS</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Eliminate operational overhead, automate tenant management, and protect your rental yield.</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Automated Rent Collection — direct-to-bank remittance via regional payment rails.',
                  'Maintenance & Vendor Ledger — log, track, and dispatch vendor workflows.',
                  'Tenant Lifecycle Analytics — occupancy, retention, and real-time financial performance.',
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup?role=landlord" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Deploy Your Portfolio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Module 2 — Automated Lease Engine */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#4edea3]/10 blur-2xl" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <FileText className="h-5 w-5" />
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">For Tenants & Real Estate Operations</div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Automated Lease Engine</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Legally compliant, digital-first leasing calibrated for regional tenancy frameworks.</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Instant Digital Agreements — smart contract generation tuned to local regulatory law.',
                  'Verification — tenant background checks and identity screening.',
                  'Lifecycle Tracking — deposits, renewals, and inspection logs in real time.',
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup?role=tenant" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Onboard as Tenant <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Module 3 — Shortlet Sync */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">For Hospitality & Short-Stay Operators</div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Shortlet Sync</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Turn standard real estate into high-yield, automated hospitality assets.</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Channel & Property Sync — calendars, dynamic pricing, and check-ins without double-bookings.',
                  'Secure Guest Payment — deposits held safely, settled instantly on check-in.',
                  'Operational Telemetry — real-time occupancy, reviews, and asset performance.',
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/listings?listingType=short_let" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Launch Shortlet Module <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Module 4 — Agent & Broker Syndication */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Handshake className="h-5 w-5" />
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">For Licensed Real Estate Professionals</div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Agent & Broker Syndication</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">A high-trust network built to accelerate transaction velocity through verified collaboration.</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Exclusive Inventory Access — verified listings direct from landlords and asset owners.',
                  'Direct Principal Matching — certified agents connected straight to primary listings.',
                  'Secured Commission Payment — payouts that release automatically on close.',
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/find-agent" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Join the Syndicate <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== OPERATIONAL WORKFLOW ===================== */}
      <section className="w-full border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#0a0a0a] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">Operational Workflow</div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">From discovery to key handover.</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Four clear steps — every transition verified and recorded.</p>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 hidden md:block">
              PropatiBox Platform v1
            </div>
          </div>

          {/* Desktop: diagram line */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-[48px] right-[48px] top-[28px] h-px bg-gradient-to-r from-zinc-300 via-primary/40 to-zinc-300 dark:from-zinc-700 dark:via-primary/40 dark:to-zinc-700" />
              <div className="grid grid-cols-4 gap-6">
                {[
                  { n: '01', title: 'Verify & Onboard', sub: 'Title & Identity Audited at the Gateway', desc: 'Interact only with properties and professionals cleared through title and identity verification.' , icon: ShieldCheck },
                  { n: '02', title: 'Smart Tour', sub: '3D & Geo-Stamped Inspections', desc: 'Unfiltered high-definition tours that capture true, real-time asset conditions.' , icon: Compass },
                  { n: '03', title: 'Secure Payment', sub: 'Payment Protected · Funds Shielded', desc: 'Payment held safely until all conditions are met.' , icon: Lock },
                  { n: '04', title: 'Digital Handover', sub: 'ID Check, Access Keys & Digital Records', desc: 'Collect digital agreements, access tokens, and finalized legal records instantly.' , icon: Fingerprint },
                ].map((s) => (
                  <div key={s.n} className="relative">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="font-mono text-[11px] font-bold tracking-widest text-primary">[{s.n}]</div>
                    <h3 className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">{s.title}</h3>
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{s.sub}</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Code-style connector */}
            <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-400 dark:border-zinc-800">
              <span className="text-white">[01. Verify &amp; Onboard]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-white">[02. Smart Tour]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-[#4edea3]">[03. Secure Payment]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-white">[04. Digital Handover]</span>
              <span className="ml-4 text-zinc-500">// every step verified</span>
            </div>
          </div>

          {/* Mobile vertical stepper */}
          <div className="space-y-3 md:hidden">
            {[
              { n: '01', title: 'Verify & Onboard', sub: 'Title & Identity Audited', desc: 'Title and identity checks before any transaction begins.', icon: ShieldCheck },
              { n: '02', title: 'Smart Tour', sub: '3D & Geo-Stamped Inspections', desc: 'Unfiltered high-definition tours capturing real, verified asset conditions.', icon: Compass },
              { n: '03', title: 'Secure Payment', sub: 'Payment Protected', desc: 'Payment held safely until all milestones are met.', icon: Lock },
              { n: '04', title: 'Digital Handover', sub: 'ID Check & Digital Records', desc: 'Instant issuance of digital tenancy agreements, access keys, and deeds.', icon: Fingerprint },
            ].map((s, idx) => (
              <div key={s.n} className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary dark:text-[#4edea3]">STEP [{s.n}]</span>
                      <span className="text-xs uppercase font-semibold text-zinc-400">Phase {idx + 1}/4</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{s.title}</h3>
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{s.sub}</div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LIVE SYSTEM INVENTORY ===================== */}
      <section className="w-full bg-white dark:bg-black py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live System Inventory
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">Active property assets on the platform.</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Document-integrity validated. Payment-ready. Location-mapped.</p>
            </div>
            <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4edea3] hover:text-[var(--sovereign-hover)]">
              View full inventory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredListings.map((listing: any, i: number) => (
              <Link
                key={String(listing.id ?? i)}
                href={`/listings/${String(listing.id ?? '').startsWith('feat-') ? '' : String(listing.id ?? listing.title)}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="relative h-52 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image src={listing.img} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-zinc-900/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{listing.type}</span>
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-900 backdrop-blur-sm shadow-sm">{listing.kind}</span>
                  </div>
                  <button aria-label="Save property" className="absolute right-3 top-3 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 text-zinc-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500">
                    <Heart className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-xl bg-zinc-900/90 px-3 py-1 font-mono text-xs font-bold text-[#4edea3] backdrop-blur-sm">
                    {listing.price}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-[#4edea3]">
                    <ShieldCheck className="h-4 w-4 shrink-0" /> Document Integrity Validated
                  </div>
                  <h3 className="line-clamp-1 text-base font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{listing.title}</h3>
                  <p className="mt-1 mb-4 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" /> {listing.location}
                  </p>
                  <div className="mb-5 flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-zinc-400" /> {listing.specs[0]?.val}</span>
                    <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
                    <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-zinc-400" /> {listing.specs[1]?.val}</span>
                    <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
                    <span className="flex items-center gap-1.5 font-mono"><Square className="h-4 w-4 text-zinc-400" /> {listing.specs[2]?.val}</span>
                  </div>
                  <div className="mt-auto">
                    <span className="flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 text-center text-sm font-semibold text-white transition-all group-hover:bg-primary dark:bg-white dark:text-zinc-900 dark:group-hover:bg-[#4edea3] dark:group-hover:text-black">
                      {listing.kind === 'SHORT-STAY' ? 'Book Shortlet' : listing.kind === 'FOR SALE' ? 'Buy Property' : listing.kind === 'FOR RENT' ? 'Rent Property' : 'View Property'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PAN-AFRICAN FOOTPRINT ===================== */}
      <section className="w-full border-t border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-[#0a0a0a] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header & Status Legend */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary dark:text-[#4edea3]">
                <Globe2 className="h-4 w-4" /> Pan-African Network Coverage
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
                Operating in Nigeria. Expanding Continent-Wide.
              </h2>
              <p className="mt-1.5 text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Real-time payments, verified property records, and licensed agent networks across Nigeria&apos;s leading property corridors.
              </p>
            </div>
            <div className="flex items-center gap-5 text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                Live Operational Hubs
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-800" />
                Expansion Gateways
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Active Nigerian Hubs (Highlighted Tier) */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-white p-6 shadow-sm dark:border-emerald-500/20 dark:bg-zinc-900/90">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Primary Operational Hubs (Nigeria)
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 self-start sm:self-auto">
                  Fully Verified &amp; Payment-Cleared
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { city: 'Lagos', sub: 'Lekki · Victoria Island · Ikoyi · Ikeja · Mainland', active: 'Active Desk & Cadastre' },
                  { city: 'Abuja FCT', sub: 'Maitama · Asokoro · Wuse II · Guzape', active: 'Federal Capital Desk' },
                  { city: 'Port Harcourt', sub: 'GRA Phase 2 · Trans-Amadi Industrial Corridor', active: 'South-South Gateway' },
                  { city: 'Ibadan', sub: 'Bodija Residential · Oluyole Commercial Hub', active: 'Western Regional Hub' },
                  { city: 'Enugu', sub: 'Independence Layout · New Haven Corporate', active: 'South-East Desk' },
                  { city: 'Kano & Northern Hubs', sub: 'Bompai · Nassarawa GRA Commercial Desk', active: 'Northern Corridor' },
                ].map((hub) => (
                  <div
                    key={hub.city}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 transition-colors hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        {hub.city}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {hub.active}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {hub.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Expansion Gateways (Pan-African Pipeline) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Pan-African Expansion Gateways
                  </h3>
                </div>
                <span className="text-xs font-medium text-zinc-400">
                  Target Deployments 2026 – 2027
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { city: 'Accra', country: 'Ghana', tag: 'West Africa Corridor' },
                  { city: 'Nairobi', country: 'Kenya', tag: 'East Africa Hub' },
                  { city: 'Kigali', country: 'Rwanda', tag: 'East Africa Hub' },
                  { city: 'Johannesburg', country: 'South Africa', tag: 'Southern Africa Gateway' },
                  { city: 'Abidjan', country: 'Ivory Coast', tag: 'Francophone Hub' },
                ].map((g) => (
                  <div
                    key={g.city}
                    className="flex items-center gap-2.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300"
                  >
                    <span className="h-2.5 w-2.5 rounded-full border border-zinc-400 bg-zinc-300 dark:bg-zinc-700" />
                    <span className="font-semibold text-zinc-900 dark:text-white">{g.city}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">({g.country})</span>
                    <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {g.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ZillowStyleFooter />
    </div>
  );
}
