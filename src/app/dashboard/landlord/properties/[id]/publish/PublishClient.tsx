'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Rocket, Eye, Building2, MapPin, Home, Bath, Bed, Car, Ruler, Zap, Wifi, Waves, Dumbbell, Shield, Lock, Sun, Images, FileText, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ListingData = {
  id: string;
  title: string;
  description: string | null;
  listingType: string;
  propertyType: string | null;
  address: string;
  area: string;
  state: string;
  price: number;
  pricePeriod: string | null;
  cautionDeposit: number | null;
  serviceCharge: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  parkingSpaces: number;
  amenities: string[];
  availableFrom: string | null;
  status: string;
  images: { url: string }[];
};

export default function PublishClient({ listing }: { listing: ListingData }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (!res.ok) throw new Error('Failed to publish');
      router.push(`/dashboard/landlord/listing/${listing.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/landlord" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link href="/dashboard/landlord/properties" className="hover:text-emerald-600">Properties</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-white font-semibold truncate">{listing.title}</span>
        <span>/</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Publish</span>
      </nav>

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-white bg-emerald-600 text-xs tracking-widest uppercase font-bold">Marketplace Syndication</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Propati Node</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Publish Listing — {listing.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Review listing specifications, leasable units, statutory terms, and media before activating live syndication.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye size={16} /> Preview Listing
          </Button>
          <Button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Rocket size={16} /> {publishing ? 'Publishing...' : 'Publish to Marketplace'}
          </Button>
        </div>
      </header>

      {/* Status ribbon */}
      <div className="flex items-center flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Draft (Ready to Syndicate)
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle2 size={14} /> CAC Verified
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
          <FileText size={14} /> LASRERA Active 2024
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Core Listing Specifications */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">1. Core Listing Specifications</h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Public identity visible to institutional tenants</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">REQUIRED</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-white">Listing Title</label>
                <input className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" defaultValue={listing.title} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-white">Syndicated Description</label>
                <textarea className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" rows={4} defaultValue={listing.description || ''} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Type</div>
                  <div className="text-sm text-zinc-900 dark:text-white mt-1">{listing.listingType}</div>
                </div>
                <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Property Type</div>
                  <div className="text-sm text-zinc-900 dark:text-white mt-1">{listing.propertyType?.replace(/_/g, ' ') || '—'}</div>
                </div>
                <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Status</div>
                  <div className="text-sm text-zinc-900 dark:text-white mt-1">{listing.status}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Commercial Terms & Pricing Structure */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">2. Commercial Terms &amp; Pricing Structure</h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Baseline leasable rates and statutory terms</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 rounded">LAGOS TENANCY ACT 2011</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Base Lease Rate</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">₦{listing.price.toLocaleString()}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">{listing.pricePeriod || 'per year'}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Caution Deposit</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{listing.cautionDeposit ? `₦${listing.cautionDeposit.toLocaleString()}` : '—'}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Service Charge</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{listing.serviceCharge ? `₦${listing.serviceCharge.toLocaleString()}` : '—'}</div>
              </div>
            </div>
            {listing.availableFrom && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Commencement / Availability: {listing.availableFrom}</div>
            )}
          </section>

          {/* Section 3: Building Infrastructure & Certified Amenities */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">3. Building Infrastructure &amp; Certified Amenities</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Tier-1 certified amenities.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.length === 0 && <span className="text-sm text-zinc-600 dark:text-zinc-400">No amenities listed.</span>}
              {listing.amenities.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white font-medium">{a}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3"><div className="text-xs text-zinc-600 dark:text-zinc-400">Bedrooms</div><div className="text-lg font-bold text-zinc-900 dark:text-white">{listing.bedrooms ?? '—'}</div></div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3"><div className="text-xs text-zinc-600 dark:text-zinc-400">Bathrooms</div><div className="text-lg font-bold text-zinc-900 dark:text-white">{listing.bathrooms ?? '—'}</div></div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3"><div className="text-xs text-zinc-600 dark:text-zinc-400">Floors</div><div className="text-lg font-bold text-zinc-900 dark:text-white">{listing.floors ?? '—'}</div></div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3"><div className="text-xs text-zinc-600 dark:text-zinc-400">Parking</div><div className="text-lg font-bold text-zinc-900 dark:text-white">{listing.parkingSpaces}</div></div>
            </div>
          </section>

          {/* Section 4: Visual Portfolio & Verified Photography */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Images size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">4. Visual Portfolio &amp; Verified Photography</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Verified photography assets.</p>
              </div>
            </div>
            {listing.images.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No images uploaded.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.images.map((img, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08]">
                    <img src={img.url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Statutory Compliance & LASRERA Legal Declaration */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">5. Statutory Compliance &amp; LASRERA Legal Declaration</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Legal declaration before publishing.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>CAC registration verified (RC-1849204).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>LASRERA registration active for 2024.</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>By publishing you confirm all information is accurate and legally binding.</span>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white">
              <input type="checkbox" className="rounded" />
              I declare the above is accurate and authorize syndication.
            </label>
          </section>
        </div>

        {/* Right sticky summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-5 space-y-3">
            <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Listing Summary</div>
            <div className="text-sm text-zinc-900 dark:text-white font-semibold">{listing.title}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{listing.address}, {listing.area}</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white">₦{listing.price.toLocaleString()}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{listing.images.length} photo(s) · {listing.amenities.length} amenities</div>
          </div>
        </aside>
      </div>
    </div>
  );
}