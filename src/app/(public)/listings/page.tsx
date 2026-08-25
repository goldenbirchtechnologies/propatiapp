'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CategoryToggle, type PropertyCategory } from '@/components/search/CategoryToggle';
import { PropertyCard, PropertyCardSkeleton } from '@/components/listings/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterIcon, XIcon, MapPinIcon, SearchIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type VerificationTier = 'basic' | 'verified' | 'inspected' | 'certified';
type PropertyType = 'apartment' | 'house' | 'duplex' | 'land' | 'shop' | 'office' | 'warehouse';
type ListingType = 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
type SortOption = 'verification' | 'newest' | 'price_asc' | 'price_desc';

interface Filters {
  category: PropertyCategory;
  location: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number | null;
  propertyTypes: PropertyType[];
  verificationTier: VerificationTier[];
  amenities: string[];
  listingType: ListingType | 'all';
}

// ============================================================================
// MOCK DATA (Replace with real API calls)
// ============================================================================

const MOCK_PROPERTIES = Array.from({ length: 12 }, (_, i) => {
  const category = (i % 3 === 0 ? 'residential' : i % 3 === 1 ? 'commercial' : 'short_let') as
    | 'residential'
    | 'commercial'
    | 'short_let';

  const titles: Record<string, string[]> = {
    residential: [
      '3 Bedroom Luxury Apartment with Pool',
      '2 Bedroom Duplex in Lekki',
      'Luxury 4 Bedroom Detached House',
      'Studio Apartment in VI',
    ],
    commercial: [
      'Open Plan Office Space in VI',
      'Retail Shop Front on Main Road',
      'Serviced Office in Lekki',
      'Co-working Space in Ikeja GRA',
    ],
    short_let: [
      'Short Let Studio Apartment',
      'Serviced 1 Bedroom Short Let',
      'Furnished 2 Bedroom Short Stay',
      'Luxury Short Let Flat in VI',
    ],
  };

  return {
    id: `prop-${i + 1}`,
    title: titles[category][i % titles[category].length],
    location: i % 3 === 0 ? 'Lekki Phase 1, Lagos' : i % 3 === 1 ? 'Victoria Island, Lagos' : 'Ikeja GRA, Lagos',
    price: (i + 1) * 5000000,
    pricePeriod: category === 'short_let' ? 'night' : 'year',
    category,
    verificationTier: (['basic', 'verified', 'inspected', 'certified'][i % 4]) as VerificationTier,
    listingType: (['rent', 'sale', 'short_let'][i % 3]) as ListingType,
    image: `https://picsum.photos/seed/${i + 1}/800/600`,
    specs:
      category === 'commercial'
        ? { sqm: 200, parking: 10 }
        : category === 'short_let'
          ? { beds: 1, baths: 1, sqm: 45 }
          : { beds: 3, baths: 2, sqm: 120 },
    isSaved: false,
  };
});

const AMENITIES = [
  'Swimming Pool',
  '24/7 Security',
  'Parking',
  'Gym',
  'Generator',
  'Elevator',
  'Garden',
  'Playground',
];

const RESIDENTIAL_TYPES: PropertyType[] = ['apartment', 'house', 'duplex', 'land'];
const COMMERCIAL_TYPES: PropertyType[] = ['shop', 'office', 'warehouse'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ListingsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [filters, setFilters] = React.useState<Filters>({
    category: 'residential',
    location: '',
    priceMin: 0,
    priceMax: 100000000,
    bedrooms: null,
    propertyTypes: [],
    verificationTier: [],
    amenities: [],
    listingType: 'all',
  });

  const [sortBy, setSortBy] = React.useState<SortOption>('verification');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [filtersDrawerOpen, setFiltersDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (filtersDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersDrawerOpen]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeFilterCount, setActiveFilterCount] = React.useState(0);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Count active filters (excluding defaults)
  React.useEffect(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.priceMin > 0 || filters.priceMax < 100000000) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.verificationTier.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.listingType !== 'all') count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Sync with URL params (optional)
  React.useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam === 'residential' || categoryParam === 'commercial' || categoryParam === 'short_let') {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryChange = (category: PropertyCategory) => {
    setFilters((prev) => ({
      ...prev,
      category,
      listingType: category === 'short_let' ? 'short_let' : 'all',
      propertyTypes: [],
      bedrooms: category === 'commercial' || category === 'short_let' ? null : prev.bedrooms,
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceMin: values[0],
      priceMax: values[1],
    }));
  };

  const handleBedroomSelect = (bedrooms: number | null) => {
    setFilters((prev) => ({ ...prev, bedrooms }));
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleVerificationTierToggle = (tier: VerificationTier) => {
    setFilters((prev) => ({
      ...prev,
      verificationTier: prev.verificationTier.includes(tier)
        ? prev.verificationTier.filter((t) => t !== tier)
        : [...prev.verificationTier, tier],
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'residential',
      location: '',
      priceMin: 0,
      priceMax: 100000000,
      bedrooms: null,
      propertyTypes: [],
      verificationTier: [],
      amenities: [],
      listingType: 'all',
    });
    setSortBy('verification');
  };

  const handleSaveProperty = (id: string) => {
    console.log('Save property:', id);
    // Implement save logic here
  };

  // ============================================================================
  // FILTER & SORT LOGIC
  // ============================================================================

  const filteredProperties = React.useMemo(() => {
    let results = [...MOCK_PROPERTIES];

    // Category filter
    results = results.filter((p) => p.category === filters.category);

    // Location filter
    if (filters.location) {
      results = results.filter((p) =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filter
    results = results.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // Bedrooms filter (residential only)
    if (filters.bedrooms !== null && filters.category === 'residential') {
      results = results.filter(
        (p) => p.specs.beds && p.specs.beds >= filters.bedrooms!
      );
    }

    // Property type filter
    if (filters.propertyTypes.length > 0) {
      // For demo purposes, we don't have propertyType in mock data
      // In real implementation, filter by propertyTypes
    }

    // Verification tier filter
    if (filters.verificationTier.length > 0) {
      results = results.filter((p) =>
        filters.verificationTier.includes(p.verificationTier)
      );
    }

    // Listing type filter
    if (filters.listingType !== 'all') {
      results = results.filter((p) => p.listingType === filters.listingType);
    }

    // Sort
    switch (sortBy) {
      case 'verification': {
        const tierOrder: Record<VerificationTier, number> = {
          certified: 4,
          inspected: 3,
          verified: 2,
          basic: 1,
        };
        results.sort((a, b) => tierOrder[b.verificationTier] - tierOrder[a.verificationTier]);
        break;
      }
      case 'newest':
        // In real app, sort by date
        break;
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
    }

    return results;
  }, [MOCK_PROPERTIES, filters, sortBy]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFilters = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-zinc-500">₦</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: Number(e.target.value) || 0 }))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:border-emerald-500"
            />
          </div>
          <span className="text-zinc-600">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-zinc-500">₦</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax === 100000000 ? '' : filters.priceMax}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priceMax: Number(e.target.value) || 100000000 }))
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms (Residential Only) */}
      {filters.category === 'residential' && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Bedrooms</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleBedroomSelect(filters.bedrooms === num ? null : num)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  'border border-zinc-800',
                  filters.bedrooms === num
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                )}
              >
                {num === 4 ? '4+' : num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Property Type */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">Property Type</label>
        <div className="space-y-2">
          {(filters.category === 'residential' || filters.category === 'short_let' ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES).map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => handlePropertyTypeToggle(type)}
              />
              <span className="text-sm text-white capitalize group-hover:text-emerald-400 transition-colors">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification Tier */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Verification Level
        </label>
        <div className="space-y-2">
          {(['basic', 'verified', 'inspected', 'certified'] as VerificationTier[]).map((tier) => (
            <label
              key={tier}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.verificationTier.includes(tier)}
                onCheckedChange={() => handleVerificationTierToggle(tier)}
              />
              <span className="text-sm text-white capitalize group-hover:text-emerald-400 transition-colors">
                {tier}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">Amenities</label>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => handleAmenityToggle(amenity)}
              />
              <span className="text-sm text-white group-hover:text-emerald-400 transition-colors">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="w-full"
        >
          <XIcon className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div>
      <div className="min-h-screen bg-black">
      {/* Sticky Filter Bar - Below nav */}
      <div className="sticky top-[64px] z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-16 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category Toggle */}
            <CategoryToggle
              value={filters.category}
              onChange={handleCategoryChange}
            />

            {/* Location Quick Filter */}
            <div className="hidden md:flex flex-1 max-w-xs relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Lekki, VI, Ikeja..."
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                className="pl-9 h-10 placeholder:text-zinc-600"
              />
            </div>

            {/* All Filters Button */}
            <Button
              variant="outline"
              onClick={() => setFiltersDrawerOpen(true)}
              className="relative"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verification">Verification Tier</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 py-8">
        {/* Results Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {filters.category === 'short_let' ? 'Short Let' : filters.category === 'commercial' ? 'Commercial' : 'Residential'} Properties
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-900'
                )}
                aria-label="Grid view"
              >
                <AppIcon name="grid_view" className="lucide" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-900'
                )}
                aria-label="List view"
              >
                <AppIcon name="format_list_bulleted" className="lucide" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1'
            )}>
              <PropertyCardSkeleton count={6} />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center py-16 fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 mb-4">
                <SearchIcon className="h-12 w-12 text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No properties found</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search criteria to find what you're looking for.
              </p>
              <Button onClick={handleResetFilters} variant="outline">
                <XIcon className="h-4 w-4 mr-2" />
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Property Grid */}
          {!isLoading && filteredProperties.length > 0 && (
            <div className="fade-in-stagger">
              <div className={cn(
                'grid gap-6 pb-24',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
              )}>
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    onSave={handleSaveProperty}
                    onClick={() => router.push(`/listings/${property.id}`)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {filteredProperties.length >= 12 && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      // Load more logic
                      console.log('Load more');
                    }}
                  >
                    Load More Properties
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters Drawer */}
      {filtersDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setFiltersDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 modal-slide-right">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Filters</h3>
              <button
                onClick={() => setFiltersDrawerOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto h-full pb-32">
              {renderFilters()}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm px-6 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={handleResetFilters}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  size="lg"
                  onClick={() => setFiltersDrawerOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsPageInner />
    </Suspense>
  );
}
