import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trendPositive?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trendPositive = true,
}: StatsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className="text-xs font-medium"
            style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}
          >
            {trendPositive ? '↑' : '↓'}
          </span>
          <span
            className="text-xs"
            style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
