'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, Scale, X, MapPin, Bed, Bath, Maximize2, ShieldCheck, Home } from 'lucide-react';

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

const MAX_COMPARE = 3;

function useCompareIds() {
  const sp = useSearchParams();
  const raw = sp.get('ids') || '';
  return React.useMemo(
    () => raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE),
    [raw]
  );
}

export default function ComparePage() {
  const router = useRouter();
  const ids = useCompareIds();
  const [listings, setListings] = React.useState<CompareListing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    return () => {
      cancelled = true;
    };
  }, [ids.join(',')]);

  function removeId(id: string) {
    const next = ids.filter((x) => x !== id);
    const qs = next.length ? `?ids=${encodeURIComponent(next.join(','))}` : '';
    router.push(`/compare${qs}`);
  }

  function clearAll() {
    router.push('/compare');
  }

  const rows: { label: string; get: (l: CompareListing) => React.ReactNode }[] = [
    { label: 'Price', get: (l) => (l.price ? formatCurrency(Number(l.price) * 100) + (l.pricePeriod ? ` / ${l.pricePeriod}` : '') : '—') },
    { label: 'Location', get: (l) => (l.area ? `${l.area}, ${l.state || ''}`.trim() : l.address || '—') },
    { label: 'Property type', get: (l) => l.propertyType || '—' },
    { label: 'Listing type', get: (l) => l.listingType || '—' },
    { label: 'Bedrooms', get: (l) => (l.bedrooms != null ? String(l.bedrooms) : '—') },
    { label: 'Bathrooms', get: (l) => (l.bathrooms != null ? String(l.bathrooms) : '—') },
    { label: 'Size', get: (l) => (l.sizeSqm ? `${l.sizeSqm} sqm` : '—') },
    { label: 'Verification', get: (l) => <StatusBadge status={l.verificationTier || 'basic'} /> },
    {
      label: 'Amenities',
      get: (l) => {
        const a = l.amenities;
        if (Array.isArray(a) && a.length) return a.slice(0, 6).join(', ');
        if (typeof a === 'string' && a) return a;
        return '—';
      },
    },
  ];

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 relative">
          <SectionLabel>Compare</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight text-white tracking-tight">Compare listings side by side</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Pick up to {MAX_COMPARE} properties from{' '}
            <Link href="/listings" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
              listings
            </Link>{' '}
            and see price, verification, and specs at a glance. Share the URL to send the comparison to anyone.
          </p>
          {ids.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-500">
                {ids.length} / {MAX_COMPARE} selected
              </span>
              <Button variant="outline" size="sm" onClick={clearAll} className="border-white/15 text-white hover:bg-white/10">
                Clear all
              </Button>
              <Link href="/listings" className="text-xs text-zinc-500 hover:text-white">
                Add from listings →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: ids.length || 2 }).map((_, i) => (
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
          ) : listings.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="No listings to compare"
              description="Go to listings, open any property, and tap Compare — or paste a compare link with ?ids=."
              action={
                <Button asChild>
                  <Link href="/listings">
                    Browse listings <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              {/* Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {listings.map((l) => (
                  <div key={l.id} className="glass-card overflow-hidden">
                    <div className="relative h-44 bg-zinc-900">
                      {l.coverImage || l.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.coverImage || l.images![0].url} alt={l.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-700">
                          <Home className="h-8 w-8" />
                        </div>
                      )}
                      <button
                        onClick={() => removeId(l.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-black"
                        aria-label="Remove from comparison"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2">
                        <StatusBadge status={l.verificationTier || 'basic'} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{l.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {l.area || l.address}
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">{l.price ? formatCurrency(Number(l.price) * 100) : '—'}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                        {l.bedrooms != null && (
                          <span className="inline-flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" /> {l.bedrooms} bd
                          </span>
                        )}
                        {l.bathrooms != null && (
                          <span className="inline-flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" /> {l.bathrooms} ba
                          </span>
                        )}
                        {l.sizeSqm && (
                          <span className="inline-flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5" /> {l.sizeSqm} sqm
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/listings/${l.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeId(l.id)} className="border-white/10">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="mt-8 glass-card overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">Side-by-side specs</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 w-36">Feature</th>
                        {listings.map((l) => (
                          <th key={l.id} className="text-left px-4 py-3 text-xs font-semibold text-white min-w-[180px]">
                            <span className="line-clamp-1">{l.title}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                          <td className="px-4 sm:px-6 py-3 text-xs font-medium text-zinc-500">{row.label}</td>
                          {listings.map((l) => (
                            <td key={l.id} className="px-4 py-3 text-sm text-zinc-300">
                              {row.get(l)}
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
                  className="text-zinc-400 hover:text-white"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard?.writeText(url);
                  }}
                >
                  Copy compare link
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
