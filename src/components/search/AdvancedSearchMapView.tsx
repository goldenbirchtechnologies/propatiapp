'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapPin, X, SlidersHorizontal, ZoomIn, ZoomOut, Maximize2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ListingData } from '@/components/listings/listing-card';


// Types
interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MapCenter {
  lat: number;
  lng: number;
}

interface PropertyMarker extends ListingData {
  position: { lat: number; lng: number };
}

interface PropertyCluster {
  id: string;
  position: { lat: number; lng: number };
  count: number;
  properties: PropertyMarker[];
  bounds: MapBounds;
}

interface FilterState {
  priceRange: [number, number];
  propertyTypes: string[];
  listingTypes: string[];
  bedrooms: string;
  bathrooms: string;
  verificationTier: string[];
  amenities: string[];
  sortBy: string;
}

interface AdvancedSearchMapViewProps {
  properties: ListingData[];
  onPropertyClick?: (property: ListingData) => void;
  onPropertyHover?: (property: ListingData | null) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  onFiltersChange?: (filters: FilterState) => void;
  initialCenter?: MapCenter;
  initialZoom?: number;
  className?: string;
}

// Utility Functions
const getCategoryColor = (listingType: string): string => {
  const colors: Record<string, { marker: string; cluster: string }> = {
    rent: { marker: 'bg-emerald-500', cluster: 'bg-emerald-500/90' },
    sale: { marker: 'bg-emerald-500', cluster: 'bg-emerald-500/90' },
    short_let: { marker: 'bg-emerald-500', cluster: 'bg-emerald-500/90' },
    share: { marker: 'bg-emerald-500', cluster: 'bg-emerald-500/90' },
    commercial: { marker: 'bg-amber-500', cluster: 'bg-amber-500/90' },
  };
  return colors[listingType]?.marker || 'bg-emerald-500';
};

const getClusterColor = (properties: PropertyMarker[]): string => {
  const hasCommercial = properties.some(p => p.listingType === 'commercial');
  return hasCommercial ? 'bg-amber-500/90' : 'bg-emerald-500/90';
};

// Create clusters from markers based on zoom level
const createClusters = (markers: PropertyMarker[], zoom: number, bounds: MapBounds): PropertyCluster[] => {
  const clusterDistance = 60 / Math.pow(2, zoom - 10); // Adjust cluster distance based on zoom
  const clusters: PropertyCluster[] = [];
  const processed = new Set<string>();

  markers.forEach((marker) => {
    if (processed.has(marker.id)) return;

    const cluster: PropertyCluster = {
      id: `cluster-${marker.id}`,
      position: marker.position,
      count: 1,
      properties: [marker],
      bounds: {
        north: marker.position.lat,
        south: marker.position.lat,
        east: marker.position.lng,
        west: marker.position.lng,
      },
    };

    processed.add(marker.id);

    // Find nearby markers
    markers.forEach((other) => {
      if (processed.has(other.id)) return;

      const distance = Math.sqrt(
        Math.pow(marker.position.lat - other.position.lat, 2) +
        Math.pow(marker.position.lng - other.position.lng, 2)
      );

      if (distance < clusterDistance) {
        cluster.properties.push(other);
        cluster.count++;
        processed.add(other.id);

        // Update bounds
        cluster.bounds.north = Math.max(cluster.bounds.north, other.position.lat);
        cluster.bounds.south = Math.min(cluster.bounds.south, other.position.lat);
        cluster.bounds.east = Math.max(cluster.bounds.east, other.position.lng);
        cluster.bounds.west = Math.min(cluster.bounds.west, other.position.lng);
      }
    });

    // Calculate cluster center
    const avgLat = cluster.properties.reduce((sum, p) => sum + p.position.lat, 0) / cluster.count;
    const avgLng = cluster.properties.reduce((sum, p) => sum + p.position.lng, 0) / cluster.count;
    cluster.position = { lat: avgLat, lng: avgLng };

    clusters.push(cluster);
  });

  return clusters;
};

// Map Marker Component
function MapMarker({
  property,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  scale = 1,
}: {
  property: PropertyMarker;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  scale?: number;
}) {
  const colorClass = getCategoryColor(property.listingType);

  return (
    <button
      className={cn(
        'absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200',
        'hover:z-50 focus:z-50 focus:outline-none',
        isHovered && 'z-50 scale-110'
      )}
      style={{
        left: `${((property.position.lng + 180) / 360) * 100}%`,
        top: `${((90 - property.position.lat) / 180) * 100}%`,
        transform: `translate(-50%, -100%) scale(${isHovered ? 1.1 * scale : scale})`,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`View ${property.title}`}
    >
      {/* Pin shape */}
      <div className="relative">
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center',
            colorClass,
            'transition-all duration-200'
          )}
        >
          <MapPin className="h-4 w-4 text-white" fill="currentColor" />
        </div>
        {/* Pin point */}
        <div
          className={cn(
            'absolute left-1/2 top-full w-0 h-0 -translate-x-1/2',
            'border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent',
            colorClass.replace('bg-', 'border-t-')
          )}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        />
      </div>
      {/* Price label */}
      <div className={cn(
        'absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap',
        'bg-surface-elevated px-2 py-1 rounded-md shadow-md text-xs font-semibold',
        'border border-gray-200',
        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none',
        'transition-opacity duration-200'
      )}>
        {property.priceFormatted || `₦${(property.price / 100).toLocaleString()}`}
      </div>
    </button>
  );
}

// Cluster Marker Component
function ClusterMarker({
  cluster,
  onClick,
  scale = 1,
}: {
  cluster: PropertyCluster;
  onClick: () => void;
  scale?: number;
}) {
  const colorClass = getClusterColor(cluster.properties);
  const size = Math.min(50 + cluster.count * 2, 80);

  return (
    <button
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white z-40"
      style={{
        left: `${((cluster.position.lng + 180) / 360) * 100}%`,
        top: `${((90 - cluster.position.lat) / 180) * 100}%`,
        width: `${size * scale}px`,
        height: `${size * scale}px`,
      }}
      onClick={onClick}
      aria-label={`View ${cluster.count} properties in this area`}
    >
      <div
        className={cn(
          'w-full h-full rounded-full border-4 border-white shadow-xl flex items-center justify-center',
          colorClass,
          'text-white font-bold transition-all duration-200'
        )}
      >
        <span className="text-lg">{cluster.count}</span>
      </div>
    </button>
  );
}

// Property Card Hover Component
function PropertyHoverCard({ property, onClose }: { property: PropertyMarker; onClose: () => void }) {
  const primaryImage = property.coverImage || (Array.isArray(property.images) && property.images.length > 0
    ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url)
    : null);

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm z-50 shadow-2xl animate-slide-in-from-bottom">
      <CardContent className="p-0">
        <div className="relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={property.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
          ) : (
            <div className="w-full h-48 bg-zinc-900 flex items-center justify-center rounded-t-xl">
              <MapPin className="h-12 w-12 text-zinc-400" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-surface-elevated/90 backdrop-blur-sm rounded-full hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute top-2 left-2">
            <Badge className={getCategoryColor(property.listingType)}>
              {property.listingType === 'commercial' ? 'Commercial' : 'Residential'}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-zinc-400 mb-2 line-clamp-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 inline flex-shrink-0" />
            {property.address}, {property.area}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-emerald-400">
                {property.priceFormatted || `₦${(property.price / 100).toLocaleString()}`}
              </p>
              {property.listingType === 'rent' && (
                <p className="text-xs text-zinc-400">per month</p>
              )}
            </div>
            <div className="flex gap-3 text-sm text-zinc-400">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold">{property.bedrooms}</span> bed
                </span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold">{property.bathrooms}</span> bath
                </span>
              )}
            </div>
          </div>
          <Button className="w-full mt-3" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Overlay Component
function FilterOverlay({
  filters,
  onFiltersChange,
  onClose,
  propertyCount,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
  propertyCount: number;
}) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: string,
    array: FilterState[K]
  ) => {
    if (Array.isArray(array)) {
      const newArray = (array as unknown).includes(value)
        ? array.filter(v => v !== value)
        : ([...(array as unknown), value] as unknown);
      updateFilter(key, newArray as FilterState[K]);
    }
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 100000000],
      propertyTypes: [],
      listingTypes: [],
      bedrooms: 'unknown',
      bathrooms: 'unknown',
      verificationTier: [],
      amenities: [],
      sortBy: 'relevance',
    };
    setLocalFilters(defaultFilters);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] animate-fade-in">
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl animate-slide-in-from-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Content */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Price Range</Label>
                <div className="flex items-center gap-2 text-sm">
                  <AppIcon name="₦{localFilters.priceRange[0].toLocaleString()}" className="lucide" />
                  <span className="text-zinc-400">-</span>
                  <AppIcon name="₦{localFilters.priceRange[1].toLocaleString()}" className="lucide" />
                </div>
                <Slider
                  min={0}
                  max={100000000}
                  step={100000}
                  value={localFilters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  className="mt-2"
                />
              </div>

              {/* Listing Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Listing Type</Label>
                <div className="space-y-2">
                  {['rent', 'sale', 'short_let', 'commercial'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`listing-${type}`}
                        checked={localFilters.listingTypes.includes(type)}
                        onCheckedChange={() => toggleArrayFilter('listingTypes', type, localFilters.listingTypes)}
                      />
                      <label
                        htmlFor={`listing-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                      >
                        {type.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Property Type</Label>
                <div className="space-y-2">
                  {['apartment', 'house', 'duplex', 'office', 'shop', 'warehouse'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type}`}
                        checked={localFilters.propertyTypes.includes(type)}
                        onCheckedChange={() => toggleArrayFilter('propertyTypes', type, localFilters.propertyTypes)}
                      />
                      <label
                        htmlFor={`property-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Bedrooms</Label>
                <Select value={localFilters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Bathrooms</Label>
                <Select value={localFilters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Tier */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Verification Level</Label>
                <div className="space-y-2">
                  {['verified', 'inspected', 'certified'].map((tier) => (
                    <div key={tier} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tier-${tier}`}
                        checked={localFilters.verificationTier.includes(tier)}
                        onCheckedChange={() => toggleArrayFilter('verificationTier', tier, localFilters.verificationTier)}
                      />
                      <label
                        htmlFor={`tier-${tier}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                      >
                        {tier}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Amenities</Label>
                <div className="space-y-2">
                  {['parking', 'security', 'pool', 'gym', 'generator', 'water_supply'].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={localFilters.amenities.includes(amenity)}
                        onCheckedChange={() => toggleArrayFilter('amenities', amenity, localFilters.amenities)}
                      />
                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                      >
                        {amenity.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Sort By</Label>
                <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4 space-y-2">
            <div className="text-sm text-zinc-400 text-center mb-2">
              {propertyCount} properties found
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetFilters}>
                Reset
              </Button>
              <Button className="flex-1" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function AdvancedSearchMapView({
  properties,
  onPropertyClick,
  onPropertyHover,
  onBoundsChange,
  onFiltersChange,
  initialCenter = { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
  initialZoom = 12,
  className,
}: AdvancedSearchMapViewProps) {
  const [mapCenter, setMapCenter] = useState<MapCenter>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [hoveredProperty, setHoveredProperty] = useState<PropertyMarker | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<PropertyCluster | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000000],
    propertyTypes: [],
    listingTypes: [],
    bedrooms: 'unknown',
    bathrooms: 'unknown',
    verificationTier: [],
    amenities: [],
    sortBy: 'relevance',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Convert properties to markers (mock coordinates for demo)
  const markers = useMemo<PropertyMarker[]>(() => {
    return properties.map((property, index) => ({
      ...property,
      position: {
        // Mock coordinates - in production, these should come from property data
        lat: initialCenter.lat + (Math.random() - 0.5) * 0.1,
        lng: initialCenter.lng + (Math.random() - 0.5) * 0.1,
      },
    }));
  }, [properties, initialCenter]);

  // Apply filters
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // Price filter
      if (marker.price < filters.priceRange[0] || marker.price > filters.priceRange[1]) {
        return false;
      }
      // Listing type filter
      if (filters.listingTypes.length > 0 && !filters.listingTypes.includes(marker.listingType)) {
        return false;
      }
      // Property type filter
      if (filters.propertyTypes.length > 0 && marker.propertyType && !filters.propertyTypes.includes(marker.propertyType)) {
        return false;
      }
      // Bedrooms filter
      if (filters.bedrooms !== 'unknown' && marker.bedrooms != null) {
        const minBedrooms = parseInt(filters.bedrooms);
        if (marker.bedrooms < minBedrooms) return false;
      }
      // Bathrooms filter
      if (filters.bathrooms !== 'unknown' && marker.bathrooms != null) {
        const minBathrooms = parseInt(filters.bathrooms);
        if (marker.bathrooms < minBathrooms) return false;
      }
      // Verification tier filter
      if (filters.verificationTier.length > 0 && !filters.verificationTier.includes(marker.verificationTier)) {
        return false;
      }
      // Amenities filter
      if (filters.amenities.length > 0 && marker.amenities) {
        const hasAllAmenities = filters.amenities.every(amenity => marker.amenities?.includes(amenity));
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [markers, filters]);

  // Create clusters
  const clusters = useMemo(() => {
    const bounds: MapBounds = {
      north: mapCenter.lat + 0.1 / zoom,
      south: mapCenter.lat - 0.1 / zoom,
      east: mapCenter.lng + 0.1 / zoom,
      west: mapCenter.lng - 0.1 / zoom,
    };
    return createClusters(filteredMarkers, zoom, bounds);
  }, [filteredMarkers, zoom, mapCenter]);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 1));
  }, []);

  // Handle cluster click
  const handleClusterClick = useCallback((cluster: PropertyCluster) => {
    if (cluster.count === 1) {
      onPropertyClick?.(cluster.properties[0]);
    } else {
      setSelectedCluster(cluster);
      // Zoom in to cluster bounds
      setMapCenter({
        lat: (cluster.bounds.north + cluster.bounds.south) / 2,
        lng: (cluster.bounds.east + cluster.bounds.west) / 2,
      });
      setZoom(prev => prev + 2);
    }
  }, [onPropertyClick]);

  // Handle property hover
  const handlePropertyHover = useCallback((property: PropertyMarker | null) => {
    setHoveredProperty(property);
    onPropertyHover?.(property);
  }, [onPropertyHover]);

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  // Handle map drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setMapCenter(prev => ({
      lat: prev.lat - (deltaY / 1000) * (1 / zoom),
      lng: prev.lng - (deltaX / 1000) * (1 / zoom),
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  return (
    <div className={cn('relative w-full h-screen bg-surface', className)}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className={cn(
          'w-full h-full bg-gradient-to-br from-surface-container-low to-surface-container',
          'overflow-hidden relative',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Mock Map Background - Replace with actual map integration (Mapbox, Google Maps, etc.) */}
        <div className="absolute inset-0 bg-[#e7eeff]">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,#006b5b_20px,#006b5b_21px),repeating-linear-gradient(90deg,transparent,transparent_20px,#006b5b_20px,#006b5b_21px)]" />
        </div>

        {/* Render Clusters */}
        {clusters.map((cluster) => (
          cluster.count > 1 ? (
            <ClusterMarker
              key={cluster.id}
              cluster={cluster}
              onClick={() => handleClusterClick(cluster)}
              scale={1}
            />
          ) : (
            <MapMarker
              key={cluster.properties[0].id}
              property={cluster.properties[0]}
              isHovered={hoveredProperty?.id === cluster.properties[0].id}
              onClick={() => onPropertyClick?.(cluster.properties[0])}
              onMouseEnter={() => handlePropertyHover(cluster.properties[0])}
              onMouseLeave={() => handlePropertyHover(null)}
            />
          )
        ))}

        {/* Property Hover Card */}
        {hoveredProperty && (
          <PropertyHoverCard
            property={hoveredProperty}
            onClose={() => handlePropertyHover(null)}
          />
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(true)}
          className="bg-surface-elevated shadow-lg hover:shadow-xl"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1 bg-surface-elevated rounded-lg shadow-lg p-1">
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-5 w-5" />
          </Button>
          <div className="h-px bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="outline" size="icon" className="bg-surface-elevated shadow-lg hover:shadow-xl">
          <Layers className="h-5 w-5" />
        </Button>
      </div>

      {/* Property Count Badge */}
      <div className="absolute top-4 left-4 z-50">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-sm">
                {filteredMarkers.length} {filteredMarkers.length === 1 ? 'Property' : 'Properties'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-50">
        <Card className="shadow-lg">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium">Residential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-medium">Commercial</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Overlay */}
      {showFilters && (
        <FilterOverlay
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
          propertyCount={filteredMarkers.length}
        />
      )}
    </div>
  );
}

export default AdvancedSearchMapView;
