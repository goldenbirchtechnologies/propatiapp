'use client';

import ImageGallery from './ImageGallery';
import PropertyHeader from './PropertyHeader';
import Amenities from './Amenities';
import BookingCard from './BookingCard';

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ImageGallery images={listing.images.map((img) => img.url)} />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
          <hr className="border-white/[0.08]" />
          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">About this space</h2>
            <p className="text-zinc-500 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description provided.'}
            </p>
          </div>
          <hr className="border-white/[0.08]" />
          <Amenities amenities={listing.amenities} />
        </section>
        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <BookingCard listing={listing} />
        </aside>
      </div>
    </main>
  );
}
