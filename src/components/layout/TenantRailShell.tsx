'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, User, Settings, LogOut } from 'lucide-react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';
import { NotificationsBell } from '@/components/notifications/notifications-bell';
import GlobalSearch from './GlobalSearch';
import { SidebarOverlay } from '@/components/layout/sidebar';
import { LandlordSidebar } from '@/components/layout/LandlordSidebar';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
import { HeaderOverlayProvider, useHeaderOverlay } from '@/components/layout/header-overlay-context';
import { cn } from '@/lib/utils';
import { getDashboardPageTitle } from '@/lib/dashboard-titles';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { NavItem, NavSection } from '@/lib/navigation';

interface TenantRailShellProps {
  children: React.ReactNode;
  navigation: Array<NavItem | NavSection>;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  orgName?: string | null;
  quickAction?: { href: string; label: string; icon?: React.ReactNode };
  hideGlobalSearch?: boolean;
}

type RailEntry = { kind: 'item'; item: NavItem } | { kind: 'divider'; key: string };

function flattenNav(navigation: Array<NavItem | NavSection>): RailEntry[] {
  const out: RailEntry[] = [];
  navigation.forEach((entry, i) => {
    if ('items' in entry) {
      if (out.length > 0) out.push({ kind: 'divider', key: `div-${i}` });
      (entry as NavSection).items.forEach((item) => out.push({ kind: 'item', item }));
    } else {
      out.push({ kind: 'item', item: entry as NavItem });
    }
  });
  return out;
}

export default function TenantRailShell({
  children,
  navigation,
  userRole,
  userName,
  userAvatar,
  orgName,
  quickAction,
  hideGlobalSearch = false,
}: TenantRailShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = useMemo(() => getDashboardPageTitle(pathname, userRole), [pathname, userRole]);
  const shortTitle = pageTitle.split(' - ')[0];

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const railEntries = useMemo(() => flattenNav(navigation), [navigation]);

  // Bottom nav: first 4 flat items + Menu button that opens the drawer.
  const bottomItems = useMemo(
    () =>
      navigation
        .filter((entry): entry is NavItem => !('items' in entry))
        .slice(0, 4),
    [navigation]
  );

  const railButton = (item: NavItem) => {
    const active = item.children
      ? item.children.some((c) => isActive(c.href || ''))
      : isActive(item.href || '');
    return (
      <Link
        key={item.href || item.label}
        href={item.children ? item.children[0]?.href || '#' : item.href || '#'}
        aria-label={item.label}
        aria-current={active ? 'true' : undefined}
        title={item.label}
        className={cn(
          'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          active
            ? 'bg-primary/15 text-primary dark:text-[#4edea3]'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
        )}
      >
        {item.icon}
        {item.badge != null && item.badge !== '' && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-800">
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="app-layout theme-tenant shell-tenant">
      <SidebarOverlay isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Icon rail — desktop only, all roles except landlord */}
      {userRole !== 'landlord' && (
        <aside
          className="hidden w-[72px] flex-shrink-0 flex-col items-center gap-1 border-r border-zinc-200 bg-white py-4 lg:flex dark:border-white/[0.07] dark:bg-[#09090b]"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mb-3">
            <PropatiBoxLogo href="/dashboard" size="sm" variant="iconOnly" />
          </div>

          {quickAction && (
            <Link
              href={quickAction.href}
              aria-label={quickAction.label}
              title={quickAction.label}
              className="group relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary"
            >
              {quickAction.icon || <span className="text-lg font-semibold">+</span>}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-800">
                {quickAction.label}
              </span>
            </Link>
          )}

          <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto" aria-label="Dashboard navigation">
            {railEntries.map((entry) =>
              entry.kind === 'divider' ? (
                <div key={entry.key} className="my-2 h-px w-8 bg-zinc-200 dark:bg-white/[0.08]" />
              ) : (
                railButton(entry.item)
              )
            )}
          </nav>
        </aside>
      )}

      {/* Landlord labeled panel — desktop only, driven by LANDLORD_NAVIGATION */}
      {userRole === 'landlord' && (
        <LandlordSidebar
          navigation={navigation}
          pathname={pathname}
		    mobileOpen={drawerOpen}
		    onMobileClose={() => setDrawerOpen(false)}
        />
      )}

      <main className="main-area bg-background flex-1 min-w-0">
        {/* Minimal topbar */}
        <header
          className="topbar border-b border-border bg-background/80 backdrop-blur-md dark:border-white/[0.07]"
          style={{ height: 56 }}
        >
          <button
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-white/[0.06]"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 flex-col leading-tight lg:flex">
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{shortTitle}</span>
            <span className="text-[11px] capitalize text-zinc-500 dark:text-zinc-400">
              {userRole ? `${userRole.replace(/_/g, ' ')} workspace` : 'Workspace'}
            </span>
          </div>
          {!hideGlobalSearch && <GlobalSearch userRole={userRole} />}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <HeaderOverlayProvider>
              <NotificationsBell position="right" userRole={userRole} />
              {(() => {
                const { isOpen, setOpen } = useHeaderOverlay('profile');
                return (
                  <DropdownMenu open={isOpen} onOpenChange={setOpen}>
                    <DropdownMenuTrigger className="flex items-center gap-1 rounded-full p-1 outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName || 'Profile'}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-white/10"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {(userName || 'User').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <div>
                          <p className="truncate text-sm font-semibold">{userName || 'User'}</p>
                          <p className="truncate text-xs text-muted-foreground">{orgName || 'Personal Workspace'}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={userRole ? `/dashboard/${userRole}/profile` : '/dashboard/tenant/profile'}
                          className="cursor-pointer"
                        >
                          <User className="size-4" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={userRole ? `/dashboard/${userRole}/settings` : '/dashboard/tenant/settings'}
                          className="cursor-pointer"
                        >
                          <Settings className="size-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href="/api/auth/sign-out" className="w-full cursor-pointer text-destructive">
                          <LogOut className="size-4" /> Sign Out
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })()}
            </HeaderOverlayProvider>
          </div>
        </header>

        <div className="content-area bg-background pb-20 lg:pb-4">{children}</div>

        {/* Minimal mobile bottom nav: 4 primary items + menu */}
        <nav
          className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch justify-around border-t border-zinc-200 bg-white/95 px-2 backdrop-blur-md lg:hidden dark:border-white/[0.07] dark:bg-[#09090b]/95"
          aria-label="Mobile navigation"
        >
          {bottomItems.map((item) => {
            const active = isActive(item.href || '');
            return (
              <Link
                key={item.href}
                href={item.href || '#'}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  active ? 'text-primary dark:text-[#4edea3]' : 'text-zinc-500 dark:text-zinc-400'
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
                {item.icon}
                <span className="leading-none">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="More navigation"
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 transition-colors dark:text-zinc-400"
          >
            <Menu className="h-5 w-5" />
            <span className="leading-none">More</span>
          </button>
        </nav>
      </main>

      <OnboardingOverlay />
    </div>
  );
}
