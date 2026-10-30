'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, MapPin, Ruler, CreditCard, Zap, Wifi, Waves, Dumbbell, Shield, Car, Building, Sun, Images, Save, X,
} from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  status: string;
  listingType: string;
  propertyType: string;
  price: number;
  pricePeriod: string;
  allowShortlet: boolean;
  amenities: string[];
  description: string;
  viewsCount: number;
  createdAt: string;
  verification: { id: string; overallStatus: string; currentLayer: number; l1Status: string; l2Status: string; l3Status: string; l4Status: string; l5Status: string } | null;
  images: { id: string; url: string; isCover: boolean }[];
  units: {
    id: string; unitNumber: string; type: string; listingType: string; pricePeriod: string | null; rent: number;
    cautionDeposit: number | null; serviceCharge: number | null; status: string; occupancy: string; isListed: boolean;
    bedrooms: number; bathrooms: number; sizeSqm: number | null;
  }[];
};

export default function PropertyEditClient({ listing, userId }: { listing: Listing; userId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description || '',
    address: listing.address,
    area: listing.area,
    state: listing.state,
    baseRent: listing.price,
    amenities: listing.amenities || [],
  });

  const updateField = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAmenity = (id: string) => setForm((prev) => ({
    ...prev,
    amenities: prev.amenities.includes(id) ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          address: form.address,
          area: form.area,
          state: form.state,
          price: form.baseRent,
          amenities: form.amenities,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save property');
      }
      toast.success('Property updated', { description: 'Your changes have been saved.' });
      router.push(`/dashboard/landlord/properties/${listing.id}`);
    } catch (error) {
      toast.error('Save failed', { description: error instanceof Error ? error.message : 'Unexpected error' });
    } finally {
      setSaving(false);
    }
  };

  const amenityOptions = [
    { id: 'power', label: '24/7 Dedicated Power', icon: Zap },
    { id: 'wifi', label: 'High-Speed Fiber Grid', icon: Wifi },
    { id: 'pool', label: 'Olympic Infinity Pool', icon: Waves },
    { id: 'security', label: 'Armed Patrol & Biometrics', icon: Shield },
    { id: 'gym', label: 'Technogym Fitness Studio', icon: Dumbbell },
    { id: 'parking', label: 'Dedicated Parking', icon: Car },
    { id: 'elevator', label: 'KONE High-Speed Elevators', icon: Building },
    { id: 'water', label: 'Industrial Reverse Osmosis', icon: Sun },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/dashboard/landlord" className="hover:text-primary">Portfolio</Link>
            <span>/</span>
            <Link href="/dashboard/landlord/properties" className="hover:text-primary">Properties</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">{listing.title}</span>
            <span>/</span>
            <span className="text-primary dark:text-[#4edea3] font-bold">Edit</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">Asset Ref: {listing.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] font-semibold">{listing.status}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Edit Property — {listing.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.04] flex items-center gap-2">
            <X size={16} /> Discard
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-primary hover:bg-[var(--sovereign-hover)] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Section 1: Property Details */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white"><Building2 size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Property Details</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Core descriptive metadata and geographical location.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3 space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Title of Real Estate Asset *</label>
              <input className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
            </div>
            <div className="lg:col-span-3 space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Executive Institutional Summary *</label>
              <textarea className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm resize-y" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Registered Plot &amp; Street Address *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-2.5 text-zinc-500 dark:text-zinc-400" />
                <input className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Area / Neighborhood</label>
              <input className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" value={form.area} onChange={(e) => updateField('area', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">State Jurisdiction</label>
              <input className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" value={form.state} onChange={(e) => updateField('state', e.target.value)} />
            </div>
          </div>
        </section>

        {/* Section 2: Property Specs & Engineering Dimensions */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white"><Ruler size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Property Specs &amp; Engineering Dimensions</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Architectural classification and spatial allocation.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Asset Classification</label>
              <select className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm">
                <option>Grade-A Institutional Commercial</option>
                <option>Residential High-Rise Block</option>
                <option>Mixed-Use Asset</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Listing Instrument</label>
              <select className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm">
                <option>Institutional Commercial Lease</option>
                <option>Residential Tenancy</option>
                <option>Freehold Sale</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Year Built</label>
              <input className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm" defaultValue="2021" />
            </div>
          </div>
        </section>

        {/* Section 3: Pricing & Financial Structure */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white"><CreditCard size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pricing &amp; Financial Structure</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Lease economics and escrow requirements.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Base Lease Rate (₦)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-mono" value={form.baseRent} onChange={(e) => updateField('baseRent', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Caution Deposit (₦)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-mono" defaultValue={listing.units[0]?.cautionDeposit ?? 0} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Service Charge (₦)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-mono" defaultValue={listing.units[0]?.serviceCharge ?? 0} />
            </div>
          </div>
        </section>

        {/* Section 4: Amenities & Certified Building Infrastructure */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white"><Shield size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Amenities &amp; Certified Building Infrastructure</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Tier-1 certified amenities.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {amenityOptions.map((a) => {
              const active = form.amenities.includes(a.id);
              const Icon = a.icon;
              return (
                <button type="button" key={a.id} onClick={() => toggleAmenity(a.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${active ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border-primary dark:border-primary/30 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08]'}`}>
                  <Icon size={16} /> {a.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 5: Media & Imagery Asset Gallery */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white"><Images size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Media &amp; Imagery Asset Gallery</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Verified photography assets.</p>
            </div>
          </div>
          {listing.images.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">No images uploaded.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {listing.images.map((img) => (
                <div key={img.id} className="aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08]">
                  <img src={img.url} alt="asset" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}