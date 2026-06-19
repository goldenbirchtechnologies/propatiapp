'use client';

import * as React from 'react';
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
type PropertyType = 'apartment' | 'house' | 'duplex' | 'townhouse' | 'land' | 'shop' | 'office' | 'warehouse';
type ListingType = 'rent' | 'lease' | 'sale';
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

const MOCK_PROPERTIES = Array.from({ length: 12 }, (_, i) => ({
  id: `prop-${i + 1}`,
  title: i % 2 === 0
    ? '3 Bedroom Luxury Apartment with Pool'
    : 'Modern Office Space in Prime Location',
  location: i % 3 === 0 ? 'Lekki Phase 1, Lagos' : i % 3 === 1 ? 'Victoria Island, Lagos' : 'Ikeja GRA, Lagos',
  price: (i + 1) * 5000000,
  pricePeriod: 'year' as const,
  category: (i % 2 === 0 ? 'residential' : 'commercial') as 'residential' | 'commercial',
  verificationTier: (['basic', 'verified', 'inspected', 'certified'][i % 4]) as VerificationTier,
  listingType: (['rent', 'lease', 'sale'][i % 3]) as ListingType,
  image: `https://picsum.photos/seed/${i + 1}/800/600`,
  specs: i % 2 === 0
    ? { beds: 3, baths: 2, sqm: 120 }
    : { sqm: 200, parking: 10 },
  isSaved: false,
}));

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

const RESIDENTIAL_TYPES: PropertyType[] = ['apartment', 'house', 'duplex', 'townhouse', 'land'];
const COMMERCIAL_TYPES: PropertyType[] = ['shop', 'office', 'warehouse'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ListingsPage() {
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
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
    if (categoryParam === 'residential' || categoryParam === 'commercial') {
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
      propertyTypes: [], // Reset property types when category changes
      bedrooms: category === 'commercial' ? null : prev.bedrooms, // Reset bedrooms for commercial
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
      case 'verification':
        const tierOrder: Record<VerificationTier, number> = {
          certified: 4,
          inspected: 3,
          verified: 2,
          basic: 1,
        };
        results.sort((a, b) => tierOrder[b.verificationTier] - tierOrder[a.verificationTier]);
        break;
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
      {/* Location Search */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">Location</label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
          <Input
            type="text"
            placeholder="Lekki, VI, Ikeja..."
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">
          Price Range
        </label>
        <div className="px-2">
          <Slider
            min={0}
            max={100000000}
            step={1000000}
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={handlePriceRangeChange}
            className="mb-4"
          />
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span>₦{(filters.priceMin / 1000000).toFixed(0)}M</span>
            <span>-</span>
            <span>₦{(filters.priceMax / 1000000).toFixed(0)}M</span>
          </div>
        </div>
      </div>

      {/* Bedrooms (Residential Only) */}
      {filters.category === 'residential' && (
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Bedrooms</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleBedroomSelect(filters.bedrooms === num ? null : num)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  'border border-outline-variant',
                  filters.bedrooms === num
                    ? 'bg-residential-teal text-white border-residential-teal'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
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
        <label className="block text-sm font-semibold text-on-surface mb-2">Property Type</label>
        <div className="space-y-2">
          {(filters.category === 'residential' ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES).map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => handlePropertyTypeToggle(type)}
              />
              <span className="text-sm text-on-surface capitalize group-hover:text-residential-teal transition-colors">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification Tier */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">
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
              <span className="text-sm text-on-surface capitalize group-hover:text-residential-teal transition-colors">
                {tier}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">Amenities</label>
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
              <span className="text-sm text-on-surface group-hover:text-residential-teal transition-colors">
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
    <div className="min-h-screen bg-surface">
      {/* Sticky Filter Bar - Below nav */}
      <div className="sticky top-[64px] z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category Toggle */}
            <CategoryToggle
              value={filters.category}
              onChange={handleCategoryChange}
            />

            {/* Location Quick Filter */}
            <div className="hidden md:flex flex-1 max-w-xs relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="text"
                placeholder="Lekki, VI, Ikeja..."
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                className="pl-9 h-10"
              />
            </div>

            {/* Price Inputs - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priceMin: Number(e.target.value) || 0 }))
                }
                className="w-32 h-10"
              />
              <span className="text-on-surface-variant">-</span>
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priceMax: Number(e.target.value) || 100000000 }))
                }
                className="w-32 h-10"
              />
            </div>

            {/* All Filters Button - Mobile */}
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden relative"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-residential-teal text-white text-xs font-bold rounded-full flex items-center justify-center">
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
      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-[180px] bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-on-surface mb-6">Filters</h2>
              {renderFilters()}
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h1 className="text-headline-lg font-bold text-on-surface">
                  {filters.category === 'residential' ? 'Residential' : 'Commercial'} Properties
                </h1>
                <p className="text-body-sm text-on-surface-variant mt-1">
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
                      ? 'bg-residential-teal text-white'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  )}
                  aria-label="Grid view"
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-residential-teal text-white'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  )}
                  aria-label="List view"
                >
                  <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
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
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface-container-low mb-4">
                  <SearchIcon className="h-12 w-12 text-on-surface-variant" />
                </div>
                <h3 className="text-xl font-semibold text-on-surface mb-2">No properties found</h3>
                <p className="text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
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
                  'grid gap-6 pb-xl',
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1'
                )}>
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      onSave={handleSaveProperty}
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
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-fade"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-xl max-h-[80vh] overflow-y-auto modal-slide-bottom shadow-xl">
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-surface">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-surface-container rounded-lg transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-6">
              {renderFilters()}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface border-t border-outline-variant px-6 py-4">
              <Button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full"
                size="lg"
              >
                Show {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
