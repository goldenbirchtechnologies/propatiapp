'use client'

import MaterialIcon from '@/components/icons/material-icon';

import { useState, useCallback, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';


export interface SearchFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number[];
  propertyTypes?: string[];
  verificationTier?: number;
  amenities?: string[];
}

interface SearchFiltersProps {
  category: 'residential' | 'commercial';
  onFilterChange: (filters: SearchFilters) => void;
  filters: SearchFilters;
}

const RESIDENTIAL_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
];

const COMMERCIAL_TYPES = [
  { value: 'office', label: 'Office Space' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'plaza', label: 'Plaza' },
  { value: 'mall', label: 'Mall Space' },
];

const AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Security',
  'Parking',
  'Generator',
  'Water Supply',
  'Air Conditioning',
  'Balcony',
  'Elevator',
  'Garden',
  'Playground',
  'CCTV',
  'Gated Estate',
  'Service Quarters',
  'Fitted Kitchen',
  'En-suite Rooms',
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6];

const VERIFICATION_TIERS = [
  { value: 0, label: 'All Properties' },
  { value: 1, label: 'Basic Verified' },
  { value: 2, label: 'Standard Verified' },
  { value: 3, label: 'Premium Verified' },
];

const NIGERIAN_LOCATIONS = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Lekki, Lagos',
  'Victoria Island, Lagos',
  'Ikoyi, Lagos',
  'Surulere, Lagos',
  'Ikeja, Lagos',
  'Ajah, Lagos',
  'Yaba, Lagos',
  'Maryland, Lagos',
  'Magodo, Lagos',
  'Festac, Lagos',
  'Maitama, Abuja',
  'Asokoro, Abuja',
  'Wuse, Abuja',
  'Garki, Abuja',
  'Gwarinpa, Abuja',
  'Jabi, Abuja',
  'Kaduna',
  'Calabar',
  'Enugu',
  'Warri',
];

const formatNGN = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function SearchFilters({
  category,
  onFilterChange,
  filters,
}: SearchFiltersProps) {
  const [locationInput, setLocationInput] = useState(filters.location || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [priceMin, setPriceMin] = useState(filters.priceMin || 0);
  const [priceMax, setPriceMax] = useState(filters.priceMax || 500000000);

  const propertyTypes = category === 'residential' ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;
  const maxPrice = 500000000; // 500M NGN
  const minPrice = 0;

  const filteredLocations = useMemo(() => {
    if (!locationInput.trim()) return NIGERIAN_LOCATIONS;
    return NIGERIAN_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(locationInput.toLowerCase())
    );
  }, [locationInput]);

  const displayedAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 6);

  const handleLocationSelect = useCallback(
    (location: string) => {
      setLocationInput(location);
      setShowLocationDropdown(false);
      onFilterChange({ ...filters, location });
    },
    [filters, onFilterChange]
  );

  const handlePriceChange = useCallback(
    (type: 'min' | 'max', value: number) => {
      if (type === 'min') {
        setPriceMin(value);
        onFilterChange({ ...filters, priceMin: value });
      } else {
        setPriceMax(value);
        onFilterChange({ ...filters, priceMax: value });
      }
    },
    [filters, onFilterChange]
  );

  const handleBedroomToggle = useCallback(
    (bedroom: number) => {
      const currentBedrooms = filters.bedrooms || [];
      const newBedrooms = currentBedrooms.includes(bedroom)
        ? currentBedrooms.filter((b) => b !== bedroom)
        : [...currentBedrooms, bedroom];
      onFilterChange({ ...filters, bedrooms: newBedrooms });
    },
    [filters, onFilterChange]
  );

  const handlePropertyTypeToggle = useCallback(
    (type: string) => {
      const currentTypes = filters.propertyTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      onFilterChange({ ...filters, propertyTypes: newTypes });
    },
    [filters, onFilterChange]
  );

  const handleVerificationChange = useCallback(
    (tier: number) => {
      onFilterChange({ ...filters, verificationTier: tier });
    },
    [filters, onFilterChange]
  );

  const handleAmenityToggle = useCallback(
    (amenity: string) => {
      const currentAmenities = filters.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter((a) => a !== amenity)
        : [...currentAmenities, amenity];
      onFilterChange({ ...filters, amenities: newAmenities });
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    setLocationInput('');
    setPriceMin(0);
    setPriceMax(maxPrice);
    onFilterChange({});
  }, [onFilterChange, maxPrice]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Location Input with Autocomplete */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
              placeholder="Search location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {showLocationDropdown && filteredLocations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Range Dual Slider */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Price Range</label>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Min: {formatNGN(priceMin)}</span>
              <span className="text-gray-600">Max: {formatNGN(priceMax)}</span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={1000000}
              value={priceMin}
              onChange={(e) => handlePriceChange('min', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={1000000}
              value={priceMax}
              onChange={(e) => handlePriceChange('max', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms Selector */}
      {category === 'residential' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((bedroom) => (
              <button
                key={bedroom}
                onClick={() => handleBedroomToggle(bedroom)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.bedrooms?.includes(bedroom)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bedroom}+
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Property Type Checkboxes */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.propertyTypes?.includes(type.value) || false}
                onChange={() => handlePropertyTypeToggle(type.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification Tier Slider */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Verification Level</label>
        <div className="space-y-2">
          {VERIFICATION_TIERS.map((tier) => (
            <label key={tier.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="verification"
                checked={
                  filters.verificationTier === tier.value ||
                  (filters.verificationTier === undefined && tier.value === 0)
                }
                onChange={() => handleVerificationChange(tier.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{tier.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Checkboxes with Show More */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Amenities</label>
        <div className="space-y-2">
          {displayedAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities?.includes(amenity) || false}
                onChange={() => handleAmenityToggle(amenity)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
        {AMENITIES.length > 6 && (
          <button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <MaterialIcon name={showAllAmenities ? 'Show Less' : 'Show More'} className="material-symbols-outlined" />
            {showAllAmenities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
