'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';

interface NavItem {
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
}

export function DashboardShell({
  children,
  navigation,
  userRole,
  userName,
  userAvatar,
}: DashboardShellProps) {
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
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
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
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
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
            <SignOutButton
              signOutUrl="/"
              className="btn btn-ghost text-sm w-full justify-center"
              style={{ padding: 'var(--space-sm) var(--space-md)' }}
            >
              {!sidebarCollapsed && 'Sign Out'}
              {sidebarCollapsed && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button
              className="hidden md:flex p-2 rounded-lg"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarCollapsed ? (
                  <>
                    <line x1="9" y1="18" x2="15" y2="12"/>
                    <line x1="9" y1="6" x2="15" y2="12"/>
                  </>
                ) : (
                  <>
                    <line x1="15" y1="18" x2="9" y2="12"/>
                    <line x1="15" y1="6" x2="9" y2="12"/>
                  </>
                )}
              </svg>
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <button className="relative p-2 rounded-lg" style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }} aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
            </button>

            {/* User Button */}
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
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

interface CollapsibleNavItemProps {
  item: NavItem & { children: NavItem[] };
  isActive: boolean;
  sidebarCollapsed: boolean;
}

function CollapsibleNavItem({ item, isActive, sidebarCollapsed }: CollapsibleNavItemProps) {
  const [expanded, setExpanded] = useState(isActive);

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
          <polyline points="6 9 12 15 18 9"/>
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