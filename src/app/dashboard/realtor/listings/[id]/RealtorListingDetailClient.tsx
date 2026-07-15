'use client';

import { useState } from 'react';
import Link from 'next/link';
import {

  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Edit3,
  Save,
  X,
  Plus,
  Eye,
  Shield,
  Image as ImageIcon,
  Layers,
  Ruler,
  Wifi,
  Car,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
};

const statusColors: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-success/10 text-success border border-success/20', label: 'Active' },
  draft: { class: 'bg-warning/10 text-warning border border-warning/20', label: 'Draft' },
  suspended: { class: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Suspended' },
  deleted: { class: 'bg-surface-container-low text-on-surface-variant border border-outline-variant', label: 'Deleted' },
};

function VerificationBadge({ verification }: { verification: Listing['verification'] | null }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-warning/20">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-warning/20">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
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
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-bold text-on-surface-variant border border-outline-variant">
          {verification.overallStatus}
        </span>
      );
  }
}

export default function RealtorListingDetailClient({ listing, ownerName }: { listing: Listing; ownerName: string }) {
  const [activeTab, setActiveTab] = useState<'manage' | 'verification' | 'amenities'>('manage');
  const [editingManage, setEditingManage] = useState(false);
  const [manageForm, setManageForm] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    status: listing.status,
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>(listing.amenities);
  const [saved, setSaved] = useState(false);

  const updateManageField = (field: string, value: string | number) => {
    setManageForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSaveManage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditingManage(false);
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

  const statusColorsInner: Record<string, { class: string; label: string }> = {
    not_started: { class: 'bg-warning/10 text-warning border border-warning/20', label: 'Not Started' },
    in_progress: { class: 'bg-primary/10 text-primary border border-primary/20', label: 'In Progress' },
    certified: { class: 'bg-success/10 text-success border border-success/20', label: 'Verified ✓' },
    rejected: { class: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Rejected' },
    pending: { class: 'bg-warning/10 text-warning border border-warning/20', label: 'Pending' },
    approved: { class: 'bg-success/10 text-success border border-success/20', label: 'Approved' },
  };

  const verificationStatus = listing.verification?.overallStatus || 'not_started';
  const currentLayer = listing.verification?.currentLayer || 1;

  const tabs = [
    { id: 'manage' as const, label: 'Manage' },
    { id: 'verification' as const, label: 'Verification' },
    { id: 'amenities' as const, label: 'Amenities' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/dashboard/agent" className="hover:underline">Dashboard</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <Link href="/dashboard/agent/listings" className="hover:underline">Listings</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <span className="text-primary font-medium truncate">{listing.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent/listings"
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-primary">
              {listing.title}
            </h1>
            <p className="flex items-center gap-1 mt-1 text-sm text-on-surface-variant">
              <MapPin className="h-3 w-3" /> {listing.address}
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
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{ color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted-foreground)', borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'manage' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary">Property Details</h2>
            {!editingManage ? (
              <Button onClick={() => setEditingManage(true)} size="sm" variant="secondary">
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setEditingManage(false)} size="sm" variant="ghost">
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSaveManage} size="sm" variant="primary">
                  <Save className="w-4 h-4 mr-1" /> {saved ? 'Saved!' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Property Title</label>
                {editingManage ? (
                  <input type="text" value={manageForm.title} onChange={(e) => updateManageField('title', e.target.value)} className="inp-field" />
                ) : (
                  <p className="font-medium text-primary">{listing.title}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Address</label>
                <p className="font-medium text-primary">{listing.address}</p>
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Location</label>
                <p className="font-medium text-primary">{listing.area}, {listing.state}</p>
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Owner</label>
                <p className="font-medium text-primary">{ownerName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Price</label>
                {editingManage ? (
                  <input type="text" value={manageForm.price} onChange={(e) => updateManageField('price', Number(e.target.value))} className="inp-field" />
                ) : (
                  <p className="font-medium text-primary">₦{listing.price.toLocaleString()}{listing.pricePeriod ? `/${listing.pricePeriod}` : ''}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Status</label>
                {editingManage ? (
                  <select value={manageForm.status} onChange={(e) => updateManageField('status', e.target.value)} className="inp-field">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="suspended">Suspended</option>
                  </select>
                ) : (
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColors[listing.status]?.class || 'bg-surface-container-low text-on-surface-variant border border-outline-variant')}>{statusColors[listing.status]?.label || listing.status}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Property Type</label>
                <p className="font-medium capitalize text-primary">{listing.propertyType || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Views</label>
                <p className="font-medium text-primary">{listing.viewsCount}</p>
              </div>
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
              <p className="text-sm leading-relaxed text-primary">{listing.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Price</p>
                <p className="font-medium text-sm text-primary">₦{listing.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Views</p>
                <p className="font-medium text-sm text-primary">{listing.viewsCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Images</p>
                <p className="font-medium text-sm text-primary">{listing.images.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Type</p>
                <p className="font-medium text-sm capitalize text-primary">{listing.listingType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-sm text-headline-sm text-primary">Verification Status</h2>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', listing.verification ? statusColorsInner[verificationStatus]?.class : 'bg-warning/10 text-warning border border-warning/20')}>
                {listing.verification ? (statusColorsInner[verificationStatus]?.label || 'Unknown') : 'Not Started'}
              </span>
            </div>
            <p className="text-sm mb-4 text-on-surface-variant">
              {listing.verification ? `Currently on Layer ${currentLayer} of the 5-layer verification process.` : 'Verification has not been started for this property.'}
            </p>
          </div>

          {layerLabels.map((layer, index) => {
            const layerStatus = listing.verification?.[layer.key as keyof typeof listing.verification] as string || 'pending';
            const isApproved = layerStatus === 'approved';
            const isCurrent = index + 1 === currentLayer && verificationStatus === 'in_progress';
            const config = statusColorsInner[layerStatus] || statusColorsInner.pending;

            return (
              <div
                key={layer.key}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow"
                style={{
                  background: isCurrent ? 'var(--accent-bg)' : undefined,
                  border: isCurrent ? '1px solid var(--accent)' : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: isApproved ? 'var(--green-bg)' : isCurrent ? 'var(--accent-bg)' : 'var(--border)',
                      color: isApproved ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--muted)',
                    }}
                  >
                    {isApproved ? <Shield className="w-5 h-5" /> : <MaterialIcon name={index + 1} className="material-symbols-outlined" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-primary">{layer.label}</p>
                    <p className="text-xs text-on-surface-variant">{layer.desc}</p>
                  </div>
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.class)}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'amenities' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary">Amenities</h2>
            {saved && <span className="text-xs text-success">Changes saved</span>}
          </div>

          {listing.verification && listing.verification.overallStatus !== 'certified' && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}>
              <AlertTriangle className="h-4 w-4 text-primary" />
              <p className="text-sm text-primary">Amenity updates will be reviewed during verification.</p>
            </div>
          )}

          <p className="text-sm mb-4 text-on-surface-variant">
            Listing amenities show on public property pages.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                {a}
                <button onClick={() => removeAmenity(a)} className="ml-1 hover:text-destructive">&times;</button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              placeholder="Add amenity..."
              className="inp-field"
            />
            <Button onClick={addAmenity} size="sm" variant="secondary">Add</Button>
          </div>
        </div>
      )}
    </div>
  );
}
