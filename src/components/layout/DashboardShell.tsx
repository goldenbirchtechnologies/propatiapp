'use client'

import AppIcon from '@/components/icons/app-icon';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { NotificationsBell } from '@/components/notifications/notifications-bell';
import GlobalSearch from './GlobalSearch';
import { SkeletonNavItem, SidebarOverlay } from '@/components/layout/sidebar';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardPageTitle } from '@/lib/dashboard-titles';

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: string | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface DashboardShellProps {
  children: React.ReactNode;
  navigation: Array<NavItem | NavSection>;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  shellLoading?: boolean;
}
function StatCardSkeleton() {
  return (
    <div
      className="skel-card"
      style={{
        animation: 'skel-pulse 1.6s ease-in-out infinite',
        padding: 'var(--space-lg)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div
            className="rounded"
            style={{
              height: 11,
              width: '55%',
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
          <div
            className="rounded"
            style={{
              height: 28,
              width: '40%',
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
          <div
            className="rounded"
            style={{
              height: 10,
              width: '35%',
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
        </div>
        <div
          className="rounded-lg flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

function ActionCardSkeleton() {
  return (
    <div
      className="skel-card"
      style={{
        animation: 'skel-pulse 1.6s ease-in-out infinite',
        padding: 'var(--space-lg)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="rounded-md flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="rounded"
            style={{
              height: 14,
              width: '65%',
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
          <div
            className="rounded"
            style={{
              height: 10,
              width: '90%',
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div
      className="skel-table-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) 0',
        borderBottom: '1px solid var(--border)',
        animation: 'skel-pulse 1.6s ease-in-out infinite',
      }}
    >
      <div
        className="skel-table-avatar"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skel-shimmer 1.6s linear infinite',
        }}
      />
      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div
          style={{
            height: 13,
            width: '40%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
        <div
          style={{
            height: 10,
            width: '60%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
      </div>
      <div
        className="hidden sm:block"
        style={{
          width: 64,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skel-shimmer 1.6s linear infinite',
        }}
      />
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div
      className="skel-list-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) 0',
        animation: 'skel-pulse 1.6s ease-in-out infinite',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skel-shimmer 1.6s linear infinite',
        }}
      />
      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div
          style={{
            height: 12,
            width: '50%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
        <div
          style={{
            height: 10,
            width: '70%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skel-shimmer 1.6s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div
      className="app-layout"
      aria-busy="true"
      aria-label="Loading dashboard"
      style={{
        minHeight: '100vh',
        '--text': '#f8f6f0',
        '--muted': 'rgba(255,255,255,0.65)',
        '--surface-elevated': '#093057',
        '--border': 'rgba(255,255,255,0.18)',
      }}
    >
      {/* Skeleton sidebar */}
      <aside
        className="sidebar"
        role="navigation"
        aria-label="Loading navigation"
        style={{
          width: 'var(--sidebar-width)',
          color: 'var(--text)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div className="sb-header" style={{ padding: 'var(--space-lg)' }}>
          <div
            className="rounded-md"
            style={{
              height: 22,
              width: 100,
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
        </div>
        <div className="sb-user-card" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skel-shimmer 1.6s linear infinite',
              }}
            />
            <div className="space-y-2 flex-1">
              <div
                className="rounded"
                style={{
                  height: 12,
                  width: '60%',
                  background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skel-shimmer 1.6s linear infinite',
                }}
              />
              <div
                className="rounded"
                style={{
                  height: 10,
                  width: '40%',
                  background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skel-shimmer 1.6s linear infinite',
                }}
              />
            </div>
          </div>
        </div>
        <nav className="sb-nav" style={{ padding: 'var(--space-md)' }} aria-hidden="true">
          <ul className="space-y-1" role="list">
            {[...Array(7)].map((_, i) => (
              <li key={i}>
                <SkeletonNavItem />
              </li>
            ))}
          </ul>
        </nav>
        <div className="sb-footer" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div
            className="rounded-md"
            style={{ height: 36, width: '100%', background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
          />
        </div>
      </aside>

      {/* Skeleton main area */}
      <main className="main-area">
        <header
          className="topbar"
          style={{
            height: 'var(--topbar-height)',
            padding: '0 var(--space-lg)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skel-shimmer 1.6s linear infinite',
              }}
            />
            <div
              className="rounded-md hidden md:block"
              style={{
                height: 36,
                width: 240,
                background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skel-shimmer 1.6s linear infinite',
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }} />
            <div className="rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }} />
            <div className="rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }} />
          </div>
        </header>

        <div
          className="content-area"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem var(--space-lg)',
          }}
        >
          {/* Stat cards grid */}
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            <style>{`
              @media (max-width: 1024px) {
                .shell-loading-grid { grid-template-columns: repeat(2, 1fr) !important; }
              }
              @media (max-width: 600px) {
                .shell-loading-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {[...Array(6)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          <div className="shell-loading-grid grid gap-4 sm:gap-6 mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[...Array(3)].map((_, i) => (
              <ActionCardSkeleton key={i} />
            ))}
          </div>

          <div className="mt-6 space-y-2" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
            <div className="flex items-center justify-between mb-4">
              <div
                className="rounded"
                style={{
                  height: 18,
                  width: 180,
                  background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skel-shimmer 1.6s linear infinite',
                }}
              />
              <div
                className="rounded-md"
                style={{
                  height: 34,
                  width: 90,
                  background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skel-shimmer 1.6s linear infinite',
                }}
              />
            </div>
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
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
      <div
        className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center', className)}
        role="alert"
      >
        <p className="text-destructive font-medium mb-1">Unable to load this section</p>
        <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-secondary text-sm"
            style={{ padding: 'var(--space-sm) var(--space-lg)' }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading content" className={className}>
        {skeleton}
      </div>
    );
  }

  return (
    <section className={className}>
      {children}
    </section>
  );
}

interface DashboardSectionProps {
  /** When true, show skeleton placeholder in this section (cards/table/list slots) */
  loading?: boolean;
  /** Error returned from the data-fetch for this section */
  error?: Error | null;
  /** Fallback message when data is empty */
  emptyMessage?: string;
  /** Skeleton slot: shown only when loading=true */
  skeleton?: React.ReactNode;
  /** Actual loaded content */
  children: React.ReactNode;
  /** Optional CSS class override for the skeleton container */
  className?: string;
  /** onRetry handler when an error is shown */
  onRetry?: () => void;
}

export function DashboardShell({
  children,
  navigation,
  userRole,
  userName,
  userAvatar,
  shellLoading = false,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('dashboard:sidebarCollapsed');
      return stored === '1';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('dashboard:sidebarCollapsed', sidebarCollapsed ? '1' : '0');
    } catch { /* noop */ }
  }, [sidebarCollapsed]);

  // Close mobile sidebar on Escape for accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const pageTitle = useMemo(() => getDashboardPageTitle(pathname, userRole), [pathname, userRole]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  // Early return after hooks to avoid Rules-of-Hooks violations
  if (shellLoading) {
    return <LoadingShell />;
  }

  const roleThemeClass = `theme-${(userRole || 'tenant').toLowerCase().replace('_', '-')}`;
  const roleClass = `shell-${(userRole || 'tenant').toLowerCase().replace('_', '-')}`;
  const profileHref = userRole === 'estate_manager' ? '/dashboard/estate-manager/profile' : `/dashboard/${userRole}/profile`;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className={`app-layout ${roleThemeClass} ${roleClass}`}>
      <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <style>{`
          @keyframes propLogoPop {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          @media (prefers-reduced-motion: reduce) {
            .prop-logo-anim { animation: none !important; }
          }
          .sb-inner { display: flex; flex-direction: column; height: 100%; padding: 16px 16px 12px; gap: 12px; }
          .sb-header-bar, .sb-nav-inner, .sb-footer-bar { display: flex; align-items: center; }
          .sb-header-bar { justify-content: space-between; }
          .sb-user-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
          .sb-user-text { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
          .sb-user-name { color: var(--text); font-weight: 600; font-size: 14px; line-height: 20px; }
          .sb-user-role { color: var(--muted); font-size: 11px; line-height: 16px; text-transform: capitalize; }
          .sb-nav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
          .sb-nav-item { display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 8px 10px; border-radius: 10px; color: var(--text); background: transparent; border-left: 3px solid transparent; font-size: 14px; line-height: 20px; font-weight: 500; text-align: left; text-decoration: none; transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; white-space: nowrap; }
          .sb-nav-item.active, .sb-nav-item[aria-current='true'] { background: var(--accent); border-left-color: var(--accent2); }
          .sb-nav-item .icon-slot { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
          .sb-footer-bar { justify-content: center; }
          .sb-signout-btn { display: inline-flex; width: 100%; align-items: center; justify-content: flex-start; gap: 10px; border-radius: 10px; padding: 8px 10px; font-size: 13px; line-height: 18px; color: var(--text); background: var(--surface-elevated); border: none; cursor: pointer; transition: background-color 0.15s ease; }
          .sb-signout-btn:hover { background: var(--surface-elevated); }
        `}</style>
        <div className="sb-inner">
          <div className="sb-header-bar">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/brand/propati-logo.png" alt="PROPATI" width="32" height="32" className="rounded-full" style={{ animation: 'propLogoPop 2.4s ease-in-out infinite', transformOrigin: 'center center' }} />
            </Link>
            <button
              className="hidden md:flex p-2 rounded-lg bg-surface-elevated text-foreground"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarCollapsed ? (
                  <>
                    <line x1="9" y1="18" x2="15" y2="12" />
                    <line x1="9" y1="6" x2="15" y2="12" />
                  </>
                ) : (
                  <>
                    <line x1="15" y1="18" x2="9" y2="12" />
                    <line x1="15" y1="6" x2="9" y2="12" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <Link
            href={profileHref}
            className="sb-user-card block transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="View Profile"
            title="View Profile"
          >
            <div className="sb-user-row">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold bg-surface-elevated text-foreground"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  (userName || 'U').charAt(0).toUpperCase()
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="sb-user-text">
                  <p className="sb-user-name truncate">{userName || (user?.fullName || 'User')}</p>
                  <p className="sb-user-role truncate">Open profile</p>
                </div>
              )}
            </div>
          </Link>

          <nav className="sb-nav" aria-label="Dashboard navigation">
            <ul className="sb-nav-list" role="list">
              {navigation.map((item, idx) => {
                if ('items' in item) {
                  const section = item as NavSection;
                  const active = section.items.some((c) => isActive(c.href || ''));
                  return (
                    <li key={`section-${section.title}-${idx}`}>
                      <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {section.title}
                      </div>
                      <ul className="space-y-1 ml-1" role="list">
                        {section.items.map((child) => {
                          const childActive = isActive(child.href || '');
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href as any}
                                className={`sb-nav-item ${childActive ? 'active' : ''}`}
                                aria-current={childActive ? 'true' : undefined}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <span className="icon-slot">
                                  {child.icon
                                    ? child.icon
                                    : !sidebarCollapsed
                                    ? <AppIcon name={child.label} className="lucide" size={18} />
                                    : <AppIcon name="help" className="lucide" size={18} />}
                                </span>
                                {!sidebarCollapsed && <span className="text-foreground" style={{ marginLeft: 8, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{child.label}</span>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                }

                const navItem = item as NavItem;
                const itemActive = navItem.children
                  ? navItem.children.some((c) => isActive(c.href || ''))
                  : isActive(navItem.href || '');
                return (
                  <li key={navItem.href}>
                    {navItem.children ? (
                      <CollapsibleNavItem
                        item={navItem}
                        isActive={itemActive}
                        sidebarCollapsed={sidebarCollapsed}
                      />
                    ) : (
                      <Link
                        href={navItem.href || '#'}
                        className={`sb-nav-item ${itemActive ? 'active' : ''}`}
                        aria-current={itemActive ? 'true' : undefined}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="icon-slot">
                          {navItem.icon
                            ? navItem.icon
                            : !sidebarCollapsed
                            ? <AppIcon name={navItem.label} className="lucide" size={18} />
                            : <AppIcon name="help" className="lucide" size={18} />}
                        </span>
                        {!sidebarCollapsed && <span className="text-foreground" style={{ marginLeft: 8, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{navItem.label}</span>}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="sb-footer">
            <SignOutButton redirectUrl="/sign-in" className="sb-signout-btn">
              {!sidebarCollapsed ? 'Sign Out' : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
            </SignOutButton>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="md:hidden p-2 rounded-lg bg-surface-elevated text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <GlobalSearch userRole={userRole} />

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button
              className="hidden md:flex p-2 rounded-full transition hover:bg-muted"
              aria-label="Help"
              title="Help"
            >
              <HelpCircle size={20} style={{ color: 'var(--muted-foreground)' }} />
            </button>
            <NotificationsBell position="right" userRole={userRole} />
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || 'Profile'}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-border bg-surface-elevated text-foreground"
              >
                {(userName || (user?.fullName || 'U')).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <div className="content-area">{children}</div>
      </main>

      {/* Mobile bottom nav + FAB */}
      <MobileBottomNav navigation={navigation} userRole={userRole} />
    </div>
  );
}

function CollapsibleNavItem({ item, isActive, sidebarCollapsed }: { item: NavItem; isActive: boolean; sidebarCollapsed?: boolean }) {
  const [expanded, setExpanded] = useState(isActive);

  if (!item.children || item.children.length === 0) return null;

  if (sidebarCollapsed) {
    return (
      <Link
        href={item.children[0]?.href || '#'}
        className="sb-nav-item"
        style={{ justifyContent: 'center', padding: '10px 0' }}
        title={item.label}
        aria-label={item.label}
      >
        <span className="icon-slot">{item.icon}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        className={`sb-nav-item ${isActive ? 'active' : ''}`}
        aria-current={isActive ? 'true' : undefined}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="icon-slot">
          {item.icon
            ? item.icon
            : <AppIcon name={item.label} className="lucide" size={18} />}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <ul className="sb-nav-list" style={{ marginTop: '4px', paddingLeft: '8px', gap: '2px' }} role="list">
          {item.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="sb-nav-item"
                style={{ padding: '7px 10px', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}
              >
                <span className="icon-slot">
                  {child.icon
                    ? child.icon
                    : <AppIcon name={child.label} className="lucide" size={16} />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileBottomNav({ navigation, userRole }: { navigation: Array<NavItem | NavSection>; userRole?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  const top = navigation
    .filter((item): item is NavItem => !('items' in item))
    .slice(0, 4);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 hidden h-16 items-center justify-around border-t md:hidden"
        style={{
          background: 'var(--surface)',
          borderTopColor: 'var(--border)',
        }}
        aria-label="Mobile navigation"
      >
        {top.map((item) => {
          const active = isActive(item.href || '');
          return (
            <Link
              key={item.href}
              href={item.href || '#'}
              className="flex flex-col items-center gap-1 px-2 py-1"
              style={{
                color: active ? 'var(--amber)' : 'var(--muted-foreground)',
                transition: 'color var(--transition-fast)',
              }}
            >
              <span className={cn('transition-transform', active && 'scale-110')}>{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/dashboard"
        aria-label="Dashboard"
        className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg md:hidden bg-secondary-container text-on-secondary-container"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>
    </>
  );
}

export { CollapsibleNavItem };
export default DashboardShell;
