'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, RefreshCw, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────
type Referral = {
  id: string;
  referredName: string;
  referredEmail: string;
  referredPhone: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
  source: string;
  date: string;
};

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockReferrals: Referral[] = [
  {
    id: '1',
    referredName: 'Kevin Okafor',
    referredEmail: 'kevin.okafor@example.com',
    referredPhone: '+234 801 234 5678',
    status: 'new',
    source: 'Website',
    date: '2024-12-15',
  },
  {
    id: '2',
    referredName: 'Fatima Bello',
    referredEmail: 'fatima.bello@example.com',
    referredPhone: '+234 802 345 6789',
    status: 'contacted',
    source: 'Instagram',
    date: '2024-12-10',
  },
  {
    id: '3',
    referredName: 'Adewale Johnson',
    referredEmail: 'ade.johnson@example.com',
    referredPhone: '+234 803 456 7890',
    status: 'qualified',
    source: 'Referral',
    date: '2024-11-28',
  },
  {
    id: '4',
    referredName: 'Chidinma Eze',
    referredEmail: 'chidi.eze@example.com',
    referredPhone: '+234 804 567 8901',
    status: 'closed',
    source: 'Website',
    date: '2024-11-15',
  },
  {
    id: '5',
    referredName: 'Oluwaseun Adeyemi',
    referredEmail: 'seun.adeyemi@example.com',
    referredPhone: '+234 805 678 9012',
    status: 'lost',
    source: 'Facebook',
    date: '2024-10-30',
  },
];

// ── Status Helpers ──────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  new: 'bg-surface-container-high/20 border-outline-variant text-primary',
  contacted: 'bg-warning/10 border-warning/20 text-warning',
  qualified: 'bg-surface-container-high/20 border-outline-variant text-primary',
  closed: 'bg-success-bright/10 border-success-bright/20 text-success',
  lost: 'bg-destructive/10 border-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed',
  lost: 'Lost',
};

type FilterStatus = 'all' | Referral['status'];

// ── Skeleton Components ────────────────────────────────────────────────────────
const SkeletonStatCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg bg-surface-container" />
      <div>
        <div className="h-3 bg-surface-container rounded w-24 mb-2" />
        <div className="h-6 bg-surface-container rounded w-12" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-container rounded w-48" />
        <div className="h-3 bg-surface-container rounded w-64" />
      </div>
      <div className="h-6 bg-surface-container rounded-full w-20" />
      <div className="h-9 bg-surface-container rounded w-24" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3" aria-label="Loading referrals">
    {[1, 2, 3, 4, 5].map((i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
        <UserPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">
        {hasFilters ? 'No matching referrals' : 'No referrals yet'}
      </h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you are looking for.'
          : 'Start building your referral network by adding new referrals or sharing your referral link.'}
      </p>
      {!hasFilters && (
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Referral
        </Button>
      )}
    </div>
  );
}

// ── Error State ────────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-destructive/20 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <RefreshCw className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">Something went wrong</h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
        {message || 'We could not load your referrals. Please check your connection and try again.'}
      </p>
      <Button size="sm" variant="outline" className="gap-2" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  color: 'teal' | 'gold' | 'blue' | 'purple' | 'green';
}) {
  const colorMap = {
    teal: 'hover:border-residential-teal text-residential-teal',
    gold: 'hover:border-commercial-gold text-commercial-gold',
    blue: 'hover:border-primary text-primary',
    purple: 'hover:border-primary text-primary',
    green: 'hover:border-success text-success',
  };

  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
        colorMap[color]
      )}
    >
      <p className="text-sm text-on-surface-variant font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {trend && (
        <p
          className={cn(
            'text-xs font-medium mt-1',
            trend.positive ? 'text-success' : 'text-destructive'
          )}
        >
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}

// ── Referral Row ───────────────────────────────────────────────────────────────
function ReferralRow({ referral }: { referral: Referral }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm transition-colors hover:bg-surface-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-primary truncate">
            {referral.referredName}
          </p>
          <p className="text-xs text-on-surface-variant truncate">
            {referral.referredEmail} · {referral.referredPhone}
          </p>
          <p className="text-xs mt-1 text-on-surface-variant">
            Source: {referral.source} · {new Date(referral.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={cn('text-xs font-medium border', statusStyles[referral.status])}>
            {statusLabels[referral.status]}
          </Badge>
          <Button variant="outline" size="sm" className="shrink-0">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReferralsClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Placeholder fetch — replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Simulate occasional error for demo/retry UX
      if (Math.random() < 0.15) {
        throw new Error('Failed to fetch referrals');
      }

      setReferrals(mockReferrals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.referredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'all' || r.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Referrals', value: referrals.length, color: 'teal' as const },
    {
      label: 'New',
      value: referrals.filter((r) => r.status === 'new').length,
      color: 'blue' as const,
    },
    {
      label: 'Qualified',
      value: referrals.filter((r) => r.status === 'qualified').length,
      color: 'purple' as const,
    },
    {
      label: 'Closed',
      value: referrals.filter((r) => r.status === 'closed').length,
      color: 'green' as const,
      trend: { value: '3 this month', positive: true },
    },
    {
      label: 'Lost',
      value: referrals.filter((r) => r.status === 'lost').length,
      color: 'gold' as const,
    },
    {
      label: 'Conversion Rate',
      value: referrals.length
        ? `${Math.round((referrals.filter((r) => r.status === 'closed').length / referrals.length) * 100)}%`
        : '0%',
      color: 'teal' as const,
    },
  ];

  const hasActiveFilters = searchQuery.trim().length > 0 || activeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-sm text-headline-sm text-primary">
              Referrals Pipeline
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              Track every lead from first contact to closed deal.
            </p>
          </div>
        </div>
        <ErrorState message={error} onRetry={loadReferrals} />
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Referrals Pipeline
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Track every lead from first contact to closed deal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadReferrals} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Referral
          </Button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 shrink-0 text-on-surface-variant" />
        <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} label="All" />
        {(['new', 'contacted', 'qualified', 'closed', 'lost'] as const).map((status) => (
          <FilterButton
            key={status}
            active={activeFilter === status}
            onClick={() => setActiveFilter(status)}
            label={statusLabels[status]}
          />
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => <SkeletonStatCard key={i} />)
          ) : (
            stats.map((s, i) => <StatCard key={i} {...s} />)
          )}
        </div>
      </section>

      {/* Table / Referral Rows */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">
            Referral Directory
          </h2>
          {!loading && (
            <span className="text-xs text-on-surface-variant">
              {filteredReferrals.length} result{filteredReferrals.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filteredReferrals.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="space-y-3">
            {filteredReferrals.map((referral) => (
              <ReferralRow key={referral.id} referral={referral} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Filter Pill ────────────────────────────────────────────────────────────────
function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-transparent hover:border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
      )}
    >
      {label}
    </button>
  );
}
