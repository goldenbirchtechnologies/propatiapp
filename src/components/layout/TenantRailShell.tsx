'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, Settings } from 'lucide-react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';
import { NotificationsBell } from '@/components/notifications/notifications-bell';
import GlobalSearch from './GlobalSearch';
import { SidebarOverlay } from '@/components/layout/sidebar';
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

  // Bottom nav: first 4 flat items + Menu button that opens the drawer
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
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
        )}
      >
        {item.icon}
        {item.badge != null && item.badge !== '' && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
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

      {/* Icon rail — desktop only */}
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
            className="group relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500"
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

        <div className="mt-2 flex flex-col items-center gap-1 border-t border-zinc-200 pt-3 dark:border-white/[0.07]">
          <Link
            href="/dashboard/tenant/settings"
            aria-label="Settings"
            title="Settings"
            className={cn(
              'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              pathname.startsWith('/dashboard/tenant/settings')
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-800">
              Settings
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile / tablet drawer — full labels */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[100] flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform lg:hidden dark:border-white/[0.07] dark:bg-[#09090b]',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <PropatiBoxLogo href="/dashboard" size="sm" variant="horizontal" />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard navigation">
          {navigation.map((entry, idx) => {
            if ('items' in entry) {
              const section = entry as NavSection;
              return (
                <div key={`section-${section.title}-${idx}`} className="mt-4 first:mt-1">
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {section.title}
                  </div>
                  <ul className="space-y-0.5" role="list">
                    {section.items.map((child) => {
                      const active = isActive(child.href || '');
                      return (
                        <li key={child.href}>
                          <Link
                            href={(child.href || '#') as any}
                            aria-current={active ? 'true' : undefined}
                            onClick={() => setDrawerOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                            )}
                          >
                            {child.icon}
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }
            const item = entry as NavItem;
            const active = isActive(item.href || '');
            return (
              <ul key={item.href} className="mt-1 space-y-0.5" role="list">
                <li>
                  <Link
                    href={(item.href || '#') as any}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              </ul>
            );
          })}
        </nav>
      </aside>

      <main className="main-area bg-[#F8FAFC] dark:bg-black">
        {/* Minimal topbar */}
        <header className="topbar border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-white/[0.07] dark:bg-[#09090b]/80" style={{ height: 56 }}>
          <button
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-white/[0.06]"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 flex-col leading-tight lg:flex">
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{shortTitle}</span>
            <span className="text-[11px] capitalize text-zinc-500 dark:text-zinc-400">Tenant workspace</span>
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
            <NotificationsBell position="right" userRole={userRole} />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-full p-1 outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || 'Profile'}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-white/10"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
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
                  <Link href="/dashboard/tenant/profile" className="cursor-pointer">
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/tenant/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/sign-out" className="w-full cursor-pointer text-destructive">
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="content-area bg-[#F8FAFC] pb-20 dark:bg-black lg:pb-4">{children}</div>

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
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-500" />}
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
    </div>
  );
}
