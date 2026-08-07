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
    active: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Active' },
    draft: { class: 'bg-muted text-muted-foreground border-outline-variant', label: 'Draft' },
    suspended: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Suspended' },
    deleted: { class: 'bg-muted text-muted-foreground border-outline-variant', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-muted text-muted-foreground border-outline-variant', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: Listing['verification'] | null }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30">
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
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
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
      setSaved(false);
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities((prev) => prev.filter((a) => a !== amenity));
    setSaved(false);
  };

  const layerLabels = [
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts' },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection' },
    { key: 'l5Status', label: 'Layer 5: Certified', desc: 'Final approval & badge' },
  ];

  const statusColors: Record<string, { class: string; label: string }> = {
    not_started: { class: 'bg-muted text-muted-foreground border-outline-variant', label: 'Not Started' },
    in_progress: { class: 'bg-primary/10 text-primary border-primary/20', label: 'In Progress' },
    certified: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Verified ✓' },
    rejected: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Rejected' },
    pending: { class: 'bg-muted text-muted-foreground border-outline-variant', label: 'Pending' },
    approved: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Approved' },
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
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/dashboard/landlord" className="hover:underline">
          Dashboard
        </Link>
        <AppIcon name="/" className="lucide" />
        <Link href="/dashboard/landlord/properties" className="hover:underline">
          Properties
        </Link>
        <AppIcon name="/" className="lucide" />
        <span className="font-medium text-primary truncate">
          {listing.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord/properties"
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="font-headline-sm text-headline-sm font-bold text-primary text-primary"
            >
              {capitalizeWords(listing.title)}
            </h1>
            <p className="flex items-center gap-1 mt-1 text-on-surface-variant">
              <MapPin className="h-3 w-3" />
              {capitalizeWords(listing.address)}
            </p>
          </div>
        </div>
        <VerificationBadge verification={listing.verification} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'building' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary text-primary">
              Building Information
            </h2>
            {!editingManage ? (
              <button onClick={() => setEditingManage(true)} className="btn btn-secondary btn-sm">
                <Edit3 className="w-4 h-4 mr-2" />
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
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
                  <p className="font-medium text-primary">
                    {capitalizeWords(listing.title)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
                  <p className="font-medium text-primary">
                    {listing.address}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
                  <p className="font-medium text-primary">
                    {capitalizeWords(listing.area)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
                  <p className="font-medium text-primary">
                    {capitalizeWords(listing.state)}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
                  <p className="font-medium text-primary">
                    {formatPropertyType(listing.propertyType)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
                  Total Units
                </label>
                <p className="font-medium text-primary">
                  {listing.units.length}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
                  Verification
                </label>
                <VerificationBadge verification={listing.verification} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
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
              <p className="text-sm leading-relaxed text-primary">
                {listing.description || 'No description provided.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-outline-variant">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Images</p>
                <p className="font-medium text-sm text-primary">
                  {listing.images.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Amenities</p>
                <p className="font-medium text-sm text-primary">
                  {listing.amenities.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">Added</p>
                <p className="font-medium text-sm text-primary">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-xs text-on-surface-variant">ID</p>
                <p className="font-medium text-sm text-primary">
                  {listing.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-headline-sm text-headline-sm text-primary text-primary">
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
              <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-headline-sm text-headline-sm font-bold text-foreground mb-2">No units yet</h3>
              <p className="text-muted-foreground mb-4">
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
                  <tr className="border-b border-outline-variant">
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Unit</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Listing Intent</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Occupancy</th>
                    <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Marketplace</th>
                    <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listing.units.map((unit) => (
                    <tr key={unit.id} className="border-b border-outline-variant last:border-b-0">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">Unit {unit.unitNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {unit.bedrooms} Bed • {unit.bathrooms} Bath {unit.sizeSqm ? `• ${unit.sizeSqm} sqm` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{formatPropertyType(unit.type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground border border-outline-variant">
                          {formatListingType(unit.listingType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{formatUnitPrice(unit)}</p>
                        {unit.cautionDeposit ? (
                          <p className="text-xs text-muted-foreground">Caution: {formatCurrency(Number(unit.cautionDeposit))}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          unit.occupancy === 'VACANT'
                            ? 'bg-success/10 text-success border-success/20'
                            : unit.occupancy === 'OCCUPIED'
                              ? 'bg-muted text-muted-foreground border-outline-variant'
                              : 'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {unit.occupancy}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {unit.isListed ? (
                          <span className="inline-flex items-center rounded-full bg-success/10 text-success border border-success/20 px-2.5 py-0.5 text-xs font-medium">
                            Listed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground border border-outline-variant px-2.5 py-0.5 text-xs font-medium">
                            Unlisted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/landlord/properties/${listing.id}/units/${unit.id}`}>
                            Manage
                          </Link>
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
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-primary text-primary">
                Verification Status
              </h2>
              <span className={`tag ${statusColors[verificationStatus]?.class || 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>
                {statusColors[verificationStatus]?.label || 'Unknown'}
              </span>
            </div>
            <p className="text-sm mb-4 text-on-surface-variant">
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
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow border-outline-variant">
                <div className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-on-surface-variant">
                    {isApproved ? <CheckCircle2 className="w-5 h-5" /> : <AppIcon name={index + 1} className="lucide" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-primary">
                      {layer.label}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {layer.desc}
                    </p>
                  </div>
                  <span className={`tag ${config.class}`}>{config.label}</span>
                </div>
              </div>
            );
          })}

          <div className="flex gap-4 pt-2">
            <Link href="/dashboard/landlord/verify" className="btn btn-secondary">
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
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary text-primary">
              Shared Building Amenities
            </h2>
            {saved && (
              <span className="text-xs text-success">
                Changes saved
              </span>
            )}
          </div>

          <p className="text-sm mb-4 text-on-surface-variant">
            Manage shared building amenities for {listing.title}. These features will automatically apply to all units housed within this property.
          </p>

          {listing.verification && listing.verification.overallStatus !== 'certified' && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 bg-primary/10 text-primary border border-primary">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <p className="text-sm text-primary">
                Amenity updates will be reviewed during verification.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
              >
                {AMENITY_ICON_MAP[amenity]}
                {capitalizeWords(amenity)}
                <button
                  onClick={() => removeAmenity(amenity)}
                  className="ml-1 hover:opacity-70"
                  title={`Remove ${amenity}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-label-md uppercase tracking-wider text-on-surface-variant">
              Quick Add
            </p>
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
                        setSaved(false);
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-background border-outline-variant text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    {AMENITY_ICON_MAP[preset]}
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add amenity..."
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              className="inp-field"
              style={{ maxWidth: '300px' }}
            />
            <button onClick={addAmenity} className="btn btn-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary text-primary">
              Property Media
            </h2>
            <label className="btn btn-secondary btn-sm cursor-pointer">
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
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-headline-sm text-headline-sm font-bold text-foreground mb-2">No media yet</h3>
              <p className="text-muted-foreground">
                Exterior shots, compound photos, and entrance images will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative rounded-lg overflow-hidden border border-outline-variant">
                  <img
                    src={image.url}
                    alt={listing.title}
                    className="w-full h-40 object-cover"
                  />
                  {image.isCover && (
                    <span className="absolute top-2 left-2 tag bg-primary/10 text-primary border-primary/20">
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
    </div>
  );
}
