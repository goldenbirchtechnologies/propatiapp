'use client';

import { Building2, CheckCircle2, Clock, Users, MessageSquare, ArrowRight, Home, ShoppingCart, Gavel, BedDouble, Wallet, TrendingUp, CalendarCheck, CalendarX } from 'lucide-react';
import { StatCard, PageHeader } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';

interface AgentDashboardClientProps {
  userName: string;
  managedProperties: number;
  activeListings: number;
  pendingInvites: number;
  totalUnits: number;
  vacantUnits: number;
  enquiries: number;
  saleListingsCount: number;
  saleListingsValue: number;
  buyerApplicationsCount: number;
  pendingAgreementsCount: number;
  shortletListingsCount: number;
  shortletTotalUnits: number;
  shortletOccupiedUnits: number;
  shortletOccupancyRate: number;
  shortletCheckinsToday: number;
  shortletCheckoutsToday: number;
  shortletRevenue: number;
  shortletAvgDailyRate: number;
  previewListings: Array<{
    id: string;
    title: string;
    address: string;
    listingType: string;
    price: number;
    coverImage: string | null;
    unitCount: number;
    vacantCount: number;
    occupiedCount: number;
    units: Array<{
      id: string;
      unitNumber: string;
      occupancy: string;
      currentTenant: string | null;
    }>;
  }>;
}

function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AgentDashboardClient({
  userName,
  managedProperties,
  activeListings,
  pendingInvites,
  totalUnits,
  vacantUnits,
  enquiries,
  saleListingsCount,
  saleListingsValue,
  buyerApplicationsCount,
  pendingAgreementsCount,
  shortletListingsCount,
  shortletTotalUnits,
  shortletOccupiedUnits,
  shortletOccupancyRate,
  shortletCheckinsToday,
  shortletCheckoutsToday,
  shortletRevenue,
  shortletAvgDailyRate,
  previewListings,
}: AgentDashboardClientProps) {
  const propertyWord = managedProperties === 1 ? 'property' : 'properties';

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Agent Dashboard"
        description={`Welcome back, ${userName}. You are managing ${managedProperties} ${propertyWord}.`}
        actions={
          <Link
            href="/dashboard/agent/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Properties <ArrowRight size={14} />
          </Link>
        }
      />

      {/* Primary KPI Quick Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Managed Properties"
          value={String(managedProperties)}
          icon={Building2}
          href="/dashboard/agent/properties"
        />
        <StatCard
          label="Active Listings"
          value={String(activeListings)}
          icon={CheckCircle2}
          href="/dashboard/agent/listings"
        />
        <StatCard
          label="Vacant Units"
          value={String(vacantUnits)}
          icon={Clock}
          href="/dashboard/agent/properties"
        />
        <StatCard
          label="Pending Invites"
          value={String(pendingInvites)}
          icon={Users}
          href="/dashboard/agent/invites"
        />
      </div>

      {/* Buy / Sell Pipeline */}
      <div className="grid lg:grid-cols-3 gap-4">
        <StatCard
          label="Buyer Enquiries"
          value={String(buyerApplicationsCount)}
          sub={formatNaira(saleListingsValue)}
          icon={ShoppingCart}
          accentColor="#3b82f6"
          href="/dashboard/agent/pipeline"
        />
        <StatCard
          label="For Sale Listings"
          value={String(saleListingsCount)}
          sub={`${formatNaira(saleListingsValue)} portfolio`}
          icon={Gavel}
          accentColor="#f59e0b"
          href="/dashboard/agent/listings"
        />
        <StatCard
          label="Pending Closings"
          value={String(pendingAgreementsCount)}
          icon={CheckCircle2}
          accentColor="#8b5cf6"
          href="/dashboard/agent/deals"
        />
      </div>

      {/* Shortlet Metrics */}
      <div className="grid lg:grid-cols-3 gap-4">
        <StatCard
          label="Shortlet Occupancy"
          value={`${shortletOccupancyRate}%`}
          sub={`${shortletOccupiedUnits}/${shortletTotalUnits} booked`}
          icon={BedDouble}
          accentColor="#ec4899"
          href="/dashboard/agent/properties"
        />
        <StatCard
          label="Check-ins / Check-outs"
          value={`${shortletCheckinsToday}/${shortletCheckoutsToday}`}
          sub="Today"
          icon={CalendarCheck}
          accentColor="#06b6d4"
          href="/dashboard/agent/schedule"
        />
        <StatCard
          label="Shortlet Revenue"
          value={formatNaira(shortletRevenue)}
          sub={shortletAvgDailyRate > 0 ? `${formatNaira(Math.round(shortletAvgDailyRate))} / night avg` : 'No bookings'}
          icon={Wallet}
          accentColor="#10b981"
          href="/dashboard/agent/earnings"
        />
      </div>

      {/* Managed Properties Preview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Managed Properties</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Properties assigned to you by landlords</p>
          </div>
          <Link href="/dashboard/agent/properties" className="text-xs text-emerald-400 flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {previewListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Building2 className="w-10 h-10 text-zinc-500 mb-2" style={{ opacity: 0.4 }} />
            <p className="text-sm text-zinc-400">No managed properties yet</p>
            <p className="text-xs text-zinc-600 mt-1">Accepted invites will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {previewListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/dashboard/agent/properties`}
                className="group rounded-xl border border-white/[0.08] bg-zinc-950/60 overflow-hidden hover:border-zinc-700/80 transition-colors"
              >
                <div className="relative h-32 bg-zinc-900">
                  {listing.coverImage ? (
                    <img src={listing.coverImage} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Home className="h-8 w-8 text-zinc-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="text-sm font-medium text-white truncate">{listing.title}</p>
                    <p className="text-[11px] text-zinc-300 truncate">{listing.address}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Occupancy</span>
                    <span className="text-white font-medium">{listing.occupiedCount}/{listing.unitCount}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${listing.unitCount > 0 ? (listing.occupiedCount / listing.unitCount) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 capitalize">{listing.listingType.replace('_', ' ')}</span>
                    <span className="text-xs text-white font-medium">{formatNaira(listing.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/dashboard/agent/properties" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-emerald-400" />
              <p className="text-sm text-white">Properties</p>
            </div>
            <ArrowRight size={12} className="text-zinc-500" />
          </Link>
          <Link href="/dashboard/agent/listings" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <p className="text-sm text-white">Listings</p>
            </div>
            <ArrowRight size={12} className="text-zinc-500" />
          </Link>
          <Link href="/dashboard/agent/messages" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-emerald-400" />
              <p className="text-sm text-white">Messages</p>
            </div>
            <ArrowRight size={12} className="text-zinc-500" />
          </Link>
          <Link href="/dashboard/agent/payments" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <p className="text-sm text-white">Payments</p>
            </div>
            <ArrowRight size={12} className="text-zinc-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
