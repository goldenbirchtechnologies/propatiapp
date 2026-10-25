'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  Refrigerator,
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
  Trash2,
  MapPin,
  BadgeCheck,
  Download,
  Phone,
  MessageCircle,
  Maximize2,
  Images,
  Bolt,
  Router,
  SquareParking,
  Fingerprint,
  Droplets,
  ArrowUpDown,
  DoorOpen,
  Building2,
  Bathtub,
  Expand,
  Landmark,
  AlertTriangle,
} from 'lucide-react';
import ManageUnitDrawer from './ManageUnitDrawer';

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

export default function PropertyDetailClient({ listing }: { listing: Listing }) {
  const [tab, setTab] = useState<'overview' | 'units' | 'financials' | 'verification'>('overview');
  const [showDelete, setShowDelete] = useState(false);
  const hero = listing.images?.[0]?.url;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'units', label: `Units (${listing.units.length})` },
    { key: 'financials', label: 'Financials & Payouts' },
    { key: 'verification', label: 'Verification (5-Tier)' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400 text-sm">
        <nav className="flex items-center gap-1 font-medium">
          <Link href="/dashboard/landlord/properties" className="hover:text-emerald-600 transition-colors">Portfolio</Link>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <span className="hover:text-emerald-600 transition-colors">{listing.area || 'Zone'}</span>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-900 dark:text-white font-semibold">{listing.title}</span>
        </nav>
        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/[0.04] px-2 py-1 rounded-lg font-mono text-xs">
          <span className="text-emerald-600 font-bold">ASSET REF:</span>
          <span className="text-zinc-900 dark:text-white tracking-wider">{listing.id.slice(0, 12).toUpperCase()}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{listing.title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs uppercase font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {listing.status}
            </span>
            {listing.verification && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs uppercase font-semibold flex items-center gap-1">
                <Verified className="h-3.5 w-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-sm">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>{listing.address}, {listing.area}, {listing.state}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/landlord/properties/${listing.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-1">
              <Pencil className="h-4 w-4" /> Edit Listing
            </Button>
          </Link>
          <label className="relative inline-flex items-center cursor-pointer bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg shadow-sm border border-zinc-200 dark:border-white/[0.08]">
            <input type="checkbox" className="sr-only peer" defaultChecked={listing.status === 'published'} />
            <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            <span className="ml-2 text-sm font-semibold text-zinc-900 dark:text-white">Propati Live</span>
          </label>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete Asset
          </Button>
        </div>
      </div>

      {/* Hero image */}
      <div className="space-y-2">
        <div className="aspect-video w-full rounded-xl overflow-hidden relative shadow-md bg-zinc-100 dark:bg-zinc-800">
          {hero ? (
            <img src={hero} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <Building2 className="h-16 w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
            <span className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs uppercase tracking-wider font-semibold">
              Photo 1 of {listing.images.length || 1}
            </span>
          </div>
          <button className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1 shadow-sm hover:bg-white transition-all">
            <Maximize2 className="h-4 w-4" /> Expand Media
          </button>
        </div>
        {/* Thumbnail strip */}
        <div className="grid grid-cols-5 gap-2">
          {listing.images.slice(0, 4).map((img) => (
            <div key={img.id} className="aspect-video rounded-lg overflow-hidden relative cursor-pointer opacity-80 hover:opacity-100 transition-opacity shadow-sm bg-zinc-100 dark:bg-zinc-800">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="aspect-video rounded-lg overflow-hidden relative cursor-pointer bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <Images className="h-6 w-6 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider mt-1">View All {listing.images.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/[0.04] p-1 rounded-xl shadow-sm overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-4 border border-zinc-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Asset Specifications</h2>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-semibold uppercase tracking-wider">Tier-1</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              {[
                { label: 'Asset Class', value: listing.propertyType || 'Property' },
                { label: 'Listing Type', value: listing.listingType },
                { label: 'Price', value: `₦${listing.price.toLocaleString()}` },
                { label: 'Views', value: listing.viewsCount },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-50 dark:bg-white/[0.04] p-3 rounded-lg">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">{s.label}</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 block">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-2 border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Description</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{listing.description || 'No description provided.'}</p>
          </div>
          {listing.amenities?.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-4 border border-zinc-200 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Amenities &amp; Services</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-white/[0.04] rounded-lg">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNITS */}
      {tab === 'units' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-4 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Unit Inventory ({listing.units.length})</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {listing.units.filter((u) => u.status === 'occupied').length} Occupied • {listing.units.filter((u) => u.status !== 'occupied').length} Vacant
              </p>
            </div>
            <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Unit
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-2 rounded-l-lg">Unit &amp; Name</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Specs</th>
                  <th className="p-2">Monthly Rent</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                {listing.units.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="p-2">
                      <div className="font-semibold text-zinc-900 dark:text-white">{u.unitNumber}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">{u.buildingName || u.type}</div>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs">{u.type}</span>
                    </td>
                    <td className="p-2 text-zinc-600 dark:text-zinc-400">
                      {u.bedrooms} Bed • {u.bathrooms} Bath{u.sizeSqm ? ` • ${u.sizeSqm} m²` : ''}
                    </td>
                    <td className="p-2 font-mono font-bold text-zinc-900 dark:text-white">₦{u.rent.toLocaleString()}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === 'occupied'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-2 text-right space-x-1">
                      <button className="p-1 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded text-zinc-600 dark:text-zinc-400"><Pencil className="h-4 w-4" /></button>
                      <button className="p-1 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded text-zinc-600 dark:text-zinc-400"><Layers className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {listing.units.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-600 dark:text-zinc-400">No units yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FINANCIALS */}
      {tab === 'financials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Annual Gross Rent', value: `₦${listing.price.toLocaleString()}` },
              { label: 'Service Charge Pool', value: '—' },
              { label: 'Disbursal Target', value: 'Propati' },
              { label: 'Net Cap Yield', value: '—' },
            ].map((k) => (
              <div key={k.label} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08] space-y-1">
                <span className="text-xs text-zinc-600 dark:text-zinc-400 uppercase font-semibold">{k.label}</span>
                <div className="text-lg font-bold text-zinc-900 dark:text-white">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION */}
      {tab === 'verification' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-4 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">5-Tier Institutional Verification</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Audited by Propati Regulatory Compliance</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-sm self-start sm:self-auto">
              {listing.verification?.overallStatus || 'Pending'}
            </span>
          </div>
          <div className="space-y-3">
            {[
              { tier: 'Tier 1: CAC Document & Corporate Title', status: listing.verification?.l1Status },
              { tier: 'Tier 2: Landlord Biometric Identity', status: listing.verification?.l2Status },
              { tier: 'Tier 3: Drone & Interior Audit', status: listing.verification?.l3Status },
              { tier: 'Tier 4: Physical SLA & Engineer Sign-Off', status: listing.verification?.l4Status },
              { tier: 'Tier 5: LASRERA Digital Title Token', status: listing.verification?.l5Status },
            ].map((v) => (
              <div key={v.tier} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-white/[0.04] rounded-lg">
                <Shield className="h-6 w-6 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{v.tier}</span>
                    <span className="text-emerald-600 text-xs font-bold">{v.status || 'PENDING'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-zinc-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-7 w-7" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Confirm Asset Deletion</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">{listing.title}</span> from the portfolio?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowDelete(false)}>Permanently Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
