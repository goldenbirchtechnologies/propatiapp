'use client';

import { useState } from 'react';
import Link from 'next/link';
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'tag-green', label: 'Active' },
    draft: { class: 'tag-amber', label: 'Draft' },
    suspended: { class: 'tag-red', label: 'Suspended' },
    deleted: { class: 'tag-gray', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'tag-gray', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: Listing['verification'] }) {
  if (!verification) return <span className="tag tag-amber">Not Started</span>;
  const config: Record<string, { class: string; label: string }> = {
    not_started: { class: 'tag-amber', label: 'Not Started' },
    in_progress: { class: 'tag-blue', label: `Layer ${verification.currentLayer}` },
    certified: { class: 'tag-green', label: 'Verified ✓' },
    rejected: { class: 'tag-red', label: 'Rejected' },
  };
  const cfg = config[verification.overallStatus] || config.not_started;
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

export default function PropertyDetailClient({ listing }: { listing: Listing }) {
  const [activeTab, setActiveTab] = useState<'manage' | 'verification' | 'amenities'>('manage');
  const [editingManage, setEditingManage] = useState(false);
  const [manageForm, setManageForm] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    pricePeriod: listing.pricePeriod,
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
    // In a real app, this would call an API endpoint
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

  const statusColors: Record<string, { class: string; label: string }> = {
    not_started: { class: 'tag-amber', label: 'Not Started' },
    in_progress: { class: 'tag-blue', label: 'In Progress' },
    certified: { class: 'tag-green', label: 'Verified ✓' },
    rejected: { class: 'tag-red', label: 'Rejected' },
    pending: { class: 'tag-amber', label: 'Pending' },
    approved: { class: 'tag-green', label: 'Approved' },
  };

  const verificationStatus = listing.verification?.overallStatus || 'not_started';
  const currentLayer = listing.verification?.currentLayer || 1;

  const tabs = [
    { id: 'manage' as const, label: 'Manage', icon: <Edit3 className="h-4 w-4" /> },
    { id: 'verification' as const, label: 'Verification', icon: <Shield className="h-4 w-4" /> },
    { id: 'amenities' as const, label: 'Amenities', icon: <Layers className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <Link href="/dashboard/landlord" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/landlord/properties" className="hover:underline">
          Properties
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text)' }} className="font-medium truncate">
          {listing.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord/properties"
            className="p-2 rounded-lg hover:bg-gray-100"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="font-heading font-bold"
              style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
            >
              {listing.title}
            </h1>
            <p className="flex items-center gap-1 mt-1" style={{ color: 'var(--muted)' }}>
              <MapPin className="h-3 w-3" />
              {listing.address}
            </p>
          </div>
        </div>
        <VerificationBadge verification={listing.verification} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary' : 'border-transparent'
            }`}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
              borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              Property Details
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
                <button onClick={handleSaveManage} className="btn btn-primary btn-sm">
                  <Save className="w-4 h-4 mr-1" />
                  {saved ? 'Saved!' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
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
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    {listing.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Address
                </label>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {listing.address}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Location
                </label>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {listing.area}, {listing.state}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Price
                </label>
                {editingManage ? (
                  <input
                    type="text"
                    value={manageForm.price}
                    onChange={(e) => updateManageField('price', e.target.value)}
                    className="inp-field"
                  />
                ) : (
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    {listing.price}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Status
                </label>
                {editingManage ? (
                  <select
                    value={manageForm.status}
                    onChange={(e) => updateManageField('status', e.target.value)}
                    className="inp-field"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="suspended">Suspended</option>
                  </select>
                ) : (
                  <StatusBadge status={listing.status} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Property Type
                </label>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {listing.propertyType || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
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
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {listing.description || 'No description provided.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: 'var(--muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Rent</p>
                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{listing.pricePeriod || 'month'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {listing.allowShortlet ? (
                <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--green)' }} />
              ) : (
                <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" style={{ color: 'var(--muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Images</p>
                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                  {listing.images.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" style={{ color: 'var(--muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Views</p>
                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                  {listing.viewsCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
                Verification Status
              </h2>
              <span className={`tag ${statusColors[verificationStatus]?.class || 'tag-gray'}`}>
                {statusColors[verificationStatus]?.label || 'Unknown'}
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
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
                className="card p-4"
                style={{
                  background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
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
                    {isApproved ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                      {layer.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
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

      {activeTab === 'amenities' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              Amenities
            </h2>
            {saved && (
              <span className="text-xs" style={{ color: 'var(--green)' }}>
                Changes saved
              </span>
            )}
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Update amenities that tenants and buyers will see on this listing.
          </p>

          {listing.verification && listing.verification.overallStatus !== 'certified' && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              <p className="text-sm" style={{ color: 'var(--text)' }}>
                Amenity updates will be reviewed during verification.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
              >
                {AMENITY_ICON_MAP[amenity]}
                {amenity}
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
    </div>
  );
}
