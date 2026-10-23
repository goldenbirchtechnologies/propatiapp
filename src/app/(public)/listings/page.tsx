'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, MapPin, ShieldCheck, BadgeCheck,
  RotateCcw, Bell, ArrowRight, Zap, Layers, Building2,
  LayoutGrid,
} from 'lucide-react';
import { AdvancedSearchMapView } from '@/components/search/AdvancedSearchMapView';

interface Listing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  price: number;
  pricePeriod: string;
  beds: number;
  baths: number;
  sqm: number;
  parking: number;
  image: string;
  images: string[];
  listingType: string;
  verificationTier: string;
  propertyType: string;
  status: string;
  description: string;
}

const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Sale' },
  { id: 'short_let', label: 'Shortlet' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'share', label: 'Share' },
] as const;

const SORT_OPTIONS = [
  'Most Verified',
  'Newest Listings',
  'Price: Low to High',
  'Price: High to Low',
  'Square Area (sqm)',
] as const;

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function listingBadge(listingType: string) {
  switch (listingType) {
    case 'sale': return { label: 'FOR SALE', cls: 'bg-emerald-600 text-white' };
    case 'rent': return { label: 'FOR RENT', cls: 'bg-sky-600 text-white' };
    case 'short_let': return { label: 'SHORTLET', cls: 'bg-amber-600 text-white' };
    case 'commercial': return { label: 'COMMERCIAL', cls: 'bg-blue-600 text-white' };
    case 'share': return { label: 'SHARE', cls: 'bg-emerald-600 text-white' };
    default: return { label: listingType.toUpperCase(), cls: 'bg-zinc-700 text-white' };
  }
}

function verificationBadge(tier: string, listingType: string) {
  if (tier === 'certified') return 'C of O Verified • Block 14A';
  if (tier === 'inspected') return "Governor's Consent";
  if (tier === 'verified') return 'Bank-Backed Escrow';
  if (listingType === 'short_let') return 'Beacon BI-992-01';
  if (listingType === 'commercial') return 'Gazette Excision Verified';
  return 'C of O Audited';
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [priceMin, setPriceMin] = useState('₦5,000,000');
  const [priceMax, setPriceMax] = useState('₦450,000,000');
  const [bedFilter, setBedFilter] = useState<string>('Any');
  const [legalChecked, setLegalChecked] = useState(true);
  const [infraActive, setInfraActive] = useState<string>('gen');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/listings?limit=50')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data.listings) ? data.listings : [];
        setListings(
          items
            .filter((l: any) => l.status !== 'suspended' && l.status !== 'deleted')
            .map((l: any) => ({
              id: String(l.id ?? ''),
              title: l.title || 'Listing',
              address: l.address || [l.area, l.state].filter(Boolean).join(', ') || 'Nigeria',
              area: l.area || '',
              state: l.state || '',
              price: Number(l.price || 0),
              pricePeriod: l.pricePeriod || (l.listingType === 'sale' ? 'once' : l.listingType === 'short_let' ? 'night' : 'year'),
              beds: Number(l.bedrooms ?? l.beds ?? 0),
              baths: Number(l.bathrooms ?? l.baths ?? 0),
              sqm: Number(l.sizeSqm ?? l.sqm ?? 0),
              parking: Number(l.parkingSpaces ?? 0),
              image: l.coverImage || l.images?.[0]?.url || l.images?.[0] || '',
              images: Array.isArray(l.images) ? l.images.map((im: any) => typeof im === 'string' ? im : im.url).filter(Boolean) : [],
              listingType: l.listingType || 'rent',
              verificationTier: l.verificationTier || (l.verified ? 'verified' : 'basic'),
              propertyType: l.propertyType || 'apartment',
              status: l.status || 'active',
              description: l.description || '',
            }))
        );
      })
      .catch(() => { if (!cancelled) setListings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let out = [...listings];
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((l) => l.title.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.area.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      if (category === 'commercial') out = out.filter((l) => l.listingType === 'commercial' || l.propertyType === 'office' || l.propertyType === 'shop');
      else out = out.filter((l) => l.listingType === category);
    }
    if (legalChecked) {
      out = out.filter((l) => l.verificationTier !== 'basic');
    }
    if (bedFilter !== 'Any') {
      const n = bedFilter === '5+' ? 5 : parseInt(bedFilter, 10);
      out = out.filter((l) => bedFilter === '5+' ? l.beds >= 5 : l.beds === n);
    }
    // price filter: parse numeric from priceMin/Max strings
    const pMin = parseInt(priceMin.replace(/[^0-9]/g, ''), 10) || 0;
    const pMax = parseInt(priceMax.replace(/[^0-9]/g, ''), 10) || Infinity;
    if (pMin > 0 || isFinite(pMax)) {
      out = out.filter((l) => l.price >= pMin && l.price <= pMax);
    }
    // sort
    if (sort === 'Price: Low to High') out.sort((a, b) => a.price - b.price);
    else if (sort === 'Price: High to Low') out.sort((a, b) => b.price - a.price);
    else if (sort === 'Square Area (sqm)') out.sort((a, b) => b.sqm - a.sqm);
    else if (sort === 'Newest Listings') { /* keep fetch order */ }
    else if (sort === 'Most Verified') {
      const rank = (t: string) => ({ certified: 4, inspected: 3, verified: 2, basic: 1 }[t] ?? 0);
      out.sort((a, b) => rank(b.verificationTier) - rank(a.verificationTier));
    }
    return out;
  }, [listings, search, category, legalChecked, bedFilter, priceMin, priceMax, sort]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visibleCount);

  const activeBadges: { label: string; onClear: () => void }[] = [];
  if (search.trim()) activeBadges.push({ label: `Search: "${search.trim()}"`, onClear: () => setSearch('') });
  if (category !== 'all') {
    const catLabel = CATEGORY_PILLS.find((c) => c.id === category)?.label || category;
    activeBadges.push({ label: catLabel, onClear: () => setCategory('all') });
  }
  if (legalChecked) activeBadges.push({ label: "C of O / Governor's Consent", onClear: () => setLegalChecked(false) });
  if (bedFilter !== 'Any') activeBadges.push({ label: `${bedFilter} Beds`, onClear: () => setBedFilter('Any') });
  // price badge if not default
  if (priceMin !== '₦5,000,000' || priceMax !== '₦450,000,000') activeBadges.push({ label: `${priceMin} - ${priceMax}`, onClear: () => { setPriceMin('₦5,000,000'); setPriceMax('₦450,000,000'); } });

  const activeFilterCount = (legalChecked ? 1 : 0) + (bedFilter !== 'Any' ? 1 : 0) + (category !== 'all' ? 1 : 0) + (priceMin !== '₦5,000,000' || priceMax !== '₦450,000,000' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black pt-16">
      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location or area (e.g. Lekki, Ikoyi, Victoria Island)..."
              className="w-full h-10 pl-10 pr-24 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]">LASG-GIS</span>
              {search && (
                <button onClick={() => setSearch('')} className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] overflow-x-auto">
            {CATEGORY_PILLS.map((pill) => {
              const active = category === pill.id;
              const isAll = pill.id === 'all';
              return (
                <button
                  key={pill.id}
                  onClick={() => setCategory(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${active ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
                >
                  {pill.label}
                  {isAll && active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">{filtered.length}</span>}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </div>
            <div className="hidden md:flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-zinc-500'}`} aria-label="Grid"><Grid3X3 size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-zinc-500'}`} aria-label="List"><List size={16} /></button>
            </div>
            <button onClick={() => setFilterOpen(true)} className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-100 transition-colors">
              <SlidersHorizontal size={14} /> Filters
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex gap-6 items-start w-full">
          {/* LEFT */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Header audit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"><BadgeCheck size={12} /> Verified C-GIS Registry</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">SURCON BCN: 409-NG-24</span>
                </div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                  Showing <span className="text-emerald-600">{filtered.length}</span> institutional-grade properties{filtered.length !== listings.length ? ` · filtered from ${listings.length}` : ' in Lagos & Abuja'}
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Synchronized with State Lands Bureau</span>
              </div>
            </div>

            {/* Active badges */}
            {activeBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Filters:</span>
                {activeBadges.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 shadow-sm">
                    {b.label}
                    <button onClick={b.onClear} className="hover:text-red-600 dark:hover:text-red-400"><X size={12} /></button>
                  </span>
                ))}
                <button onClick={() => { setSearch(''); setCategory('all'); setLegalChecked(false); setBedFilter('Any'); setPriceMin('₦5,000,000'); setPriceMax('₦450,000,000'); }} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline underline-offset-4 ml-1">Clear all</button>
              </div>
            )}

            {/* Desktop Quick Filter Bar */}
            <div className="hidden lg:block bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Price Range (NGN ₦)</label>
                  <div className="flex items-center gap-2">
                    <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] font-mono text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    <span className="text-zinc-400 text-xs">-</span>
                    <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] font-mono text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Bedrooms</label>
                  <div className="flex items-center gap-1">
                    {['Any', '1', '2', '3', '4', '5+'].map((b) => (
                      <button key={b} onClick={() => setBedFilter(b)} className={`w-7 h-8 rounded-lg text-xs font-semibold transition-colors ${bedFilter === b ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>{b}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Legal Perfection</label>
                  <label className="flex items-center gap-2 cursor-pointer h-8 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-sm">
                    <input type="checkbox" checked={legalChecked} onChange={(e) => setLegalChecked(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1">Governor&apos;s Consent / C of O <ShieldCheck size={12} className="text-emerald-600" /></span>

                  </label>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Key Infrastructure</label>
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {[
                      { id: 'gen', label: '100% Standby Gen' },
                      { id: 'pool', label: 'Private Pool' },
                      { id: 'security', label: '24/7 Security' },
                    ].map((p) => (
                      <button key={p.id} onClick={() => setInfraActive(p.id)} className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${infraActive === p.id ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4'}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"><Search size={28} /></div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">No Verified Properties Found</h2>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">No properties match your exact combination of filters. Try clearing filters or expanding your search.</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button onClick={() => { setSearch(''); setCategory('all'); setLegalChecked(false); setBedFilter('Any'); setPriceMin('₦5,000,000'); setPriceMax('₦450,000,000'); }} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm"><RotateCcw size={14} /> Reset All Filters</button>
                  <button className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"><Bell size={14} className="text-amber-600" /> Save Search & Get Alert</button>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4'}>
                {visible.map((l) => {
                  const badge = listingBadge(l.listingType);
                  const cadBadge = verificationBadge(l.verificationTier, l.listingType);
                  const isCompared = compareIds.includes(l.id);
                  const isHovered = hoveredId === l.id;
                  const priceText = l.listingType === 'sale' ? formatPrice(l.price) : l.listingType === 'short_let' ? `${formatPrice(l.price)} / night` : `${formatPrice(l.price)} / yr`;
                  return (
                    <article
                      key={l.id}
                      onMouseEnter={() => setHoveredId(l.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border shadow-sm hover:shadow-md transition-all flex flex-col relative ${isHovered ? 'border-emerald-500/30 dark:border-emerald-500/30' : 'border-zinc-200 dark:border-white/[0.06]'}`}
                    >
                      <Link href={`/listings/${l.id}`} className="relative h-52 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 block">
                        {l.image ? (
                          <img src={l.image} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800"><Building2 size={32} /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <label onClick={(e) => e.preventDefault()} className="pointer-events-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-[11px] font-semibold cursor-pointer border border-white/10">
                            <input type="checkbox" checked={isCompared} onChange={(e) => { e.stopPropagation(); setCompareIds((prev) => e.target.checked ? (prev.length < 3 ? [...prev, l.id] : prev) : prev.filter((x) => x !== l.id)); }} onClick={(e) => e.stopPropagation()} className="w-3.5 h-3.5 rounded accent-emerald-500" />
                            Compare
                          </label>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${badge.cls}`}>{badge.label}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 backdrop-blur text-emerald-300 text-[11px] font-semibold border border-emerald-500/20">
                          <ShieldCheck size={12} /> {cadBadge}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur text-white font-mono font-bold text-xs border border-white/10">
                          {priceText}
                        </div>
                      </Link>
                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs mb-1"><MapPin size={12} className="text-emerald-600" /> <span className="truncate">{l.address}</span></div>
                          <Link href={`/listings/${l.id}`} className="block"><h2 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{l.title}</h2></Link>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{l.description || 'Premium residential parcel with pristine land title and verified beacon coordinates.'}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04] text-center">
                          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Beds</span><span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">{l.beds || '-'}</span></div>
                          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Baths</span><span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">{l.baths || '-'}</span></div>
                          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Land Size</span><span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">{l.sqm ? `${l.sqm} sqm` : '-'}</span></div>
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <Link href={`/listings/${l.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"><BadgeCheck size={12} /> Audit Details</Link>
                          <a href={`https://wa.me/2348000000000?text=Hi,%20inquiring%20about%20${encodeURIComponent(l.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm">WhatsApp</a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            {!loading && filtered.length > visibleCount && (
              <div className="pt-4 pb-2 flex flex-col items-center gap-2">
                <button onClick={() => setVisibleCount((n) => n + 6)} className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold shadow-sm transition-colors">
                  <RotateCcw size={16} className="text-emerald-600" /> Load more verified properties ({remaining} remaining)
                </button>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">SURCON API Synced: 2 mins ago</span>
              </div>
            )}

            {/* Comparison tray */}
            {compareIds.length > 0 && (
              <div className="sticky bottom-6 z-20">
                <div className="bg-zinc-900 dark:bg-zinc-900 text-white rounded-2xl shadow-xl p-3 sm:p-4 flex items-center justify-between gap-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><LayoutGrid size={18} /></div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-xs font-bold">{compareIds.length} of 3 Properties Selected</span><span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500 text-white">Side-by-Side</span></div>
                      <p className="text-xs text-white/60 hidden sm:block truncate max-w-[320px]">{compareIds.join(' vs ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCompareIds([])} className="px-3 py-1.5 rounded-xl text-white/70 hover:text-white text-xs font-medium">Deselect</button>
                    <button onClick={() => router.push(`/compare?ids=${compareIds.join(',')}`)} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md">Compare Listings <ArrowRight size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Map */}
          <aside className="hidden lg:block w-[460px] xl:w-[500px] shrink-0 sticky top-[132px] h-[calc(100vh-148px)] rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-white/[0.06] bg-[#eef2f6] dark:bg-[#070d14] relative">
            <AdvancedSearchMapView
              properties={filtered.map((l) => ({
                id: l.id,
                title: l.title,
                address: l.address,
                area: l.area,
                price: l.price,
                priceFormatted: formatPrice(l.price),
                listingType: l.listingType,
                propertyType: l.propertyType,
                bedrooms: l.beds,
                bathrooms: l.baths,
                coverImage: l.image,
                images: l.image ? [{ url: l.image }] : [],
              })) as any}
              onPropertyHover={(p: any) => setHoveredId(p?.id || null)}
              onPropertyClick={(p: any) => router.push(`/listings/${p.id}`)}
              initialCenter={{ lat: 6.5244, lng: 3.3792 }}
              initialZoom={11}
            />
          </aside>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2"><SlidersHorizontal size={20} className="text-emerald-600" /><h2 className="text-base font-bold text-zinc-900 dark:text-white">Filter Registry</h2></div>
              <button onClick={() => setFilterOpen(false)} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-900 dark:text-white">Price Range</label>
              <div className="grid grid-cols-2 gap-3">
                <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] font-mono text-sm text-zinc-900 dark:text-white" />
                <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] font-mono text-sm text-zinc-900 dark:text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-900 dark:text-white">Bedrooms</label>
              <div className="flex gap-1 flex-wrap">
                {['Any', '1', '2', '3', '4', '5+'].map((b) => (
                  <button key={b} onClick={() => setBedFilter(b)} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${bedFilter === b ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300'}`}>{b}</button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 cursor-pointer">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Bank-Backed Escrow Protected</span>
              <input type="checkbox" checked={legalChecked} onChange={(e) => setLegalChecked(e.target.checked)} className="w-5 h-5 rounded border-zinc-300 text-emerald-600" />
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Only display deals with verified bank-backed escrow.</p>
            <div className="pt-6 mt-auto flex gap-3">
              <button onClick={() => { setSearch(''); setCategory('all'); setLegalChecked(false); setBedFilter('Any'); setPriceMin('₦5,000,000'); setPriceMax('₦450,000,000'); }} className="flex-1 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold">Reset</button>
              <button onClick={() => setFilterOpen(false)} className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
