'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';

interface StatItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  change?: { value: string; positive?: boolean };
}

interface SpatialStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  emptyMessage?: string;
}

const SpatialStats = React.forwardRef<HTMLDivElement, SpatialStatsProps>(
  (
    {
      className,
      items,
      columns = 4,
      loading = false,
      emptyMessage = 'No statistics available.',
      ...props
    },
    ref
  ) => {
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
    };

    if (loading) {
      return (
        <SpatialSection ref={ref} elevation={1} spacing="md" className={className} {...props}>
          <div className={cn('grid gap-4', gridCols[columns])}>
            {Array.from({ length: columns }).map((_, idx) => (
              <div key={idx} className="rounded-lg border border-default bg-raised p-6 shadow-1">
                <div className="mb-2 h-4 w-24 animate-shimmer rounded bg-border-subtle" />
                <div className="h-8 w-16 animate-shimmer rounded bg-border-subtle" />
              </div>
            ))}
          </div>
        </SpatialSection>
      );
    }

    if (items.length === 0) {
      return (
        <SpatialSection ref={ref} elevation={1} spacing="md" className={className} {...props}>
          <p className="py-8 text-center text-text-muted">{emptyMessage}</p>
        </SpatialSection>
      );
    }

    return (
      <SpatialSection ref={ref} elevation={1} spacing="md" className={className} {...props}>
        <div className={cn('grid gap-4', gridCols[columns])}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-default bg-raised p-6 shadow-1 transition-shadow duration-200 hover:shadow-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{item.value}</p>
                </div>
                {item.icon && <div className="text-text-muted">{item.icon}</div>}
              </div>
              {item.change && (
                <p className={cn('mt-2 text-sm', item.change.positive ? 'text-success' : 'text-error')}>
                  {item.change.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </SpatialSection>
    );
  }
);

SpatialStats.displayName = 'SpatialStats';

export { SpatialStats };
