'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface SavedProperty {
  id: string;
  listingId: string;
  savedAt: Date;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: number;
    pricePeriod: string;
    bedrooms: number;
    bathrooms: number;
    sqm: number;
    listingType: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
    propertyType: string;
    status: 'active' | 'draft' | 'suspended' | 'deleted';
    images: string[];
    verified: boolean;
    owner: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  notes?: string;
}

interface FilterOptions {
  listingType: string;
  propertyType: string;
  priceRange: string;
  sortBy: string;
}

interface TenantSavedPropertiesClientProps {
  initialSavedProperties: SavedProperty[];
}

// Skeleton Components
function SkeletonPropertyCard() {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-variant"></div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-surface-variant rounded w-20"></div>
          <div className="h-6 bg-surface-variant rounded w-28"></div>
        </div>
        <div className="h-5 bg-surface-variant rounded w-full mb-2"></div>
        <div className="h-4 bg-surface-variant rounded w-3/4 mb-3"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-surface-variant rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Property Card Component
function SavedPropertyCard({
  property,
  selected,
  onSelect,
  onRemove,
  onAddNote,
}: {
  property: SavedProperty;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onAddNote: () => void;
}) {
  const listingTypeStyles: Record<string, string> = {
    rent: 'bg-teal-50 text-teal-700',
    sale: 'bg-warning/10 text-warning',
    short_let: 'bg-blue-50 text-blue-700',
    share: 'bg-purple-50 text-purple-700',
    commercial: 'bg-warning/10 text-warning',
  };

  const listingTypeLabels: Record<string, string> = {
    rent: 'For Rent',
    sale: 'For Sale',
    short_let: 'Short Let',
    share: 'Shared',
    commercial: 'Commercial',
  };

  const style = listingTypeStyles[property.listing.listingType] || listingTypeStyles.rent;
  const label = listingTypeLabels[property.listing.listingType] || listingTypeLabels.rent;

  return (
    <div
      className={`bg-surface-container-lowest rounded-lg border transition-all duration-300 hover:shadow-lg group relative ${
        selected ? 'border-residential-teal ring-2 ring-residential-teal/20' : 'border-border'
      }`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer accent-residential-teal"
        />
      </div>

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onAddNote}
          className="p-2 bg-surface-container-lowest rounded-full shadow-lg hover:bg-surface-container transition-colors"
          title="Add note"
        >
          <AppIcon name="edit_note" className="lucide" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 bg-surface-container-lowest rounded-full shadow-lg hover:bg-error-container transition-colors"
          title="Remove from saved"
        >
          <AppIcon name="delete" className="lucide" />
        </button>
      </div>

      <Link href={`/properties/${property.listing.id}`} className="block">
        {/* Image */}
        <div className="aspect-video bg-surface-variant relative overflow-hidden">
          {property.listing.images && property.listing.images.length > 0 ? (
            <img
              src={property.listing.images[0]}
              alt={property.listing.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AppIcon name="home" className="lucide" />
            </div>
          )}

          {/* Verification Badge */}
          {property.listing.verified && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-commercial-gold text-foreground shadow-lg">
                <AppIcon name="verified" className="lucide" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Type & Price */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style}`}
            >
              {label}
            </span>
            <span className="font-headline-md font-bold text-on-surface">
              {formatPrice(property.listing.price)}
              {property.listing.pricePeriod ? `/${property.listing.pricePeriod}` : ''}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-headline-sm font-bold text-on-surface mb-2 line-clamp-2">
            {property.listing.title}
          </h3>

          {/* Location & Details */}
          <p className="text-sm text-on-surface-variant mb-3 flex items-start gap-2">
            <AppIcon name="location_on" className="lucide" />
            <span className="line-clamp-1">
              {property.listing.area}, {property.listing.state}
            </span>
          </p>

          {/* Property Info */}
          <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
            {property.listing.bedrooms && (
              <span className="flex items-center gap-1">
                <AppIcon name="bed" className="lucide" />
                {property.listing.bedrooms} bed
              </span>
            )}
            {property.listing.bathrooms && (
              <>
                <span className="flex items-center gap-1">
                  <AppIcon name="circle" className="lucide" />
                </span>
                <span className="flex items-center gap-1">
                  <AppIcon name="bathroom" className="lucide" />
                  {property.listing.bathrooms} bath
                </span>
              </>
            )}
            {property.listing.sqm && (
              <>
                <span className="flex items-center gap-1">
                  <AppIcon name="circle" className="lucide" />
                </span>
                <span className="flex items-center gap-1">
                  <AppIcon name="square_foot" className="lucide" />
                  {property.listing.sqm} sqm
                </span>
              </>
            )}
          </div>

          {/* Saved Date */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-border">
            <span className="flex items-center gap-1">
              <AppIcon name="schedule" className="lucide" />
              Saved {new Date(property.savedAt).toLocaleDateString()}
            </span>
            {property.notes && (
              <span className="flex items-center gap-1 text-residential-teal">
                <AppIcon name="sticky_note_2" className="lucide" />
                Has notes
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function formatPrice(price: number): string {
  return '₦' + price.toLocaleString();
}

// Empty State Component
function EmptyState() {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-border p-12 text-center">
      <AppIcon name="bookmark_remove" className="lucide" />
      <h3 className="font-headline-md font-bold text-on-surface mb-2">No Saved Properties</h3>
      <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
        Start saving properties you&apos;re interested in to keep track of them and compare later.
      </p>
      <Link
        href="/dashboard/tenant/search"
        className="inline-flex items-center gap-2 px-6 py-3 bg-residential-teal text-foreground rounded-lg font-semibold hover:bg-residential-teal/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <AppIcon name="search" className="lucide" />
        Browse Properties
      </Link>
    </div>
  );
}

// Main Component
export default function TenantSavedPropertiesClient({
  initialSavedProperties,
}: TenantSavedPropertiesClientProps) {
  const router = useRouter();
  const isLoading = false;
  const [properties, setProperties] = useState<SavedProperty[]>(initialSavedProperties);
  const [filteredProperties, setFilteredProperties] = useState<SavedProperty[]>(initialSavedProperties);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteProperty, setCurrentNoteProperty] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const [filters, setFilters] = useState<FilterOptions>({
    listingType: 'all',
    propertyType: 'all',
    priceRange: 'all',
    sortBy: 'recent',
  });

  // Apply filters
  useEffect(() => {
    let filtered = [...properties];

    if (filters.listingType !== 'all') {
      filtered = filtered.filter(p => p.listing.listingType === filters.listingType);
    }

    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.listing.propertyType === filters.propertyType);
    }

    // Sort
    if (filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    } else if (filters.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.listing.price - b.listing.price);
    } else if (filters.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.listing.price - a.listing.price);
    }

    setFilteredProperties(filtered);
  }, [filters, properties]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProperties.map(p => p.id)));
    }
  };

  // Bulk actions
  const bulkRemove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} properties from saved?`)) return;

    try {
      // In production: await fetch('/api/saved-properties/bulk-delete', { method: 'DELETE', body: JSON.stringify([...selectedIds]) })
      setProperties(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error removing properties:', error);
    }
  };

  const bulkExport = () => {
    const selectedProperties = properties.filter(p => selectedIds.has(p.id));
    const dataStr = JSON.stringify(selectedProperties, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `saved-properties-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Note handlers
  const openNoteModal = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    setCurrentNoteProperty(propertyId);
    setNoteText(property?.notes || '');
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!currentNoteProperty) return;

    try {
      // In production: await fetch('/api/saved-properties/note', { method: 'PATCH', body: JSON.stringify({ id: currentNoteProperty, notes: noteText }) })
      setProperties(prev =>
        prev.map(p => (p.id === currentNoteProperty ? { ...p, notes: noteText } : p))
      );
      setShowNoteModal(false);
      setCurrentNoteProperty(null);
      setNoteText('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/tenant"
              className="p-2 hover:bg-surface-container rounded-lg transition-colors md:hidden"
            >
              <AppIcon name="arrow_back" className="lucide" />
            </Link>
            <h1 className="font-headline-xl text-on-surface">Saved Properties</h1>
          </div>
          <p className="text-on-surface-variant">
            {isLoading ? 'Loading...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'property' : 'properties'} saved`}
          </p>
        </div>

        {/* Action Bar */}
        {!isLoading && properties.length > 0 && (
          <div className="bg-surface-container-lowest rounded-lg border border-border p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
            {/* Selection */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredProperties.length && filteredProperties.length > 0}
                onChange={selectAll}
                className="w-5 h-5 rounded cursor-pointer accent-residential-teal"
              />
              <span className="text-sm font-medium text-on-surface">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={bulkRemove}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-error-container text-error rounded-lg text-sm font-semibold hover:bg-error/10 transition-colors"
                >
                  <AppIcon name="delete" className="lucide" />
                  <span className="hidden sm:inline">Remove Selected</span>
                </button>
                <button
                  onClick={bulkExport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors"
                >
                  <AppIcon name="download" className="lucide" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            )}

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors ml-auto"
            >
              <AppIcon name="tune" className="lucide" />
              Filters
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && !isLoading && (
          <div className="bg-surface-container-lowest rounded-lg border border-border p-4 md:p-6 mb-6">
            <h3 className="font-headline-sm font-bold text-on-surface mb-4">Filter & Sort</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  Listing Type
                </label>
                <select
                  value={filters.listingType}
                  onChange={e => setFilters({ ...filters, listingType: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal"
                >
                  <option value="all">All Types</option>
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="short_let">Short Let</option>
                  <option value="share">Shared</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={e => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal"
                >
                  <option value="all">All Properties</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="duplex">Duplex</option>
                  <option value="land">Land</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={e => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal"
                >
                  <option value="all">All Prices</option>
                  <option value="0-1000000">Under ₦1M</option>
                  <option value="1000000-5000000">₦1M - ₦5M</option>
                  <option value="5000000-10000000">₦5M - ₦10M</option>
                  <option value="10000000+">Over ₦10M</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <SkeletonPropertyCard />
            <SkeletonPropertyCard />
            <SkeletonPropertyCard />
          </div>
        ) : filteredProperties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProperties.map(property => (
              <SavedPropertyCard
                key={property.id}
                property={property}
                selected={selectedIds.has(property.id)}
                onSelect={() => toggleSelect(property.id)}
                onRemove={() => {
                  if (confirm('Remove this property from saved?')) {
                    setProperties(prev => prev.filter(p => p.id !== property.id));
                  }
                }}
                onAddNote={() => openNoteModal(property.id)}
              />
            ))}
          </div>
        )}

        {/* Compare Button (Fixed on Mobile) */}
        {selectedIds.size >= 2 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:static md:transform-none md:mt-8">
            <button
              onClick={() => router.push(`/compare?ids=${[...selectedIds].join(',')}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-residential-teal text-foreground rounded-full font-semibold hover:bg-residential-teal/90 transition-all duration-300 hover:scale-105 shadow-elevated"
            >
              <AppIcon name="compare" className="lucide" />
              Compare {selectedIds.size} Properties
            </button>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Saved item preview"
        >
          <div className="bg-surface-container-lowest rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md font-bold text-on-surface">Add Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-surface-container rounded-lg transition-colors"
              >
                <AppIcon name="close" className="lucide" />
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add your thoughts, reminders, or questions about this property..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal resize-none"
              rows={5}
            />

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={saveNote}
                className="flex-1 px-4 py-3 bg-residential-teal text-foreground rounded-lg font-semibold hover:bg-residential-teal/90 transition-colors"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-3 bg-surface-container text-on-surface rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .lucide {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
