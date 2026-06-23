'use client';

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
  Building,
  Users,
  FileText,
  DollarSign,
  Settings,
  Bell,
  Shield,
  BarChart,
  Truck,
  Package,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Key,
  Award,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive';
  children?: NavItem[];
  roles?: string[];
  disabled?: boolean;
}

interface SidebarProps {
  navigation: NavItem[];
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

const roleNavigation: Record<string, NavItem[]> = {
  landlord: [
    { label: 'Dashboard', href: '/dashboard/landlord', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Properties', href: '/dashboard/landlord/properties', icon: <Building className="h-5 w-5" /> },
    { label: 'Rent Collection', href: '/dashboard/landlord/rent', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Verifications', href: '/dashboard/landlord/verification', icon: <Shield className="h-5 w-5" /> },
    { label: 'Agreements', href: '/dashboard/landlord/agreements', icon: <FileText className="h-5 w-5" /> },
    { label: 'Messages', href: '/dashboard/landlord/messages', icon: <Mail className="h-5 w-5" /> },
    { label: 'Profile', href: '/dashboard/landlord/profile', icon: <Settings className="h-5 w-5" /> },
  ],
  tenant: [
    { label: 'Dashboard', href: '/dashboard/tenant', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Find Property', href: '/dashboard/tenant/search', icon: <MapPin className="h-5 w-5" /> },
    { label: 'Payments', href: '/dashboard/tenant/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'My Agreements', href: '/dashboard/tenant/agreements', icon: <FileText className="h-5 w-5" /> },
    { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: <Settings className="h-5 w-5" /> },
    { label: 'Messages', href: '/dashboard/tenant/messages', icon: <Mail className="h-5 w-5" /> },
    { label: 'Profile', href: '/dashboard/tenant/profile', icon: <User className="h-5 w-5" /> },
  ],
  agent: [
    { label: 'Pipeline', href: '/dashboard/agent/pipeline', icon: <BarChart className="h-5 w-5" /> },
    { label: 'Listings', href: '/dashboard/agent/listings', icon: <Building className="h-5 w-5" /> },
    { label: 'Inspections', href: '/dashboard/agent/inspections', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Commissions', href: '/dashboard/agent/commissions', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Clients', href: '/dashboard/agent/clients', icon: <Users className="h-5 w-5" /> },
    { label: 'Reputation', href: '/dashboard/agent/reputation', icon: <Award className="h-5 w-5" /> },
    { label: 'Profile', href: '/dashboard/agent/profile', icon: <Settings className="h-5 w-5" /> },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Verifications', href: '/dashboard/admin/verification', icon: <Shield className="h-5 w-5" /> },
    { label: 'Flags', href: '/dashboard/admin/flags', icon: <Flag className="h-5 w-5" /> },
    { label: 'Disputes', href: '/dashboard/admin/disputes', icon: <Gavel className="h-5 w-5" /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Revenue', href: '/dashboard/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
  ],
  estate_manager: [
    { label: 'Dashboard', href: '/dashboard/estate-manager', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio', icon: <Building className="h-5 w-5" /> },
    { label: 'Ledger', href: '/dashboard/estate-manager/ledger', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Maintenance', href: '/dashboard/estate-manager/maintenance', icon: <Settings className="h-5 w-5" /> },
    { label: 'Team', href: '/dashboard/estate-manager/team', icon: <Users className="h-5 w-5" /> },
    { label: 'Reports', href: '/dashboard/estate-manager/reports', icon: <BarChart className="h-5 w-5" /> },
    { label: 'Subscription', href: '/dashboard/estate-manager/subscription', icon: <CreditCard className="h-5 w-5" /> },
  ],
  realtor: [
    { label: 'Dashboard', href: '/dashboard/realtor', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Buy Pipeline', href: '/dashboard/realtor/buy', icon: <BarChart className="h-5 w-5" /> },
    { label: 'Sell Pipeline', href: '/dashboard/realtor/sell', icon: <BarChart className="h-5 w-5" /> },
    { label: 'My Listings', href: '/dashboard/realtor/listings', icon: <Building className="h-5 w-5" /> },
    { label: 'My Profile', href: '/dashboard/realtor/profile', icon: <User className="h-5 w-5" /> },
    { label: 'Messages', href: '/dashboard/realtor/messages', icon: <Mail className="h-5 w-5" /> },
  ],
};

import { User, ClipboardList, Flag, Gavel } from 'lucide-react';

// ─── Skeleton nav item (shown when isLoading=true) ───────────────────────────
function SkeletonNavItem({ level = 0 }: { level?: number }) {
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

function NavItemComponent({
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
  const [expanded, setExpanded] = React.useState(
    item.children?.some((c) => c.href === window.location.pathname) || false
  );
  const pathname = usePathname();
  const childActive = item.children?.some((c) => pathname?.startsWith(c.href)) || false;
  const active = isActive || childActive;

  const icon = item.icon || <LayoutDashboard className="h-5 w-5" />;

  if (sidebarCollapsed && level === 0) {
    return (
      <Link
        href={item.children?.[0]?.href || item.href}
        className={cn(
          'nav-item flex items-center justify-center relative',
          active && 'active'
        )}
        style={{
          padding: 'var(--space-base)',
          borderRadius: 'var(--radius-btn)',
          color: active ? 'var(--accent)' : 'var(--text)',
          backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
          minHeight: '44px',
        }}
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
                  pathname?.startsWith(child.href) && 'active'
                )}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-btn-sm)',
                  color: pathname?.startsWith(child.href) ? 'var(--accent)' : 'var(--muted)',
                  backgroundColor: pathname?.startsWith(child.href) ? 'var(--accent-bg)' : 'transparent',
                }}
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

// ─── Skeleton overview: aria-busy replaces content so screen readers announce ── function LoadingSidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  // Placeholder nav items matching the role-navigation count (average ~7)
  const placeholderItems: NavItem[] = [
    { label: '', href: '#', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: '', href: '#', icon: <Building className="h-5 w-5" /> },
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
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
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

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) || false;
  };

  // Lock body scroll when mobile drawer is open; restore on close / unmount
  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
        // Mobile drawer: fixed positioning for slide-from-left behavior;
        // desktop keeps flex-shrink via globals.css
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

      <div className="sb-user-card" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
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
      </div>

      <nav className="sb-nav" style={{ padding: 'var(--space-md)' }} aria-label="Dashboard navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavItemComponent
                item={item}
                isActive={isActive(item.href)}
                sidebarCollapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="sb-footer" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--muted)', fontSize: 'var(--text-tag)' }}>
          <span>v1.0.0</span>
          <span style={{ flex: 1 }} />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2"
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
