'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ListingData = {
  price: number;
  serviceCharge: number | null;
  cautionDeposit: number | null;
  pricePeriod: string | null;
  availableFrom: string | null;
  id: string;
};

type Props = {
  listing: ListingData;
};

export default function BookingCard({ listing }: Props) {
  const [duration, setDuration] = useState('1');

  const months = parseInt(duration, 10);
  const totalRent = listing.price * months;
  const serviceCharge = listing.serviceCharge || 0;
  const cautionDeposit = listing.cautionDeposit || 0;
  const grandTotal = totalRent + serviceCharge + cautionDeposit;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const pricePeriodLabel =
    listing.pricePeriod === 'night'
      ? '/ Night'
      : listing.pricePeriod === 'year'
        ? '/ Year'
        : listing.pricePeriod === 'total'
          ? ''
          : '/ Month';

  return (
    <div className="border border-white/[0.08] rounded-2xl p-6 shadow-none bg-zinc-900 space-y-6">
      {listing.availableFrom && (
        <div className="bg-zinc-900 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4" />
          Available from:{' '}
          <span className="font-semibold">
            {new Date(listing.availableFrom).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      )}

      <div>
        <p className="text-xs uppercase font-semibold text-zinc-500">Rent Price</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-extrabold text-white">
            {formatCurrency(listing.price)}
          </span>
          <span className="text-zinc-500 text-sm">{pricePeriodLabel}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white uppercase mb-2">
          Select Duration
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-zinc-950/50 text-white"
        >
          <option value="1">1 Month</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
        </select>
      </div>

      <div className="space-y-3 text-sm border-t border-white/[0.08] pt-4 text-zinc-500">
        <div className="flex justify-between">
          <span>Rent ({duration} mo)</span>
          <span className="font-medium text-white">{formatCurrency(totalRent)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Charge</span>
          <span className="font-medium text-white">{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="flex justify-between">
          <span>Refundable Caution Deposit</span>
          <span className="font-medium text-white">{formatCurrency(cautionDeposit)}</span>
        </div>

        <div className="border-t border-white/[0.08] pt-3 flex justify-between items-center">
          <span className="font-bold text-base text-white">Total</span>
          <span className="font-extrabold text-xl text-white">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link href={`/dashboard/landlord/properties/${listing.id}`} className="block">
          <Button className="w-full" size="lg">
            View Property
          </Button>
        </Link>
        <Link href={`/dashboard/landlord/properties`} className="block">
          <Button variant="outline" className="w-full" size="lg">
            All Properties
          </Button>
        </Link>
      </div>
    </div>
  );
}
