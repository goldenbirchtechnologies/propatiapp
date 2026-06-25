'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { NotificationsBell } from '@/components/notifications/notifications-bell';
import { Sidebar, SkeletonNavItem, SidebarMobileTrigger, SidebarOverlay } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface DashboardShellProps {
  children: React.ReactNode;
  navigation: NavItem[];
  userRole: string;
  userName: string;
  userAvatar?: string;
  /** Set true during the initial shell hydration/sidebar data fetch.
   *  When true, renders the skeleton shell so layout never flashes empty. */
  shellLoading?: boolean;
}

// ─── CSS-grid responsive skeleton containers ─────────────────────────────────
// All use CSS-only shimmer via cls injected inline style; no extra TS files needed.

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

// ─── Loading shell (full-page skeleton) ──────────────────────────────────────
function LoadingShell() {
  return (
    <div
      className="app-layout"
      aria-busy="true"
      aria-label="Loading dashboard"
      style={{ minHeight: '100vh' }}
    >
      {/* Skeleton sidebar */}
      <aside
        className="sidebar"
        role="navigation"
        aria-label="Loading navigation"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface)',
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
        <nav
          className="sb-nav"
          style={{ padding: 'var(--space-md)' }}
          aria-hidden="true"
        >
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
            padding: '0 var(--space-xxl)',
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
                width: 36,
                background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skel-shimmer 1.6s linear infinite',
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }} />
            <div className="rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }} />
          </div>
        </header>

        <div
          className="content-area"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--content-padding-desktop)',
          }}
        >
          {/* Stat cards grid — collapses 3→2→1 via inline responsive classes */}
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
            {/* Force class to scope the media rules to just this grid */}
            {[...Array(6)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Action cards grid */}
          <div
            className="shell-loading-grid grid gap-4 sm:gap-6 mt-6"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {[...Array(3)].map((_, i) => (
              <ActionCardSkeleton key={i} />
            ))}
          </div>

          {/* Table skeleton */}
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

// ─── Section guard: loading / empty / error states per content block ──────────
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

// ─── Main shell ──────────────────────────────────────────────────────────────
export function DashboardShell({
  children,
  navigation,
  userRole,
  userName,
  userAvatar,
  shellLoading = false,
}: DashboardShellProps) {
  // Full-page skeleton during initial hydration prevents layout shift / inf-load flash
  if (shellLoading) {
    return <LoadingShell />;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Role-based theme class
  const roleThemeClass = `theme-${userRole.toLowerCase().replace('_', '-')}`;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className={`app-layout ${roleThemeClass}`}>
      {/* Mobile Sidebar Overlay */}
      <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar — on mobile, drawer is driven by the `open` class + inline
          `position:fixed; transform:translateX(...)` set in Sidebar component */}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sb-header" style={{ padding: 'var(--space-lg)' }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
              PROPATI
            </span>
            {!sidebarCollapsed && (
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Dashboard
              </span>
            )}
          </Link>
        </div>

        <div className="sb-user-card" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
              style={{ background: `linear-gradient(135deg, var(--accent), var(--accent2))` }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{userName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                  {userRole.charAt(0) + userRole.slice(1).toLowerCase().replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="sb-nav" style={{ padding: 'var(--space-md)' }} aria-label="Dashboard navigation">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <CollapsibleNavItem
                    item={item}
                    isActive={item.children.some((c) => isActive(c.href))}
                    sidebarCollapsed={sidebarCollapsed}
                  />
                ) : (
                  <Link
                    href={item.href}
                    className={`nav-item flex items-center gap-3 ${isActive(item.href) ? 'active' : ''}`}
                    style={{
                      padding: 'var(--space-base) var(--space-md)',
                      borderRadius: 'var(--radius-btn)',
                      fontSize: 'var(--text-body)',
                      fontWeight: 500,
                      minHeight: '44px',
                      color: isActive(item.href) ? 'var(--accent)' : 'var(--text)',
                      backgroundColor: isActive(item.href) ? 'var(--accent-bg)' : 'transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sb-footer" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div className="flex items-center gap-3" style={{ color: 'var(--muted)', fontSize: 'var(--text-tag)' }}>
            <span>v1.0.0</span>
            <span style={{ flex: 1 }} />
            <SignOutButton>
              <button
                className="btn btn-ghost text-sm w-full justify-center"
                style={{ padding: 'var(--space-sm) var(--space-md)' }}
              >
                {!sidebarCollapsed && 'Sign Out'}
                {sidebarCollapsed && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                )}
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger — opens drawer */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {/* Desktop collapse toggle */}
            <button
              className="hidden md:flex p-2 rounded-lg"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationsBell position="right" userRole={userRole} />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                  userButtonPopover: 'rounded-lg shadow-lg',
                  userButtonPopoverActions: 'flex-col gap-2',
                },
              }}
            />
          </div>
        </header>

        {/* Content */}
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}

// ─── Collapsible Nav Item (internal, used by shell) ─────────────────────────
function CollapsibleNavItem({
  item,
  isActive,
  sidebarCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  sidebarCollapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(isActive);

  if (!item.children || item.children.length === 0) return null;

  if (sidebarCollapsed) {
    return (
      <Link
        href={item.children[0]?.href || '#'}
        className="nav-item flex items-center justify-center"
        style={{
          padding: 'var(--space-base)',
          borderRadius: 'var(--radius-btn)',
          color: isActive ? 'var(--accent)' : 'var(--text)',
          backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
        }}
        title={item.label}
        aria-label={item.label}
      >
        {item.icon}
      </Link>
    );
  }

  return (
    <div>
      <button
        className={`nav-item flex items-center gap-3 w-full ${isActive || expanded ? 'active' : ''}`}
        style={{
          padding: 'var(--space-base) var(--space-md)',
          borderRadius: 'var(--radius-btn)',
          fontSize: 'var(--text-body)',
          fontWeight: 500,
          minHeight: '44px',
          color: isActive || expanded ? 'var(--accent)' : 'var(--text)',
          backgroundColor: isActive || expanded ? 'var(--accent-bg)' : 'transparent',
          transition: 'all var(--transition-fast)',
          textAlign: 'left',
        }}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--muted)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <ul className="mt-1 ml-8 space-y-1" role="list">
          {item.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="nav-item flex items-center gap-2 text-sm"
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-btn-sm)',
                  color: 'var(--muted)',
                }}
              >
                {child.icon && <span className="flex-shrink-0">{child.icon}</span>}
                <span>{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
