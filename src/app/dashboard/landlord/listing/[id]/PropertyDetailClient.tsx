'use client';

import { Building2, MapPin, BadgeCheck, Images, ShieldCheck, Home, Bath, Bed, Car, Ruler, Zap, Wifi, Waves, Dumbbell, Lock, Building, Sun, Layers, FileText, ChevronRight } from 'lucide-react';
import ImageGallery from './ImageGallery';
import PropertyHeader from './PropertyHeader';
import Amenities from './Amenities';

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
  allowShortlet: boolean;
  viewsCount: number;
  images: { url: string }[];
  verification: { overallStatus: string; currentLayer: number } | null;
  units?: Array<{ id: string; label: string; price: number; available: boolean }>;
};

export default function PropertyDetailClient({ listing }: { listing: ListingData }) {
  const attributes: string[] = [];
  if (listing.bedrooms) attributes.push(`${listing.bedrooms} bed(s)`);
  if (listing.bathrooms) attributes.push(`${listing.bathrooms} bath(s)`);
  if (listing.listingType === 'share') attributes.push('Shared apartment');
  if (listing.propertyType) {
    attributes.push(
      listing.propertyType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }
  if (listing.parkingSpaces > 0) attributes.push(`${listing.parkingSpaces} parking`);

  const units = listing.units || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ImageGallery images={listing.images.map((img) => img.url)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7 space-y-8">
          <PropertyHeader
            title={listing.title}
            location={`${listing.area}, ${listing.state}`}
            status={listing.status}
            verification={listing.verification}
            listingType={listing.listingType}
            propertyType={listing.propertyType}
            attributes={attributes}
          />

          {/* Property Overview & Architectural Profile */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Property Overview &amp; Architectural Profile</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Core identity, location and architectural classification.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Address</div>
                  <div className="text-sm text-zinc-900 dark:text-white">{listing.address}, {listing.area}, {listing.state}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheck size={16} className="mt-0.5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Verification</div>
                  <div className="text-sm text-zinc-900 dark:text-white">{listing.verification?.overallStatus || 'Pending'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home size={16} className="mt-0.5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Property Type</div>
                  <div className="text-sm text-zinc-900 dark:text-white">{listing.propertyType?.replace(/_/g, ' ') || '—'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Images size={16} className="mt-0.5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Gallery</div>
                  <div className="text-sm text-zinc-900 dark:text-white">{listing.images.length} photo(s)</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description provided.'}
            </p>
          </section>

          {/* Technical & Engineering Specifications */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Ruler size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Technical &amp; Engineering Specifications</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Structural and capacity metrics.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold"><Bed size={14} /> Bedrooms</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listing.bedrooms ?? '—'}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold"><Bath size={14} /> Bathrooms</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listing.bathrooms ?? '—'}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold"><Layers size={14} /> Floors</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listing.floors ?? '—'}</div>
              </div>
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold"><Car size={14} /> Parking</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listing.parkingSpaces}</div>
              </div>
            </div>
          </section>

          {/* Tier-1 Executive Amenities */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Tier-1 Executive Amenities</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Certified building infrastructure.</p>
              </div>
            </div>
            <Amenities amenities={listing.amenities} />
          </section>

          {/* Statutory Lease Structure & Escrow Mandate */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Statutory Lease Structure &amp; Escrow Mandate</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Pricing, deposit and service charge terms.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Base Price</div>
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
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Available from: {listing.availableFrom}</div>
            )}
          </section>

          {/* Building Unit Stack & Availability Ledger */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-900 dark:text-white">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Building Unit Stack &amp; Availability Ledger</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Units and availability.</p>
              </div>
            </div>
            {units.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No units registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/[0.08]">
                      <th className="py-2 pr-4">Unit</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u) => (
                      <tr key={u.id} className="border-b border-zinc-100 dark:border-white/[0.04]">
                        <td className="py-2 pr-4 text-zinc-900 dark:text-white">{u.label}</td>
                        <td className="py-2 pr-4 text-zinc-900 dark:text-white">₦{u.price.toLocaleString()}</td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.available ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>
                            {u.available ? 'Available' : 'Occupied'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm p-6 space-y-3">
            <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">Quick Actions</div>
            <a href={`/dashboard/landlord/properties/${listing.id}/edit`} className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-sm font-medium">
              <span className="flex items-center gap-2"><ChevronRight size={16} /> Edit Property</span>
            </a>
            <a href={`/dashboard/landlord/properties/${listing.id}/publish`} className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-sm font-medium">
              <span className="flex items-center gap-2"><ChevronRight size={16} /> Publish Listing</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}