'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, StarIcon, CheckCircle2, ShieldCheck, BedDouble, Bath, Wifi, Car } from 'lucide-react';


const MOCK_SHORTLET = {
  id: 'sl-1',
  title: 'Lekki Short-Let Apartment — 2 Bed',
  location: 'Lekki Phase 1, Lagos',
  pricePerNight: 35000,
  rating: 4.8,
  reviews: 24,
  host: 'Ada Properties',
  hostVerified: true,
  beds: 2,
  baths: 2,
  amenities: ['WiFi', 'Parking', 'AC', 'Security', 'Generator', 'Pool'],
  images: [
    'https://picsum.photos/seed/sl1a/1200/800',
    'https://picsum.photos/seed/sl1b/1200/800',
    'https://picsum.photos/seed/sl1c/1200/800',
  ],
  description: 'Fully Furnished 2-bedroom apartment in the heart of Lekki Phase 1. Close to restaurants, beaches, and shopping malls.',
  rules: [
    'No smoking',
    'No parties',
    'Check-in: 2:00 PM',
    'Check-out: 12:00 PM',
    'Quiet hours: 10:00 PM - 7:00 AM',
  ],
};

export default function ShortLetDetailPage() {
  const params = useParams();
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState('1');
  const [selectedImage, setSelectedImage] = useState(0);

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const subtotal = nights * MOCK_SHORTLET.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              <img src={MOCK_SHORTLET.images[selectedImage]} alt={MOCK_SHORTLET.title} className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_SHORTLET.images.slice(1).map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx + 1)} className="overflow-hidden rounded-xl bg-slate-100">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{MOCK_SHORTLET.title}</h1>
              <p className="mt-1 flex items-center gap-2 text-slate-600">
                <SearchIcon className="h-4 w-4" /> {MOCK_SHORTLET.location}
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  ★ {MOCK_SHORTLET.rating} ({MOCK_SHORTLET.reviews} reviews)
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {MOCK_SHORTLET.beds} beds</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {MOCK_SHORTLET.baths} baths</span>
              {MOCK_SHORTLET.amenities.slice(0, 3).map((a) => (
                <span key={a} className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {a}</span>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">About this place</h2>
              <p className="mt-2 text-slate-700">{MOCK_SHORTLET.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">House rules</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-slate-700">
                {MOCK_SHORTLET.rules.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">₦{MOCK_SHORTLET.pricePerNight.toLocaleString()}</span>
              <span className="text-sm text-slate-500">/ night</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Check-in</label>
                  <Input
                    type="date"
                    value={checkIn ? checkIn.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Check-out</label>
                  <Input
                    type="date"
                    value={checkOut ? checkOut.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Guests</label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 guest</SelectItem>
                    <SelectItem value="2">2 guests</SelectItem>
                    <SelectItem value="3">3 guests</SelectItem>
                    <SelectItem value="4">4 guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {nights > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>₦{MOCK_SHORTLET.pricePerNight.toLocaleString()} x {nights} nights</span>
                    <MaterialIcon name="₦{subtotal.toLocaleString()}" className="material-symbols-outlined" />
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <MaterialIcon name="Service fee (5%)" className="material-symbols-outlined" />
                    <MaterialIcon name="₦{serviceFee.toLocaleString()}" className="material-symbols-outlined" />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                    <MaterialIcon name="Total" className="material-symbols-outlined" />
                    <MaterialIcon name="₦{total.toLocaleString()}" className="material-symbols-outlined" />
                  </div>
                </div>
              )}

              <Button className="mt-4 w-full" disabled={!checkIn || !checkOut || nights <= 0}>
                Reserve
              </Button>

              <p className="text-center text-xs text-slate-500">You won't be charged yet</p>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified host</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Instant confirmation</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
