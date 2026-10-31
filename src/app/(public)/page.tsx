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
          kind: (l.listingType === 'sale' ? 'FOR SALE' : l.listingType === 'short_let' ? 'SHORT-STAY' : l.listingType === 'commercial' ? 'FOR LEASE' : 'FOR LEASE') as string,
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
    { value: liveStats ? `${liveStats.active.toLocaleString('en-NG')}` : '11', label: 'Curated Live Listings', sub: 'Title-cleared inventory' },
    { value: '100%', label: 'Title & Document Audited', sub: 'Beacon-verified deeds' },
    { value: '₦1.2B+', label: 'Active Escrow Managed', sub: 'Bank-backed pipeline' },
  ];

  return (
    <div className="min-h-screen bg-[#fbf8fc] dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-primary/20">

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

        <div className="relative mx-auto flex max-w-6xl flex-col px-6 pb-16 pt-20 md:pb-20 md:pt-28">
          {/* Eyebrow — OS positioning */}
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4edea3]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4edea3]">
              The Property Operating System for Africa
            </span>
            <span className="hidden sm:inline text-[11px] text-white/40">— Launching in Nigeria · Engineered for Africa</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-[32px] font-bold leading-[1.05] tracking-tight text-white md:text-[56px]">
            Streamline property management,<br />
            <span className="text-[#4edea3]">automate</span> institutional leasing,<br />
            power shortlet operations.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-[15px]">
            One unified platform to eliminate market fragmentation and operational risk.
            Bank-backed escrow, cross-border compliance workflows, and end-to-end automation —
            <span className="text-zinc-200"> sync with vetted agent networks on a single core.</span>
          </p>

          {/* Search Terminal — the OS command bar */}
          <div className="mt-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-white p-3 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 md:p-4">
            {/* Tabs */}
            <div className="mb-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: 'rent', label: 'Rent', icon: <Layers className="h-3.5 w-3.5" /> },
                { key: 'buy', label: 'Buy', icon: <Home className="h-3.5 w-3.5" /> },
                { key: 'shortlet', label: 'Manage Shortlet', icon: <Clock3 className="h-3.5 w-3.5" /> },
                { key: 'commercial', label: 'Lease Commercial', icon: <Building2 className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSearchTab(tab.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                    searchTab === tab.key
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1.5 pl-3 text-[11px] font-mono text-zinc-400 md:flex">
                <Radio className="h-3 w-3" /> SYSTEM READY
              </span>
            </div>

            {/* Search Grid */}
            <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-12">
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 lg:col-span-4 dark:bg-zinc-900 dark:border-zinc-800 cursor-text">
                <MapPin className="mr-2 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Region / City</span>
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                    placeholder="Lekki Phase 1, Victoria Island, Maitama..."
                    type="text"
                  />
                </span>
              </label>
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 lg:col-span-3 dark:bg-zinc-900 dark:border-zinc-800">
                <Building2 className="mr-2 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Asset Infrastructure</span>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-sm text-zinc-900 focus:outline-none dark:text-white"
                  >
                    <option>Residential Villa, Penthouse, Commercial Space</option>
                    <option>Residential Villa & Penthouse</option>
                    <option>Fully Detached Duplex</option>
                    <option>Serviced Commercial Office</option>
                    <option>Surveyed Land</option>
                    <option>Industrial & Warehouse</option>
                  </select>
                </span>
              </label>
              <label className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 lg:col-span-3 dark:bg-zinc-900 dark:border-zinc-800">
                <Layers className="mr-2 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1 flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Budget Range</span>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full cursor-pointer bg-transparent font-mono text-sm text-zinc-900 focus:outline-none dark:text-white"
                  >
                    <option>₦5M — ₦25M / year</option>
                    <option>₦25M — ₦75M / year</option>
                    <option>₦75M — ₦250M (Outright Buy)</option>
                    <option>₦250M — ₦1.5B (Institutional)</option>
                  </select>
                </span>
              </label>
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--sovereign-hover)] lg:col-span-2"
              >
                <Search className="h-4 w-4" />
                Initialize Search
              </button>
            </div>
          </div>

          {/* System Vital Statistics — directly under hero as in your copy */}
          <div className="mt-6 grid w-full max-w-4xl grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            {vitalStats.map((s) => (
              <div key={s.label} className="px-4 py-4 text-center md:px-6 md:py-5">
                <div className="font-mono text-lg font-bold text-white md:text-xl">{s.value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#4edea3]">{s.label}</div>
                <div className="hidden text-[11px] text-white/40 md:block">{s.sub}</div>
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
              Pick the operating mode that matches your mandate — every module shares the same verification and escrow core.
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
                  'Institutional Verification — tenant background checks and identity screening.',
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
                  'Secure Guest Escrow — deposits held in trust, settled instantly on check-in.',
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
                  'Secured Commission Escrow — payout structures that trigger automatically on close.',
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
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Four auditable steps — every transition verified, recorded, and escrow-gated.</p>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 hidden md:block">
              PropatiBox Operational Protocol v1
            </div>
          </div>

          {/* Desktop: diagram line */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-[48px] right-[48px] top-[28px] h-px bg-gradient-to-r from-zinc-300 via-primary/40 to-zinc-300 dark:from-zinc-700 dark:via-primary/40 dark:to-zinc-700" />
              <div className="grid grid-cols-4 gap-6">
                {[
                  { n: '01', title: 'Verify & Onboard', sub: 'Title & Identity Audited at the Gateway', desc: 'Interact only with properties and professionals cleared through rigid title, beacon, and CAC verification.' , icon: ShieldCheck },
                  { n: '02', title: 'Smart Tour', sub: '3D & Geo-Stamped Inspections', desc: 'Unfiltered high-definition tours that capture true, real-time asset conditions.' , icon: Compass },
                  { n: '03', title: 'Secure Escrow', sub: 'Multi-Tier Bank Escrow · Capital Shielded', desc: 'Transaction capital locked in tier-1 bank escrow until compliance conditions are satisfied.' , icon: Lock },
                  { n: '04', title: 'Digital Handover', sub: 'Biometrics, Access Keys & Digital Records', desc: 'Collect digital agreements, access tokens, and finalized legal records instantly.' , icon: Fingerprint },
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
              <span className="text-white">[01. Verify &amp; Onboard]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-white">[02. Smart Tour]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-[#4edea3]">[03. Secure Escrow]</span> <span className="text-zinc-500">──&gt;</span> <span className="text-white">[04. Digital Handover]</span>
              <span className="ml-4 text-zinc-500">// every transition escrow-gated</span>
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {[
              { n: '01', title: 'Verify & Onboard', sub: 'Title & Identity Audited', icon: ShieldCheck },
              { n: '02', title: 'Smart Tour', sub: '3D & Geo-Stamped Inspections', icon: Compass },
              { n: '03', title: 'Secure Escrow', sub: 'Multi-Tier Bank Escrow', icon: Lock },
              { n: '04', title: 'Digital Handover', sub: 'Biometrics & Digital Records', icon: Fingerprint },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-[11px] font-bold text-primary">[{s.n}] {s.title}</div>
                  <div className="text-xs text-zinc-500">{s.sub}</div>
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
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Document-integrity validated. Escrow-ready. Beacon-mapped.</p>
            </div>
            <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[var(--sovereign-hover)]">
              View full inventory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredListings.map((listing: any, i: number) => (
              <Link
                key={String(listing.id ?? i)}
                href={`/listings/${String(listing.id ?? '').startsWith('feat-') ? '' : String(listing.id ?? listing.title)}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image src={listing.img} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
                    <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{listing.type}</span>
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-900 backdrop-blur-sm">{listing.kind}</span>
                  </div>
                  <button aria-label="Save" className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 backdrop-blur-sm hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2.5 right-2.5 rounded-full bg-zinc-900 px-2.5 py-1 font-mono text-xs font-bold text-[#4edea3]">
                    {listing.price}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-[#4edea3]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Document Integrity Validated
                  </div>
                  <h3 className="line-clamp-1 text-sm font-bold text-zinc-900 dark:text-white">{listing.title}</h3>
                  <p className="mb-3 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-3 w-3" /> {listing.location}
                  </p>
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {listing.specs[0]?.val}</span>
                    <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {listing.specs[1]?.val}</span>
                    <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
                    <span className="flex items-center gap-1 font-mono"><Square className="h-3.5 w-3.5" /> {listing.specs[2]?.val}</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <span className="flex-1 rounded-full bg-zinc-900 py-2 text-center text-xs font-semibold text-white group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-zinc-100">
                      {listing.kind === 'SHORT-STAY' ? 'Book Stay Vector' : 'Inspect Asset Node'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PAN-AFRICAN FOOTPRINT ===================== */}
      <section className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#0a0a0a] py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                <Globe2 className="h-4 w-4" /> Pan-African Expansion Footprint
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-white">Active Hubs (Nigeria):</span> Lagos (Lekki, VI, Ikoyi, Ikeja, Mainland) · Abuja (Maitama, Asokoro, Wuse) · Port Harcourt · Ibadan · Enugu
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Accra (Ghana)', 'Nairobi (Kenya)', 'Kigali (Rwanda)', 'Johannesburg (South Africa)', 'Abidjan (Ivory Coast)'].map((c) => (
                  <span key={c} className="rounded-full border border-dashed border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    {c} <span className="text-[10px] uppercase tracking-wide">— Future Gateway</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live in Nigeria
              <span className="h-2 w-2 rounded-full border border-zinc-400" /> Future Gateway
            </div>
          </div>
        </div>
      </section>

      <ZillowStyleFooter />
    </div>
  );
}
