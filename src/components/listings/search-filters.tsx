'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import { X, Filter, SlidersHorizontal, ChevronDown, ChevronUp, MapPin, Home, Building, DollarSign, Bed, Bath, Square, Search, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { NAIGERIAN_STATES, LAGOS_AREAS } from '@/lib/utils';


export interface SearchFiltersData {
  query?: string;
  listingType?: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial' | 'all';
  propertyType?: string[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  state?: string;
  city?: string;
  area?: string;
  verificationTier?: ('basic' | 'verified' | 'inspected' | 'certified')[];
  amenities?: string[];
  furnished?: boolean;
  availableFrom?: Date;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'verification';
  page?: number;
  limit?: number;
}

export interface SearchFiltersProps {
  filters: SearchFiltersData;
  onChange: (filters: Partial<SearchFiltersData>) => void;
  onSearch?: (query: string) => void;
  onReset?: () => void;
  variant?: 'sidebar' | 'inline' | 'modal';
  className?: string;
  isLoading?: boolean;
  totalResults?: number;
}

const listingTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
  { value: 'short_let', label: 'Short Let' },
  { value: 'share', label: 'Shared' },
  { value: 'commercial', label: 'Commercial' },
];

const propertyTypeOptions = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'land', label: 'Land' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
];

const bedroomOptions = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

const bathroomOptions = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const verificationTierOptions = [
  { value: 'basic', label: 'Basic' },
  { value: 'verified', label: 'Verified' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'certified', label: 'Certified' },
];

const amenityOptions = [
  'parking', 'security', 'generator', 'water_supply', 'internet', 'air_conditioning',
  'swimming_pool', 'gym', 'elevator', 'balcony', 'furnished', 'wardrobe',
  'kitchen_equipment', 'laundry', 'cctv', 'intercom', 'borehole', 'solar_power'
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'verification', label: 'Highest Verification' },
];

function FilterSection({
  title,
  children,
  icon,
  isOpen,
  onToggle,
  className,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-border', className)}>
      <button
        type="button"
        onClick={onToggle}
        className={cn('w-full flex items-center justify-between p-3', 'hover:bg-muted/50 transition-colors', 'text-left')}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</h3>
        </div>
        <span className={cn('transition-transform', isOpen && 'rotate-180')}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </span>
      </button>
      <CollapsibleContent className="pb-3" forceMount>
        {children}
      </CollapsibleContent>
    </div>
  );
}

function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  icon: Icon,
  className,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    const next = checked ? [...selectedValues, value] : selectedValues.filter((v) => v !== value);
    onChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-between text-left h-auto py-2', selectedValues.length > 0 && 'bg-accent/5 border-accent/20', className)}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="flex-1 truncate font-medium text-sm">
              {selectedValues.length > 0
                ? `${selectedValues.length} selected`
                : placeholder}
            </span>
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedValues.length}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
            className="flex items-center justify-between px-2 py-1.5"
          >
            <span className="text-sm">{option.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
        {selectedValues.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onChange([])}
              className="text-accent"
              inset
            >
              <X className="mr-2 h-3 w-3" />
              Clear all
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriceRangeSlider({
  min,
  max,
  values,
  onChange,
  currency = 'NGN',
}: {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
  currency?: string;
}) {
  const formatPrice = (value: number) => {
    if (value >= 1e9) return `₦${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `₦${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `₦${(value / 1e3).toFixed(1)}K`;
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--muted)' }}>
        <AppIcon name="Min: {formatPrice(values[0])}" className="lucide" />
        <AppIcon name="Max: {formatPrice(values[1])}" className="lucide" />
      </div>
      <Slider
        min={min}
        max={max}
        step={100000}
        value={values}
        onValueChange={onChange}
        className="w-full"
      />
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={values[0] || ''}
          onChange={(e) => onChange([Number(e.target.value) || min, values[1]])}
          className="w-1/2"
          inputMode="numeric"
        />
        <Input
          type="number"
          placeholder="Max"
          value={values[1] || ''}
          onChange={(e) => onChange([values[0], Number(e.target.value) || max])}
          className="w-1/2"
          inputMode="numeric"
        />
      </div>
    </div>
  );
}

export function SearchFilters({
  filters,
  onChange,
  onSearch,
  onReset,
  variant = 'sidebar',
  className,
  isLoading = false,
  totalResults = 0,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    location: true,
    price: true,
    property: true,
    features: true,
    verification: false,
    more: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = React.useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'query' || key === 'page' || key === 'limit' || key === 'sortBy') return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '' && value !== 0;
    });
  }, [filters]);

  const handleReset = () => {
    onReset?.();
    onChange({
      query: '',
      listingType: 'all',
      propertyType: [],
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: 0,
      bathrooms: 0,
      minArea: undefined,
      maxArea: undefined,
      state: undefined,
      city: undefined,
      area: undefined,
      verificationTier: [],
      amenities: [],
      furnished: undefined,
      availableFrom: undefined,
      sortBy: 'relevance',
    });
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.listingType && filters.listingType !== 'all') count++;
    if (filters.propertyType?.length) count += filters.propertyType.length;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms && filters.bedrooms > 0) count++;
    if (filters.bathrooms && filters.bathrooms > 0) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.area) count++;
    if (filters.verificationTier?.length) count += filters.verificationTier.length;
    if (filters.amenities?.length) count += filters.amenities.length;
    if (filters.furnished) count++;
    if (filters.availableFrom) count++;
    return count;
  }, [filters]);

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-xl', className)}>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={filters.query || ''}
            onChange={(e) => { onChange({ query: e.target.value }); onSearch?.(e.target.value); }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <MultiSelectDropdown
            label="Listing Type"
            options={listingTypeOptions}
            selectedValues={filters.listingType && filters.listingType !== 'all' ? [filters.listingType] : []}
            onChange={(v) => onChange({ listingType: v[0] as unknown || 'all' })}
            placeholder="All Types"
            icon={<Home className="h-4 w-4" /> as unknown}
          />
          <MultiSelectDropdown
            label="Property Type"
            options={propertyTypeOptions}
            selectedValues={filters.propertyType || []}
            onChange={(v) => onChange({ propertyType: v })}
            placeholder="All Types"
            icon={<Building className="h-4 w-4" /> as unknown}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn('gap-1', filters.sortBy !== 'relevance' && 'bg-accent/5 border-accent/20')}>
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => onChange({ sortBy: option.value as unknown })}
                  className={cn(filters.sortBy === option.value && 'bg-accent/10 text-accent')}
                  inset={false}
                >
                  {option.label}
                  {filters.sortBy === option.value && <span className="ml-auto text-accent">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && onReset && (
            <Button variant="ghost" size="icon" onClick={handleReset} className="text-destructive hover:text-destructive">
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h2 className="font-heading font-semibold" style={{ color: 'var(--text)' }}>
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{activeFilterCount}</Badge>
            )}
          </h2>
        </div>
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-accent hover:text-accent/80">
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Search Query */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={filters.query || ''}
            onChange={(e) => { onChange({ query: e.target.value }); onSearch?.(e.target.value); }}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        <Separator />

        {/* Location Filters */}
        <FilterSection
          title="Location"
          icon={<MapPin className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.location}
          onToggle={() => toggleSection('location')}
        >
          <div className="space-y-3 pt-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>State</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-between h-auto py-2', filters.state && 'bg-accent/5 border-accent/20')}
                  >
                    <span className="truncate font-medium text-sm">
                      {filters.state || 'All States'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-60">
                  <DropdownMenuLabel>Select State</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onChange({ state: undefined, city: undefined, area: undefined })}
                    className={cn(!filters.state && 'bg-accent/10 text-accent')}
                    inset
                  >
                    All States
                  </DropdownMenuItem>
                  {NAIGERIAN_STATES.map((state) => (
                    <DropdownMenuItem
                      key={state}
                      onSelect={() => onChange({ state, city: undefined, area: undefined })}
                      className={cn(filters.state === state && 'bg-accent/10 text-accent')}
                      inset={false}
                    >
                      {state}
                      {filters.state === state && <span className="ml-auto text-accent">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {filters.state && (
              <>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>
                    {filters.state === 'Lagos' ? 'Area' : 'City'}
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-between h-auto py-2', filters.city && 'bg-accent/5 border-accent/20')}
                      >
                        <span className="truncate font-medium text-sm">
                          {filters.city || (filters.state === 'Lagos' ? 'All Areas' : 'All Cities')}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 max-h-60">
                      <DropdownMenuLabel>{filters.state === 'Lagos' ? 'Select Area' : 'Select City'}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onChange({ city: undefined, area: undefined })}
                        className={cn(!filters.city && 'bg-accent/10 text-accent')}
                        inset
                      >
                        {filters.state === 'Lagos' ? 'All Areas' : 'All Cities'}
                      </DropdownMenuItem>
                      {(filters.state === 'Lagos' ? LAGOS_AREAS : NAIGERIAN_STATES).map((city) => (
                        <DropdownMenuItem
                          key={city}
                          onSelect={() => onChange({ city, area: undefined })}
                          className={cn(filters.city === city && 'bg-accent/10 text-accent')}
                          inset={false}
                        >
                          {city}
                          {filters.city === city && <span className="ml-auto text-accent">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {(filters.state === 'Lagos' && filters.city) && (
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Neighborhood</Label>
                    <Input
                      placeholder="Enter neighborhood"
                      value={filters.area || ''}
                      onChange={(e) => onChange({ area: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={<DollarSign className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <PriceRangeSlider
            min={0}
            max={500000000}
            values={[filters.minPrice || 0, filters.maxPrice || 500000000]}
            onChange={([min, max]) => onChange({ minPrice: min || undefined, maxPrice: max || undefined })}
          />
        </FilterSection>

        {/* Property Type & Listing Type */}
        <FilterSection
          title="Property Type"
          icon={<Home className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.property}
          onToggle={() => toggleSection('property')}
        >
          <div className="space-y-3 pt-3">
            <MultiSelectDropdown
              label="Listing Type"
              options={listingTypeOptions}
              selectedValues={filters.listingType && filters.listingType !== 'all' ? [filters.listingType] : []}
              onChange={(v) => onChange({ listingType: v[0] as unknown || 'all' })}
              placeholder="All Types"
              icon={<Home className="h-4 w-4" /> as unknown}
            />
            <MultiSelectDropdown
              label="Property Type"
              options={propertyTypeOptions}
              selectedValues={filters.propertyType || []}
              onChange={(v) => onChange({ propertyType: v })}
              placeholder="All Types"
              icon={<Building className="h-4 w-4" /> as unknown}
            />
          </div>
        </FilterSection>

        {/* Bedrooms & Bathrooms */}
        <FilterSection
          title="Rooms"
          icon={<Bed className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Bedrooms</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-full justify-between h-auto py-2', filters.bedrooms && filters.bedrooms > 0 && 'bg-accent/5 border-accent/20')}
                    >
                      <span className="truncate font-medium text-sm">
                        {bedroomOptions.find((o) => o.value === filters.bedrooms)?.label || 'Any'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bedrooms</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {bedroomOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onSelect={() => onChange({ bedrooms: option.value })}
                        className={cn(filters.bedrooms === option.value && 'bg-accent/10 text-accent')}
                        inset={false}
                      >
                        {option.label}
                        {filters.bedrooms === option.value && <span className="ml-auto text-accent">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Bathrooms</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-full justify-between h-auto py-2', filters.bathrooms && filters.bathrooms > 0 && 'bg-accent/5 border-accent/20')}
                    >
                      <span className="truncate font-medium text-sm">
                        {bathroomOptions.find((o) => o.value === filters.bathrooms)?.label || 'Any'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bathrooms</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {bathroomOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onSelect={() => onChange({ bathrooms: option.value })}
                        className={cn(filters.bathrooms === option.value && 'bg-accent/10 text-accent')}
                        inset={false}
                      >
                        {option.label}
                        {filters.bathrooms === option.value && <span className="ml-auto text-accent">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Area (sqm)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minArea || ''}
                  onChange={(e) => onChange({ minArea: Number(e.target.value) || undefined })}
                  className="w-1/2"
                  inputMode="numeric"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxArea || ''}
                  onChange={(e) => onChange({ maxArea: Number(e.target.value) || undefined })}
                  className="w-1/2"
                  inputMode="numeric"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.furnished || false}
                onChange={(e) => onChange({ furnished: e.target.checked })}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm" style={{ color: 'var(--text)' }}>Furnished only</span>
            </label>
          </div>
        </FilterSection>

        {/* Verification Tier */}
        <FilterSection
          title="Verification"
          icon={<Shield className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.verification}
          onToggle={() => toggleSection('verification')}
        >
          <MultiSelectDropdown
            label="Verification Tier"
            options={verificationTierOptions}
            selectedValues={filters.verificationTier || []}
            onChange={(v) => onChange({ verificationTier: v as unknown })}
            placeholder="All Tiers"
            icon={<Shield className="h-4 w-4" /> as unknown}
          />
        </FilterSection>

        {/* Amenities */}
        <FilterSection
          title="Amenities"
          icon={<Square className="h-4 w-4" /> as unknown}
          isOpen={expandedSections.more}
          onToggle={() => toggleSection('more')}
        >
          <MultiSelectDropdown
            label="Amenities"
            options={amenityOptions.map((a) => ({ value: a, label: a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))}
            selectedValues={filters.amenities || []}
            onChange={(v) => onChange({ amenities: v })}
            placeholder="Select amenities"
            icon={<Square className="h-4 w-4" /> as unknown}
          />
        </FilterSection>

        {/* Results Summary */}
        {totalResults > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {totalResults} {totalResults === 1 ? 'property' : 'properties'} found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchFiltersMobileBottomSheet({
  filters,
  onChange,
  onSearch,
  onReset,
  isOpen,
  onClose,
  totalResults = 0,
}: SearchFiltersProps & {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Search Filters">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex-1 flex flex-col bg-white rounded-t-[20px] rounded-t-[20px] max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface-elevated z-10 rounded-t-[20px]">
          <h2 className="font-heading font-semibold text-lg" style={{ color: 'var(--text)' }}>Filters</h2>
          <div className="flex items-center gap-2">
            {totalResults > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalResults} results
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SearchFilters
            filters={filters}
            onChange={onChange}
            onSearch={onSearch}
            onReset={onReset}
            variant="sidebar"
            totalResults={totalResults}
          />
        </div>
        <div className="p-4 border-t border-border sticky bottom-0 bg-surface-elevated z-10">
          <Button className="w-full" size="lg" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
