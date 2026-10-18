'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, MapPin, Square,
  ShieldCheck, Zap, Home, Building2, RotateCcw, Bell, UserCheck, ArrowRight,
  ChevronUp, Car, Trees, Dumbbell, Waves,
} from 'lucide-react';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { InteractiveHoverButton } from '@/components/ui';
import { AdvancedSearchMapView } from '@/components/search/AdvancedSearchMapView';

const AMENITY_FILTERS = [
  'Swimming Pool', 'Gym / Fitness Centre', 'Tennis Court', 'Children Playground',
  'Rooftop Lounge', 'Cinema Room', 'Conference Centre',
];

const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi-Furnished', 'Serviced & Managed BQ', 'Unfurnished'];

const INFRASTRUCTURE_FILTERS = [
  '24/7 Dedicated Power (IPPs/Gen)',
  'Treated Borehole / Water Supply',
  'Armed Uniformed Security & CCTV',
  'Private Jetty / Waterfront Access',
  'Flood-Free Elevation Verified',
];

const LEGAL_FILTERS = [
  { id: 'gov_consent', label: "Governor's Consent", tag: 'Prime' },
  { id: 'c_of_o', label: 'Certificate of Occupancy', tag: 'C of O' },
  { id: 'gazette', label: 'Gazette / Excision' },
  { id: 'lasrera', label: 'LASRERA Escrow Protected' },
];

interface Listing {
  id: string;
  title: string;
  address: string;
  price: number;
  beds?: number;
  baths?: number;
  sqm?: number;
  parking?: number;
  image: string;
  listingType: string;
  verificationTier: string;
  propertyType: string;
  status: string;
  area?: string;
  state?: string;
}

// ─── Collapsible Accordion Section ───
function Accordion({ title, icon, badge, defaultOpen = false, children }: {
  title: string;
  icon: React.ReactNode;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800">
          {icon}
          {title}
          {badge != null && badge > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">{badge}</span>
          )}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
          : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState('Newest First');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Granular sidebar filters
  const [legalFilters, setLegalFilters] = useState<string[]>(['gov_consent', 'c_of_o', 'lasrera']);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [infraFilters, setInfraFilters] = useState<string[]>(['24/7', 'borehole', 'security']);
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [parkingMin, setParkingMin] = useState('Any');
  const [serviceChargeMax, setServiceChargeMax] = useState('');

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
              title: l.title,
              address: l.address || l.area || '',
              price: Number(l.price || 0),
              beds: l.bedrooms,
              baths: l.bathrooms,
              sqm: l.sizeSqm,
              parking: l.parkingSpaces,
              image: l.coverImage || l.images?.[0]?.url || '',
              listingType: l.listingType || 'rent',
              verificationTier: l.verificationTier || (l.verified ? 'verified' : 'basic'),
              propertyType: l.propertyType || 'apartment',
              status: l.status,
              area: l.area,
              state: l.state,
            }))
        );
      })
      .catch(() => { if (!cancelled) setListings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter((l) => {
      const matchesSearch = !q || l.title.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
      const matchesLegal = legalFilters.length === 0 || l.verificationTier !== 'basic';
      return matchesSearch && matchesLegal;
    });
  }, [listings, search, legalFilters]);

  const activeFilters = useMemo(() => {
    const filters: { label: string; clear: () => void }[] = [];
    legalFilters.forEach((id) => {
      const label = LEGAL_FILTERS.find((f) => f.id === id)?.label;
      if (label) filters.push({ label, clear: () => setLegalFilters((prev) => prev.filter((x) => x !== id)) });
    });
    if (amenities.length > 0) filters.push({ label: `${amenities.length} amenit${amenities.length === 1 ? 'y' : 'ies'}`, clear: () => setAmenities([]) });
    if (infraFilters.length > 0) filters.push({ label: 'Infrastructure', clear: () => setInfraFilters([]) });
    if (furnishing !== 'Any') filters.push({ label: furnishing, clear: () => setFurnishing('Any') });
    if (parkingMin !== 'Any') filters.push({ label: `${parkingMin}+ parking`, clear: () => setParkingMin('Any') });
    if (serviceChargeMax) filters.push({ label: `Service charge ≤ ₦${serviceChargeMax}`, clear: () => setServiceChargeMax('') });
    return filters;
  }, [legalFilters, amenities, infraFilters, furnishing, parkingMin, serviceChargeMax]);

  const activeFilterCount = legalFilters.length + amenities.length + infraFilters.length
    + (furnishing !== 'Any' ? 1 : 0)
    + (parkingMin !== 'Any' ? 1 : 0)
    + (serviceChargeMax ? 1 : 0);

  const toggleInfra = (id: string) => {
    setInfraFilters((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAmenity = (id: string) => {
    setAmenities((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const sidebarContent = (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">Refine Results</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{activeFilterCount}</span>
          )}
        </div>
        <button
          onClick={() => { setLegalFilters([]); setAmenities([]); setInfraFilters([]); setFurnishing('Any'); setParkingMin('Any'); setServiceChargeMax(''); }}
          className="text-[11px] font-semibold text-zinc-500 transition-colors hover:text-rose-600"
        >
          Reset All
        </button>
      </div>

      {/* Trust Badge */}
      <div className="mb-4 rounded-xl border border-emerald-200/80 bg-emerald-50 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div>
            <p className="text-[11px] font-bold text-emerald-950">Lagos Surveyor Audit Guaranteed</p>
            <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-emerald-900/90">
              All cadastral coordinates mapped via Lagos State GIS Alausa registry.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Accordion: Verification & Legal ─── */}
      <Accordion
        title="Verification & Legal"
        icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
        badge={legalFilters.length}
        defaultOpen
      >
        <span className="mb-2 inline-block rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">Alausa Sync</span>
        <div className="space-y-1.5">
          {LEGAL_FILTERS.map((filter) => {
            const isChecked = legalFilters.includes(filter.id);
            return (
              <label
                key={filter.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-2.5 py-2 transition-colors ${
                  isChecked ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setLegalFilters((prev) => isChecked ? prev.filter((x) => x !== filter.id) : [...prev, filter.id])}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`text-xs ${isChecked ? 'font-semibold text-zinc-800' : 'font-medium text-zinc-600'}`}>{filter.label}</span>
                </div>
                {filter.tag && (
                  <span className="rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">{filter.tag}</span>
                )}
              </label>
            );
          })}
        </div>
      </Accordion>

      {/* ─── Accordion: Building Amenities ─── */}
      <Accordion
        title="Building Amenities"
        icon={<Waves className="h-3.5 w-3.5 text-emerald-600" />}
        badge={amenities.length}
      >
        <div className="space-y-1.5">
          {AMENITY_FILTERS.map((amenity) => {
            const isChecked = amenities.includes(amenity);
            return (
              <label key={amenity} className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-900">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                {amenity}
              </label>
            );
          })}
        </div>
      </Accordion>

      {/* ─── Accordion: Furnishing & Fit-Out ─── */}
      <Accordion
        title="Furnishing"
        icon={<Home className="h-3.5 w-3.5 text-zinc-500" />}
        badge={furnishing !== 'Any' ? 1 : 0}
      >
        <div className="space-y-1.5">
          {['Any', ...FURNISHING_OPTIONS].map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-900">
              <input
                type="radio"
                name="furnishing"
                checked={furnishing === option}
                onChange={() => setFurnishing(option)}
                className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              {option}
            </label>
          ))}
        </div>
      </Accordion>

      {/* ─── Accordion: Service Charge ─── */}
      <Accordion title="Service Charge" icon={<Zap className="h-3.5 w-3.5 text-amber-600" />}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Max ₦</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="500,000"
            value={serviceChargeMax}
            onChange={(e) => setServiceChargeMax(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-xs text-zinc-500">/yr</span>
        </div>
      </Accordion>

      {/* ─── Accordion: Parking ─── */}
      <Accordion title="Parking Spaces" icon={<Car className="h-3.5 w-3.5 text-zinc-500" />}>
        <div className="flex flex-wrap gap-1.5">
          {['Any', '1', '2', '3+'].map((option) => (
            <button
              key={option}
              onClick={() => setParkingMin(option)}
              className={`rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                parkingMin === option
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {option === 'Any' ? 'Any' : `${option}+`}
            </button>
          ))}
        </div>
      </Accordion>

      {/* ─── Accordion: Infrastructure & Power ─── */}
      <Accordion
        title="Infrastructure & Power"
        icon={<Zap className="h-3.5 w-3.5 text-amber-600" />}
        badge={infraFilters.length}
      >
        <div className="space-y-1.5">
          {INFRASTRUCTURE_FILTERS.map((filter, i) => {
            const id = ['24/7', 'borehole', 'security', 'jetty', 'flood'][i];
            const isChecked = infraFilters.includes(id);
            return (
              <label key={filter} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleInfra(id)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                {filter}
              </label>
            );
          })}
        </div>
      </Accordion>

      {/* Bottom Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800">
          Apply Filters
          {activeFilterCount > 0 && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{activeFilterCount}</span>}
        </button>
        <button
          onClick={() => { setLegalFilters([]); setAmenities([]); setInfraFilters([]); setFurnishing('Any'); setParkingMin('Any'); setServiceChargeMax(''); }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-16">
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between gap-4 px-4 lg:px-6">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-zinc-900">Propati<span className="text-emerald-700">Box</span></span>
                <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">NG</span>
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">Sovereign Land &amp; Property Registry</span>
            </div>
          </Link>

          {/* Center Search */}
          <div className="hidden max-w-2xl flex-1 items-center gap-2 md:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-24 text-xs font-medium text-zinc-800 placeholder-zinc-400 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Search Lekki Phase 1, Victoria Island, Ikeja GRA, Yaba, Ikoyi..."
                type="text"
              />
              <button className="absolute inset-y-1.5 right-1.5 flex items-center gap-1 rounded-full bg-emerald-700 px-3 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-emerald-800">
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <div className="relative hidden xl:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-8 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Verified First (CAC &amp; Title)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-500" />
            </div>

            <div className="hidden items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-zinc-600 sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                title="Grid View"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 md:inline-flex">
              <MapPin className="h-3.5 w-3.5" />
              <span>Map Split</span>
              <span className="ml-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </button>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] font-bold text-white">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto border-t border-zinc-100 bg-zinc-50/70 px-4 py-2 no-scrollbar lg:px-6">
          <div className="flex items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <SlidersHorizontal className="h-3 w-3" /> Quick:
            </span>
            <button className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              <span>All Nigerian Listings</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{listings.length}</span>
            </button>
            {['For Sale', 'For Rent (Annual)', 'Shortlets', 'Commercial & Co-work'].map((pill) => (
              <button
                key={pill}
                className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-emerald-600 hover:text-emerald-700"
              >
                {pill}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-zinc-300" />
            <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
              Price: ₦1M - ₦500M+
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>
            <button className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
              Beds: Any (1-5+)
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>
            <button className="flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-sm">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              CAC &amp; Title Verified Only
            </button>
          </div>
          <div className="hidden items-center gap-1.5 text-[11px] font-medium text-zinc-500 xl:flex">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Lagos State Geospatial Grid: <strong className="font-semibold text-zinc-800">Lekki, VI, Ikoyi, Ikeja, Yaba</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex max-w-[1920px] w-full overflow-hidden">
        {/* Left Pane: Sidebar + Listings */}
        <div className="flex w-full flex-col border-r border-zinc-200 bg-white lg:w-[60%] xl:w-[58%] xl:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 border-b border-zinc-200 bg-zinc-50/50 p-5 xl:w-72 xl:border-b-0 xl:border-r">
            {sidebarContent}
          </aside>

          {/* Listings Grid */}
          <section className="max-h-[calc(100vh-6.5rem)] flex-1 overflow-y-auto p-4 lg:p-5">
            {/* Results Header */}
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3.5">
              <div>
                <h1 className="text-sm font-extrabold text-zinc-900 lg:text-base">
                  Showing <span className="font-black text-rose-600">{filtered.length}</span> Verified Properties
                </h1>
                <p className="text-xs text-zinc-500">
                  {search ? `Filtered by "${search}"` : 'No matching properties found in current filter criteria'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <span className="hidden text-xs text-zinc-400 sm:inline">Active ({activeFilters.length}):</span>
                {activeFilters.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10.5px] font-medium text-zinc-600">
                    {f.label}
                    <button onClick={f.clear} className="ml-0.5 leading-none hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600">
                    {f.label}
                    <button onClick={f.clear} className="ml-1 leading-none text-zinc-500 hover:text-zinc-800" aria-label={`Clear ${f.label}`}>×</button>
                  </span>
                ))}
                <button
                  onClick={() => { setLegalFilters([]); setAmenities([]); setInfraFilters([]); setFurnishing('Any'); setParkingMin('Any'); setServiceChargeMax(''); setSearch(''); }}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="space-y-6">
                {/* Empty State */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Search className="h-8 w-8" />
                  </div>
                  <h2 className="mb-1.5 text-base font-bold text-zinc-900 lg:text-lg">No Verified Properties Found</h2>
                  <p className="mx-auto mb-5 max-w-lg text-xs leading-relaxed text-zinc-500">
                    No properties match your exact combination of {activeFilterCount} active filters.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => { setLegalFilters([]); setAmenities([]); setInfraFilters([]); setFurnishing('Any'); setParkingMin('Any'); setServiceChargeMax(''); setSearch(''); }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset All Filters
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700">
                      <Bell className="h-3.5 w-3.5 text-amber-600" />
                      Save Search &amp; Get Instant SMS/Email Alert
                    </button>
                  </div>
                </div>

                {/* Recommended Next Steps */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Recommended Next Steps</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {[
                      { icon: <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />, title: 'Expand Search Radius', desc: 'Extend polygon boundary to Victoria Island or Ikoyi (+14 verified listings).', action: 'Expand to VI & Ikoyi →' },
                      { icon: <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />, title: 'Relax Power Constraint', desc: "Uncheck '24/7 Dedicated Power' filter to reveal 6 prime private inverter units.", action: 'Remove Power Filter →' },
                      { icon: <UserCheck className="h-3.5 w-3.5 text-blue-600" />, title: 'Lagos Alausa Desk', desc: 'Request an accredited sovereign agent to source off-market Lekki listings.', action: 'Request Agent Match →' },
                    ].map((step) => (
                      <div key={step.title} className="group cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-emerald-500">
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold text-zinc-800 group-hover:text-emerald-700">
                          {step.icon}
                          {step.title}
                        </div>
                        <p className="mb-2 text-[11px] leading-normal text-zinc-500">{step.desc}</p>
                        <span className="text-[10.5px] font-bold text-emerald-700 group-hover:underline">{step.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
                {filtered.map((listing) => {
                  const isCompared = compareIds.includes(listing.id);
                  const isHovered = hoveredId === listing.id;
                  return (
                    <div
                      key={listing.id}
                      className={`relative transition-all duration-200 ${isHovered ? 'z-10 scale-[1.02]' : ''}`}
                      onMouseEnter={() => setHoveredId(listing.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Link href={`/listings/${listing.id}`}>
                        <PropertyCard
                          id={listing.id}
                          title={listing.title}
                          location={listing.address}
                          price={listing.price}
                          pricePeriod={listing.listingType === 'sale' ? 'total' : 'year'}
                          category={listing.propertyType === 'office' || listing.propertyType === 'shop' ? 'commercial' : 'residential'}
                          verificationTier={listing.verificationTier as 'basic' | 'verified' | 'inspected' | 'certified'}
                          listingType={listing.listingType as 'rent' | 'sale' | 'short_let' | 'share' | 'commercial'}
                          image={listing.image}
                          specs={{ beds: listing.beds, baths: listing.baths, sqm: listing.sqm, parking: listing.parking }}
                        />
                      </Link>
                      <label className="absolute left-3 top-3 z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-xs text-white backdrop-blur transition-colors hover:bg-black/80">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={(e) => {
                            e.stopPropagation();
                            setCompareIds((prev) =>
                              e.target.checked ? (prev.length < 3 ? [...prev, listing.id] : prev) : prev.filter((x) => x !== listing.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-emerald-500"
                        />
                        Compare
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compare Bar */}
            {compareIds.length > 0 && (
              <div className="sticky bottom-4 z-20 mt-6">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
                  <span className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">{compareIds.length}/3</span> selected for comparison
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCompareIds([])}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => router.push(`/compare?ids=${compareIds.join(',')}`)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Pane: Map */}
        <div className="relative hidden overflow-hidden bg-[#eef2f6] lg:block lg:w-[40%] xl:w-[42%]">
          <AdvancedSearchMapView
            properties={filtered.map((l) => ({
              id: l.id,
              title: l.title,
              address: l.address,
              area: l.address,
              price: l.price,
              priceFormatted: `₦${Number(l.price).toLocaleString()}`,
              listingType: l.listingType,
              propertyType: l.propertyType === 'office' ? 'office' : 'apartment',
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
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto flex h-full w-[320px] flex-col border-l border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <span className="font-semibold text-zinc-900">Filters</span>
              <button onClick={() => setFilterOpen(false)} className="text-zinc-500 hover:text-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{sidebarContent}</div>
            <div className="flex gap-2 border-t border-zinc-200 p-5">
              <button
                onClick={() => { setLegalFilters([]); setAmenities([]); setInfraFilters([]); setFurnishing('Any'); setParkingMin('Any'); setServiceChargeMax(''); }}
                className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
