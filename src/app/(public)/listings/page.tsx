'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, X, Building2, Home, DollarSign, Star, MapPin, Bed, Bath, Square, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const propertyTypes = [
  { value: '', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'land', label: 'Land' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
];

const pricePeriods = [
  { value: '', label: 'Any Period' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'night', label: 'Per Night' },
  { value: 'total', label: 'Total Price' },
];

const verificationTiers = [
  { value: '', label: 'All Tiers' },
  { value: 'basic', label: 'Basic' },
  { value: 'verified', label: 'Verified' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'certified', label: 'Certified' },
];

const mockListings = [
  {
    id: 'lst_1',
    title: 'Luxury 3BR Apartment in Lekki Phase 1',
    description: 'Stunning 3-bedroom apartment with modern finishes, sea view, 24/7 security, and premium amenities.',
    listingType: 'rent',
    propertyType: 'apartment',
    address: '12 Admiralty Way, Lekki Phase 1',
    area: 'Lekki Phase 1',
    price: 4500000,
    pricePeriod: 'year',
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    sizeSqm: 180,
    furnished: true,
    parkingSpaces: 2,
    amenities: ['AC', 'Generator', 'Pool', 'Gym', 'Security', 'Water Treatment', 'Smart Home'],
    verificationTier: 'certified',
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  },
  {
    id: 'lst_2',
    title: '2BR Apartment for Sale in Ikeja GRA',
    description: 'Well-maintained 2-bedroom apartment in prime Ikeja GRA. Close to airport, shopping malls, and major roads.',
    listingType: 'sale',
    propertyType: 'apartment',
    address: '25 Oba Akran Avenue, Ikeja GRA',
    area: 'Ikeja GRA',
    price: 85000000,
    pricePeriod: 'total',
    bedrooms: 2,
    bathrooms: 2,
    toilets: 3,
    sizeSqm: 120,
    furnished: false,
    parkingSpaces: 1,
    amenities: ['AC', 'Generator', 'Security', 'Water Treatment'],
    verificationTier: 'verified',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  },
  {
    id: 'lst_3',
    title: 'Short-Let Studio in Victoria Island',
    description: 'Fully serviced studio apartment for short stays. Walking distance to business district and nightlife.',
    listingType: 'short_let',
    propertyType: 'apartment',
    address: '8 Kofo Abayomi Street, Victoria Island',
    area: 'Victoria Island',
    price: 85000,
    pricePeriod: 'night',
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    sizeSqm: 45,
    furnished: true,
    parkingSpaces: 1,
    amenities: ['AC', 'WiFi', 'Generator', 'Pool', 'Gym', 'Security', 'Housekeeping', 'Netflix'],
    verificationTier: 'inspected',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  },
  {
    id: 'lst_4',
    title: 'Commercial Office Space in Yaba',
    description: 'Modern open-plan office space suitable for tech startups. High-speed internet, meeting rooms, and 24/7 access.',
    listingType: 'rent',
    propertyType: 'office',
    address: '42 Montgomery Road, Yaba',
    area: 'Yaba',
    price: 12000000,
    pricePeriod: 'year',
    sizeSqm: 200,
    parkingSpaces: 5,
    amenities: ['High-speed Internet', 'Generator', 'AC', 'Security', 'Meeting Rooms', 'Kitchen', 'Parking'],
    verificationTier: 'verified',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
  },
  {
    id: 'lst_5',
    title: '4BR Duplex in Surulere',
    description: 'Spacious family duplex with large compound, BQ, and modern fittings. Quiet residential area.',
    listingType: 'rent',
    propertyType: 'duplex',
    address: '15 Adeniran Ogunsanya, Surulere',
    area: 'Surulere',
    price: 3200000,
    pricePeriod: 'year',
    bedrooms: 4,
    bathrooms: 4,
    toilets: 5,
    sizeSqm: 280,
    furnished: false,
    parkingSpaces: 3,
    amenities: ['AC', 'Generator', 'Borehole', 'Security', 'BQ', 'Large Compound'],
    verificationTier: 'basic',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
  },
  {
    id: 'lst_6',
    title: 'Luxury Penthouse in Ikoyi',
    description: 'Exclusive penthouse with panoramic Lagos views, private terrace, and premium finishes.',
    listingType: 'sale',
    propertyType: 'apartment',
    address: '5 Bourdillon Road, Ikoyi',
    area: 'Ikoyi',
    price: 450000000,
    pricePeriod: 'total',
    bedrooms: 4,
    bathrooms: 4,
    toilets: 5,
    sizeSqm: 350,
    furnished: true,
    parkingSpaces: 3,
    amenities: ['AC', 'Generator', 'Pool', 'Gym', 'Security', 'Smart Home', 'Private Terrace', 'Wine Cellar'],
    verificationTier: 'certified',
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  },
];

function formatCurrency(amount: number, period: string): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const periodLabels: Record<string, string> = {
    month: '/month',
    year: '/year',
    night: '/night',
    total: '',
  };

  return `${formatted}${periodLabels[period] || ''}`;
}

function ListingCard({ listing }: { listing: typeof mockListings[0] }) {
  const imageUrl = listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <Card className="card-hover overflow-hidden h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            {listing.isFeatured && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
            <Badge
              variant={
                listing.verificationTier === 'certified' ? 'verification' :
                listing.verificationTier === 'inspected' ? 'success' :
                listing.verificationTier === 'verified' ? 'default' : 'secondary'
              }
              className="capitalize"
            >
              {listing.verificationTier}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="capitalize gap-1">
              {listing.listingType.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {listing.area}, {listing.address.split(',')[0]}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-primary">
                {formatCurrency(listing.price, listing.pricePeriod)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.bedrooms && (
              <Badge variant="outline" className="gap-1">
                <Bed className="h-3 w-3" />
                {listing.bedrooms} BR
              </Badge>
            )}
            {listing.bathrooms && (
              <Badge variant="outline" className="gap-1">
                <Bath className="h-3 w-3" />
                {listing.bathrooms} BA
              </Badge>
            )}
            {listing.sizeSqm && (
              <Badge variant="outline" className="gap-1">
                <Square className="h-3 w-3" />
                {listing.sizeSqm}m²
              </Badge>
            )}
            {listing.furnished && (
              <Badge variant="outline" className="gap-1">
                <Home className="h-3 w-3" />
                Furnished
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1 max-h-10 overflow-hidden">
            {listing.amenities?.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {listing.amenities && listing.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{listing.amenities.length - 4} more
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/listings/${listing.id}`}>
              View Details
              <ChevronDown className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get('minBedrooms') || '');
  const [verificationTier, setVerificationTier] = useState(searchParams.get('verificationTier') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (propertyType) params.set('propertyType', propertyType);
    if (area) params.set('area', area);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minBedrooms) params.set('minBedrooms', minBedrooms);
    if (verificationTier) params.set('verificationTier', verificationTier);
    if (sortBy) params.set('sortBy', sortBy);
    router.push(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setListingType('');
    setPropertyType('');
    setArea('');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setVerificationTier('');
    router.push('/listings');
  };

  const hasFilters = listingType || propertyType || area || minPrice || maxPrice || minBedrooms || verificationTier;

  let filteredListings = mockListings;
  if (listingType) filteredListings = filteredListings.filter(l => l.listingType === listingType);
  if (propertyType) filteredListings = filteredListings.filter(l => l.propertyType === propertyType);
  if (area) filteredListings = filteredListings.filter(l => l.area.toLowerCase().includes(area.toLowerCase()));
  if (verificationTier) filteredListings = filteredListings.filter(l => l.verificationTier === verificationTier);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Perfect Property</h1>
        <p className="mt-2 text-muted-foreground">
          {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn('gap-2', listingType && 'bg-primary text-primary-foreground')}>
                <Building2 className="h-4 w-4" />
                Type
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {propertyTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => { setPropertyType(type.value); handleFilterChange(); }}
                  className={cn(propertyType === type.value && 'bg-accent')}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn('gap-2', listingType && 'bg-primary text-primary-foreground')}>
                <DollarSign className="h-4 w-4" />
                Listing Type
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setListingType(''); handleFilterChange(); }}>All</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setListingType('rent'); handleFilterChange(); }}>Rent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setListingType('sale'); handleFilterChange(); }}>Buy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setListingType('short_let'); handleFilterChange(); }}>Short Let</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setListingType('commercial'); handleFilterChange(); }}>Commercial</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn('gap-2', verificationTier && 'bg-primary text-primary-foreground')}>
                <Star className="h-4 w-4" />
                Verification
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {verificationTiers.map((tier) => (
                <DropdownMenuItem
                  key={tier.value}
                  onClick={() => { setVerificationTier(tier.value); handleFilterChange(); }}
                  className={cn(verificationTier === tier.value && 'bg-accent')}
                >
                  {tier.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Sort
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSortBy('newest'); handleFilterChange(); }}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('price_asc'); handleFilterChange(); }}>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('price_desc'); handleFilterChange(); }}>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('most_verified'); handleFilterChange(); }}>Most Verified</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className={cn('transition-all duration-200', showFilters ? 'block' : 'hidden')}>
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="area" className="block text-sm font-medium mb-1">Area / Location</label>
                <Input
                  id="area"
                  placeholder="e.g., Lekki, Ikeja, Victoria Island"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium mb-1">Min Price (₦)</label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="500000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">Max Price (₦)</label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="5000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="minBedrooms" className="block text-sm font-medium mb-1">Min Bedrooms</label>
                <Input
                  id="minBedrooms"
                  type="number"
                  min="0"
                  placeholder="1"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {listingType && (
              <Badge variant="secondary" className="gap-1">
                {listingType.charAt(0).toUpperCase() + listingType.slice(1).replace('_', ' ')}
                <X className="h-3 w-3" onClick={() => { setListingType(''); handleFilterChange(); }} />
              </Badge>
            )}
            {propertyType && (
              <Badge variant="secondary" className="gap-1">
                {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
                <X className="h-3 w-3" onClick={() => { setPropertyType(''); handleFilterChange(); }} />
              </Badge>
            )}
            {area && (
              <Badge variant="secondary" className="gap-1">
                {area}
                <X className="h-3 w-3" onClick={() => { setArea(''); handleFilterChange(); }} />
              </Badge>
            )}
            {verificationTier && (
              <Badge variant="secondary" className="gap-1">
                {verificationTier.charAt(0).toUpperCase() + verificationTier.slice(1)}
                <X className="h-3 w-3" onClick={() => { setVerificationTier(''); handleFilterChange(); }} />
              </Badge>
            )}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Results */}
      <div className={cn(
        'grid gap-6',
        viewMode === 'grid'
          ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search criteria</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" disabled>Previous</Button>
        <Button variant="default">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}