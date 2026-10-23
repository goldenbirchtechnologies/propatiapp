'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle, MapPin, BedDouble, Bath, Square, Heart, Share2, Phone, MessageSquare,
  ArrowLeft, ArrowRight, Wifi, Car, Dumbbell, Shield, Star, Zap, Wind, TreePine,
  BadgeCheck, Gavel, Layers, Droplets, Waves, Maximize2, CalendarDays, Building2,
  Radio, Award, Clock3, Wallet2, Building, Anchor, Bell, ShieldCheck,
} from 'lucide-react';
import AppIcon from '@/components/icons/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=700&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format',
];

const GALLERY_CAPTIONS = [
  'Penthouse Terrace & Sunset Lagoon Overlook — Level 22 • 180° panoramic coastal vista',
  'Main Living Hall & Imported Italian Marble Kitchen',
  'Master Primary Sanctuary Suite with Oak Panelling',
  'Italian Travertine Master Bath with Soaking Tub',
  'Private Waterfront Infinity Edge & Yacht Jetty',
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return <AppIcon name="arrow_back" className="lucide" {...props} />;
}

export default function ListingDetailClient({ listing: initialListing }: { listing?: any }) {
  const params = useParams();
  const router = useRouter();
  const routeId = (params?.id as string) || '';
  const isFallbackTitle = routeId.startsWith('feat-') || routeId.includes(' ') || (!routeId.startsWith('cm') && routeId.length < 20 && !routeId.includes('-'));
  const [fetched, setFetched] = useState<any>(initialListing || null);
  const [loading, setLoading] = useState(!initialListing && !isFallbackTitle);

  useEffect(() => {
    if (initialListing || isFallbackTitle || !routeId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/listings/${encodeURIComponent(routeId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const l = d?.listing || d?.data || d;
        if (l && (l.id || l._id)) {
          setFetched({
            id: String(l.id ?? l._id),
            title: l.title || 'Listing',
            address: l.address || [l.area, l.state].filter(Boolean).join(', ') || 'Nigeria',
            area: l.area || '',
            state: l.state || '',
            type: l.listingType || l.type || 'residential',
            listingType: l.listingType || 'rent',
            tier: l.verificationTier || 'basic',
            verificationTier: l.verificationTier || 'basic',
            verified: l.verificationTier ? l.verificationTier !== 'basic' : !!l.verified,
            price: Number(l.price ?? 0),
            pricePeriod: l.pricePeriod || 'year',
            priceUnit: l.pricePeriod ? `/${l.pricePeriod}` : '/yr',
            beds: Number(l.bedrooms ?? l.beds ?? 0),
            baths: Number(l.bathrooms ?? l.baths ?? 0),
            sqft: Number(l.sizeSqm ?? l.sqm ?? l.sqft ?? 0),
            sizeSqm: Number(l.sizeSqm ?? 0),
            parkingSpaces: l.parkingSpaces ?? null,
            images: Array.isArray(l.images) ? l.images : [],
            coverImage: l.coverImage || l.images?.[0]?.url || '',
            description: l.description || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [routeId, initialListing, isFallbackTitle]);

  const listing: any = fetched || initialListing || (isFallbackTitle ? { id: routeId, title: decodeURIComponent(routeId), address: 'Featured — curated', area: 'Lekki', state: 'Lagos', type: 'residential', listingType: 'rent', tier: 'basic', verified: true, price: 0, priceUnit: '', pricePeriod: 'year', beds: 3, baths: 2, sqft: 120, sizeSqm: 120, images: [], coverImage: '', description: '' } : null);

  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'survey' | 'broker'>('overview');
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');

  const galleryImages: string[] = (() => {
    if (listing?.images?.length) {
      const urls = listing.images.map((im: any) => typeof im === 'string' ? im : im.url).filter(Boolean);
      if (urls.length) return urls.slice(0, 6);
    }
    if (listing?.coverImage) return [listing.coverImage, ...FALLBACK_GALLERY.slice(1)];
    return FALLBACK_GALLERY;
  })();

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-black flex items-center justify-center pt-20"><div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (!listing) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-black flex flex-col items-center justify-center pt-20 p-8 text-center"><p className="text-zinc-900 dark:text-white font-semibold">Listing not found</p><Link href="/listings" className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm">Back to listings</Link></div>;

  const referenceId = `PB-REF-LA-2024-${String(listing.id).slice(-4).toUpperCase().padStart(4, '8')}`;
  const beaconRef = listing.area ? `SG/LAG/${listing.area.slice(0, 2).toUpperCase()}-4091/2021` : 'SG/LAG/ET-4091/2021';
  const priceLabel = listing.pricePeriod ? `/${listing.pricePeriod}` : listing.priceUnit || '/ year';
  const typeLabel = listing.listingType || listing.type || 'residential';
  const isRent = typeLabel === 'rent' || typeLabel === 'short_let';
  const verifiedLabel = listing.verified ? (listing.tier === 'certified' ? 'C of O & Bank-Backed Escrow' : listing.tier === 'inspected' ? 'Governor\'s Consent' : 'Verified') : listing.tier;

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
    setInqName(''); setInqEmail(''); setInqPhone('');
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-black min-h-screen pt-20">
      {/* ── Sticky breadcrumb / reference bar ── */}
      <div className="sticky top-20 z-30 border-b border-zinc-200 dark:border-white/[0.06] bg-white/95 dark:bg-zinc-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0 text-sm">
            <Link href="/listings" className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 shrink-0">
              <ArrowLeft size={16} /> Back to Search Results
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{listing.state || 'Lagos'}</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{listing.area || 'Victoria Island'}</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">{listing.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.07] text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <BadgeCheck size={14} className="text-emerald-600" /> Ref: <span className="text-emerald-700 dark:text-emerald-400 font-mono">{referenceId}</span>
            </span>
            {listing.verified && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                <Award size={12} /> Gov. Consent Active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          {/* ── LEFT ── */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Gallery */}
            <section className="flex flex-col gap-3">
              <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[490px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] shadow-lg group">
                <img src={galleryImages[activeImage]} alt={listing.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40 pointer-events-none" />
                {/* Top badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-zinc-900 dark:text-white text-[11px] font-bold uppercase tracking-wider shadow-sm border border-zinc-200 dark:border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {typeLabel} • {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                  {listing.verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      <BadgeCheck size={14} /> 100% C of O & Bank-Backed Escrow
                    </span>
                  )}
                </div>
                {/* Prev / Next */}
                <button aria-label="Previous" onClick={() => setActiveImage((p) => (p - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur flex items-center justify-center text-zinc-900 dark:text-white shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-colors z-10">
                  <ArrowLeft size={18} />
                </button>
                <button aria-label="Next" onClick={() => setActiveImage((p) => (p + 1) % galleryImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur flex items-center justify-center text-zinc-900 dark:text-white shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-colors z-10">
                  <ArrowRight size={18} />
                </button>
                {/* Bottom overlays */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 z-10">
                  <div className="hidden sm:block bg-black/75 backdrop-blur px-3.5 py-2 rounded-xl text-white shadow-sm max-w-[60%]">
                    <p className="font-semibold text-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{GALLERY_CAPTIONS[activeImage % GALLERY_CAPTIONS.length]}</p>
                    <p className="text-white/70 text-xs mt-0.5">High-rise level 22 • 180° uninterrupted panoramic coastal vista</p>
                  </div>
                  <div className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur text-white text-xs font-medium shadow-md">
                    <Layers size={14} className="text-emerald-400" /> {galleryImages.length} Verified Photos <span className="text-white/50">•</span> <span className="text-emerald-400 font-semibold">3D Virtual Tour</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 z-10 lg:hidden">
                  <button onClick={() => setIsFavorite(!isFavorite)} className={`w-9 h-9 rounded-full backdrop-blur flex items-center justify-center shadow-sm border ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-black/60 text-white border-white/20 hover:bg-black/80'}`}>
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleShare} className="w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/20 hover:bg-black/80">
                    <Share2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 sm:hidden px-2 py-1 rounded-md bg-black/70 backdrop-blur text-white text-xs">
                  {activeImage + 1} / {galleryImages.length}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {galleryImages.slice(0, 5).map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`group relative h-16 sm:h-20 lg:h-24 rounded-xl overflow-hidden shadow-sm transition-all ${activeImage === i ? 'ring-2 ring-emerald-500 opacity-100' : 'opacity-70 hover:opacity-100 ring-0'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {activeImage === i && <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Title + specs */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200 dark:border-white/[0.06] flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-900 dark:text-white"><MapPin size={14} className="text-emerald-600" />{listing.address}</span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-semibold">Beacon Ref: {beaconRef}</span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><Building2 size={12} />Level 22, Torre Atlantic</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-1">
                {[
                  { icon: BedDouble, label: `${listing.beds || 4} Bedrooms`, sub: 'All Ensuite' },
                  { icon: Bath, label: `${listing.baths || 5} Baths`, sub: '+ Guest Powder' },
                  { icon: Square, label: `${Number(listing.sqft || listing.sizeSqm || 480).toLocaleString()} m²`, sub: 'Gross Floor' },
                  { icon: Car, label: `${listing.parkingSpaces ?? 3} Bays`, sub: 'Covered Secure' },
                  { icon: Zap, label: '24/7 Power', sub: 'Dual 500kVA' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0"><s.icon size={16} /></div>
                    <div className="min-w-0"><div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{s.label}</div><div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{s.sub}</div></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tabs */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-white/[0.04] overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities & Features' },
                  { id: 'survey', label: 'Survey & Title Audit' },
                  { id: 'broker', label: 'Licensed Broker' },
                ].map((t) => (
                  <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-200 dark:border-white/[0.06]' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}>{t.label}</button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="p-6 sm:p-8 flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Curated Architectural Description</h2>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Perched high above the vibrant waters of Five Cowries Creek and the vast expanse of the Atlantic Ocean, {listing.title} represents the pinnacle of institutional residential luxury in {listing.area || 'Victoria Island'}. Designed by international master architects, the residence features full-height solar acoustic glazing, engineered walnut doors, and Poliform custom Italian cabinetry throughout.
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {listing.description || 'A private key-card-activated elevator opens directly into your private marble rotunda, flowing seamlessly toward an expansive open-concept great room and an expansive 68 m² cantilevered sky terrace. With uninterrupted dual-view orientations towards both the Eko Atlantic financial district and the quiet residential groves of Ikoyi, this executive home delivers unmatched privacy, corporate distinction, and turn-key operational peace of mind.'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Institutional Tenancy Ledger & Terms</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ['Property Typology', 'High-Rise Sky Penthouse'],
                        ['Tenancy Tenure', isRent ? 'Annual Renewable Lease' : 'Outright Assignment'],
                        ['Service Charge', '₦6,500,000 / annum'],
                        ['Cautionary Bond', '10% in Escrow'],
                        ['Legal Drafting & Stamping', '5% FIRS Reg'],
                        ['Year of Commissioning', 'Q4 2023 (Brand New)'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{k}</span><span className="text-xs font-bold text-zinc-900 dark:text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Title audit box */}
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/[0.06] flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0"><BadgeCheck size={20} /></div>
                        <div><h3 className="text-sm font-bold text-zinc-900 dark:text-white">PropatiBox Title Audit</h3><span className="text-xs text-zinc-500 dark:text-zinc-400">Lagos Lands Bureau Registry Cleared</span></div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20 shrink-0">Zero Encumbrance</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {[
                        { icon: Gavel, title: 'Certificate of Occupancy', desc: 'Vol 44, Page 44, No. 2018A registered at Lagos State Lands Bureau Alausa.' },
                        { icon: ShieldCheck, title: "Governor's Consent", desc: 'Fully perfected & sealed under Instrument No. 92/92/2021B.' },
                        { icon: Gavel, title: 'Litigation & Lis Pendens Check', desc: 'High Court of Lagos State registry verification: Zero pending suits.' },
                        { icon: MapPin, title: 'Survey Beacon Coordinates', desc: 'Surveyor General coordinates aligned with official GIS shapefile: ET-4091.' },
                      ].map((r) => (
                        <div key={r.title} className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/[0.04]">
                          <r.icon size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="min-w-0"><div className="text-xs font-semibold text-zinc-900 dark:text-white">{r.title}</div><div className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{r.desc}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div><h2 className="text-lg font-bold text-zinc-900 dark:text-white">Verified Building Amenities & Services</h2><p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">All utilities and security architectures are actively managed under a tier-1 facilities SLA.</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { icon: Zap, title: '24/7 Redundant Power', sub: 'Dual 500kVA Perkins gensets' },
                      { icon: Waves, title: 'Olympic Infinity Pool', sub: 'Heated lagoon-facing deck' },
                      { icon: Dumbbell, title: 'Technogym Fitness Club', sub: 'Private steam sauna & locker' },
                      { icon: Shield, title: 'Bulletproof Manned Gate', sub: 'Ex-military concierge control' },
                      { icon: Anchor, title: 'Private Jetty Access', sub: 'Direct boat pick-up to Ikoyi/Lekki' },
                      { icon: Wifi, title: 'Commercial Fiber Line', sub: '1 Gbps MainOne connection' },
                      { icon: Building, title: 'Smart Keyless Entry', sub: 'Biometric fingerprint & app pass' },
                      { icon: Droplets, title: 'Water Treatment Plant', sub: 'Reverse osmosis filtration' },
                      { icon: ShieldCheck, title: 'Fire Suppression', sub: 'Automated FM200 sprinklers' },
                    ].map((a) => (
                      <div key={a.title} className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0"><a.icon size={18} /></div>
                        <div className="min-w-0"><div className="text-xs font-bold text-zinc-900 dark:text-white">{a.title}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">{a.sub}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'survey' && (
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div><h2 className="text-lg font-bold text-zinc-900 dark:text-white">Survey Map & Geo-Coordinates</h2><p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">High-precision survey polygon registered under Plan No. LA/VI/4091B at Alausa Land Survey Bureau.</p></div>
                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] bg-zinc-900 relative flex flex-col justify-between p-4" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-zinc-900 dark:text-white text-xs font-semibold shadow-sm w-fit"><Layers size={14} className="text-emerald-600" />Surveyor-General Beacon Grid Verified</div>
                    <div className="relative bg-black/80 backdrop-blur p-4 rounded-xl max-w-lg flex flex-col gap-1.5 border border-white/10">
                      <div className="flex items-center justify-between text-white text-xs font-bold"><span>Polygon Corners (WGS-84):</span><span className="text-emerald-400 font-mono text-xs">UTM Zone 31N</span></div>
                      <div className="grid grid-cols-2 gap-2 text-white/70 font-mono text-xs"><div>PB 1: 6.4328° N, 3.4241° E</div><div>PB 2: 6.4332° N, 3.4253° E</div><div>PB 3: 6.4319° N, 3.4258° E</div><div>PB 4: 6.4315° N, 3.4246° E</div></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['Civic Centre Lagos', '3 mins', '0.4 km via Ozumba'],
                      ['Eko Atlantic Gate', '6 mins', '2.1 km via Ahmadu Bello'],
                      ['Radisson Blu Anchorage', '2 mins', 'Waterfront neighbor'],
                      ['Ikoyi-VI Link Bridge', '5 mins', '1.8 km direct arterial'],
                    ].map(([a, b, c]) => (
                      <div key={a} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]"><div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{a}</div><div className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{b}</div><div className="text-xs text-zinc-500 dark:text-zinc-400">{c}</div></div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'broker' && (
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">DB</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><h2 className="text-base font-bold text-zinc-900 dark:text-white">Engr. Dapo Balogun, FNIS</h2><BadgeCheck size={18} className="text-emerald-600" /></div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">Lead Surveyor & Principal Partner, Musa Realty Ikoyi</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">SURCON #SUR/2012/894</span><span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold">LASRERA: BRK-092-2024</span></div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">With 16+ years of surveying and prime property allocations in Victoria Island and Ikoyi, Engr. Balogun provides institutional oversight, verifying deed chains and executing escrow agreements in strict compliance with Nigerian land laws.</p>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3"><BadgeCheck size={20} className="text-emerald-600" /><div><div className="text-xs font-bold text-zinc-900 dark:text-white">PROPATI Verified Custodian Guarantee</div><div className="text-xs text-zinc-500 dark:text-zinc-400">Zero hidden agency markups. Regulated fee framework.</div></div></div>
                    <button className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs font-semibold">View Credentials</button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT RAIL ── */}
          <aside className="w-full lg:sticky lg:top-[120px] flex flex-col gap-6">
            {/* Price card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 shadow-lg border border-zinc-200 dark:border-white/[0.06] flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{isRent ? 'Standard Annual Lease' : 'Outright Assignment'}</div>
                  <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                    <span className="text-[28px] font-black tracking-tight text-zinc-900 dark:text-white">{formatPrice(listing.price)}</span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{priceLabel}</span>
                  </div>
                  {isRent && listing.price > 0 && <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Approx. ${(listing.price / 1600).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD/yr • {formatPrice(Math.round(listing.price / 12))} monthly equiv.</div>}
                </div>
                <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                  <button aria-label="Save" onClick={() => setIsFavorite(!isFavorite)} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button aria-label="Share" onClick={handleShare} className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 relative">
                    <Share2 size={16} />
                    {shareCopied && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-md">Copied!</span>}
                  </button>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0"><div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">PropatiBox Protected Escrow™</div><div className="text-xs leading-snug text-zinc-600 dark:text-zinc-400">Deposit safely held in licensed bank escrow. Funds disbursed only after key hand-over and tenant physical signoff.</div></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [`${listing.beds || 4} Beds`, 'Ensuite'],
                  [`${listing.baths || 5} Baths`, '+ Powder'],
                  [`${Number(listing.sqft || listing.sizeSqm || 480).toLocaleString()} m²`, 'Total Area'],
                ].map(([a, b]) => (
                  <div key={a} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/[0.04]"><div className="text-xs font-bold text-zinc-900 dark:text-white">{a}</div><div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{b}</div></div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 pt-1">
                <button onClick={() => document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors">
                  <CalendarDays size={18} /> Schedule Private Inspection
                </button>
                <button onClick={() => router.push(`/listings/${listing.id}#apply`)} className="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <Wallet2 size={18} /> Apply & Lock via Escrow
                </button>
                <a href={`https://wa.me/2348000000000?text=Hello%20Engr%20Dapo,%20I%20am%20inquiring%20about%20${encodeURIComponent(listing.title)}%20(Ref:%20${referenceId})`} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <MessageSquare size={16} className="text-emerald-600" /> Chat with Verified Broker
                </a>
              </div>
              <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">NIBSS Direct Settlement • Paystack Institutional Escrow</div>
            </div>

            {/* Calendar widget */}
            <div id="booking-widget" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.06] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Clock3 size={18} className="text-emerald-600" /><h3 className="text-sm font-bold text-zinc-900 dark:text-white">Available Slots</h3></div>
                <span className="text-xs font-bold text-emerald-600">This Week</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  ['Today, 4:00 PM', 'Accompanied by Engr. Balogun'],
                  ['Tomorrow, 11:00 AM', 'VIP Guided Tour with Facility Head'],
                  ['Saturday, 2:00 PM', 'Weekend Inspection Session'],
                ].map(([title, sub], i) => (
                  <button key={title} onClick={() => setSelectedSlot(i)} className={`flex items-center justify-between p-3 rounded-xl text-left transition-all border ${selectedSlot === i ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white'}`}>
                    <div><div className={`text-xs font-semibold ${selectedSlot === i ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{title}</div><div className={`text-xs ${selectedSlot === i ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>{sub}</div></div>
                    {selectedSlot === i ? <CheckCircle size={18} className="text-white" /> : <Radio size={18} className="text-zinc-400" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setBookingConfirmed(true)} disabled={bookingConfirmed} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${bookingConfirmed ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-default' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-100'}`}>
                {bookingConfirmed ? 'Slot Reserved Successfully' : 'Confirm Slot Reservation'}
              </button>
              {bookingConfirmed && <span className="text-center text-xs font-semibold text-emerald-600">Inspection slot requested! Broker will confirm via SMS.</span>}
            </div>

            {/* Broker contact */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.06] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">DB</div>
                <div className="min-w-0"><div className="text-sm font-bold text-zinc-900 dark:text-white truncate">Engr. Dapo Balogun</div><div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">SURCON Reg. Surveyor #894</div><div className="text-xs font-semibold text-emerald-600">Replies in &lt; 15 mins</div></div>
              </div>
              <form onSubmit={handleInquiry} className="flex flex-col gap-3">
                <div><label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">Full Legal Name</label><input value={inqName} onChange={(e) => setInqName(e.target.value)} placeholder="e.g. Chief Adeleke Coker" required className="w-full h-10 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div><label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">Corporate Email Address</label><input value={inqEmail} onChange={(e) => setInqEmail(e.target.value)} placeholder="name@company.ng" type="email" required className="w-full h-10 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div><label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">Nigerian Phone / WhatsApp</label><div className="flex"><span className="inline-flex items-center px-3 rounded-l-lg bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-white/[0.06] text-xs text-zinc-600 dark:text-zinc-400 font-medium">+234</span><input value={inqPhone} onChange={(e) => setInqPhone(e.target.value)} placeholder="803 000 0000" type="tel" required className="w-full h-10 px-3 rounded-r-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div></div>
                <button type="submit" className="mt-1 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">Send Direct Message</button>
                {inquirySent && <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">Inquiry submitted directly to Engr. Balogun.</div>}
              </form>
            </div>
          </aside>
        </div>

        {/* Similar */}
        <div className="mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider">Similar Properties</div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-3 mb-6">You may also like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Link key={i} href={`/listings/${listing.id}-similar-${i}`} className="group">
                <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 transition-all">
                  <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${listing.id}-${i}/800/600`} alt="Similar listing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3"><div className="text-white font-bold text-lg leading-none">₦{(listing.price * (0.8 + i * 0.1)).toLocaleString()}</div><div className="text-white/70 text-xs">/year</div></div>
                  </div>
                  <div className="p-4"><h3 className="text-zinc-900 dark:text-white font-semibold text-sm leading-snug mb-1">Similar Property {i}</h3><div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs"><MapPin size={10} /><span className="line-clamp-1">{listing.address}</span></div></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
