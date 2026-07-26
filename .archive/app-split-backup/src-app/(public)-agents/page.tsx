'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { AgentCard, type Agent } from '@/components/agents/AgentCard';
import { AgentCardSkeleton } from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ALL_AGENTS } from '@/lib/mock-agents';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type Specialty = string;
type Location = string;

interface Filters {
  search: string;
  location: string;
  specialty: string;
  minRating: number;
  verificationTier: string;
}

function AgentsPageInner() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    specialty: '',
    minRating: 0,
    verificationTier: '',
  });
  const [displayedCount, setDisplayedCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Derive unique values for filter dropdowns
  const locations = useMemo(() => {
    const set = new Set<string>(ALL_AGENTS.map((a) => a.location));
    return Array.from(set).sort();
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>((ALL_AGENTS || []).flatMap((a) => a.specialty));
    return Array.from(set).sort();
  }, []);

  const verificationTiers = ['basic', 'verified', 'inspected', 'certified'] as const;

  // ==========================================================================
  // FILTER LOGIC
  // ==========================================================================

  const filteredAgents = useMemo(() => {
    let results = [...ALL_AGENTS];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.specialty.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.location) {
      results = results.filter((a) => a.location === filters.location);
    }

    if (filters.specialty) {
      results = results.filter((a) => a.specialty.includes(filters.specialty));
    }

    if (filters.minRating > 0) {
      results = results.filter((a) => a.rating >= filters.minRating);
    }

    if (filters.verificationTier) {
      results = results.filter((a) => a.verificationTier === filters.verificationTier);
    }

    return results;
  }, [filters]);

  const visibleAgents = filteredAgents.slice(0, displayedCount);
  const hasMore = displayedCount < filteredAgents.length;

  const loadMore = React.useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 6, filteredAgents.length));
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, hasMore, filteredAgents.length]);

  React.useEffect(() => {
    setDisplayedCount(8);
  }, [filters]);

  React.useEffect(() => {
    const node = observerTarget.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => {
    setFilters({
      search: '',
      location: '',
      specialty: '',
      minRating: 0,
      verificationTier: '',
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.location,
    filters.specialty,
    filters.minRating > 0 ? 'rating' : null,
    filters.verificationTier,
  ].filter(Boolean).length;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Intro */}
      <div className="bg-surface-elevated border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-headline-lg font-bold text-on-surface">
                Discover Agents & Brokers
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Browse verified real estate professionals across Nigeria. Filter by location, specialty, and rating to find your perfect match.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-6">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-[164px] bg-surface border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wide">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <Input
                    placeholder="Name, role, specialty..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Location</label>
                <Select value={filters.location} onValueChange={(v) => updateFilter('location', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Specialty</label>
                <Select value={filters.specialty} onValueChange={(v) => updateFilter('specialty', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All specialties</SelectItem>
                    {specialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Minimum Rating</label>
                <Select
                  value={filters.minRating === 0 ? '0' : String(filters.minRating)}
                  onValueChange={(v) => updateFilter('minRating', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Tier */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Verification</label>
                <Select value={filters.verificationTier} onValueChange={(v) => updateFilter('verificationTier', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tiers</SelectItem>
                    {verificationTiers.map((tier) => (
                      <SelectItem key={tier} value={tier} className="capitalize">
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">
                  {filteredAgents.length} agent{filteredAgents.length === 1 ? '' : 's'} found
                </p>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-surface text-sm font-medium"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </button>
            </div>

            {/* Mobile Filter Sheet */}
            {mobileFiltersOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-xl p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-on-surface">Filters</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 rounded-md text-muted-foreground hover:bg-accent"
                      aria-label="Close filters"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                        <Input
                          placeholder="Name, role, specialty..."
                          value={filters.search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Location</label>
                      <Select value={filters.location} onValueChange={(v) => updateFilter('location', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All locations</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Specialty</label>
                      <Select value={filters.specialty} onValueChange={(v) => updateFilter('specialty', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All specialties</SelectItem>
                          {specialties.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Minimum Rating</label>
                      <Select
                        value={filters.minRating === 0 ? '0' : String(filters.minRating)}
                        onValueChange={(v) => updateFilter('minRating', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any rating</SelectItem>
                          <SelectItem value="3">3+ stars</SelectItem>
                          <SelectItem value="3.5">3.5+ stars</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="4.5">4.5+ stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Verification</label>
                      <Select value={filters.verificationTier} onValueChange={(v) => updateFilter('verificationTier', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All tiers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All tiers</SelectItem>
                          {verificationTiers.map((tier) => (
                            <SelectItem key={tier} value={tier} className="capitalize">
                              {tier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t border-outline-variant space-y-2">
                      <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                        Show results
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          clearAll();
                          setMobileFiltersOpen(false);
                        }}
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredAgents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg font-medium text-on-surface">No agents found</p>
                <p className="text-sm text-on-surface-variant mt-2">
                  Try adjusting your filters or search terms.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Agent Grid */}
            {filteredAgents.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 pb-xl">
                {visibleAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentsPageInner;
