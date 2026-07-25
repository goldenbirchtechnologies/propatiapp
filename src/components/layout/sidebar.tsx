'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  ChevronRight,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Home,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings,
  Bell,
  Shield,
  BarChart2,
  Wrench,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Key,
  Award,
  User,
  ClipboardList,
  Flag,
  Gavel,
} from 'lucide-react';

import {
  LANDLORD_NAVIGATION,
  TENANT_NAVIGATION,
  AGENT_NAVIGATION,
  ADMIN_NAVIGATION,
  ESTATE_MANAGER_NAVIGATION,
  ACCOUNTANT_NAVIGATION,
  NavItem,
  NavSection,
} from '@/lib/navigation';

export interface SidebarProps {
  navigation: Array<NavItem | NavSection>;
  userRole: string;
  userName: string;
  userAvatar?: string;
  onSignOut?: () => void;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
  /** When true, render skeleton placeholders instead of nav items */
  isLoading?: boolean;
}

const roleNavigation: Record<string, Array<NavItem | NavSection>> = {
  landlord: LANDLORD_NAVIGATION,
  tenant: TENANT_NAVIGATION,
  agent: AGENT_NAVIGATION,
  admin: ADMIN_NAVIGATION,
  estate_manager: ESTATE_MANAGER_NAVIGATION,
  accountant: ACCOUNTANT_NAVIGATION,
};

// ─── Skeleton nav item (shown when isLoading=true) ───────────────────────────
export function SkeletonNavItem({ level = 0 }: { level?: number }) {
  const indent = level === 0 ? '0' : 'var(--space-md)';
  return (
    <div
      className="animate-pulse flex items-center gap-3 rounded-md"
      style={{ padding: `var(--space-base) var(--space-md)`, marginLeft: indent, height: 44 }}
    >
      <div
        className="rounded-md flex-shrink-0"
        style={{ width: 20, height: 20, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
      />
      <div
        className="rounded flex-1"
        style={{ height: 13, width: '60%', background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
      />
    </div>
  );
}

// ─── Skeleton user card ──────────────────────────────────────────────────────
function SkeletonUserCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-4">
        <div
          className="rounded-full"
          style={{ width: 36, height: 36, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div
        className="rounded-full flex-shrink-0"
        style={{ width: 40, height: 40, background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
      />
      <div className="flex-1 space-y-2">
        <div
          className="rounded"
          style={{ height: 13, width: '70%', background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
        />
        <div
          className="rounded"
          style={{ height: 10, width: '45%', background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'skel-shimmer 1.6s linear infinite' }}
        />
      </div>
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function NavItemComponent({
  item,
  isActive,
  sidebarCollapsed,
  level = 0,
}: {
  item: NavItem;
  isActive: boolean;
  sidebarCollapsed: boolean;
  level?: number;
}) {
  const [expanded, setExpanded] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return item.children?.some((c) => c.href === window.location.pathname) || false;
  });
  const pathname = usePathname();
  const active = isActive;

  const icon = item.icon || <LayoutDashboard className="h-5 w-5" />;

  if (sidebarCollapsed && level === 0) {
    return (
      <Link
        href={(item.children?.[0]?.href || item.href || '#') as any}
        className={cn(
          'nav-item flex items-center justify-center relative',
          active && 'active'
        )}
        title={item.label}
        aria-label={item.label}
      >
        {icon}
        {item.badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold bg-accent text-accent-foreground rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger
            className={cn(
              'nav-item flex items-center gap-3 w-full',
              active && 'active'
            )}
            style={{
              padding: 'var(--space-base) var(--space-md)',
              borderRadius: 'var(--radius-btn)',
              fontSize: 'var(--text-body)',
              fontWeight: 500,
              minHeight: '44px',
              color: active ? 'var(--accent)' : 'var(--text)',
              backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
              transition: 'all var(--transition-fast)',
              textAlign: 'left',
            }}
            aria-expanded={expanded}
          >
            <span className="flex-shrink-0">{icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold bg-accent/10 text-accent rounded-full">
                {item.badge}
              </span>
            )}
            <ChevronRight
              className={cn(
                'transition-transform h-4 w-4 flex-shrink-0',
                expanded && 'rotate-90',
                'text-muted-foreground'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 ml-8 space-y-1" forceMount>
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'nav-item flex items-center gap-2 text-sm',
                  child.href && pathname?.startsWith(child.href) && 'active'
                )}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-btn-sm)',
                  color: child.href && pathname?.startsWith(String(child.href)) ? 'var(--accent)' : 'var(--muted)',
                  backgroundColor: child.href && pathname?.startsWith(String(child.href)) ? 'var(--accent-bg)' : 'transparent',
                } as any}
              >
                {child.icon && <span className="flex-shrink-0">{child.icon}</span>}
                <span className="truncate">{child.label}</span>
                {child.badge && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-accent/10 text-accent rounded-full">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn('nav-item flex items-center gap-3', active && 'active')}
      style={{
        padding: 'var(--space-base) var(--space-md)',
        borderRadius: 'var(--radius-btn)',
        fontSize: 'var(--text-body)',
        fontWeight: 500,
        minHeight: '44px',
        color: active ? 'var(--accent)' : 'var(--text)',
        backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
        transition: 'all var(--transition-fast)',
      }}
      aria-current={active ? 'page' : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={sidebarCollapsed ? 'hidden' : 'truncate'}>{item.label}</span>
      {item.badge && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold bg-accent/10 text-accent rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ─── Skeleton overview: aria-busy replaces content so screen readers announce ──
function LoadingSidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  // Placeholder nav items matching the role-navigation count (average ~7)
  const placeholderItems: NavItem[] = [
    { label: '', href: '#', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: '', href: '#', icon: <Building2 className="h-5 w-5" /> },
    { label: '', href: '#', icon: <DollarSign className="h-5 w-5" /> },
    { label: '', href: '#', icon: <Shield className="h-5 w-5" /> },
    { label: '', href: '#', icon: <FileText className="h-5 w-5" /> },
    { label: '', href: '#', icon: <Mail className="h-5 w-5" /> },
    { label: '', href: '#', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside
      className="sidebar"
      role="navigation"
      aria-label="Main navigation"
      aria-busy="true"
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
      }}
    >
      <div className="sb-header" style={{ padding: 'var(--space-lg)' }}>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md flex-shrink-0"
            style={{
              width: collapsed ? 36 : 80,
              height: 20,
              background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.08) 50%, hsl(var(--border)) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skel-shimmer 1.6s linear infinite',
            }}
          />
        </div>
      </div>

      <div className="sb-user-card" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
        <SkeletonUserCard collapsed={collapsed} />
      </div>

      <nav className="sb-nav" style={{ padding: 'var(--space-md)' }} aria-hidden="true">
        <ul className="space-y-1" role="list">
          {placeholderItems.map((item, i) => (
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
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function Sidebar({
  navigation,
  userRole,
  userName,
  userAvatar,
  onSignOut,
  collapsed = false,
  onCollapseChange,
  mobileOpen = false,
  onMobileClose,
  className,
  isLoading = false,
}: SidebarProps) {
  // While loading, show skeleton so layout is stable; guard against SSR window
  if (typeof window === 'undefined' || isLoading) {
    return <LoadingSidebarSkeleton collapsed={collapsed} />;
  }

  const roleThemeClass = `theme-${userRole.toLowerCase().replace('_', '-')}`;
  const pathname = usePathname();
  const navItems = navigation.length > 0 ? navigation : roleNavigation[userRole.toLowerCase()] || roleNavigation.landlord;

  const isActive = (href?: string) => {
    if (!href || href === '/dashboard') return pathname === href;
    return pathname?.startsWith(href) || false;
  };

  const isSection = (item: NavItem | NavSection): item is NavSection => 'items' in item;

  const showToggle = typeof onCollapseChange === 'function';
  const handleToggle = () => {
    if (showToggle) onCollapseChange(!collapsed);
  };

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onMobileClose) {
        onMobileClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <aside
      className={cn(
        'sidebar',
        collapsed && 'collapsed',
        mobileOpen && 'open',
        roleThemeClass,
        className
      )}
      role="navigation"
      aria-label="Main navigation"
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        zIndex: 100,
        transition: 'transform var(--transition-base) var(--easing-standard), width var(--transition-base) var(--easing-standard)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <div className="sb-header" style={{ padding: 'var(--space-lg)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
            PROPATI
          </span>
          {!collapsed && (
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Dashboard
            </span>
          )}
        </Link>
      </div>

      <Link
        href={userRole === 'estate_manager' ? '/dashboard/estate-manager/profile' : `/dashboard/${userRole}/profile`}
        className="block transition-colors hover:bg-muted/40"
        style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}
        aria-label="View Profile"
        title="View Profile"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{userName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {userRole.charAt(0) + userRole.slice(1).toLowerCase().replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </Link>

      <nav className="sb-nav" style={{ padding: 'var(--space-md)' }} aria-label="Dashboard navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item, idx) => {
            if (isSection(item)) {
              return (
                <li key={`section-${item.title}-${idx}`}>
                  <div
                    className="text-xs font-semibold uppercase tracking-wider px-3 py-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.title}
                  </div>
                  <ul className="space-y-1 ml-2" role="list">
                    {item.items.map((child) => (
                      <li key={child.href}>
                        <NavItemComponent
                          item={child}
                          isActive={isActive(child.href)}
                          sidebarCollapsed={collapsed}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            const navItem = item as NavItem;
            const key = navItem.href || `nav-${idx}`;
            return (
              <li key={key}>
                <NavItemComponent
                  item={navItem}
                  isActive={isActive(navItem.href)}
                  sidebarCollapsed={collapsed}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle anchored to sidebar bounds */}
      {showToggle && (
        <div className="px-2 pb-2" style={{ marginTop: 'auto' }}>
          <button
            onClick={handleToggle}
            className="hidden md:flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {collapsed ? (
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
            {!collapsed && <span className="text-xs" style={{ color: 'var(--muted)' }}>Collapse</span>}
          </button>
        </div>
      )}

      <div className="sb-footer" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--muted)', fontSize: 'var(--text-tag)' }}>
          <AppIcon name="tag" className="lucide" size={12} />
          <span style={{ flex: 1 }} />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onSignOut}
            style={{ padding: 'var(--space-sm) var(--space-md)' }}
          >
            {!collapsed && <LogOut className="h-4 w-4" />}
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function SidebarMobileTrigger({
  mobileOpen,
  onToggle,
}: {
  mobileOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="md:hidden p-2 rounded-lg"
      style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
      onClick={onToggle}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={mobileOpen}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function SidebarOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="sidebar-overlay open"
      onClick={onClose}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 99,
      }}
    />
  );
}
