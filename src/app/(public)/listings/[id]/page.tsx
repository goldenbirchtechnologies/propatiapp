'use client';

import Link from 'next/link';
import MaterialIcon from '@/components/icons/material-icon';
import { useState } from 'react';
export default function ListingDetailClient({ listing }: { listing: unknown }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const images = [
    listing.image,
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
            PROPATI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Browse
            <Link href="/help-center" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Help
          </nav>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined p-2 hover:bg-muted rounded-full text-muted-foreground">
              notifications
            </button>
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Login
          </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/properties" className="hover:text-foreground">Properties</Link>
          <MaterialIcon name="chevron_right" className="material-symbols-outlined text-[16px]" />
          <span className="text-foreground">{listing.title}</span>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                <div className="w-full h-full bg-muted" />
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors"
                >
                  <span className={`material-symbols-outlined ${isFavorite ? 'text-destructive' : 'text-muted-foreground'}`}>
                    favorite
                  </span>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.tierColor || 'bg-primary text-white'}`}>
                    {listing.tier || 'Verified'}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.listingColor || 'bg-type-sale text-white'}`}>
                    {listing.listingType || 'FOR SALE'}
              <div className="flex gap-3">
                {images.map((_, i) => (
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                ))}
            {/* Property Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MaterialIcon name="location_on" className="material-symbols-outlined text-[18px]" />
                  <span className="text-sm">{listing.location}</span>
              <div className="flex items-center gap-6 py-6 border-y border-border">
                  <MaterialIcon name="bed" className="material-symbols-outlined text-[24px] text-primary" />
                    <span className="block text-lg font-bold text-foreground">{listing.beds}</span>
                    <span className="text-xs text-muted-foreground">Bedrooms</span>
                <div className="w-px h-10 bg-border" />
                  <MaterialIcon name="bathtub" className="material-symbols-outlined text-[24px] text-primary" />
                    <span className="block text-lg font-bold text-foreground">{listing.baths}</span>
                    <span className="text-xs text-muted-foreground">Bathrooms</span>
                  <MaterialIcon name="square_foot" className="material-symbols-outlined text-[24px] text-primary" />
                    <span className="block text-lg font-bold text-foreground">{listing.area}</span>
                    <span className="text-xs text-muted-foreground">sq.m</span>
              {/* Description */}
                <h2 className="text-xl font-bold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experience premium living at {listing.title}. This outstanding property in {listing.location}
                  offers {listing.beds} bedrooms and {listing.baths} bathrooms across {listing.area} square meters.
                  Professionally managed and verified by PROPATI standards.
                </p>
              {/* Amenities */}
                <h2 className="text-xl font-bold">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Parking', 'Security', 'Power Supply', 'Water Supply', 'WiFi', 'Swimming Pool', 'Gym', 'Garden', 'Elevator'].map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <MaterialIcon name="check_circle" className="material-symbols-outlined text-primary text-[18px]" />
                      <span className="text-sm">{amenity}</span>
          {/* Right Column - Contact Card */}
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <div className="text-3xl font-bold text-primary mb-1">{listing.price}</div>
              <p className="text-sm text-muted-foreground mb-6">Asking price</p>
              <div className="space-y-3 mb-6">
                <Link
                  href={`tel:+2348000000000`}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                  <MaterialIcon name="call" className="material-symbols-outlined" />
                  Contact Agent
                  href={`mailto:agent@propati.com?subject=Inquiry about ${listing.title}`}
                  className="w-full bg-muted text-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
                  <MaterialIcon name="mail" className="material-symbols-outlined" />
                  Send Email
                  href={`https://wa.me/2348000000000?text=I'm interested in ${listing.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                  <MaterialIcon name="chat" className="material-symbols-outlined" />
                  WhatsApp
              <div className="pt-6 border-t border-border">
                <h3 className="font-bold mb-4">Listed by</h3>
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border border-border">
                    <p className="font-bold text-sm">PROPATI Verified Agent</p>
                    <p className="text-xs text-muted-foreground">Licensed Real Estate Professional</p>
      </main>
  );
}

'use client';

import Link from 'next/link';
import MaterialIcon from '@/components/icons/material-icon';
import { useState } from 'react';

export default function ListingDetailClient({ listing }: { listing: unknown }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = [
    listing.image,
    listing.image,
    listing.image,
    listing.image,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
            PROPATI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link href="/help-center" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Help
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined p-2 hover:bg-muted rounded-full text-muted-foreground">
              notifications
            </button>
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/properties" className="hover:text-foreground">Properties</Link>
          <MaterialIcon name="chevron_right" className="material-symbols-outlined text-[16px]" />
          <span className="text-foreground">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                <div className="w-full h-full bg-muted" />
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors"
                >
                  <span className={`material-symbols-outlined ${isFavorite ? 'text-destructive' : 'text-muted-foreground'}`}>
                    favorite
                  </span>
                </button>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.tierColor || 'bg-primary text-white'}`}>
                    {listing.tier || 'Verified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.listingColor || 'bg-type-sale text-white'}`}>
                    {listing.listingType || 'FOR SALE'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-full bg-muted" />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MaterialIcon name="location_on" className="material-symbols-outlined text-[18px]" />
                  <span className="text-sm">{listing.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MaterialIcon name="bed" className="material-symbols-outlined text-[24px] text-primary" />
                  <div>
                    <span className="block text-lg font-bold text-foreground">{listing.beds}</span>
                    <span className="text-xs text-muted-foreground">Bedrooms</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MaterialIcon name="bathtub" className="material-symbols-outlined text-[24px] text-primary" />
                  <div>
                    <span className="block text-lg font-bold text-foreground">{listing.baths}</span>
                    <span className="text-xs text-muted-foreground">Bathrooms</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MaterialIcon name="square_foot" className="material-symbols-outlined text-[24px] text-primary" />
                  <div>
                    <span className="block text-lg font-bold text-foreground">{listing.area}</span>
                    <span className="text-xs text-muted-foreground">sq.m</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experience premium living at {listing.title}. This outstanding property in {listing.location}
                  offers {listing.beds} bedrooms and {listing.baths} bathrooms across {listing.area} square meters.
                  Professionally managed and verified by PROPATI standards.
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Parking', 'Security', 'Power Supply', 'Water Supply', 'WiFi', 'Swimming Pool', 'Gym', 'Garden', 'Elevator'].map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <MaterialIcon name="check_circle" className="material-symbols-outlined text-primary text-[18px]" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <div className="text-3xl font-bold text-primary mb-1">{listing.price}</div>
              <p className="text-sm text-muted-foreground mb-6">Asking price</p>

              <div className="space-y-3 mb-6">
                <Link
                  href={`tel:+2348000000000`}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                >
                  <MaterialIcon name="call" className="material-symbols-outlined" />
                  Contact Agent
                </Link>
                <Link
                  href={`mailto:agent@propati.com?subject=Inquiry about ${listing.title}`}
                  className="w-full bg-muted text-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
                >
                  <MaterialIcon name="mail" className="material-symbols-outlined" />
                  Send Email
                </Link>
                <Link
                  href={`https://wa.me/2348000000000?text=I'm interested in ${listing.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                >
                  <MaterialIcon name="chat" className="material-symbols-outlined" />
                  WhatsApp
                </Link>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="font-bold mb-4">Listed by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border border-border">
                    <div className="w-full h-full bg-muted" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">PROPATI Verified Agent</p>
                    <p className="text-xs text-muted-foreground">Licensed Real Estate Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
