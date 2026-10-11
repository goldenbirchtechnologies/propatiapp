'use client';

import Link from 'next/link';

/**
 * Zillow-style footer with city/state recommendations for each use case.
 * Clicking a city navigates to /listings with the location filtered
 * via the `q` query parameter (read by the Listings client).
 */

const realEstateCities = [
  { label: 'Lagos', state: 'Lagos' },
  { label: 'Lagos Mainland', state: 'Lagos' },
  { label: 'Victoria Island', state: 'Lagos' },
  { label: 'Ikoyi', state: 'Lagos' },
  { label: 'Abuja', state: 'Abuja' },
  { label: 'Ikeja', state: 'Lagos' },
  { label: 'Lekki', state: 'Lagos' },
  { label: 'Badore', state: 'Lagos' },
];

const rentalCities = [
  { label: 'Lagos', state: 'Lagos' },
  { label: 'Abuja', state: 'Abuja' },
  { label: 'Ibadan', state: 'Oyo' },
  { label: 'Port Harcourt', state: 'Rivers' },
  { label: 'Enugu', state: 'Enugu' },
  { label: 'Benin City', state: 'Edo' },
  { label: 'Kano', state: 'Kano' },
  { label: 'Abeokuta', state: 'Ogun' },
];

const mortgageStates = [
  'Abia', 'Adamawa', 'Akwa-Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
];

const browseStates = [
  'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Kano', 'Kaduna', 'Anambra',
  'Delta', 'Edo', 'Enugu', 'Abia', 'Rivers', 'Cross River', 'Kano', 'Benue',
];

export default function ZillowStyleFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommendation blurb */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">
            About PROPATI&apos;s Recommendations
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">
            Recommendations are personalized based on your location, search activity, and viewed or saved homes so you never miss a suitable listing in your preferred Nigerian city.
          </p>
        </div>

        {/* 4-column city grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Real Estate */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              Real Estate
            </h4>
            <Link
              href="/listings"
              className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
            >
              Browse all homes
            </Link>
            {realEstateCities.map((c) => (
              <Link
                key={c.label}
                href={`/listings?q=${encodeURIComponent(c.state)}`}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                {c.label} real estate
              </Link>
            ))}
          </div>

          {/* Rentals */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              Rentals
            </h4>
            <Link
              href="/listings"
              className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
            >
              Rental buildings
            </Link>
            {rentalCities.map((c) => (
              <Link
                key={c.label}
                href={`/listings?q=${encodeURIComponent(c.state)}`}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                {c.label} apartments for rent
              </Link>
            ))}
          </div>

          {/* Browse Homes */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              Browse Homes
            </h4>
            {browseStates.slice(0, 8).map((state) => (
              <Link
                key={state}
                href={`/listings?q=${encodeURIComponent(state)}`}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                {state} homes
              </Link>
            ))}
          </div>

          {/* Mortgage Rates */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              Mortgage Rates
            </h4>
            <Link
              href="/mortgage-rates"
              className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
            >
              Current mortgage rates
            </Link>
            {mortgageStates.slice(0, 8).map((state) => (
              <Link
                key={state}
                href={`/mortgage-rates?q=${encodeURIComponent(state)}`}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                {state} mortgage rates
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
