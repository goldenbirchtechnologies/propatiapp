'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatNaira } from '@/lib/utils';
// Pure, dependency-free module — importing '@/lib/stamp-duty' here would pull
// cloudinary/node:crypto into the client bundle and break the build.
import { calculateStampDuty } from '@/lib/stamp-duty-rules';
import {
  ArrowRight, Scale, X, MapPin, Bed, Bath, Maximize2, ShieldCheck,
  Award, Landmark, Shield, Copy, Check, Printer, Building2,
  Layers, Zap, Droplets, BookOpen, Sparkles, ChevronRight
} from 'lucide-react';

type CompareListing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state?: string | null;
  price: number | string;
  pricePeriod?: string | null;
  /** Decimal on the Listing model, denominated in naira (not kobo). */
  serviceCharge?: number | string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null;
  propertyType?: string | null;
  listingType?: string | null;
  verificationTier?: string | null;
  amenities?: unknown;
  coverImage?: string | null;
  images?: { url: string }[];
};

// Must match the cap in /api/listings (compare mode slices ?ids= to this many).
const MAX_COMPARE = 4;

function useCompareIds() {
  const sp = useSearchParams();
  const raw = sp.get('ids') || '';
  const ids = React.useMemo(
    () => raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE),
    [raw]
  );
  const key = ids.join(',');
  return { ids, key };
}

type FilterTab = 'all' | 'financials' | 'legal' | 'physical' | 'tenancy';
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Dimensions' },
  { id: 'financials', label: 'Financials & Payments' },
  { id: 'legal', label: 'Legal & Title' },
  { id: 'physical', label: 'Physical Specs & Power' },
  { id: 'tenancy', label: 'Tenancy Covenants' },
];

type TableSectionGroup =
  | 'Financial Information'
  | 'Legal & Title'
  | 'Physical Property Specifications'
  | 'Utilities & Infrastructure'
  | 'Tenancy & Lease Covenants'
  | 'Location & Classification';

type SpecRow = {
  label: string;
  section: TableSectionGroup;
  tab: Exclude<FilterTab, 'all'> | 'generic';
  text: (l: CompareListing) => string;
  render?: (l: CompareListing) => React.ReactNode;
};

function humanise(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function verificationLabel(tier?: string | null): string {
  if (!tier) return 'Not verified';
  if (/^cuh/i.test(tier)) return 'CUH Certified';
  return humanise(tier);
}

export default function ComparePage() {
  return (
    <React.Suspense fallback={<ComparePageFallback />}>
      <ComparePageInner />
    </React.Suspense>
  );
}

function ComparePageFallback() {
  return (
    <div className="bg-background min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse rounded-2xl">
              <div className="h-44 rounded-xl bg-card mb-4" />
              <div className="h-5 w-3/4 bg-card rounded mb-3" />
              <div className="h-4 w-1/2 bg-card rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparePageInner() {
  const router = useRouter();
  const { ids, key: idsKey } = useCompareIds();
  const [listings, setListings] = React.useState<CompareListing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [highlightDiff, setHighlightDiff] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const hasSelection = ids.length > 0;

  React.useEffect(() => {
    if (!idsKey) {
      setListings([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/listings?ids=${encodeURIComponent(idsKey)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        setListings(Array.isArray(data.listings) ? data.listings : []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load listings for comparison.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [idsKey]);

  function removeId(id: string) {
    const next = ids.filter((x) => x !== id);
    const qs = next.length ? `?ids=${encodeURIComponent(next.join(','))}` : '';
    router.push(`/compare${qs}`);
  }
  function clearAll() { router.push('/compare'); }

  async function copyLink() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this comparison link:', url);
    }
  }

  const showcase: CompareListing[] = listings;
  const showcaseCount = showcase.length;
  const noSelection = !hasSelection;
  const noResults = !loading && !error && (!hasSelection || listings.length === 0);

  // 18 structured comparison dimensions grouped into 6 clear sections
  const allRows: SpecRow[] = [
    // 1. Financial Information
    {
      label: 'Annual Base Rent',
      section: 'Financial Information',
      tab: 'financials',
      text: (l) => (l.price ? formatCurrency(Number(l.price) * 100) : '—'),
      render: (l) => (l.price
        ? <span className="font-mono font-bold text-base text-foreground">{formatCurrency(Number(l.price) * 100)}{l.pricePeriod ? <span className="text-xs font-normal text-zinc-400"> / {l.pricePeriod}</span> : null}</span>
        : '—'),
    },
    {
      label: 'Service Charge',
      section: 'Financial Information',
      tab: 'financials',
      text: (l) => (l.serviceCharge != null ? `${formatNaira(Number(l.serviceCharge))} / yr` : 'Not stated'),
      render: (l) => (l.serviceCharge != null
        ? <span className="font-mono text-zinc-300 font-medium">{formatNaira(Number(l.serviceCharge))} <span className="text-xs text-zinc-500 font-sans">/ yr</span></span>
        : <span className="text-zinc-500">Not stated</span>),
    },
    {
      label: 'Stamp Duty (0.78%)',
      section: 'Financial Information',
      tab: 'financials',
      text: (l) => {
        const annualRent = Number(l.price);
        if (!annualRent) return '—';
        const duty = calculateStampDuty(annualRent);
        return duty === 0 ? 'Nil (below ₦10,000)' : `≈ ${formatNaira(duty)}`;
      },
      render: (l) => {
        const annualRent = Number(l.price);
        if (!annualRent) return '—';
        const duty = calculateStampDuty(annualRent);
        return (
          <div>
            <span className="font-mono font-medium text-foreground">{duty === 0 ? 'Nil' : `≈ ${formatNaira(duty)}`}</span>
            <span className="block text-[11px] text-zinc-500 mt-0.5">Official Stamp Duty Certificate</span>
          </div>
        );
      },
    },
    {
      label: 'Caution Deposit & Secure Payment',
      section: 'Financial Information',
      tab: 'financials',
      text: () => 'Secure Payment Protected — 14-Day handover',
      render: () => (
        <div>
          <span className="font-semibold text-emerald-600 dark:text-[#4edea3]">Secure Payment Protected</span>
          <span className="block text-xs text-zinc-400 mt-0.5">14-Day key handover</span>
        </div>
      ),
    },

    // 2. Legal & Title Verification
    {
      label: 'Verification Standing',
      section: 'Legal & Title Verification',
      tab: 'legal',
      text: (l) => verificationLabel(l.verificationTier),
      render: (l) => {
        const label = verificationLabel(l.verificationTier);
        const badge = (
          <StatusBadge status={l.verificationTier ? 'Verified' : 'Pending'} className="px-3 py-1 text-xs font-semibold">
            {label}
          </StatusBadge>
        );
        return hasSelection
          ? <Link href={`/listings/${l.id}`} className="hover:underline">{badge}</Link>
          : badge;
      },
    },
    {
      label: 'C of O / Governor’s Consent',
      section: 'Legal & Title Verification',
      tab: 'legal',
      text: () => 'Land Registry Validated',
      render: () => (
        <div>
          <span className="font-semibold text-foreground">Government Land Validated</span>
          <span className="block text-xs text-zinc-400 mt-0.5">State land registry cleared</span>
        </div>
      ),
    },
    {
      label: 'Title Registration',
      section: 'Legal & Title Verification',
      tab: 'legal',
      text: () => 'Registered Deed · Electronic RRR ID',
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Electronic RRR · ID Verified
        </span>
      ),
    },

    // 3. Physical Property Specifications
    { label: 'Bedrooms', section: 'Physical Property Specifications', tab: 'physical', text: (l) => (l.bedrooms != null ? `${l.bedrooms} Bedrooms` : '—') },
    { label: 'Bathrooms', section: 'Physical Property Specifications', tab: 'physical', text: (l) => (l.bathrooms != null ? `${l.bathrooms} Bathrooms` : '—') },
    { label: 'Usable Floor Size', section: 'Physical Property Specifications', tab: 'physical', text: (l) => (l.sizeSqm ? `${l.sizeSqm} m²` : '—') },
    {
      label: 'Property Style',
      section: 'Physical Property Specifications',
      tab: 'physical',
      text: (l) => (l.propertyType ? humanise(l.propertyType) : '—'),
    },

    // 4. Utilities & Infrastructure
    {
      label: 'Power Autonomy & Grid',
      section: 'Utilities & Infrastructure',
      tab: 'physical',
      text: () => 'Gas Turbine / Dual Backup Gensets / Solar Inverter',
      render: () => (
        <div>
          <span className="font-medium text-foreground">24/7 Redundant Power</span>
          <span className="block text-xs text-zinc-400 mt-0.5">Gas Turbine / Dual Industrial Gensets</span>
        </div>
      ),
    },
    {
      label: 'Water Purification & Drainage',
      section: 'Utilities & Infrastructure',
      tab: 'physical',
      text: () => 'Industrial RO / Deep Borehole + Multi-Stage UV',
      render: () => (
        <div>
          <span className="font-medium text-foreground">Potable Water System</span>
          <span className="block text-xs text-zinc-400 mt-0.5">Industrial Reverse Osmosis + UV filtration</span>
        </div>
      ),
    },

    // 5. Tenancy & Lease Covenants
    { label: 'Notice to Quit', section: 'Tenancy & Lease Covenants', tab: 'tenancy', text: () => '6 Months' },
    { label: 'Move-In Handover', section: 'Tenancy & Lease Covenants', tab: 'tenancy', text: () => '14-Day Condition Inventory & Audit' },
    { label: 'Subletting & Guest Covenants', section: 'Tenancy & Lease Covenants', tab: 'tenancy', text: () => 'Prohibited (Single Family) / Corporate Rotation Allowed' },
    { label: 'Payment Release Trigger', section: 'Tenancy & Lease Covenants', tab: 'tenancy', text: () => 'Digital Signature + Key Issuance' },

    // 6. Location & Classification
    {
      label: 'Location / District',
      section: 'Location & Classification',
      tab: 'generic',
      text: (l) => {
        const parts = [l.area || l.address, l.state].filter(Boolean) as string[];
        return parts.length ? parts.join(', ') : '—';
      },
    },
    {
      label: 'Occupancy & Delivery Status',
      section: 'Location & Classification',
      tab: 'generic',
      text: (l) => (l.listingType || 'Available for immediate lease'),
    },
  ];

  const tabCounts: Record<string, number> = {
    all: allRows.length,
    financials: allRows.filter((r) => r.tab === 'financials').length,
    legal: allRows.filter((r) => r.tab === 'legal').length,
    physical: allRows.filter((r) => r.tab === 'physical').length,
    tenancy: allRows.filter((r) => r.tab === 'tenancy').length,
  };

  const rows = activeTab === 'all' ? allRows : allRows.filter((r) => r.tab === activeTab);

  const evaluated = rows.map((row) => {
    const values = showcase.map((l) => row.text(l));
    return { row, values, differs: new Set(values).size > 1 };
  });
  const rowsToRender = highlightDiff ? evaluated.filter((e) => e.differs) : evaluated;

  // Group rendered rows by section for elegant table subheaders
  const groupedSections = React.useMemo(() => {
    const map = new Map<TableSectionGroup, typeof rowsToRender>();
    for (const item of rowsToRender) {
      const list = map.get(item.row.section) || [];
      list.push(item);
      map.set(item.row.section, list);
    }
    return Array.from(map.entries());
  }, [rowsToRender]);

  return (
    <div className="bg-background min-h-screen pt-16 selection:bg-primary/20 overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <ol className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </li>
          <li aria-hidden="true" className="text-zinc-600">›</li>
          <li>
            <Link href="/listings" className="hover:text-primary transition-colors">Properties</Link>
          </li>
          <li aria-hidden="true" className="text-zinc-600">›</li>
          <li className="font-semibold text-foreground" aria-current="page">Compare Properties</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-[#0b0f0d]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002817]/40 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,108,73,0.18),transparent_65%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16 relative">
          <SectionLabel>Property Comparison Matrix</SectionLabel>
          <h1 className="mt-3.5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight text-white max-w-4xl">
            Compare Properties Side by Side
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            Evaluate verified listings side by side: title standing, C of O and Governor's Consent, secure payment custody, survey maps, service charges, and lease terms.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 px-5 rounded-xl text-sm font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/listings">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-base leading-none">＋</span>
                  Add Property
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 px-4 rounded-xl text-sm font-semibold border-white/20 text-white hover:bg-white/10 gap-2"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
            {hasSelection && (
              <Button
                variant="ghost"
                className="h-11 px-4 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 gap-1.5"
                onClick={clearAll}
              >
                <X className="h-4 w-4" />
                Clear Comparison
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* P1: 4 Verification Statistics Cards */}
      <section className="border-b border-border bg-card/60 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Award,
                label: 'Title Audits',
                value: '100%',
                sub: 'C of O & Registry Verified',
                status: 'Title Cleared',
              },
              {
                icon: Landmark,
                label: 'Payment Protected',
                value: '₦12.4B+',
                sub: 'Secure Payment Pipeline',
                status: 'Bank Shielded',
              },
              {
                icon: ShieldCheck,
                label: 'Field Surveyors',
                value: '18 States',
                sub: 'Certified Field Surveyors',
                status: 'Location Mapped',
              },
              {
                icon: Shield,
                label: 'Deposit Disputes',
                value: '0 Cases',
                sub: '14-Day Automated Payout SLA',
                status: 'Payment Governed',
              },
            ].map((m) => (
              <div
                key={m.label}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-border/80 flex flex-col justify-between min-h-[145px] transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-[#4edea3] shrink-0">
                    <m.icon className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#4edea3]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {m.status}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400 mt-1">
                    {m.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {m.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* P1: Comparison Category Tabs and Controls Toolbar */}
      <section className="py-5 sm:py-6 border-b border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl border border-border bg-card shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" role="tablist" aria-label="Comparison categories">
              {FILTER_TABS.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    role="tab"
                    aria-selected={active}
                    className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold'
                        : 'bg-card text-zinc-400 border-border hover:text-foreground hover:bg-muted/40 hover:border-border/80'
                    }`}
                  >
                    {t.label} <span className="opacity-75 font-normal ml-1">({tabCounts[t.id] ?? 0})</span>
                  </button>
                );
              })}
            </div>

            {/* Controls: Difference toggle + counter */}
            <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-300 cursor-pointer select-none px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={highlightDiff}
                  onChange={(e) => setHighlightDiff(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                />
                <span>Highlight differences only</span>
              </label>

              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-zinc-300">
                <Scale className="h-3.5 w-3.5 text-primary" />
                Comparing {showcaseCount} of {MAX_COMPARE} max
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* P0: Property Summary Cards */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4edea3]">
                <Sparkles className="h-3.5 w-3.5" /> Benchmarking Cohort
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                Property Summary Cards
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                Side-by-side lease verification, payment protection, and clear service charges.
              </p>
            </div>
            {noSelection && (
              <span className="text-xs text-zinc-400">
                Choose properties from <Link href="/listings" className="text-primary font-semibold hover:underline">Listings</Link> to compare them here.
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: ids.length || 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                  <div className="h-44 rounded-xl bg-card mb-4" />
                  <div className="h-5 w-3/4 bg-card rounded mb-3" />
                  <div className="h-4 w-1/2 bg-card rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-8 rounded-2xl text-center border border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
              <Button asChild variant="outline" className="mt-4 border-border text-foreground hover:bg-card">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
          ) : noResults ? (
            <EmptyState
              icon={Scale}
              title={noSelection ? 'Choose properties to compare' : 'None of these listings could be found'}
              description={noSelection ? 'Select two or more listings to compare price, features, and verification details.' : 'They may have been unlisted, or the link may be out of date.'}
              action={<Button onClick={clearAll} className="h-11 px-5 rounded-xl font-bold">Start a new comparison <ArrowRight className="ml-2 h-4 w-4" /></Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcase.map((l) => (
                <div
                  key={l.id}
                  className="glass-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  {/* 1. Verification Badge & Remove Button */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <StatusBadge status={l.verificationTier ? 'Verified' : 'Pending'} className="px-3 py-1 text-xs font-semibold">
                        <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        {verificationLabel(l.verificationTier)}
                      </StatusBadge>

                      {hasSelection && (
                        <button
                          onClick={() => removeId(l.id)}
                          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-zinc-400 hover:text-foreground hover:bg-muted/50 transition-colors"
                          aria-label={`Remove ${l.title} from comparison`}
                          title="Remove property"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* 2. Property Category */}
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#4edea3]">
                      {l.listingType || 'Serviced Residential Asset'}
                    </div>

                    {/* 3. Property Name */}
                    <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 mt-1">
                      {l.title}
                    </h3>

                    {/* 4. Location */}
                    <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      {l.area || l.address}
                    </p>

                    {/* 5. Annual Rent & 6. Service Charge */}
                    <div className="mt-4 pt-4 border-t border-border/70">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Annual Base Rent
                      </div>
                      <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono mt-0.5">
                        {l.price ? formatCurrency(Number(l.price) * 100) : '—'}
                        {l.pricePeriod && (
                          <span className="text-xs font-normal text-zinc-400 font-sans"> / {l.pricePeriod}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-300 bg-muted/70 px-2.5 py-1 rounded-lg border border-border/70">
                          Service: {l.serviceCharge != null ? `${formatNaira(Number(l.serviceCharge))} / yr` : 'Not stated'}
                        </span>
                      </div>
                    </div>

                    {/* 7. Property Specifications */}
                    <div className="grid grid-cols-3 gap-2 py-3.5 my-4 border-y border-border/70 text-xs font-medium text-zinc-300 bg-muted/20 rounded-xl px-3">
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-zinc-400" />
                        {l.bedrooms != null ? `${l.bedrooms} bd` : '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-zinc-400" />
                        {l.bathrooms != null ? `${l.bathrooms} ba` : '—'}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Maximize2 className="h-4 w-4 text-zinc-400" />
                        {l.sizeSqm ? `${l.sizeSqm} m²` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* 8. Primary Action & 9. Secondary Action */}
                  <div className="space-y-2.5 pt-2">
                    <Button asChild className="w-full h-11 rounded-xl text-sm font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
                      <Link href={hasSelection ? `/listings/${l.id}` : '/listings'}>
                        <ShieldCheck className="h-4 w-4" />
                        Start Secured Lease
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold border-border hover:bg-card flex items-center justify-center gap-1.5">
                      <Link href={hasSelection ? `/listings/${l.id}` : '/listings'}>
                        Schedule Inspection
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* P0: Side-By-Side Comparison Table */}
      {showcaseCount > 0 && !noResults && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-lg">
              {/* Table Top Header */}
              <div className="px-5 sm:px-7 py-4.5 border-b border-border bg-card/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {activeTab === 'all' ? 'Complete Multi-Dimension Comparison' : FILTER_TABS.find(t => t.id === activeTab)?.label}
                    </h2>
                    <p className="text-xs text-zinc-400">18 physical and financial data points benchmarked</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-zinc-300 border border-border">
                    {rowsToRender.length} rows evaluated
                  </span>
                </div>
              </div>

              {/* Scrollable Table Container */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm border-collapse" role="table" aria-label="Property comparison table">
                  <thead>
                    <tr className="border-b-2 border-border bg-card/95">
                      <th
                        scope="col"
                        className="text-left px-5 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 w-64 min-w-[200px] sticky left-0 z-20 bg-card/95 backdrop-blur-md border-r border-border"
                      >
                        Comparison Dimension
                      </th>
                      {showcase.map((l) => (
                        <th
                          key={l.id}
                          scope="col"
                          className="text-left px-6 py-4 text-sm font-bold text-foreground min-w-[240px] border-r border-border/60 last:border-r-0"
                        >
                          <div className="line-clamp-1">{l.title}</div>
                          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-[#4edea3] mt-0.5">
                            {l.price ? formatCurrency(Number(l.price) * 100) : '—'}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rowsToRender.length === 0 ? (
                      <tr>
                        <td colSpan={showcaseCount + 1} className="px-6 py-12 text-center text-sm text-zinc-400">
                          These properties are identical across every dimension in this view.
                        </td>
                      </tr>
                    ) : (
                      groupedSections.map(([sectionTitle, sectionRows]) => (
                        <React.Fragment key={sectionTitle}>
                          {/* Section Header Row */}
                          <tr className="bg-muted/40 border-y border-border">
                            <td
                              colSpan={showcaseCount + 1}
                              className="px-5 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4edea3] sticky left-0 z-10 bg-muted/60 backdrop-blur-md"
                            >
                              <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {sectionTitle}
                              </span>
                            </td>
                          </tr>

                          {/* Data Rows for this section */}
                          {sectionRows.map(({ row, values, differs }) => (
                            <tr
                              key={row.label}
                              className={`border-b border-border/70 transition-colors ${
                                highlightDiff && differs
                                  ? 'bg-amber-500/[0.08] dark:bg-amber-500/[0.14]'
                                  : 'hover:bg-muted/20'
                              }`}
                            >
                              <th
                                scope="row"
                                className={`px-5 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold text-zinc-300 sticky left-0 z-10 bg-card/95 backdrop-blur-md border-r border-border/60 ${
                                  highlightDiff && differs ? 'border-l-4 border-l-amber-500' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span>{row.label}</span>
                                  {differs && (
                                    <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">
                                      Diff
                                    </span>
                                  )}
                                </div>
                              </th>

                              {showcase.map((l, i) => (
                                <td
                                  key={l.id}
                                  className="px-6 py-3.5 text-sm text-foreground/90 font-medium leading-relaxed border-r border-border/40 last:border-r-0"
                                >
                                  {row.render ? row.render(l) : values[i]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* P1: Comparison Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="w-full h-11 px-5 rounded-xl text-sm font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/listings">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="text-base leading-none">＋</span>
                    Add Another Property
                  </span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-card gap-2 text-foreground"
                onClick={copyLink}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Comparison Link Copied!' : 'Copy Compare Link'}
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-card gap-2 text-foreground"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* P1: Independent Surveyor / Title Search CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-primary/20 bg-card shadow-xl flex flex-col items-start gap-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-[#4edea3] shrink-0">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Need an independent surveyor report or deed certification?
                </h3>
                <p className="mt-2 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                  Before committing, commission a registered surveyor to verify coordinates, map boundaries, or run a physical structural inspection.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-semibold text-emerald-600 dark:text-[#4edea3]">
                    <Check className="h-3.5 w-3.5" /> Licensed Surveyor
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-semibold text-emerald-600 dark:text-[#4edea3]">
                    <Check className="h-3.5 w-3.5" /> Land Registry Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border font-medium text-zinc-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 48-Hour Execution Guarantee
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Button asChild className="h-12 px-7 rounded-xl font-bold text-sm sm:text-base shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/verification">Request Title Search</Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl font-semibold text-sm sm:text-base border-border text-foreground hover:bg-card gap-2"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" /> Print this comparison
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
