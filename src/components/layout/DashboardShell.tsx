'use client'

import React from 'react';
import TenantRailShell from './TenantRailShell';
import type { NavItem, NavSection } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
  navigation: Array<NavItem | NavSection>;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  orgName?: string | null;
  shellLoading?: boolean;
  quickAction?: { href: string; label: string; icon?: React.ReactNode };
  hideGlobalSearch?: boolean;
}

export function DashboardSection({
  loading = false,
  error = null,
  emptyMessage = 'No data to display.',
  skeleton,
  children,
  className,
  onRetry,
}: DashboardSectionProps) {
  if (error) {
    return (
      <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center', className)} role="alert">
        <p className="text-destructive font-medium mb-1">Unable to load this section</p>
        <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
        {onRetry && <button onClick={onRetry} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-sm) var(--space-lg)' }}>Retry</button>}
      </div>
    );
  }
  if (loading) {
    return <div aria-busy="true" aria-label="Loading content" className={className}>{skeleton}</div>;
  }
  return <section className={className}>{children}</section>;
}

interface DashboardSectionProps {
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}

export function DashboardShell(props: DashboardShellProps) {
  return <TenantRailShell {...props} />;
}

export default DashboardShell;
