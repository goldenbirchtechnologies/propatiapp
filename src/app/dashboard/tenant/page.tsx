'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  isLoading?: boolean;
}

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  type: string;
  verified: boolean;
  views: number;
  imageUrl?: string;
  purpose: 'rent' | 'buy' | 'short-let' | 'shared';
  isLoading?: boolean;
}

interface PurposeSwitcherProps {
  purposes: Array<{
    key: string;
    icon: string;
    label: string;
    description: string;
    color: 'residential' | 'commercial';
  }>;
  isLoading?: boolean;
}

// Skeleton Components
function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-lg border border-outline-variant p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-surface-variant rounded w-24 mb-3"></div>
          <div className="h-8 bg-surface-variant rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-surface-variant rounded-xl"></div>
      </div>
      <div className="mt-4 h-3 bg-surface-variant rounded w-20"></div>
    </div>
  );
}

function SkeletonPropertyCard() {
  return (
    <div className="bg-white rounded-lg border border-outline-variant overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-variant"></div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-surface-variant rounded w-16"></div>
          <div className="h-6 bg-surface-variant rounded w-28"></div>
        </div>
        <div className="h-5 bg-surface-variant rounded w-full mb-2"></div>
        <div className="h-4 bg-surface-variant rounded w-3/4 mb-3"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-surface-variant rounded w-20"></div>
          <div className="h-3 bg-surface-variant rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

function SkeletonPurposeCard() {
  return (
    <div className="bg-white rounded-lg border border-outline-variant p-4 animate-pulse">
      <div className="w-10 h-10 bg-surface-variant rounded-full mx-auto mb-3"></div>
      <div className="h-4 bg-surface-variant rounded w-16 mx-auto mb-2"></div>
      <div className="h-3 bg-surface-variant rounded w-20 mx-auto"></div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, trend, trendUp = true, href, isLoading }: StatCardProps) {
  if (isLoading) return <SkeletonStatCard />;

  const Card = (
    <div className="bg-white rounded-lg border border-outline-variant p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-secondary-container cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant mb-2">{label}</p>
          <p className="text-3xl font-headline-lg font-bold text-on-surface">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#E8F5F1] text-success-emerald">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={{ color: trendUp ? '#00B37E' : '#F5A623' }}>
            {trendUp ? 'trending_up' : 'trending_down'}
          </span>
          <span className="text-xs font-medium" style={{ color: trendUp ? '#00B37E' : '#F5A623' }}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{Card}</Link> : Card;
}

// Purpose Switcher Component
function PurposeSwitcher({ purposes, isLoading }: PurposeSwitcherProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-outline-variant p-6">
        <div className="h-6 bg-surface-variant rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPurposeCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-outline-variant p-6">
      <h3 className="font-headline-md font-bold text-on-surface mb-4">What are you looking for?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {purposes.map((purpose) => (
          <Link
            key={purpose.key}
            href={`/dashboard/tenant/search?purpose=${purpose.key}`}
            className="bg-white rounded-lg border border-outline-variant p-4 text-center transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:border-secondary-container"
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                backgroundColor: purpose.color === 'residential' ? '#E0F2F1' : '#FFF4E6',
              }}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ color: purpose.color === 'residential' ? '#00897B' : '#F5A623' }}
              >
                {purpose.icon}
              </span>
            </div>
            <div className="font-semibold text-on-surface mb-1">{purpose.label}</div>
            <div className="text-xs text-on-surface-variant">{purpose.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Property Card Component
function PropertyCard({
  id,
  title,
  location,
  price,
  beds,
  baths,
  sqm,
  type,
  verified,
  views,
  imageUrl,
  purpose,
  isLoading
}: PropertyCardProps) {
  if (isLoading) return <SkeletonPropertyCard />;

  const purposeColors = {
    rent: { bg: '#E0F2F1', text: '#00897B' },
    buy: { bg: '#FFF4E6', text: '#F5A623' },
    'short-let': { bg: '#E3F2FD', text: '#1976D2' },
    shared: { bg: '#F3E5F5', text: '#7B1FA2' },
  };

  const color = purposeColors[purpose] || purposeColors.rent;

  return (
    <Link
      href={`/properties/${id}`}
      className="bg-white rounded-lg border border-outline-variant overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-secondary-container group"
    >
      <div className="aspect-video bg-surface-variant relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant">home</span>
          </div>
        )}
        {verified && (
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: '#F5A623', color: 'white' }}
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              Verified
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            <span className="material-symbols-outlined text-sm">bed</span>
            {beds} Bed
          </span>
          <span className="font-headline-md font-bold text-on-surface">{price}</span>
        </div>
        <h3 className="font-headline-sm font-bold text-on-surface mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">location_on</span>
          {location} • {beds} bed • {baths} bath • {sqm} sqm
        </p>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">{type === 'Apartment' ? 'apartment' : 'home'}</span>
            {type}
          </span>
          {verified && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-success-emerald">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Verified
              </span>
            </>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">visibility</span>
            {views} views
          </span>
        </div>
      </div>
    </Link>
  );
}

// Main Dashboard Component
export default function TenantDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Simulate data loading
  useEffect(() => {
    // In production, fetch real user data and dashboard stats
    const loadDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUserName('Chinedu'); // Replace with actual user data
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const purposes = [
    { key: 'rent', icon: 'home', label: 'Rent', description: 'Long-term rentals', color: 'residential' as const },
    { key: 'buy', icon: 'real_estate_agent', label: 'Buy', description: 'Properties for sale', color: 'commercial' as const },
    { key: 'short-let', icon: 'beach_access', label: 'Short-let', description: 'Short stays', color: 'residential' as const },
    { key: 'shared', icon: 'group', label: 'Shared', description: 'Flatmates wanted', color: 'commercial' as const },
  ];

  const stats: StatCardProps[] = [
    { label: 'Saved Properties', value: '12', icon: 'favorite', trend: '+3 this week', trendUp: true, href: '/dashboard/tenant/saved' },
    { label: 'Active Applications', value: '3', icon: 'description', trend: '2 pending review', trendUp: true, href: '/dashboard/tenant/applications' },
    { label: 'Upcoming Viewings', value: '2', icon: 'event', trend: 'Next: Tomorrow 2PM', trendUp: true, href: '/dashboard/tenant/viewings' },
    { label: 'Messages', value: '5', icon: 'chat', trend: '2 unread', trendUp: false, href: '/dashboard/tenant/messages' },
  ];

  const recommendedProperties: PropertyCardProps[] = [
    {
      id: '1',
      title: 'Modern 3BR Apartment in Lekki Phase 1',
      location: 'Lekki Phase 1, Lagos',
      price: '₦2,500,000/yr',
      beds: 3,
      baths: 2,
      sqm: 150,
      type: 'Apartment',
      verified: true,
      views: 245,
      purpose: 'rent',
      imageUrl: undefined,
    },
    {
      id: '2',
      title: 'Luxury 4BR Duplex with Pool in Ikoyi',
      location: 'Ikoyi, Lagos',
      price: '₦8,500,000/yr',
      beds: 4,
      baths: 3,
      sqm: 280,
      type: 'Duplex',
      verified: true,
      views: 189,
      purpose: 'rent',
      imageUrl: undefined,
    },
    {
      id: '3',
      title: 'Cozy 2BR Flat in Yaba',
      location: 'Yaba, Lagos',
      price: '₦1,200,000/yr',
      beds: 2,
      baths: 2,
      sqm: 90,
      type: 'Flat',
      verified: true,
      views: 312,
      purpose: 'rent',
      imageUrl: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Add Material Symbols font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          {isLoading ? (
            <>
              <div className="h-10 bg-surface-variant rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-surface-variant rounded w-80 animate-pulse"></div>
            </>
          ) : (
            <>
              <h1 className="font-headline-xl text-on-surface mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-on-surface-variant text-lg">
                Find your perfect home or manage your rental.
              </p>
            </>
          )}
        </div>

        {/* Purpose Switcher */}
        <div className="mb-8">
          <PurposeSwitcher purposes={purposes} isLoading={isLoading} />
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="font-headline-lg text-on-surface mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} isLoading={isLoading} />
            ))}
          </div>
        </div>

        {/* Recommended Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-lg text-on-surface">Recommended for You</h2>
            {!isLoading && (
              <Link
                href="/dashboard/tenant/search"
                className="text-sm font-semibold text-secondary-container hover:text-secondary transition-colors flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <SkeletonPropertyCard />
                <SkeletonPropertyCard />
                <SkeletonPropertyCard />
              </>
            ) : (
              recommendedProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        {!isLoading && (
          <section className="mt-12">
            <h2 className="font-headline-lg text-on-surface mb-6">Recent Activity</h2>
            <div className="bg-white rounded-lg border border-outline-variant p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 inline-block">
                history
              </span>
              <p className="text-on-surface-variant mb-4">No recent activity yet</p>
              <Link
                href="/dashboard/tenant/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-container text-white rounded-lg font-semibold hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span className="material-symbols-outlined">search</span>
                Start Browsing Properties
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Stitch Color CSS Variables */}
      <style jsx global>{`
        :root {
          --residential-teal: #00897B;
          --residential-teal-bg: #E0F2F1;
          --commercial-gold: #F5A623;
          --commercial-gold-bg: #FFF4E6;
        }

        /* Material Symbols Configuration */
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4c6ce;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
