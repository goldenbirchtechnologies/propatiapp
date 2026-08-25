'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, BedDouble, Bath, Maximize, MapPin, Trash2, Share2, Eye, Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, StatCard, Avatar, StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SavedProperty {
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
  status: string;
  images: { url: string }[];
  landlord: { fullName: string; avatarUrl?: string };
  savedAt: string;
}

export default function TenantSavedPropertiesClient({ initialSavedProperties }: { initialSavedProperties: SavedProperty[] }) {
  const [saved, setSaved] = useState<Set<string>>(new Set(initialSavedProperties.map((p) => p.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filtered = initialSavedProperties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Properties"
        description="Your collection of favorite properties."
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">{filtered.length} properties saved</div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            className={viewMode === 'grid' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-zinc-800 text-zinc-400'}
            onClick={() => setViewMode('grid')}
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            className={viewMode === 'list' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-zinc-800 text-zinc-400'}
            onClick={() => setViewMode('list')}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search saved properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800 text-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">No saved properties</h3>
          <p className="text-zinc-400 mb-4">Browse properties and save your favorites.</p>
          <Button asChild>
            <Link href="/dashboard/tenant/search">Search Properties</Link>
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-4'
        )}>
          {filtered.map((property) => {
            const isSaved = saved.has(property.id);
            const image = property.images[0]?.url || '/placeholder-property.png';

            return (
              <Card key={property.id} className="glass-card overflow-hidden">
                <div className="relative">
                  <img
                    src={image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={property.status} className="bg-black/40 backdrop-blur-sm" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
                      onClick={() => toggleSave(property.id)}
                    >
                      <Heart className={cn('h-4 w-4', isSaved && 'fill-red-500 text-red-500')} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
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
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <Avatar
                      src={property.landlord?.avatarUrl || undefined}
                      name={property.landlord?.fullName || 'L'}
                      size="sm"
                    />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                        <Link href={`/listings/${property.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
