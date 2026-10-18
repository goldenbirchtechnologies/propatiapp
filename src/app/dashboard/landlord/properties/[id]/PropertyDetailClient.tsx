'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  X,
  Plus,
  Layers,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Tv,
  RefrigeratorIcon,
  ShowerHead,
  Utensils,
  Armchair,
  Trees,
  Lock,
  Sun,
  Wind,
  Zap,
  Eye,
  ChevronRight,
  Check,
  Heart,
  Share2,
  Star,
  Pencil,
} from 'lucide-react';
import ManageUnitDrawer from "./ManageUnitDrawer";

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
    buildingName: string | null;
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

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Pool: <Waves className="h-4 w-4" />,
  Kitchen: <RefrigeratorIcon className="h-4 w-4" />,
  '24/7 Security': <Lock className="h-4 w-4" />,
  'Power Supply': <Zap className="h-4 w-4" />,
  'Garden Area': <Trees className="h-4 w-4" />,
  'Balcony': <Sun className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'Smart TV': <Tv className="h-4 w-4" />,
  'Shower': <ShowerHead className="h-4 w-4" />,
  'Dining': <Utensils className="h-4 w-4" />,
  'Furnished': <Armchair className="h-4 w-4" />,
};

const SHARED_AMENITY_PRESETS = [
  '24/7 Security',
  'Borehole Water',
  'Prepaid Meter',
  'Central Generator',
  'Perimeter Fencing',
  'CCTV',
  'Gated Compound',
  'Parking',
  'Garden Area',
  'WiFi',
  'Pool',
  'Gym',
];

function capitalizeWords(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatCurrency(value: number) {
  return `₦${Number(value).toLocaleString()}`;
}

function formatListingType(value?: string) {
  const map: Record<string, string> = {
    rent: 'For Rent',
    sale: 'For Sale',
    short_let: 'Short-Let',
    share: 'Shared',
    commercial: 'Commercial',
    unlisted: 'Unlisted',
  };
  if (!value) return 'For Rent';
  return map[value] || capitalizeWords(value);
}

function formatUnitPrice(unit: Listing['units'][number]) {
  const amount = formatCurrency(unit.rent);
  if (unit.listingType === 'short_let') return `${amount} / night`;
  if (unit.listingType === 'sale') return `${amount}`;
  return `${amount} / ${unit.pricePeriod || 'month'}`;
}

function formatPropertyType(value?: string) {
  if (!value) return 'N/A';
  return capitalizeWords(value);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20', label: 'Active' },
    draft: { class: 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Draft' },
    suspended: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Suspended' },
    deleted: { class: 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: Listing['verification'] | null }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/[0.08]/20 dark:bg-emerald-500/20 dark:text-white dark:border-white/[0.08]/30">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          LAYER {verification.currentLayer}
        </span>
      );
    case 'certified':
      return <SharedVerificationBadge tier="certified" />;
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20 dark:bg-red-950/40 dark:text-red-500 dark:border-red-800">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
          {verification.overallStatus}
        </span>
      );
  }
}

export default function PropertyDetailClient({ listing }: { listing: Listing }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'pricing' | 'units' | 'reviews'>('overview');
  const [editingManage, setEditingManage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manageForm, setManageForm] = useState({
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    propertyType: listing.propertyType,
    description: listing.description || '',
  });
  const [images, setImages] = useState(listing.images);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>(listing.amenities);
  const [saved, setSaved] = useState(false);
  const [savingAmenities, setSavingAmenities] = useState(false);
  const [amenitiesSaved, setAmenitiesSaved] = useState(false);
  const [manageUnitOpen, setManageUnitOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(true);

  const selectedUnit = selectedUnitId
    ? listing.units.find((u) => u.id === selectedUnitId) || null
    : null;

  const updateManageField = (field: string, value: string | number) => {
    setManageForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSaveManage = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manageForm.title,
          address: manageForm.address,
          area: manageForm.area,
          state: manageForm.state,
          propertyType: manageForm.propertyType,
          description: manageForm.description,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to update' }));
        throw new Error(data.error || 'Failed to update');
      }

      setSaved(true);
      setEditingManage(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save property:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
      setAmenityInput('');
      setAmenitiesSaved(false);
    }
  };

  const handleSaveAmenities = async () => {
    setSavingAmenities(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amenities }),
      });
      if (!res.ok) throw new Error('Failed to save amenities');
      setAmenitiesSaved(true);
      setTimeout(() => setAmenitiesSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save amenities:', error);
    } finally {
      setSavingAmenities(false);
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities((prev) => prev.filter((a) => a !== amenity));
    setAmenitiesSaved(false);
  };

  const layerLabels = [
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts', icon: FileText, cta: 'Upload Documents' },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner', icon: Shield, cta: 'Verify Identity' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code', icon: Eye, cta: 'Record Video' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection', icon: MapPin, cta: 'Schedule Inspection' },
  ];

  const statusColors: Record<string, { class: string; label: string }> = {
    not_started: { class: 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Not Started' },
    in_progress: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'In Review' },
    certified: { class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Verified' },
    rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
    pending: { class: 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Not Started' },
    approved: { class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Verified' },
  };

  const verificationStatus = listing.verification?.overallStatus || 'not_started';
  const currentLayer = listing.verification?.currentLayer || 1;

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'amenities' as const, label: 'Amenities' },
    { id: 'pricing' as const, label: 'Pricing & Terms' },
    { id: 'units' as const, label: `Units (${listing.units.length})` },
    { id: 'reviews' as const, label: 'Reviews' },
  ];

  const occupiedUnits = listing.units.filter((u) => u.occupancy === 'OCCUPIED').length;
  const availableUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 mb-4" aria-label="Breadcrumb">
        <Link href="/dashboard/landlord" className="hover:text-zinc-900 dark:hover:text-white hover:underline">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <Link href="/dashboard/landlord/properties" className="hover:text-zinc-900 dark:hover:text-white hover:underline">Properties</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <span className="font-medium text-zinc-900 dark:text-white truncate">{capitalizeWords(listing.title)}</span>
      </nav>

      {/* Property Header */}
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge verification={listing.verification} />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold">{listing.status === 'active' ? 'Active Listing' : capitalizeWords(listing.status)}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
            {capitalizeWords(listing.title)}
          </h1>
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
            <MapPin size={16} className="text-emerald-500 shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>
        </div>
        {/* Price & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
          <div className="flex flex-col lg:items-end">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(listing.price)}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">/ {listing.pricePeriod || 'year'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg border ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'} hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors`}
            >
              <Heart size={18} className={isFavorite ? 'fill-red-500' : ''} />
            </button>
            <button className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              <Share2 size={18} />
            </button>
            <Link
              href={`/dashboard/landlord/properties/${listing.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      {listing.images.length > 0 && (
        <section className="mt-4 flex flex-col gap-3">
          <div className="relative w-full aspect-[21/9] sm:aspect-[16/8] rounded-xl overflow-hidden shadow-sm bg-zinc-100 dark:bg-zinc-800">
            <img src={listing.images[0]?.url} alt={listing.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm">
                Cover Image
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 text-white backdrop-blur-md text-xs font-medium">
                1 / {listing.images.length} Photos
              </span>
            </div>
          </div>
          {listing.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {listing.images.slice(0, 7).map((img, idx) => (
                <div key={img.id} className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={img.url} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Two-Column Body */}
      <div className="lg:grid lg:grid-cols-[2fr_1fr] gap-6 mt-6 items-start">
        {/* LEFT COLUMN: Tabs */}
        <div className="flex flex-col gap-4">
          {/* Tab Bar */}
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-zinc-900 dark:text-white'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                  <Building2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  Property Overview
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {listing.description || 'No description provided for this property.'}
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Building2 size={12} className="text-emerald-500" /> Property Type</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1">{formatPropertyType(listing.propertyType)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Shield size={12} className="text-emerald-500" /> Status</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1">{capitalizeWords(listing.status)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Layers size={12} className="text-emerald-500" /> Total Units</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1">{listing.units.length} Units</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Eye size={12} className="text-emerald-500" /> Views</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1">{listing.viewsCount.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Clock size={12} className="text-emerald-500" /> Listed</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1">{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Verification</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block mt-1 capitalize">{listing.verification?.overallStatus || 'Not Started'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AMENITIES */}
          {activeTab === 'amenities' && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Zap size={18} className="text-emerald-600 dark:text-emerald-400" />
                Amenities & Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {amenities.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No amenities added yet.</p>
                ) : (
                  amenities.map((amenity) => (
                    <span key={amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      {AMENITY_ICON_MAP[amenity] || <Check size={14} />}
                      {amenity}
                      <button onClick={() => removeAmenity(amenity)} className="ml-1 hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Input placeholder="Add amenity..." value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} />
                <Button type="button" variant="outline" onClick={addAmenity}><Plus size={14} /></Button>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING */}
          {activeTab === 'pricing' && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                Pricing & Lease Terms
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Base Rent</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatCurrency(listing.price)} / {listing.pricePeriod || 'year'}</span>
                  </div>
                </div>
                {listing.units[0]?.cautionDeposit && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Caution Deposit</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatCurrency(listing.units[0].cautionDeposit)}</span>
                    </div>
                  </div>
                )}
                {listing.units[0]?.serviceCharge && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Service Charge</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatCurrency(listing.units[0].serviceCharge)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: UNITS */}
          {activeTab === 'units' && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
                  Units ({listing.units.length})
                </h2>
                <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Unit
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="py-2 px-3 rounded-l-lg">Unit</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Specs</th>
                      <th className="py-2 px-3 text-right">Rent</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {listing.units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">{unit.unitNumber}</td>
                        <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">{capitalizeWords(unit.type)}</td>
                        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 text-xs">{unit.bedrooms} Beds • {unit.bathrooms} Baths</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">{formatCurrency(unit.rent)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            unit.occupancy === 'OCCUPIED' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' :
                            unit.occupancy === 'VACANT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {unit.occupancy === 'OCCUPIED' ? 'Leased' : unit.occupancy === 'VACANT' ? 'Available' : 'Maintenance'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button onClick={() => { setSelectedUnitId(unit.id); setManageUnitOpen(true); }} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Star size={18} className="text-amber-500" />
                Reviews
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No reviews yet for this property.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Booking/Lease Card */}
        <aside className="flex flex-col gap-4 mt-6 lg:mt-0 lg:sticky lg:top-20">
          {/* Quick Stats Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Property Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Total Units</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{listing.units.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Leased</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{occupiedUnits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Available</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{availableUnits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Base Rent</span>
                <span className="font-semibold text-zinc-900 dark:text-white font-mono">{formatCurrency(listing.price)}</span>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">Statutory Verification</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                verificationStatus === 'certified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                {verificationStatus === 'certified' ? 'PASS' : 'PENDING'}
              </span>
            </div>
            <div className="space-y-2">
              {layerLabels.map((layer, idx) => {
                const layerStatus = listing.verification?.[layer.key as keyof typeof listing.verification] || 'not_started';
                const cfg = statusColors[layerStatus] || statusColors.not_started;
                return (
                  <div key={layer.key} className="flex items-start gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <layer.icon size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">{layer.label}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{layer.desc}</span>
                    </div>
                    {layerStatus === 'certified' && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Manage Unit Drawer */}
      {manageUnitOpen && selectedUnit && (
        <ManageUnitDrawer
          unit={selectedUnit}
          listingId={listing.id}
          onClose={() => { setManageUnitOpen(false); setSelectedUnitId(null); }}
        />
      )}
    </div>
  );
}
