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
  Award, Landmark, Shield, Copy, Check, Printer,
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

// Demo institutional showcase — shown when no ids selected (Stitch)
const DEMO_SHOWCASE: CompareListing[] = [
  {
    id: 'demo-alton',
    title: 'The Alton Residence',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    area: 'Admiralty Way, Lekki Phase 1',
    state: 'Lagos',
    price: 14000000, pricePeriod: 'year',
    serviceCharge: 2500000,
    propertyType: 'Detached Duplex',
    listingType: 'Serviced Residential · Ready Now',
    bedrooms: 3, bathrooms: 3.5, sizeSqm: 240,
    verificationTier: 'cuh-certified',
    coverImage: null,
  },
  {
    id: 'demo-parkview',
    title: 'Parkview Executive Heights',
    address: 'Gerrard Road, Ikoyi, Lagos',
    area: 'Gerrard Road, Ikoyi',
    state: 'Lagos',
    price: 32000000, pricePeriod: 'year',
    serviceCharge: 4800000,
    propertyType: 'Penthouse',
    listingType: 'Diamond Verified',
    bedrooms: 4, bathrooms: 4.5, sizeSqm: 480,
    verificationTier: 'Diamond Verified',
    coverImage: null,
  },
  {
    id: 'demo-maitama',
    title: 'Maitama Diplomatic Villa',
    address: 'Amazon Street, Maitama, Abuja FCT',
    area: 'Amazon Street, Maitama',
    state: 'FCT',
    price: 45000000, pricePeriod: 'year',
    serviceCharge: null,
    propertyType: 'Detached Villa',
    listingType: 'Diplomatic Duplex · Immediate',
    bedrooms: 5, bathrooms: 6, sizeSqm: 850,
    verificationTier: 'Diamond Verified',
    coverImage: null,
  },
];

type FilterTab = 'all' | 'financials' | 'legal' | 'physical' | 'tenancy';
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Dimensions' },
  { id: 'financials', label: 'Financials & Escrow' },
  { id: 'legal', label: 'Legal & Title Diligence' },
  { id: 'physical', label: 'Physical Specs & Power' },
  { id: 'tenancy', label: 'Tenancy Covenants' },
];

/** A spec row. `text` is the canonical value used for difference detection;
 *  `render` overrides how it is displayed when the value needs markup. */
type SpecRow = {
  label: string;
  // 'generic' rows only appear under "All Dimensions".
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
  // useSearchParams() must sit inside a Suspense boundary or the whole route
  // opts out of static rendering at build time.
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
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-40 rounded-lg bg-card mb-4" />
              <div className="h-4 w-3/4 bg-card rounded mb-2" />
              <div className="h-3 w-1/2 bg-card rounded" />
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard writes are rejected on insecure origins and without
      // permission — fall back to a prompt rather than claiming success.
      window.prompt('Copy this comparison link:', url);
    }
  }

  const showcase: CompareListing[] = hasSelection ? listings : DEMO_SHOWCASE;
  const showcaseCount = showcase.length;

  // No ids in the URL at all — nothing was ever selected.
  const noSelection = !hasSelection;
  // Ids were given but none resolved (deleted, unlisted, or a stale link).
  const noResults = hasSelection && !loading && !error && listings.length === 0;

  const allRows: SpecRow[] = [
    // Financials
    {
      label: 'Annual Base Rent',
      tab: 'financials',
      text: (l) => (l.price ? formatCurrency(Number(l.price) * 100) : '—'),
      render: (l) => (l.price
        ? <>{formatCurrency(Number(l.price) * 100)}{l.pricePeriod ? <span className="text-zinc-500"> / {l.pricePeriod}</span> : null}</>
        : '—'),
    },
    {
      label: 'Service Charge',
      tab: 'financials',
      text: (l) => (l.serviceCharge != null ? `${formatNaira(Number(l.serviceCharge))} / yr` : 'Not stated'),
    },
    {
      label: 'Stamp Duty (CAP S8, 0.78%)',
      tab: 'financials',
      text: (l) => {
        const annualRent = Number(l.price);
        if (!annualRent) return '—';
        const duty = calculateStampDuty(annualRent);
        return duty === 0 ? 'Nil (below ₦10,000)' : `≈ ${formatNaira(duty)}`;
      },
    },
    { label: 'Caution / Escrow', tab: 'financials', text: () => 'CBN Trustee Protected — 14-Day bilateral handover' },
    // Legal & Title
    {
      label: 'Verification',
      tab: 'legal',
      text: (l) => verificationLabel(l.verificationTier),
      render: (l) => {
        const label = verificationLabel(l.verificationTier);
        const badge = (
          <StatusBadge status={l.verificationTier ? 'Verified' : 'Pending'}>{label}</StatusBadge>
        );
        return hasSelection
          ? <Link href={`/listings/${l.id}`} className="hover:underline">{badge}</Link>
          : badge;
      },
    },
    { label: 'C of O / Governor’s Consent', tab: 'legal', text: () => 'LASRERA & AGIS Cadastral Validated' },
    { label: 'Title Registration', tab: 'legal', text: () => 'Registered / Electronic RRR' },
    // Physical
    { label: 'Bedrooms', tab: 'physical', text: (l) => (l.bedrooms != null ? String(l.bedrooms) : '—') },
    { label: 'Bathrooms', tab: 'physical', text: (l) => (l.bathrooms != null ? String(l.bathrooms) : '—') },
    { label: 'Size', tab: 'physical', text: (l) => (l.sizeSqm ? `${l.sizeSqm} sqm` : '—') },
    { label: 'Power', tab: 'physical', text: () => 'Gas Turbine / Dual Gensets / Solar Hybrid' },
    { label: 'Water & Waste', tab: 'physical', text: () => 'Industrial RO / Deep Borehole + UV' },
    // Tenancy
    { label: 'Notice to Quit', tab: 'tenancy', text: () => '6 Months — Lagos Law 2011 §13 / FCT Recovery Act' },
    { label: 'Handover Protocol', tab: 'tenancy', text: () => '14-Day Bilateral Digital Audit' },
    { label: 'Subletting', tab: 'tenancy', text: () => 'Prohibited (Single Family) / Executive Rotation Allowed' },
    { label: 'Escrow Trigger', tab: 'tenancy', text: () => 'Bilateral Electronic Key Sign-off' },
    // Generic — only shown under "All Dimensions"
    {
      label: 'Location',
      tab: 'generic',
      text: (l) => {
        const parts = [l.area || l.address, l.state].filter(Boolean) as string[];
        return parts.length ? parts.join(', ') : '—';
      },
    },
    {
      label: 'Property type',
      tab: 'generic',
      text: (l) => (l.propertyType ? humanise(l.propertyType) : '—'),
    },
  ];

  const tabCounts: Record<string, number> = { all: allRows.length };
  for (const row of allRows) {
    if (row.tab === 'generic') continue;
    tabCounts[row.tab] = (tabCounts[row.tab] || 0) + 1;
  }
  // Generic rows are part of "All Dimensions" but not of any category tab.
  tabCounts.all = allRows.length;

  const rows = activeTab === 'all' ? allRows : allRows.filter((r) => r.tab === activeTab);

  const evaluated = rows.map((row) => {
    const values = showcase.map((l) => row.text(l));
    return { row, values, differs: new Set(values).size > 1 };
  });
  // "Highlight differences ONLY" — when on, rows that agree are dropped.
  const rowsToRender = highlightDiff ? evaluated.filter((e) => e.differs) : evaluated;

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span className="text-muted-foreground">›</span>
        <Link href="/listings" className="hover:text-zinc-300">Properties</Link>
        <span className="text-muted-foreground">›</span>
        <span className="text-zinc-300">Compare Properties</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0, 108, 73,0.10),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 relative">
          <SectionLabel>Multi-property due diligence matrix</SectionLabel>
          {/* The hero paints its own black gradient regardless of theme, so its
              text must be explicitly light — text-foreground is dark in the
              light theme and would vanish against this surface. */}
          <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-white tracking-tight">Compare Properties Side by Side</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Evaluate verified institutional assets across statutory title standing (C&nbsp;of&nbsp;O & Governor&apos;s Consent), CBN-regulated escrow custody, physical coordinate surveys, service charge clarity, and lease enforceability.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/listings"><span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-lg leading-none">＋</span> Add Property</span></Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </Button>
            {hasSelection && (
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={clearAll}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear Comparison
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Award, label: 'Statutory Audits', value: '100%', badge: 'C of O & CAC Registry Verified' },
              { icon: Landmark, label: 'Escrow Liquidity Backed', value: '₦12.4B+ CBN Trustee', badge: 'Custodian Escrow' },
              { icon: ShieldCheck, label: 'Active On-Ground Surveyors', value: '18 States NIESV Cadre', badge: 'Verified' },
              { icon: Shield, label: 'Caution Disputes', value: '0', badge: '14-Day Disgorgement SLA' },
            ].map((m) => (
              <div key={m.label} className="glass-card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[#4edea3] shrink-0">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">{m.value}</p>
                  <p className="text-xs text-zinc-500 truncate">{m.label}</p>
                  <p className="text-[11px] text-[#4edea3]">{m.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter tabs + highlight toggle */}
      <section className="py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter comparison dimensions">
            {FILTER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                aria-pressed={activeTab === t.id}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === t.id ? 'bg-primary text-black border-primary' : 'bg-card text-zinc-400 border-border hover:text-foreground hover:border-border'}`}
              >
                {t.label} ({tabCounts[t.id] ?? 0})
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" checked={highlightDiff} onChange={(e) => setHighlightDiff(e.target.checked)} className="rounded border-border bg-transparent text-primary focus:ring-primary/30" />
            Highlight differences only
            <span className="ml-2 px-2 py-0.5 rounded-full bg-card border border-border text-[11px] text-zinc-500">
              Comparing {showcaseCount} of {MAX_COMPARE} Maximum
            </span>
          </label>
        </div>
      </section>

      {/* Evaluation cards */}
      <section className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">Evaluation Set</p>
              <h2 className="text-lg font-bold text-foreground">Multi-Asset Benchmarking</h2>
              <p className="text-xs text-zinc-500">Direct legal parity, institutional lease verification, and escrow liquidity guarantees. Audit Date: October 2024</p>
            </div>
            {noSelection && <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">Demo showcase — add <Link href="/listings" className="text-[#4edea3] hover:text-[#6ffbbe]">listings</Link> via ?ids=</span>}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: ids.length || 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-40 rounded-lg bg-card mb-4" />
                  <div className="h-4 w-3/4 bg-card rounded mb-2" />
                  <div className="h-3 w-1/2 bg-card rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <Button asChild variant="outline" className="mt-4 border-border text-foreground hover:bg-card">
                <Link href="/listings">Browse listings</Link>
              </Button>
            </div>
          ) : noResults ? (
            <EmptyState
              icon={Scale}
              title="None of these listings could be found"
              description="They may have been unlisted, or the link may be out of date."
              action={<Button onClick={clearAll}>Start a new comparison <ArrowRight className="ml-2 h-4 w-4" /></Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {showcase.map((l) => (
                <div key={l.id} className="glass-card overflow-hidden flex flex-col">
                  <div className="px-4 pt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <Award className="h-3.5 w-3.5" /> {verificationLabel(l.verificationTier)}
                    </span>
                  </div>
                  <div className="px-4 pt-2 pb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{l.listingType || 'Residential'}</p>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{l.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {l.area || l.address}
                    </p>
                    <p className="mt-2 text-sm font-bold text-foreground">
                      {l.price ? formatCurrency(Number(l.price) * 100) : '—'} {l.pricePeriod ? <span className="text-xs font-normal text-zinc-500">/ {l.pricePeriod}</span> : null}
                      {l.serviceCharge != null && <span className="block text-xs font-normal text-zinc-500">Service: {formatNaira(Number(l.serviceCharge))} / yr</span>}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                      {l.bedrooms != null && <span className="inline-flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {l.bedrooms} bd</span>}
                      {l.bathrooms != null && <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {l.bathrooms} ba</span>}
                      {l.sizeSqm && <span className="inline-flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" /> {l.sizeSqm} sqm</span>}
                    </div>
                  </div>
                  <div className="mt-auto px-4 pb-4 flex gap-2">
                    <Button asChild size="sm" className="flex-1 gap-1.5">
                      <Link href={hasSelection ? `/listings/${l.id}` : '/listings'}><ShieldCheck className="h-3.5 w-3.5" /> Initiate Escrow Lease</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="border-border text-xs" asChild>
                      <Link href={hasSelection ? `/listings/${l.id}` : '/listings'}>Schedule Inspection</Link>
                    </Button>
                    {hasSelection && (
                      <button
                        onClick={() => removeId(l.id)}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-zinc-500 hover:text-foreground hover:border-border shrink-0"
                        aria-label={`Remove ${l.title} from comparison`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison matrix — tab-filtered */}
      {showcaseCount > 0 && !noResults && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="glass-card overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#4edea3]" />
                <h2 className="text-sm font-semibold text-foreground">
                  {activeTab === 'all' ? 'Side-by-side specs' : FILTER_TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <span className="ml-auto text-xs text-zinc-500">{rowsToRender.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th scope="col" className="text-left px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 w-48">
                        Feature
                      </th>
                      {showcase.map((l) => (
                        <th key={l.id} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-foreground min-w-[180px]">
                          <span className="line-clamp-1">{l.title}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowsToRender.length === 0 ? (
                      <tr>
                        <td colSpan={showcaseCount + 1} className="px-4 sm:px-6 py-8 text-center text-xs text-zinc-500">
                          These properties are identical across every dimension in this view.
                        </td>
                      </tr>
                    ) : rowsToRender.map(({ row, values, differs }) => (
                      <tr key={row.label} className="border-b border-border last:border-0">
                        <th scope="row" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500">
                          {row.label}
                        </th>
                        {showcase.map((l, i) => (
                          <td
                            key={l.id}
                            className={`px-4 py-3 text-sm text-zinc-300 ${highlightDiff && differs ? 'bg-amber-500/5' : ''}`}
                          >
                            {row.render ? row.render(l) : values[i]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-border text-foreground hover:bg-card">
                <Link href="/listings">Add another</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-foreground gap-1.5"
                onClick={copyLink}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Link copied' : 'Copy compare link'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[#4edea3] shrink-0">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Need an independent surveyor report or deed certification?</h3>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed max-w-2xl">
                  Before committing significant institutional capital, commission a registered NIESV fellow to perform coordinate verification, boundary beacon mapping, or physical structural testing.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[#4edea3]"><Check className="h-3 w-3" /> LASRERA Accredited</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[#4edea3]"><Check className="h-3 w-3" /> AGIS Cadastral Validated</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-zinc-400"><ShieldCheck className="h-3 w-3" /> 48-Hour Execution Guarantee</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button asChild>
                <Link href="/verification">Request Title Search</Link>
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-card gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" /> Print this comparison
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
