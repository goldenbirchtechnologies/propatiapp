'use client';

import AppIcon from '@/components/icons/app-icon';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  FileText,
  Layers,
  Ruler,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Flame,
  Wind,
  Tv,
  RefrigeratorIcon,
  ShowerHead,
  Utensils,
  Armchair,
  Trees,
  Lock,
  Sun,
  Zap,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { VerificationBadge as SharedVerificationBadge } from '@/components/ui/badges';
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
    active: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Active' },
    draft: { class: 'bg-zinc-900 text-zinc-400 border-[#262626]', label: 'Draft' },
    suspended: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Suspended' },
    deleted: { class: 'bg-zinc-900 text-zinc-400 border-[#262626]', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-zinc-900 text-zinc-400 border-[#262626]', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: Listing['verification'] | null }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-400 border border-[#262626]">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-400 border border-[#262626]">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#262626] px-2.5 py-0.5 text-xs font-bold text-white border border-primary/20 dark:bg-emerald-500/20 dark:text-white dark:border-primary/30">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-400 border border-[#262626]">
          {verification.overallStatus}
        </span>
      );
  }
}

export default function PropertyDetailClient({ listing }: { listing: Listing }) {
  const [activeTab, setActiveTab] = useState<'building' | 'units' | 'shared-amenities' | 'media' | 'verification'>('building');
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
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts' },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection' },
    { key: 'l5Status', label: 'Layer 5: Certified', desc: 'Final approval & badge' },
  ];

  const statusColors: Record<string, { class: string; label: string }> = {
    not_started: { class: 'bg-zinc-900 text-zinc-400 border-[#262626]', label: 'Not Started' },
    in_progress: { class: 'bg-[#262626] text-white border-primary/20', label: 'In Progress' },
    certified: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Verified ✓' },
    rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
    pending: { class: 'bg-amber-500/10 text-amber-300 border-amber-500/30', label: 'Pending' },
    approved: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Approved' },
  };

  const verificationStatus = listing.verification?.overallStatus || 'not_started';
  const currentLayer = listing.verification?.currentLayer || 1;

  const tabs = [
    { id: 'units' as const, label: `Units (${listing.units.length})`, icon: <Layers className="h-4 w-4" /> },
    { id: 'building' as const, label: 'Building Details', icon: <Edit3 className="h-4 w-4" /> },
    { id: 'shared-amenities' as const, label: 'Shared Amenities', icon: <Trees className="h-4 w-4" /> },
    { id: 'media' as const, label: 'Media', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'verification' as const, label: 'Verification', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/dashboard/landlord" className="hover:underline">
          Dashboard
        </Link>
        <AppIcon name="/" className="lucide" />
        <Link href="/dashboard/landlord/properties" className="hover:underline">
          Properties
        </Link>
        <AppIcon name="/" className="lucide" />
        <span className="font-medium text-white truncate">
          {listing.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord/properties"
            className="p-2 rounded-lg hover:bg-obsidian-800 text-neutral-400">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="font-headline-sm text-headline-sm font-bold text-white"
            >
              {capitalizeWords(listing.title)}
            </h1>
            <p className="flex items-center gap-1 mt-1 text-neutral-400">
              <MapPin className="h-3 w-3" />
              {capitalizeWords(listing.address)}
            </p>
          </div>
        </div>
        <VerificationBadge verification={listing.verification} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#262626]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'building' && (
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-white">
              Building Information
            </h2>
            {!editingManage ? (
              <button onClick={() => setEditingManage(true)} className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 px-3 py-1.5 rounded-lg transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingManage(false)} className="btn btn-ghost btn-sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
                <button onClick={handleSaveManage} disabled={saving} className="btn btn-primary btn-sm">
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Property Title
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.title}
                    onChange={(e) => updateManageField('title', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium text-white">
                    {capitalizeWords(listing.title)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Address
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.address}
                    onChange={(e) => updateManageField('address', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium text-white">
                    {listing.address}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Area
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.area}
                    onChange={(e) => updateManageField('area', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium text-white">
                    {capitalizeWords(listing.area)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  State
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.state}
                    onChange={(e) => updateManageField('state', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium text-white">
                    {capitalizeWords(listing.state)}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Property Type
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.propertyType}
                    onChange={(e) => updateManageField('propertyType', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium text-white">
                    {formatPropertyType(listing.propertyType)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Total Units
                </label>
                <p className="font-medium text-white">
                  {listing.units.length}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
                  Verification
                </label>
                <VerificationBadge verification={listing.verification} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[10px] font-label-md uppercase tracking-wider text-neutral-400">
              Description
            </label>
            {editingManage ? (
              <textarea
                value={manageForm.description}
                onChange={(e) => updateManageField('description', e.target.value)}
                rows={4}
                className="inp-field"
              />
            ) : (
              <p className="text-sm leading-relaxed text-white">
                {listing.description || 'No description provided.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-[#262626]">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Images</p>
                <p className="font-medium text-sm text-white">
                  {listing.images.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Amenities</p>
                <p className="font-medium text-sm text-white">
                  {listing.amenities.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Added</p>
                <p className="font-medium text-sm text-white">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">ID</p>
                <p className="font-medium text-sm text-white">
                  {listing.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-headline-sm text-headline-sm text-white">
              Units in Building
            </h2>
            <Button asChild>
              <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Unit to Building
              </Link>
            </Button>
          </div>

          {listing.units.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
              <h3 className="font-headline-sm text-headline-sm font-bold text-white mb-2">No units yet</h3>
              <p className="text-zinc-400 mb-4">
                Add your first unit to start listing this property.
              </p>
              <Button asChild>
                <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Unit</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Type</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Listing Intent</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Price</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Occupancy</th>
                    <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listing.units.map((unit) => (
                    <tr key={unit.id} className="border-b border-[#262626] last:border-b-0">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">Unit {unit.unitNumber}</p>
                          <p className="text-xs text-zinc-400">
                            {unit.bedrooms} Bed • {unit.bathrooms} Bath {unit.sizeSqm ? `• ${unit.sizeSqm} sqm` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{formatPropertyType(unit.type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white border border-[#262626]">
                          {formatListingType(unit.listingType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{formatUnitPrice(unit)}</p>
                        {unit.cautionDeposit ? (
                          <p className="text-xs text-zinc-400">Caution: {formatCurrency(Number(unit.cautionDeposit))}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            unit.occupancy === 'VACANT'
                              ? 'bg-success/10 text-[#00ff66] border-success/20'
                              : unit.occupancy === 'OCCUPIED'
                                ? 'bg-zinc-900 text-zinc-400 border-[#262626]'
                                : 'bg-warning/10 text-warning border-warning/20'
                          }`}>
                            {unit.occupancy}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            unit.isListed ? 'bg-[#262626] text-white border-primary/20' : 'bg-zinc-900 text-zinc-400 border-[#262626]'
                          }`}>
                            {unit.isListed ? 'Listed' : 'Unlisted'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUnitId(unit.id);
                            setManageUnitOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-white">
                Verification Status
              </h2>
              <span className={`tag ${statusColors[verificationStatus]?.class || 'bg-zinc-900 text-neutral-400 border-[#262626]'}`}>
                {statusColors[verificationStatus]?.label || 'Unknown'}
              </span>
            </div>
            <p className="text-sm mb-4 text-neutral-400">
              {listing.verification
                ? `Currently on Layer ${currentLayer} of the 5-layer verification process.`
                : 'Verification has not been started for this property.'}
            </p>
          </div>

          {layerLabels.map((layer, index) => {
            const layerStatus = listing.verification?.[layer.key as keyof typeof listing.verification] as string || 'pending';
            const isApproved = layerStatus === 'approved';
            const isCurrent = index + 1 === currentLayer && verificationStatus === 'in_progress';
            const config = statusColors[layerStatus] || statusColors.pending;

            return (
              <div
                key={layer.key}
                className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-4 shadow-sm hover:shadow-md transition-shadow border-[#262626]">
                <div className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-neutral-400">
                    {isApproved ? <CheckCircle2 className="w-5 h-5" /> : <AppIcon name={String(index + 1)} className="lucide" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">
                      {layer.label}
                    </p>
                    <p className="text-xs text-neutral-300">
                      {layer.desc}
                    </p>
                  </div>
                  <span className={`tag ${config.class}`}>{config.label}</span>
                </div>
              </div>
            );
          })}

          <div className="flex gap-4 pt-2">
            <Link href="/dashboard/landlord/verify" className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors">
              <Shield className="w-4 h-4 mr-2" />
              Go to Verifications
            </Link>
            {listing.verification && (
              <Link
                href={`/dashboard/landlord/verify?listingId=${listing.id}`}
                className="btn btn-primary"
              >
                {verificationStatus === 'not_started' ? 'Start Verification' : 'Continue Verification'}
              </Link>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shared-amenities' && (
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-white">
              Shared Building Amenities
            </h2>
            {saved && (
              <span className="text-xs text-[#00ff66]">
                Changes saved
              </span>
            )}
          </div>

          <p className="text-sm mb-4 text-neutral-400">
            Manage shared building amenities for {listing.title}. These features will automatically apply to all units housed within this property.
          </p>

          {listing.verification && listing.verification.overallStatus !== 'certified' && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 bg-[#262626] text-white border border-primary">
              <AlertTriangle className="h-4 w-4 text-white" />
              <p className="text-sm text-white">
                Amenity updates will be reviewed during verification.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs font-medium px-3 py-1 rounded-full"
              >
                {capitalizeWords(amenity)}
                <button onClick={() => removeAmenity(amenity)} className="text-neutral-400 hover:text-white transition-colors" title={`Remove ${amenity}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">
                Quick Add
              </p>
              <button
                onClick={handleSaveAmenities}
                disabled={savingAmenities}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {savingAmenities ? 'Saving...' : amenitiesSaved ? 'Saved' : 'Save Amenities'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SHARED_AMENITY_PRESETS.map((preset) => {
                const active = amenities.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (active) {
                        removeAmenity(preset);
                      } else {
                        setAmenities((prev) => (prev.includes(preset) ? prev : [...prev, preset]));
                        setAmenitiesSaved(false);
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'bg-[#262626] border-primary/20 text-white'
                        : 'bg-zinc-900 border-[#262626] text-neutral-400 hover:border-white/40'
                    }`}
                  >
                    {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {AMENITY_ICON_MAP[preset]}
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Add amenity..."
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              className="inp-field border-neutral-800 focus:border-neutral-600 bg-[#090d16]"
              style={{ maxWidth: '300px' }}
            />
            <button onClick={addAmenity} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-200 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom
            </button>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-white">
              Property Media
            </h2>
            <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('setCover', String(images.length === 0));
                  try {
                    const res = await fetch(`/api/listings/${listing.id}/images`, {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data?.error || 'Failed to upload');
                    setImages((prev) => {
                      const next = [...prev, data.image].sort((a, b) => {
                        if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
                        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
                      });
                      return next;
                    });
                  } catch (err) {
                    console.error('Image upload failed:', err);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {images.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
              <h3 className="font-headline-sm text-headline-sm font-bold text-white mb-2">No media yet</h3>
              <p className="text-zinc-400">
                Exterior shots, compound photos, and entrance images will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative rounded-lg overflow-hidden border border-[#262626]">
                  <img
                    src={image.url}
                    alt={listing.title}
                    className="w-full h-40 object-cover"
                  />
                  {image.isCover && (
                    <span className="absolute top-2 left-2 tag bg-[#262626] text-white border-primary/20">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 p-2 text-white text-xs">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/listings/${listing.id}/images`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageId: image.id, setCover: true }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(data?.error || 'Failed to update cover');
                          setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === image.id })));
                        } catch (err) {
                          console.error('Set cover failed:', err);
                        }
                      }}
                      className={image.isCover ? 'font-medium' : 'opacity-80 hover:opacity-100'}
                    >
                      {image.isCover ? 'Cover' : 'Set cover'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/listings/${listing.id}/images`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageId: image.id }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(data?.error || 'Failed to delete');
                          setImages((prev) => prev.filter((img) => img.id !== image.id));
                        } catch (err) {
                          console.error('Delete image failed:', err);
                        }
                      }}
                      className="opacity-80 hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {selectedUnit && (
        <ManageUnitDrawer
          open={manageUnitOpen}
          onOpenChange={setManageUnitOpen}
          unit={selectedUnit}
          listing={{ id: listing.id, title: listing.title }}
        />
      )}
    </div>
  );
}
