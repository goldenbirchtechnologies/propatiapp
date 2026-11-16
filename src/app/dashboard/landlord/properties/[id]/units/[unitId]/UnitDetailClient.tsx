'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, MapPin, Home, Bed, Bath, Maximize2, Banknote, Shield, Lock, Calendar, User,
  ExternalLink, ArrowLeft, Edit3, FileText, Download, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Unit } from '@/hooks/useUnits';

interface ListingContext {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  status: string;
}

interface UnitDetailClientProps {
  listing: ListingContext;
  unit: Omit<Unit, 'leaseStartDate' | 'leaseEndDate'> & {
  leaseStartDate: Date | string | null;
  leaseEndDate: Date | string | null;
  currentTenant: { id: string; fullName: string; email: string } | null;
};
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—';
  return `₦${Number(value).toLocaleString()}`;
}

export default function UnitDetailClient({ listing, unit }: UnitDetailClientProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);

  // Placeholder images - in production these would come from a database or storage
  const unitImages = [
    `/api/properties/${listing.id}/units/${unit.id}/photo-1`,
    `/api/properties/${listing.id}/units/${unit.id}/photo-2`,
    `/api/properties/${listing.id}/units/${unit.id}/photo-3`,
  ];

  return (
    <div className="max-w-7xl mx-auto w-full py-6 px-4 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400 text-sm">
        <Link href="/dashboard/landlord/properties" className="hover:text-primary transition-colors">Portfolio</Link>
        <ChevronRight className="h-4 w-4 text-zinc-400" />
        <Link href={`/dashboard/landlord/properties/${listing.id}`} className="hover:text-primary transition-colors">{listing.title}</Link>
        <ChevronRight className="h-4 w-4 text-zinc-400" />
        <span className="text-zinc-900 dark:text-white font-semibold">Unit {unit.unitNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Unit {unit.unitNumber}
          </h1>
          <p className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            <MapPin className="h-4 w-4 text-primary" />
            {listing.address}, {listing.area}, {listing.state}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={unit.status === 'AVAILABLE' ? 'success' : unit.status === 'OCCUPIED' ? 'default' : 'secondary'}>
            {unit.status}
          </Badge>
          <Link href={`/dashboard/landlord/properties/${listing.id}/units/${unit.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit3 className="h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-80">
        <div className="md:col-span-2 relative bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-zinc-400" />
          <span className="absolute bottom-2 right-2 text-xs text-zinc-500">Gallery Placeholder</span>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-zinc-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unit Type */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Home className="h-4 w-4" /> Type
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">{unit.type}</p>
        </div>

        {/* Size */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Maximize2 className="h-4 w-4" /> Size
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{unit.sizeSqm ? `${unit.sizeSqm} m²` : '—'}</p>
        </div>

        {/* Bedrooms */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Bed className="h-4 w-4" /> Bedrooms
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{unit.bedrooms}</p>
        </div>

        {/* Bathrooms */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Bath className="h-4 w-4" /> Bathrooms
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{unit.bathrooms}</p>
        </div>

        {/* Rent */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Banknote className="h-4 w-4" /> Rent
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatCurrency(unit.rent)}</p>
          {unit.pricePeriod && <p className="text-xs text-zinc-500 dark:text-zinc-400">per {unit.pricePeriod}</p>}
        </div>

        {/* Caution Deposit */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Shield className="h-4 w-4" /> Caution Deposit
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatCurrency(unit.cautionDeposit)}</p>
        </div>

        {/* Service Charge */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Lock className="h-4 w-4" /> Service Charge
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatCurrency(unit.serviceCharge)}</p>
        </div>

        {/* Occupancy */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
            <Home className="h-4 w-4" /> Occupancy
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">{unit.occupancy}</p>
        </div>
      </div>

      {/* Lease & Tenant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lease */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">Lease Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Start Date</span>
              <span className="font-medium text-zinc-900 dark:text-white">{unit.leaseStartDate ? new Date(unit.leaseStartDate).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">End Date</span>
              <span className="font-medium text-zinc-900 dark:text-white">{unit.leaseEndDate ? new Date(unit.leaseEndDate).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        {/* Tenant */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">Current Tenant</h3>
          </div>
          {unit.currentTenant ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Name</span>
                <span className="font-medium text-zinc-900 dark:text-white">{unit.currentTenant.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                <span className="font-medium text-zinc-900 dark:text-white">{unit.currentTenant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">ID</span>
                <span className="font-medium text-zinc-900 dark:text-white">{unit.currentTenant.id}</span>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No tenant assigned</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileText className="h-4 w-4" /> Lease Agreement
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" /> Manage Photos
        </Button>
      </div>

      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/landlord/properties/${listing.id}`)} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to property
      </Button>
    </div>
  );
}
