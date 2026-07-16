'use client';

import { useState } from 'react';
import { BottomSheet } from '@/lib/mobile-utils';
import SearchFilters, { SearchFilters as SearchFiltersType } from './SearchFilters';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'residential' | 'commercial';
  initialFilters: SearchFiltersType;
  onApplyFilters: (filters: SearchFiltersType) => void;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  category,
  initialFilters,
  onApplyFilters,
}: MobileFilterSheetProps) {
  const [tempFilters, setTempFilters] = useState<SearchFiltersType>(initialFilters);

  const handleFilterChange = (filters: SearchFiltersType) => {
    setTempFilters(filters);
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({});
    onApplyFilters({});
    onClose();
  };

  const handleClose = () => {
    // Reset to initial filters on close without applying
    setTempFilters(initialFilters);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Filter Properties"
      snapPoints={[90]}
      showHandle={true}
      className="flex flex-col"
    >
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <SearchFilters
          category={category}
          onFilterChange={handleFilterChange}
          filters={tempFilters}
        />
      </div>

      {/* Fixed Action Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-surface-elevated border-t border-border px-6 py-4 flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </BottomSheet>
  );
}
