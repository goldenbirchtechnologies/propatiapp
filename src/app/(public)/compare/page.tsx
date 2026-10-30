'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowRight, Scale, X, MapPin, Bed, Bath, Maximize2, ShieldCheck, Home,
  Award, Landmark, Shield, DollarSign, Zap, Droplets, FileText, Gavel, Key, Copy, Check, Printer,
} from 'lucide-react';

type CompareListing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  price: number | string;
  pricePeriod?: string | null;
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

const MAX_COMPARE = 4;

function useCompareIds() {
  const sp = useSearchParams();
  const raw = sp.get('ids') || '';
  return React.useMemo(
    () => raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE),
    [raw]
  );
}

// Demo institutional showcase — shown when no ids selected (Stitch)
const DEMO_SHOWCASE = [
  {
    id: 'demo-alton',
    title: 'The Alton Residence',
    area: 'Admiralty Way, Lekki Phase 1, Lagos',
    price: 14000000, pricePeriod: 'year',
    serviceCharge: 2500000,
    badge: 'Gold Verified', badgeDetail: 'RC: 148902',
    status: 'Serviced Residential · Ready Now',
    bedrooms: 3, bathrooms: 3.5, sizeSqm: 240,
    verificationTier: 'cuh-certified',
    coverImage: null,
  },
  {
    id: 'demo-parkview',
    title: 'Parkview Executive Heights',
    area: 'Gerrard Road, Ikoyi, Lagos',
    price: 32000000, pricePeriod: 'year',
    serviceCharge: 4800000,
    badge: 'Diamond Verified', badgeDetail: 'RC: 994201',
    status: 'Prime Penthouse · Avail. 1st Prox.',
    bedrooms: 4, bathrooms: 4.5, sizeSqm: 480,
    verificationTier: 'Diamond Verified',
    coverImage: null,
  },
  {
    id: 'demo-maitama',
    title: 'Maitama Diplomatic Villa',
    area: 'Amazon Street, Maitama, Abuja FCT',
    price: 45000000, pricePeriod: 'year',
    serviceCharge: null,
    badge: 'Diamond Verified', badgeDetail: 'RC: 304190',
    status: 'Diplomatic Duplex · Immediate',
    bedrooms: 5, bathrooms: 6, sizeSqm: 850,
    verificationTier: 'Diamond Verified',
    coverImage: null,
  },
] as const;

type FilterTab = 'all' | 'financials' | 'legal' | 'physical' | 'tenancy';
const FILTER_TABS: { id: FilterTab; label: string; count?: string }[] = [
  { id: 'all', label: 'All Dimensions', count: '18' },
  { id: 'financials', label: 'Financials & Escrow' },
  { id: 'legal', label: 'Legal & Title Diligence' },
  { id: 'physical', label: 'Physical Specs & Power' },
  { id: 'tenancy', label: 'Tenancy Covenants' },
];

export default function ComparePage() {
  const router = useRouter();
  const ids = useCompareIds();
  const [listings, setListings] = React.useState<CompareListing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [highlightDiff, setHighlightDiff] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const hasSelection = ids.length > 0;

  React.useEffect(() => {
    if (ids.length === 0) {
      setListings([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/listings?ids=${encodeURIComponent(ids.join(','))}`)
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
  }, [ids.join(',')]);

  function removeId(id: string) {
    const next = ids.filter((x) => x !== id);
    const qs = next.length ? `?ids=${encodeURIComponent(next.join(','))}` : '';
    router.push(`/compare${qs}`);
  }
  function clearAll() { router.push('/compare'); }

  const showcase: CompareListing[] = hasSelection ? listings : (DEMO_SHOWCASE as unknown as CompareListing[]);
  const showcaseCount = showcase.length;

  // Filtered spec rows per Stitch tabs
  const allRows: { label: string; tab: FilterTab; get: (l: CompareListing) => React.ReactNode }[] = [
    // Financials
    { label: 'Annual Base Rent', tab: 'financials', get: (l) => (l.price ? formatCurrency(Number(l.price) * 100) + (l.pricePeriod ? ` / ${l.pricePeriod}` : '') : '—') },
    { label: 'Service Charge', tab: 'financials', get: () => '₦2.5M – ₦4.8M / yr (or Self-Serviced Cadre)' },
    { label: 'Stamp Duty (CAP S8 0.78%)', tab: 'financials', get: (l) => (l.price ? `≈ ${formatCurrency(Math.max(Number(l.price) * 0.0078 * 100, 50000))}` : '—') },
    { label: 'Caution / Escrow', tab: 'financials', get: () => 'CBN Trustee Protected — 14-Day bilateral handover' },
    // Legal & Title
    { label: 'Verification', tab: 'legal', get: (l) => <StatusBadge status={(l.verificationTier as string) || 'basic'} /> },
    { label: 'C of O / CAC', tab: 'legal', get: () => 'LASRERA & AGIS Cadastral Validated' },
    { label: 'Governor\'s Consent', tab: 'legal', get: () => 'Registered / Electronic RRR' },
    // Physical
    { label: 'Bedrooms', tab: 'physical', get: (l) => (l.bedrooms != null ? String(l.bedrooms) : '—') },
    { label: 'Bathrooms', tab: 'physical', get: (l) => (l.bathrooms != null ? String(l.bathrooms) : '—') },
    { label: 'Size', tab: 'physical', get: (l) => (l.sizeSqm ? `${l.sizeSqm} sqm` : '—') },
    { label: 'Power', tab: 'physical', get: () => 'Gas Turbine / Dual Gensets / Solar Hybrid' },
    { label: 'Water & Waste', tab: 'physical', get: () => 'Industrial RO / Deep Borehole + UV' },
    // Tenancy
    { label: 'Notice to Quit', tab: 'tenancy', get: () => '6 Months — Lagos Law 2011 §13 / FCT Recovery Act' },
    { label: 'Handover Protocol', tab: 'tenancy', get: () => '14-Day Bilateral Digital Audit' },
    { label: 'Subletting', tab: 'tenancy', get: () => 'Prohibited (Single Family) / Executive Rotation Allowed' },
    { label: 'Escrow Trigger', tab: 'tenancy', get: () => 'Bilateral Electronic Key Sign-off' },
    // Generic fallback (show in All)
    { label: 'Location', tab: 'all', get: (l) => (l.area ? `${l.area}, ${l.state || ''}`.trim() : l.address || '—') },
    { label: 'Property type', tab: 'all', get: (l) => l.propertyType || '—' },
  ];

  const rows = activeTab === 'all' ? allRows : allRows.filter(r => r.tab === activeTab || r.tab === 'all');

  const showEmpty = !hasSelection && showcaseCount === 0;

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span className="text-zinc-600">›</span>
        <Link href="/listings" className="hover:text-zinc-300">Properties</Link>
        <span className="text-zinc-600">›</span>
        <span className="text-zinc-300">Compare Properties</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 relative">
          <SectionLabel>Multi-property due diligence matrix</SectionLabel>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-white tracking-tight">Compare Properties Side by Side</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Evaluate verified institutional assets across statutory title standing (C&nbsp;of&nbsp;O & Governor&apos;s Consent), CBN-regulated escrow custody, physical coordinate surveys, service charge clarity, and lease enforceability.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/listings"><span className="inline-flex items-center gap-1.5"><span className="text-lg leading-none">＋</span> Add Property</span></Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white hover:bg-white/10 gap-1.5"
              onClick={() => { const url = typeof window !== 'undefined' ? window.location.href : ''; navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Export Dossier (PDF)'}
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
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Award, label: 'Statutory Audits', value: '100%', badge: 'C of O & CAC Registry Verified' },
              { icon: Landmark, label: 'Escrow Liquidity Backed', value: '₦12.4B+ CBN Trustee', badge: 'Custodian Escrow' },
              { icon: ShieldCheck, label: 'Active On-Ground Surveyors', value: '18 States NIESV Cadre', badge: 'Verified' },
              { icon: Shield, label: 'Caution Disputes', value: '0', badge: '14-Day Disgorgement SLA' },
            ].map((m) => (
              <div key={m.label} className="glass-card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight">{m.value}</p>
                  <p className="text-xs text-zinc-500 truncate">{m.label}</p>
                  <p className="text-[11px] text-emerald-400">{m.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter tabs + highlight toggle */}
      <section className="py-4 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTab === t.id ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/[0.06] text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/20'}`}
              >
                {t.label} {t.count ? `(${t.count})` : ''}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" checked={highlightDiff} onChange={(e) => setHighlightDiff(e.target.checked)} className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500/30" />
            Highlight Differences Only
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.06] text-[11px] text-zinc-500">
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
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Evaluation Set</p>
              <h2 className="text-lg font-bold text-white">Multi-Asset Benchmarking</h2>
              <p className="text-xs text-zinc-500">Direct legal parity, institutional lease verification, and escrow liquidity guarantees. Audit Date: October 2024</p>
            </div>
            {!hasSelection && <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-zinc-500">Demo showcase — add <Link href="/listings" className="text-emerald-400 hover:text-emerald-300">listings</Link> via ?ids=</span>}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: ids.length || 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-40 rounded-lg bg-white/[0.04] mb-4" />
                  <div className="h-4 w-3/4 bg-white/[0.04] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <Button asChild variant="outline" className="mt-4 border-white/15 text-white hover:bg-white/10">
                <Link href="/listings">Browse listings</Link>
              </Button>
            </div>
          ) : showEmpty ? (
            <EmptyState
              icon={Scale}
              title="No listings to compare"
              description="Go to listings, open any property, and tap Compare — or paste a compare link with ?ids=."
              action={<Button asChild><Link href="/listings">Browse listings <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {showcase.map((l: any) => (
                <div key={l.id} className="glass-card overflow-hidden flex flex-col">
                  <div className="px-4 pt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <Award className="h-3.5 w-3.5" /> {l.badge || (l.verificationTier || 'Verified')}
                    </span>
                    <span className="text-[11px] text-zinc-500">{l.badgeDetail || ''}</span>
                  </div>
                  <div className="px-4 pt-2 pb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{l.status || l.listingType || 'Residential'}</p>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{l.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {l.area || l.address}
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {l.price ? formatCurrency(Number(l.price) * 100) : '—'} {l.pricePeriod ? <span className="text-xs font-normal text-zinc-500">/ {l.pricePeriod}</span> : null}
                      {l.serviceCharge != null && <span className="block text-xs font-normal text-zinc-500">Service: {formatCurrency(Number(l.serviceCharge) * 100)} / yr</span>}
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
                    <Button variant="outline" size="sm" className="border-white/10 text-xs" asChild>
                      <Link href={hasSelection ? `/listings/${l.id}` : '/listings'}>Schedule Inspection</Link>
                    </Button>
                    {hasSelection && (
                      <button onClick={() => removeId(l.id)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 shrink-0" aria-label="Remove">
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
      {showcaseCount > 0 && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="glass-card overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">
                  {activeTab === 'all' ? 'Side-by-side specs' : FILTER_TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <span className="ml-auto text-xs text-zinc-500">{rows.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 w-48">Feature</th>
                      {showcase.map((l: any) => (
                        <th key={l.id} className="text-left px-4 py-3 text-xs font-semibold text-white min-w-[180px]">
                          <span className="line-clamp-1">{l.title}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className={`border-b border-white/[0.04] last:border-0 ${highlightDiff ? 'has-[.diff]:bg-amber-500/5' : ''}`}>
                        <td className="px-4 sm:px-6 py-3 text-xs font-medium text-zinc-500">{row.label}</td>
                        {showcase.map((l: any) => (
                          <td key={l.id} className="px-4 py-3 text-sm text-zinc-300">
                            <span className={highlightDiff ? 'diff' : ''}>{row.get(l)}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
                <Link href="/listings">Add another</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white gap-1.5"
                onClick={() => { const url = typeof window !== 'undefined' ? window.location.href : ''; navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Link copied' : 'Copy compare link'}
              </Button>
              <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 gap-1.5" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print dossier
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Need an independent surveyor report or deed certification?</h3>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed max-w-2xl">
                  Before committing significant institutional capital, commission a registered NIESV fellow to perform coordinate verification, boundary beacon mapping, or physical structural testing.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Check className="h-3 w-3" /> LASRERA Accredited</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Check className="h-3 w-3" /> AGIS Cadastral Validated</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-zinc-400"><ShieldCheck className="h-3 w-3" /> 48-Hour Execution Guarantee</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button asChild>
                <Link href="/verification">Request Title Search</Link>
              </Button>
              <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 gap-1.5">
                <Printer className="h-3.5 w-3.5" /> Download Spec Sheet (PDF)
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
