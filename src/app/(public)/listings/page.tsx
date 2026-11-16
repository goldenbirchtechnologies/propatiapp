'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X as XIcon,
  ChevronDown,
  MapPin,
  BadgeCheck,
  RotateCcw,
  ArrowRight,
  LayoutGrid,
  Bed,
  Bath,
  Square,
  Plus,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { AdvancedSearchMapView } from '@/components/search/AdvancedSearchMapView';
import type { ListingData } from '@/components/listings/listing-card';

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

const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5+'] as const;
const BATHROOM_OPTIONS = ['Any', '1', '2', '3', '4+'] as const;
const VERIFICATION_OPTIONS = ['basic', 'verified', 'inspected', 'certified'] as const;
const LEGAL_DOCS = ['C of O', "Governor's Consent", 'Gazette', "Deed of Assignment"] as const;
const INFRASTRUCTURE = ['Electricity', 'Water Supply', 'Roads', 'Drainage', 'Internet'] as const;

const DEFAULT_FILTERS = {
  search: '',
  category: 'all' as const,
  priceMin: '',
  priceMax: '',
  beds: 'Any' as const,
  baths: 'Any' as const,
  sizeMin: '',
  sizeMax: '',
  verification: [] as string[],
  legal: [] as string[],
  infra: [] as string[],
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function listingBadge(listingType: string) {
  switch (listingType) {
    case 'sale':
      return { label: 'FOR SALE', cls: 'bg-[#087A59] text-white' };
    case 'rent':
      return { label: 'FOR RENT', cls: 'bg-[#0ea5e9] text-white' };
    case 'short_let':
      return { label: 'SHORTLET', cls: 'bg-[#f59e0b] text-white' };
    case 'commercial':
      return { label: 'COMMERCIAL', cls: 'bg-[#3b82f6] text-white' };
    case 'share':
      return { label: 'SHARE', cls: 'bg-[#087A59] text-white' };
    default:
      return { label: listingType.toUpperCase(), cls: 'bg-[#6b7280] text-white' };
  }
}

function verificationBadge(tier: string, listingType: string) {
  if (tier === 'certified') return 'C of O Verified • Block 14A';
  if (tier === 'inspected') return "Governor's Consent";
  if (tier === 'verified') return 'Secure Payment';
  if (listingType === 'short_let') return 'Location BI-992-01';
  if (listingType === 'commercial') return 'Gazette Excision Verified';
  return 'C of O Audited';
}

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
  amenities?: string[];
}

interface Filters {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  beds: string;
  baths: string;
  sizeMin: string;
  sizeMax: string;
  verification: string[];
  legal: string[];
  infra: string[];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleArray: (key: 'verification' | 'legal' | 'infra', value: string) => void;
  clearAll: () => void;
  count: number;
}

function FilterDrawer({
  open,
  onClose,
  filters,
  setFilter,
  toggleArray,
  clearAll,
  count,
}: FilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="p-0 sm:max-w-md w-full max-h-[92vh] border-[#E5E9E7] shadow-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Advanced filters</SheetTitle>
          <SheetDescription>Refine your search results</SheetDescription>
          <SheetClose className="text-[#6b7280] hover:text-[#087A59]" />
        </SheetHeader>
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Price range (NGN)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={filters.priceMin}
                  onChange={(e) => setFilter('priceMin', e.target.value)}
                  placeholder="Min"
                  className="h-10 text-sm"
                />
                <Input
                  value={filters.priceMax}
                  onChange={(e) => setFilter('priceMax', e.target.value)}
                  placeholder="Max"
                  className="h-10 text-sm"
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Property category</Label>
              <div className="flex flex-wrap gap-1">
                {CATEGORY_PILLS.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setFilter('category', pill.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                      filters.category === pill.id
                        ? 'bg-[#087A59] text-white shadow-sm'
                        : 'bg-[#F7F9F8] text-[#6b7280] hover:bg-[#E5E9E7] hover:text-[#087A59]'
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Bedrooms</Label>
              <div className="flex flex-wrap gap-1">
                {BEDROOM_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilter('beds', b)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                      filters.beds === b
                        ? 'bg-[#087A59] text-white shadow-sm'
                        : 'bg-[#F7F9F8] text-[#6b7280] hover:bg-[#E5E9E7] hover:text-[#087A59]'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Bathrooms</Label>
              <div className="flex flex-wrap gap-1">
                {BATHROOM_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilter('baths', b)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                      filters.baths === b
                        ? 'bg-[#087A59] text-white shadow-sm'
                        : 'bg-[#F7F9F8] text-[#6b7280] hover:bg-[#E5E9E7] hover:text-[#087A59]'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Property size (sqm)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={filters.sizeMin}
                  onChange={(e) => setFilter('sizeMin', e.target.value)}
                  placeholder="Min sqm"
                  className="h-10 text-sm"
                />
                <Input
                  value={filters.sizeMax}
                  onChange={(e) => setFilter('sizeMax', e.target.value)}
                  placeholder="Max sqm"
                  className="h-10 text-sm"
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Legal documentation</Label>
              <div className="space-y-2">
                {LEGAL_DOCS.map((doc) => (
                  <div key={doc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`legal-${doc}`}
                      checked={filters.legal.includes(doc)}
                      onCheckedChange={() => toggleArray('legal', doc)}
                    />
                    <label htmlFor={`legal-${doc}`} className="text-sm text-[#111827] cursor-pointer">
                      {doc}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6b7280]">Shows listings with verified legal documentation.</p>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Infrastructure</Label>
              <div className="space-y-2">
                {INFRASTRUCTURE.map((infra) => (
                  <div key={infra} className="flex items-center space-x-2">
                    <Checkbox
                      id={`infra-${infra}`}
                      checked={filters.infra.includes(infra)}
                      onCheckedChange={() => toggleArray('infra', infra)}
                    />
                    <label htmlFor={`infra-${infra}`} className="text-sm text-[#111827] cursor-pointer">
                      {infra}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Verification status</Label>
              <div className="space-y-2">
                {VERIFICATION_OPTIONS.map((tier) => (
                  <div key={tier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`verif-${tier}`}
                      checked={filters.verification.includes(tier)}
                      onCheckedChange={() => toggleArray('verification', tier)}
                    />
                    <label htmlFor={`verif-${tier}`} className="text-sm text-[#111827] cursor-pointer capitalize">
                      {tier}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Location &amp; neighbourhood</Label>
              <Input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="e.g. Lekki, Ikoyi, Victoria Island"
              />
              <p className="text-xs text-[#6b7280]">Searches title, address and area.</p>
            </section>
          </div>
        </ScrollArea>
        <SheetFooter className="border-t border-[#E5E9E7] bg-white/80 backdrop-blur-sm p-4">
          <div className="text-sm font-medium text-[#111827]">
            {count} property{count === 1 ? '' : 's'} found
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button variant="outline" onClick={clearAll} size="sm">
              Reset all
            </Button>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = useCallback(
    (key: 'verification' | 'legal' | 'infra', value: string) => {
      setFilters((prev) => {
        const arr = [...(prev[key] as string[])];
        const i = arr.indexOf(value);
        if (i >= 0) arr.splice(i, 1);
        else arr.push(value);
        return { ...prev, [key]: arr };
      });
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
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
              images: Array.isArray(l.images)
                ? l.images.map((im: any) => (typeof im === 'string' ? im : im.url)).filter(Boolean)
                : [],
              listingType: l.listingType || 'rent',
              verificationTier: l.verificationTier || (l.verified ? 'verified' : 'basic'),
              propertyType: l.propertyType || 'apartment',
              status: l.status || 'active',
              description: l.description || '',
              amenities: Array.isArray(l.amenities) ? l.amenities : [],
            }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setListings([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let out = [...listings];
    const { search, category, priceMin, priceMax, beds, baths, sizeMin, sizeMax, verification, legal, infra } = filters;
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      if (category === 'commercial') {
        out = out.filter((l) => l.listingType === 'commercial' || l.propertyType === 'office' || l.propertyType === 'shop');
      } else {
        out = out.filter((l) => l.listingType === category);
      }
    }
    if (beds !== 'Any') {
      const n = beds === '5+' ? 5 : parseInt(beds, 10);
      out = out.filter((l) => (beds === '5+' ? l.beds >= 5 : l.beds === n));
    }
    if (baths !== 'Any') {
      const n = baths === '4+' ? 4 : parseInt(baths, 10);
      out = out.filter((l) => (baths === '4+' ? l.baths >= 4 : l.baths === n));
    }
    const pMin = priceMin !== '' ? Number(priceMin) : 0;
    const pMax = priceMax !== '' ? Number(priceMax) : Infinity;
    if (pMin > 0 || isFinite(pMax)) {
      out = out.filter((l) => l.price >= pMin && l.price <= pMax);
    }
    const sMin = sizeMin !== '' ? Number(sizeMin) : 0;
    const sMax = sizeMax !== '' ? Number(sizeMax) : Infinity;
    if (sMin > 0 || isFinite(sMax)) {
      out = out.filter((l) => l.sqm >= sMin && l.sqm <= sMax);
    }
    if (verification.length > 0) {
      out = out.filter((l) => verification.includes(l.verificationTier));
    }
    if (legal.length > 0) {
      out = out.filter((l) => l.verificationTier !== 'basic');
    }
    if (infra.length > 0) {
      const kw = infra.map((s) => s.toLowerCase());
      out = out.filter((l) => {
        const a = ((l.amenities || []) as string[]).map((s) => s.toLowerCase()).join(' ');
        return kw.some((k) => a.includes(k));
      });
    }
    if (sort === 'Price: Low to High') out.sort((a, b) => a.price - b.price);
    else if (sort === 'Price: High to Low') out.sort((a, b) => b.price - a.price);
    else if (sort === 'Square Area (sqm)') out.sort((a, b) => b.sqm - a.sqm);
    else if (sort === 'Most Verified') {
      const rank = (t: string) => ({ certified: 4, inspected: 3, verified: 2, basic: 1 }[t] ?? 0);
      out.sort((a, b) => rank(b.verificationTier) - rank(a.verificationTier));
    }
    return out;
  }, [listings, filters, sort]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visibleCount);

  const activeFilters: { id: string; label: string; onRemove: () => void }[] = [];
  if (filters.search.trim()) {
    activeFilters.push({
      id: 'search',
      label: `Search: "${filters.search.trim()}"`,
      onRemove: () => setFilter('search', ''),
    });
  }
  if (filters.category !== 'all') {
    activeFilters.push({
      id: 'category',
      label: filters.category,
      onRemove: () => setFilter('category', 'all'),
    });
  }
  if (filters.beds !== 'Any') {
    activeFilters.push({
      id: 'beds',
      label: `${filters.beds} bed${filters.beds === '5+' ? 's+' : 's'}`,
      onRemove: () => setFilter('beds', 'Any'),
    });
  }
  if (filters.baths !== 'Any') {
    activeFilters.push({
      id: 'baths',
      label: `${filters.baths} bath${filters.baths === '4+' ? 's+' : 's'}`,
      onRemove: () => setFilter('baths', 'Any'),
    });
  }
  if (filters.priceMin !== '' || filters.priceMax !== '') {
    activeFilters.push({
      id: 'price',
      label: `${filters.priceMin !== '' ? formatPrice(Number(filters.priceMin)) : 'any'} – ${filters.priceMax !== '' ? formatPrice(Number(filters.priceMax)) : 'any'}`,
      onRemove: () => {
        setFilter('priceMin', '');
        setFilter('priceMax', '');
      },
    });
  }
  if (filters.sizeMin !== '' || filters.sizeMax !== '') {
    activeFilters.push({
      id: 'size',
      label: `${filters.sizeMin !== '' ? filters.sizeMin : 'any'}–${filters.sizeMax !== '' ? filters.sizeMax : 'any'} sqm`,
      onRemove: () => {
        setFilter('sizeMin', '');
        setFilter('sizeMax', '');
      },
    });
  }
  if (filters.verification.length > 0) {
    activeFilters.push({
      id: 'verification',
      label: filters.verification.join(', '),
      onRemove: () => setFilter('verification', []),
    });
  }
  if (filters.legal.length > 0) {
    activeFilters.push({
      id: 'legal',
      label: 'Legal documentation',
      onRemove: () => setFilter('legal', []),
    });
  }
  if (filters.infra.length > 0) {
    activeFilters.push({
      id: 'infra',
      label: 'Infrastructure',
      onRemove: () => setFilter('infra', []),
    });
  }

  const clearAllFilters = () => setFilters(DEFAULT_FILTERS);

  const mapProperties = useMemo(
    () =>
      filtered.map((l) => ({
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
        images: l.images.map((u) => ({ url: u })),
        amenities: l.amenities,
      })),
    [filtered]
  );

  function PropertyCard({
    l,
    variant,
    selected,
    hovered,
    onSelect,
    onViewDetails,
    onCompareToggle,
    isCompared,
  }: {
    l: Listing;
    variant: 'grid' | 'list';
    selected: boolean;
    hovered: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
    onCompareToggle: () => void;
    isCompared: boolean;
  }) {
    const badge = listingBadge(l.listingType);
    const vBadge = verificationBadge(l.verificationTier, l.listingType);
    const priceText =
      l.listingType === 'sale'
        ? formatPrice(l.price)
        : l.listingType === 'short_let'
          ? `${formatPrice(l.price)} / night`
          : `${formatPrice(l.price)} / yr`;
    const primaryImage = l.image || (l.images.length > 0 ? l.images[0] : '');

    return (
      <article
        onClick={onSelect}
        onMouseEnter={() => setHoveredId(l.id)}
        onMouseLeave={() => setHoveredId(null)}
        className={cn(
          'group relative rounded-2xl overflow-hidden border flex flex-col transition-all duration-200',
          selected
            ? 'border-[#087A59] bg-[#E8F5EF]/60 ring-2 ring-[#087A59]/30 shadow-[0_0_0_1px_rgba(8,122,89,0.2)]'
            : hovered
              ? 'border-[#087A59]/30 shadow-sm'
              : 'border-[#E5E9E7] bg-white hover:border-[#087A59]/30 hover:shadow-sm'
        )}
      >
        <div className={cn('relative overflow-hidden', variant === 'list' ? 'h-24' : 'h-52')}>
          <div className="absolute inset-0 z-10" aria-hidden="true" />
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={l.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#E5E9E7] text-[#6b7280]">
              <Building2 size={variant === 'list' ? 18 : 24} />
            </div>
          )}
          <div className="absolute top-2 left-2 z-20">
            <Badge className={cn('px-2 py-1 text-[10px] font-bold shadow-sm', badge.cls)}>{badge.label}</Badge>
          </div>
          <div className="absolute top-2 right-2 z-20">
            <Badge className="bg-white/90 backdrop-blur text-[#111827] border border-[#E5E9E7] px-2 py-1 text-[10px] font-semibold shadow-sm">
              {vBadge}
            </Badge>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle();
            }}
            className={cn(
              'absolute top-2 right-2 z-30 h-9 w-9 rounded-xl bg-white/90 backdrop-blur border border-[#E5E9E7] flex items-center justify-center text-[#111827] transition-colors',
              isCompared ? 'bg-[#087A59] border-[#087A59] text-white' : 'hover:bg-[#087A59] hover:text-white'
            )}
            aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isCompared ? <XIcon size={14} className="text-[#087A59]" /> : <Plus size={14} />}
          </button>
          {selected && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-[#087A59] text-white text-[10px] font-bold shadow-sm">
              <MapPin size={12} /> Selected
            </div>
          )}
        </div>
        <div className={cn('p-4 flex-1 flex flex-col', variant === 'list' ? 'p-3' : '')}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#111827] text-sm list:text-base leading-tight line-clamp-2 group-hover:text-[#087A59] transition-colors">
              {l.title}
            </h3>
            {selected && <span className="text-[#087A59] text-[10px] font-bold">Selected</span>}
          </div>
          <p className="text-xs text-[#6b7280] line-clamp-1 mb-2.5">{l.address}, {l.area}</p>
          <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-3">
            {l.beds > 0 && (
              <span className="flex items-center gap-1">
                <Bed size={13} className="shrink-0" />
                <span>{l.beds} bed</span>
              </span>
            )}
            {l.baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath size={13} className="shrink-0" />
                <span>{l.baths} bath</span>
              </span>
            )}
            {l.sqm > 0 && (
              <span className="flex items-center gap-1">
                <Square size={13} className="shrink-0" />
                <span>{l.sqm} sqm</span>
              </span>
            )}
          </div>
          <div className="mt-auto pt-3 border-t border-[#E5E9E7]/50 flex items-center justify-between gap-2">
            <div className="text-[#111827] font-bold text-sm">{priceText}</div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              size="sm"
              className="h-9 px-3 text-[11px] font-bold shadow-sm"
            >
              View details <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      {/* Sticky search & category toolbar */}
      <div className="sticky top-0 z-40 bg-[#F7F9F8]/85 backdrop-blur-md border-b border-[#E5E9E7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <Input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search location or area (e.g. Lekki, Ikoyi, Victoria Island)"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E5E9E7] bg-white text-[#111827] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#087A59]/30 focus:border-[#087A59]"
              />
              {filters.search && (
                <button
                  onClick={() => setFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#6b7280] hover:text-[#087A59]"
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E5E9E7] bg-white overflow-x-auto shadow-sm min-w-[220px]">
              {CATEGORY_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilter('category', pill.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                    filters.category === pill.id
                      ? 'bg-[#087A59] text-white shadow-sm'
                      : 'bg-[#F7F9F8] text-[#6b7280] hover:bg-[#E5E9E7] hover:text-[#087A59]'
                  )}
                >
                  {pill.label}
                </button>
              ))}
              <button
                onClick={() => setFilterOpen(true)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E9E7] bg-[#F7F9F8] text-[#6b7280] hover:bg-[#E5E9E7] hover:text-[#087A59] transition-colors"
                aria-label="Advanced filters"
              >
                <SlidersHorizontal size={14} className="mr-1.5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 bg-white rounded-2xl border border-[#E5E9E7] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 lg:mb-0">
            <BadgeCheck size={14} className="text-[#087A59]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Verified listings</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#111827]">
            Showing <span className="text-[#087A59]">{filtered.length}</span> properties{filtered.length !== listings.length ? ` · filtered from ${listings.length}` : ''}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span className="flex h-2 w-2 rounded-full bg-[#087A59]" />
            <span>Live results</span>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Active filters:</span>
            {activeFilters.map((f) => (
              <span key={f.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E9E7] text-sm font-medium text-[#111827] shadow-sm">
                {f.label}
                <button onClick={f.onRemove} className="ml-1 p-0.5 rounded text-[#6b7280] hover:text-[#087A59] hover:bg-[#E5E9E7]">
                  <XIcon size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="ml-2 text-xs font-bold text-[#087A59] underline underline-offset-2 hover:text-[#065B43]">
              Clear all
            </button>
          </div>
        )}

        {/* Main split: results + map (stacked mobile, 55/45 desktop) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* LEFT: Results */}
          <div className="flex-1 min-w-0 flex flex-col gap-5 lg:w-[55%]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-[#E5E9E7] p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">View</Label>
                <div className="inline-flex items-center rounded-xl border border-[#E5E9E7] bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      viewMode === 'grid' ? 'bg-[#087A59] text-white' : 'text-[#6b7280] hover:bg-[#F7F9F8]'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      viewMode === 'list' ? 'bg-[#087A59] text-white' : 'text-[#6b7280] hover:bg-[#F7F9F8]'
                    )}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Sort</Label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-xs text-[#111827] bg-transparent border-none focus:ring-0 pr-8"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="ml-1 size-4 text-[#6b7280]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={cn('animate-pulse rounded-2xl bg-[#E5E9E7] border border-[#E5E9E7]', viewMode === 'list' ? 'h-20' : 'h-[340px]')} />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl bg-white border border-[#E5E9E7] p-12 text-center shadow-sm">
                  <MapPin className="mx-auto mb-4 size-12 text-[#6b7280]" />
                  <h2 className="text-base font-bold text-[#111827]">Unable to load properties</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm text-[#6b7280]">
                    We couldn't load the listings at the moment. Please try again later.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#087A59] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#065B43]"
                  >
                    <RotateCcw size={14} /> Try again
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl bg-white border border-[#E5E9E7] p-12 text-center shadow-sm">
                  <Search className="mx-auto mb-4 size-12 bg-[#E8F5EF] text-[#087A59] rounded-xl p-3" />
                  <h2 className="text-base font-bold text-[#111827]">No matching properties</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm text-[#6b7280]">
                    No properties match your current filters. Try clearing filters or expanding your search.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#087A59] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#065B43]"
                  >
                    <RotateCcw size={14} /> Reset all filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visible.map((l) => (
                    <PropertyCard
                      key={l.id}
                      l={l}
                      variant="grid"
                      selected={selectedId === l.id}
                      hovered={hoveredId === l.id}
                      onSelect={() => setSelectedId(selectedId === l.id ? null : l.id)}
                      onViewDetails={() => router.push(`/listings/${l.id}`)}
                      onCompareToggle={() =>
                        setCompareIds((prev) => (prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]))
                      }
                      isCompared={compareIds.includes(l.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visible.map((l) => (
                    <PropertyCard
                      key={l.id}
                      l={l}
                      variant="list"
                      selected={selectedId === l.id}
                      hovered={hoveredId === l.id}
                      onSelect={() => setSelectedId(selectedId === l.id ? null : l.id)}
                      onViewDetails={() => router.push(`/listings/${l.id}`)}
                      onCompareToggle={() =>
                        setCompareIds((prev) => (prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]))
                      }
                      isCompared={compareIds.includes(l.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {!loading && !error && filtered.length > visibleCount && (
              <div className="pt-4 pb-2 flex flex-col items-center gap-2">
                <button
                  onClick={() => setVisibleCount((n) => n + 6)}
                  className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-white border border-[#E5E9E7] text-[#111827] text-xs font-semibold shadow-sm transition-colors hover:bg-[#F7F9F8]"
                >
                  <RotateCcw size={16} className="text-[#087A59]" /> Load more properties ({remaining} remaining)
                </button>
              </div>
            )}

            {compareIds.length > 0 && (
              <div className="sticky bottom-6 z-20">
                <div className="bg-[#111827] rounded-2xl shadow-xl p-3 sm:p-4 flex items-center justify-between gap-4 border border-[#E5E9E7]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#087A59]/20 border border-[#087A59]/30 flex items-center justify-center text-[#4ade80]">
                      <LayoutGrid size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111827]">{compareIds.length} of 3 properties selected</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#087A59] text-white">
                          Side-by-side
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] hidden sm:block truncate max-w-[320px]">{compareIds.join(' vs ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompareIds([])}
                      className="px-3 py-1.5 rounded-xl text-[#6b7280] hover:text-[#111827] text-xs font-medium"
                    >
                      Deselect
                    </button>
                    <button
                      onClick={() => router.push(`/compare?ids=${compareIds.join(',')}`)}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#087A59] text-white text-xs font-semibold shadow-md hover:bg-[#065B43]"
                    >
                      Compare listings <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Map (desktop) */}
          <div className="w-full lg:w-[45%] shrink-0 rounded-2xl overflow-hidden shadow-lg border border-[#E5E9E7] bg-white relative h-[340px] lg:h-[600px]">
            <AdvancedSearchMapView
              properties={mapProperties as unknown as ListingData[]}
              loading={loading}
              error={error}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onPropertySelect={(p) => setSelectedId(selectedId === p.id ? null : p.id)}
              onViewDetails={(p) => router.push(`/listings/${p.id}`)}
              onPropertyHover={(p) => setHoveredId(p?.id ?? null)}
              initialCenter={{ lat: 6.5244, lng: 3.3792 }}
              initialZoom={12}
            />
          </div>
        </div>
      </div>

      {/* Mobile advanced filter drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        toggleArray={toggleArray}
        clearAll={clearAllFilters}
        count={filtered.length}
      />
    </div>
  );
}
