'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, BedDouble, Bath, Maximize, Search, Filter, X, Grid, LayoutList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, StatCard, Avatar, StatusBadge, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

type PropertyStatus = 'available' | 'under_offer' | 'sold';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  currency: string;
  pricePeriod?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  listingType: string;
  status: PropertyStatus;
  description?: string;
  amenities: string[];
  images: { url: string }[];
  landlord: { fullName: string; avatarUrl?: string };
  createdAt: string;
}

interface Filters {
  propertyType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
  amenities: string[];
}

export default function TenantSearchClient({ initialProperties, filters: initialFilters, cities, totalCount }: {
  initialProperties: Property[];
  filters: Filters;
  cities: string[];
  totalCount: number;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find a Property"
        description="Browse available properties and find your perfect home."
      />

      {/* Search + Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by area, city, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-950 border-white/[0.08] text-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className={viewMode === 'grid' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-white/[0.08] text-zinc-400'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              className={viewMode === 'list' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-white/[0.08] text-zinc-400'}
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {cities.slice(0, 12).map((city) => (
            <Badge
              key={city}
              variant={searchQuery.toLowerCase() === city.toLowerCase() ? 'secondary' : 'outline'}
              className={cn(
                'cursor-pointer',
                searchQuery.toLowerCase() === city.toLowerCase()
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'border-white/[0.08] text-zinc-400 hover:text-white'
              )}
              onClick={() => setSearchQuery(city)}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {city}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['Apartment', 'Duplex', 'Townhouse', 'Detached', 'Semi-Detached', 'Studio', 'Shared'].map((type) => (
            <Badge
              key={type}
              variant="outline"
              className="cursor-pointer border-white/[0.08] text-zinc-400 hover:text-white"
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">{totalCount} properties found</div>
        <Button variant="outline" size="sm" className="border-white/[0.08] text-zinc-400">
          <Filter className="h-4 w-4 mr-2" /> More Filters
        </Button>
      </div>

      {/* Property Grid/List */}
      <div className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-4'
      )}>
        {initialProperties.map((property) => {
          const isSaved = saved.has(property.id);
          const image = property.images[0]?.url || '/placeholder-property.png';

          return (
            <div className="glass-card" key={property.id} className="glass-card overflow-hidden">
              <div className="relative">
                <img
                  src={image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <StatusBadge status={property.status} className="bg-black/40 backdrop-blur-sm" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
                  onClick={() => toggleSave(property.id)}
                >
                  <Heart className={cn('h-4 w-4', isSaved && 'fill-red-500 text-red-500')} />
                </Button>
              </div>
              <div className="p-6 p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-white line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1">{property.address}, {property.city}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{formatPrice(property.price)}</span>
                  {property.pricePeriod && (
                    <span className="text-xs text-zinc-400">/{property.pricePeriod}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="h-3.5 w-3.5" /> {property.area} sqm
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <Avatar
                    src={property.landlord?.avatarUrl || undefined}
                    name={property.landlord?.fullName || 'L'}
                    size="sm"
                  />
                  <Button asChild variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                    <Link href={`/listings/${property.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {initialProperties.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">No properties found</h3>
          <p className="text-zinc-400">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
