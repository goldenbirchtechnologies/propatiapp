'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, DollarSign, Building2, Eye } from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  status: string;
  listingType: string;
  propertyType?: string;
  price: number;
  viewsCount: number;
  createdAt: string;
  images: { id: string; url: string; isCover: boolean }[];
  owner: { fullName: string } | null;
};

export default function AgentListingDetailClient({ listing }: { listing: Listing }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/agent/listings"
          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
            {listing.title}
          </h1>
          <p className="flex items-center gap-1 mt-1 text-sm text-on-surface-variant">
            <MapPin className="h-3 w-3" />
            {listing.address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">Price</p>
          <p className="text-sm font-medium mt-1">
            ₦{listing.price.toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">Status</p>
          <p className="text-sm font-medium mt-1 capitalize">{listing.status}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">Views</p>
          <p className="text-sm font-medium mt-1">{listing.viewsCount}</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2">
          Owner / Landlord
        </p>
        <p className="text-sm font-medium text-primary">
          {listing.owner?.fullName || '—'}
        </p>
        <p className="text-xs text-on-surface-variant">
          {listing.listingType} · {listing.propertyType || 'N/A'}
        </p>
      </div>

      {listing.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {listing.images.slice(0, 4).map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={listing.title}
              className="rounded-lg border border-outline-variant object-cover h-32 w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
