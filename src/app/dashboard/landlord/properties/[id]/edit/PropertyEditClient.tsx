'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Building2,
  MapPin,
  Home,
  Bed,
  Bath,
  Ruler,
  Car,
  Zap,
  Wifi,
  Waves,
  Dumbbell,
  Shield,
  Lock,
  Elevator,
  Flame,
  Video,
  Sun,
  Plus,
  Trash2,
  ChevronRight,
  PartyPopper,
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
  verification: {
    id: string;
    overallStatus: string;
    currentLayer: number;
    l1Status: string;
    l2Status: string;
    l3Status: string;
    l4Status: string;
    l5Status: string;
  } | null;
  images: { id: string; url: string; isCover: boolean }[];
  units: {
    id: string;
    unitNumber: string;
    type: string;
    listingType: string;
    pricePeriod: string | null;
    rent: number;
    cautionDeposit: number | null;
    serviceCharge: number | null;
    status: string;
    occupancy: string;
    isListed: boolean;
    bedrooms: number;
    bathrooms: number;
    sizeSqm: number | null;
  }[];
};

function capitalizeWords(value: string) {
  return value.split(/[\s-]+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

function formatCurrency(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

const WIZARD_STEPS = [
  { num: 1, label: 'Structure' },
  { num: 2, label: 'Privacy' },
  { num: 3, label: 'Location' },
  { num: 4, label: 'Capacity' },
  { num: 5, label: 'Rooms' },
  { num: 6, label: 'Rules' },
  { num: 7, label: 'Amenities' },
  { num: 8, label: 'Media' },
  { num: 9, label: 'Pitch' },
  { num: 10, label: 'Highlights' },
  { num: 11, label: 'Deeds' },
  { num: 12, label: 'Pricing' },
  { num: 13, label: 'Discounts' },
  { num: 14, label: 'Safety' },
];

export default function PropertyEditClient({ listing, userId }: { listing: Listing; userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description || '',
    listingModel: 'rent' as 'rent' | 'sale' | 'short_let',
    address: listing.address,
    area: listing.area,
    state: listing.state,
    bedrooms: listing.units[0]?.bedrooms ?? 4,
    bathrooms: listing.units[0]?.bathrooms ?? 4,
    sizeSqm: listing.units[0]?.sizeSqm ?? 480,
    parking: 2,
    maxOccupancy: 6,
    baseRent: listing.price,
    cautionDeposit: listing.units[0]?.cautionDeposit ?? 0,
    serviceCharge: listing.units[0]?.serviceCharge ?? 0,
    amenities: listing.amenities,
    photos: listing.images.map((img) => ({ id: img.id, url: img.url })),
  });

  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([]);

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id) ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
    }));
  };

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

      toast({ title: 'Property updated', description: 'Your changes have been saved.' });
      router.push(`/dashboard/landlord/properties/${listing.id}`);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const progressPct = Math.round((currentStep / WIZARD_STEPS.length) * 100);

  // Derived pricing
  const stampDuty = form.baseRent * 0.05;
  const cautionAmount = form.cautionDeposit || form.baseRent * 0.1;
  const serviceAmount = form.serviceCharge || 0;
  const totalOutlay = form.baseRent + cautionAmount + serviceAmount + stampDuty;

  const amenityOptions = [
    { id: 'power', label: '24/7 Dedicated Power', icon: Zap },
    { id: 'wifi', label: 'High-Speed Fiber Grid', icon: Wifi },
    { id: 'pool', label: 'Olympic Infinity Pool', icon: Waves },
    { id: 'security', label: 'Armed Patrol & Biometrics', icon: Shield },
    { id: 'gym', label: 'Technogym Fitness Studio', icon: Dumbbell },
    { id: 'water', label: 'Industrial Reverse Osmosis', icon: Sun },
    { id: 'elevator', label: 'KONE High-Speed Elevators', icon: Elevator },
    { id: 'parking', label: 'Dedicated Parking', icon: Car },
  ];

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Wizard Top Header Bar */}
      <div className="w-full bg-white dark:bg-zinc-900 px-4 sm:px-6 py-4 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          {/* Breadcrumb & Auto-save */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Link href="/dashboard/landlord" className="hover:text-emerald-600 transition-colors flex items-center gap-1">Portfolio</Link>
              <span>/</span>
              <Link href="/dashboard/landlord/properties" className="hover:text-emerald-600 transition-colors">Properties</Link>
              <span>/</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Edit Property</span>
            </nav>
          </div>

          {/* Title */}
          <div className="max-w-3xl">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Edit Property — {capitalizeWords(listing.title)}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Update property details, pricing, and configuration.
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between relative px-2 overflow-x-auto pb-2">
              {/* Background Line */}
              <div className="absolute left-6 right-6 top-3 h-0.5 bg-zinc-200 dark:bg-zinc-700" />
              {/* Progress Fill */}
              <div className="absolute left-6 top-3 h-0.5 bg-emerald-500 transition-all duration-500" style={{ width: `calc(${(currentStep / WIZARD_STEPS.length) * 100}% - ${(currentStep / WIZARD_STEPS.length) * 3}rem)` }} />
              {WIZARD_STEPS.map((step) => {
                const isCompleted = step.num < currentStep;
                const isActive = step.num === currentStep;
                return (
                  <button
                    key={step.num}
                    onClick={() => setCurrentStep(step.num)}
                    className="group relative z-10 flex flex-col items-center gap-1 focus:outline-none min-w-[40px]"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-[10px] font-bold transition-all ${
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 scale-110' :
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {isCompleted ? <Check size={12} /> : step.num}
                    </div>
                    <span className={`text-[9px] whitespace-nowrap ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="max-w-5xl mx-auto pb-24">
        {/* STEP 1: STRUCTURE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 01 / Structure</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Property Structure & Asset Classification</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Define title deed parameters, building typology, and target tenancy terms.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-white">Property Title</Label>
                  <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g. Sovereign Crest Tower A" />
                </div>
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-zinc-900 dark:text-white">Description</Label>
                    <span className="text-[10px] text-zinc-400">{form.description.length}/800</span>
                  </div>
                  <Textarea rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe the property..." />
                </div>
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-white">Listing Model</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'rent', label: 'Annual Rent', desc: 'Multi-year lease with corporate escrow.' },
                      { value: 'sale', label: 'Outright Sale', desc: 'Full title transfer with consent deed.' },
                      { value: 'short_let', label: 'Short-Let', desc: 'Daily / weekly executive stay.' },
                    ].map((opt) => (
                      <label key={opt.value} className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${form.listingModel === opt.value ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`w-4 h-4 rounded-full border-2 ${form.listingModel === opt.value ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                            {form.listingModel === opt.value && <Check size={10} className="text-white absolute" />}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{opt.label}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Regulatory Compliance</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Section 16 requires institutional properties to disclose building approval numbers.</p>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">AUTOMATED TITLING CHECK</div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">{form.address || 'Address not set'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 03 / Location</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Location & GIS Coordinates</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-white">Physical Address</Label>
                  <Textarea rows={3} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Area</Label>
                    <Input value={form.area} onChange={(e) => updateField('area', e.target.value)} className="mt-1" />
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">State</Label>
                    <Input value={form.state} onChange={(e) => updateField('state', e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Map Preview</div>
                  <div className="w-full h-40 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <MapPin size={32} className="text-zinc-300 dark:text-zinc-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CAPACITY */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 04 / Capacity</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Capacity Matrix</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Bedrooms', value: form.bedrooms, field: 'bedrooms', icon: Bed },
                { label: 'Bathrooms', value: form.bathrooms, field: 'bathrooms', icon: Bath },
                { label: 'Size (sqm)', value: form.sizeSqm, field: 'sizeSqm', icon: Ruler },
                { label: 'Parking', value: form.parking, field: 'parking', icon: Car },
              ].map((item) => (
                <div key={item.field} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <item.icon size={20} className="mx-auto text-zinc-400 mb-2" />
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{item.label}</div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{item.value}</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button onClick={() => updateField(item.field, Math.max(0, (item.value as number) - 1))} className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">−</button>
                    <button onClick={() => updateField(item.field, (item.value as number) + 1)} className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: AMENITIES */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 07 / Amenities</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Amenities & Infrastructure</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Select facility assurances and infrastructure.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {amenityOptions.map((amenity) => {
                const isSelected = form.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        <amenity.icon size={16} />
                      </div>
                      {isSelected && <CheckCircle size={16} className="text-emerald-500" />}
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">{amenity.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: MEDIA */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 08 / Media</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Photos & Media Library</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{listing.images.length} photos uploaded</p>
            </div>
            {listing.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-3 lg:grid-cols-4 gap-3">
                {listing.images.map((img, idx) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-800">
                      <img src={img.url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold">COVER</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Drag & drop photos or click to upload</div>
              <Button variant="outline" size="sm" className="mt-3">Select Files</Button>
            </div>
          </div>
        )}

        {/* STEP 12: PRICING */}
        {currentStep === 12 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 12 / Pricing</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Pricing, Escrow & Statutory Fees</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-zinc-900 dark:text-white">Base Annual Rent</Label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">BILLED YEARLY</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-900 dark:text-white">₦</span>
                    <Input type="number" value={form.baseRent} onChange={(e) => updateField('baseRent', Number(e.target.value))} className="pl-8 text-lg font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Caution Deposit</Label>
                    <Input type="number" value={form.cautionDeposit} onChange={(e) => updateField('cautionDeposit', Number(e.target.value))} />
                    <p className="text-[10px] text-zinc-400">Refundable bond</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Service Charge</Label>
                    <Input type="number" value={form.serviceCharge} onChange={(e) => updateField('serviceCharge', Number(e.target.value))} />
                    <p className="text-[10px] text-zinc-400">Annual facility fee</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Upfront Settlement Bill</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Base Rent</span><span className="font-mono">{formatCurrency(form.baseRent)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Caution</span><span className="font-mono">{formatCurrency(cautionAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Service Charge</span><span className="font-mono">{formatCurrency(serviceAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Stamp Duty (5%)</span><span className="font-mono">{formatCurrency(stampDuty)}</span></div>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Total Outlay</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalOutlay)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 14: SAFETY */}
        {currentStep === 14 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Step 14 / Safety</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Fire Safety & Compliance</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-3">
                {[
                  { label: 'Smoke Detectors', status: 'INSTALLED', icon: Flame },
                  { label: 'Fire Extinguishers', status: 'INSPECTED', icon: Shield },
                  { label: 'First Aid Station', status: 'VERIFIED', icon: CheckCircle2 },
                  { label: 'CCTV Surveillance', status: 'ACTIVE 24/7', icon: Video },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><item.icon size={16} /></div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.label}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4">
                <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">Attestation</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">I certify that this asset possesses clean and unencumbered title and fulfills all habitability covenants.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generic placeholder for other steps */}
        {currentStep !== 1 && currentStep !== 3 && currentStep !== 4 && currentStep !== 7 && currentStep !== 8 && currentStep !== 12 && currentStep !== 14 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{WIZARD_STEPS[currentStep - 1]?.label}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configuration for this step is managed through the property detail page.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/landlord/properties/${listing.id}`)}>
              Go to Property Detail
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Step {currentStep} of {WIZARD_STEPS.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft size={14} className="mr-1" /> Previous
              </Button>
            )}
            {currentStep < WIZARD_STEPS.length ? (
              <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Next <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
                {saving ? 'Saving...' : <><PartyPopper size={14} className="mr-1" /> Save Property</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
