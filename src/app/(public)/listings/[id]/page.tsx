'use client'

import AppIcon from '@/components/icons/app-icon'

import Link from 'next/link'
import { useState } from 'react'

export default function ListingDetailClient({ listing }: { listing: unknown }) {
  const [activeImage, setActiveImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const images = [
    listing.image,
    listing.image,
    listing.image,
    listing.image,
  ]

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Back */}
      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/listings" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <AppIcon name="arrow_back" className="lucide text-[16px]" />
            Back to listings
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-sm text-zinc-400 line-clamp-1">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 h-80 sm:h-[440px] border border-white/[0.08]">
                <div className="w-full h-full bg-zinc-900" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-9 h-9 rounded-full bg-black/70 backdrop-blur flex items-center justify-center transition-colors ${isFavorite ? 'text-red-400' : 'text-white hover:text-red-400'}`}
                    aria-label="Favorite"
                  >
                    <AppIcon name="favorite" className="lucide text-[16px]" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.tierColor || 'bg-[#10b981] text-white'}`}>
                    {listing.tier || 'Verified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${listing.listingColor || 'bg-[#10b981] text-white'}`}>
                    {listing.listingType || 'FOR SALE'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-[#10b981]' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="w-full h-full bg-zinc-900" />
                  </button>
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{listing.title}</h1>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                  <AppIcon name="location_on" className="lucide text-[16px]" />
                  <span>{listing.location}</span>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="flex gap-6 py-4 border-y border-white/[0.07] mb-6">
              <div className="flex items-center gap-2">
                <AppIcon name="bed" className="lucide text-[24px] text-[#10b981]" />
                <div>
                  <div className="text-white font-semibold">{listing.beds}</div>
                  <div className="text-zinc-600 text-xs">Bedrooms</div>
                </div>
              </div>
              <div className="w-px h-10 bg-white/[0.07]" />
              <div className="flex items-center gap-2">
                <AppIcon name="bathtub" className="lucide text-[24px] text-[#10b981]" />
                <div>
                  <div className="text-white font-semibold">{listing.baths}</div>
                  <div className="text-zinc-600 text-xs">Bathrooms</div>
                </div>
              </div>
              <div className="w-px h-10 bg-white/[0.07]" />
              <div className="flex items-center gap-2">
                <AppIcon name="square_foot" className="lucide text-[24px] text-[#10b981]" />
                <div>
                  <div className="text-white font-semibold">{listing.area}</div>
                  <div className="text-zinc-600 text-xs">sq.m</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Description</h2>
              <p className="text-zinc-400 leading-relaxed">
                Experience premium living at {listing.title}. This outstanding property in {listing.location}
                offers {listing.beds} bedrooms and {listing.baths} bathrooms across {listing.area} square meters.
                Professionally managed and verified by PROPATI standards.
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-4 mt-8">
              <h2 className="text-xl font-bold text-white">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Parking', 'Security', 'Power Supply', 'Water Supply', 'WiFi', 'Swimming Pool', 'Gym', 'Garden', 'Elevator'].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 p-3 bg-zinc-950 border border-white/[0.06] rounded-lg">
                    <AppIcon name="check_circle" className="lucide text-[18px] text-[#10b981]" />
                    <span className="text-sm text-zinc-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Contact card */}
          <div className="mt-6 lg:mt-0">
            <div className="sticky top-28 space-y-4">
              <div className="bg-zinc-950 border border-white/[0.08] p-6 rounded-2xl">
                <div className="text-[#10b981] font-black text-3xl mb-1">{listing.price}</div>
                <p className="text-sm text-zinc-500 mb-6">Asking price</p>

                <div className="space-y-3 mb-6">
                  <Link
                    href={`tel:+234****0000`}
                    className="w-full bg-[#10b981] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                  >
                    <AppIcon name="call" className="lucide" />
                    Contact Agent
                  </Link>
                  <Link
                    href={`mailto:agent@propati.com?subject=Inquiry about ${listing.title}`}
                    className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                  >
                    <AppIcon name="mail" className="lucide" />
                    Send Email
                  </Link>
                  <Link
                    href={`https://wa.me/2348000000000?text=I'm interested in ${listing.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25d366]/10 border border-[#25d366]/30 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#25d366]/20 transition-all"
                  >
                    <AppIcon name="chat" className="lucide" />
                    WhatsApp
                  </Link>
                </div>

                <div className="pt-6 border-t border-white/[0.07]">
                  <h3 className="font-bold text-white mb-4">Listed by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                      <div className="w-full h-full bg-zinc-900" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">PROPATI Verified Agent</p>
                      <p className="text-xs text-zinc-500">Licensed Real Estate Professional</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-zinc-950 border border-white/[0.08] p-4 space-y-3">
                {[
                  { text: 'Property documents verified by PROPATI' },
                  { text: 'Landlord identity confirmed' },
                  { text: 'Secure payment via escrow' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <AppIcon name="verified" className="lucide text-[14px] text-[#10b981] flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
