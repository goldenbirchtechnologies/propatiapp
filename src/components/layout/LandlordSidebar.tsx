'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, Menu, X, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import type { NavItem, NavSection } from '@/lib/navigation';
import { useIsMobile } from '@/components/hooks/use-mobile';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function isActivePath(pathname: string | null, href?: string): boolean {
  if (!href || !pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string | null, item: NavItem): boolean {
  if (isActivePath(pathname, item.href)) return true;
  return !!item.children?.some((child) => isActivePath(pathname, child.href));
}

/* ─── NavItemRenderer ──────────────────────────────────────────────────── */

interface NavItemRendererProps {
  item: NavItem;
  pathname: string | null;
  collapsed: boolean;
  onMobileClose?: () => void;
}

function NavItemRenderer({ item, pathname, collapsed, onMobileClose }: NavItemRendererProps) {
  const active = isItemActive(pathname, item);
  return (
    <Tooltip label={item.label}>
      <Link
        href={item.href || '#'}
        aria-current={active ? 'page' : undefined}
        onClick={onMobileClose}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.label : undefined}
      >
        <span className={cn('shrink-0', collapsed && 'mx-auto')}>
          {item.icon ?? <Home className="h-4 w-4" />}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </Tooltip>
  );
}

/* ─── SectionRenderer ──────────────────────────────────────────────────── */

interface SectionRendererProps {
  section: NavSection;
  pathname: string | null;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

function SectionRenderer({ section, pathname, collapsed, open, onToggle, onMobileClose }: SectionRendererProps) {
  const sectionHasActive = section.items.some((item) => isItemActive(pathname, item));

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
          sectionHasActive
            ? 'text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80',
          collapsed && 'justify-center'
        )}
      >
        <span className={cn('flex items-center gap-2', collapsed && 'mx-auto')}>
          {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {!collapsed && <span>{section.title}</span>}
        </span>
      </button>

      {(open || collapsed) && (
        <div className={cn('mt-1 space-y-0.5', collapsed ? 'ml-3' : 'ml-3 border-l border-sidebar-border pl-2')}>
          {/* Desktop expanded list */}
          <div className={cn('space-y-0.5', collapsed && 'hidden')}>
            {section.items.map((item) => (
              <NavItemRenderer
                key={item.href || item.label}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onMobileClose={onMobileClose}
              />
            ))}
          </div>

          {/* Collapsed: icon-only grid */}
          {collapsed && section.items.map((item) => (
            <NavItemRenderer
              key={item.href || item.label}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onMobileClose={onMobileClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Tooltip (simple CSS-based) ───────────────────────────────────────── */

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-zinc-800">
        {label}
        <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-zinc-900 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/* ─── SidebarBody ──────────────────────────────────────────────────────── */

interface SidebarBodyProps {
  navigation: Array<NavItem | NavSection>;
  pathname: string | null;
  collapsed: boolean;
  onSectionToggle: (title: string) => void;
  openSections: Record<string, boolean>;
  onMobileClose?: () => void;
}

function SidebarBody({
  navigation,
  pathname,
  collapsed,
  onSectionToggle,
  openSections,
  onMobileClose,
}: SidebarBodyProps) {
  const entries = useMemo(() => {
    return navigation.map((entry) => {
      if ('items' in entry) return { kind: 'section' as const, section: entry as NavSection };
      return { kind: 'item' as const, item: entry as NavItem };
    });
  }, [navigation]);

  return (
    <>
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <Tooltip label="PropatiBox">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
              <PropatiBoxLogo size="sm" variant="iconOnly" />
            </div>
            {!collapsed && <span className="font-semibold text-sm text-sidebar-foreground">PropatiBox</span>}
          </div>
        </Tooltip>
        {!collapsed && (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Landlord
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Landlord navigation">
        <div className="space-y-0.5">
          {entries.map((entry) => {
            if (entry.kind === 'item') {
              return (
                <NavItemRenderer
                  key={entry.item.href || entry.item.label}
                  item={entry.item}
                  pathname={pathname}
                  collapsed={collapsed}
                  onMobileClose={onMobileClose}
                />
              );
            }
            const section = entry.section;
            return (
              <SectionRenderer
                key={section.title}
                section={section}
                pathname={pathname}
                collapsed={collapsed}
                open={!!openSections[section.title]}
                onToggle={() => onSectionToggle(section.title)}
                onMobileClose={onMobileClose}
              />
            );
          })}
        </div>
      </nav>

    </>
  );
}

/* ─── Main LandlordSidebar ─────────────────────────────────────────────── */

export interface LandlordSidebarProps {
  /** Defaults to LANDLORD_NAVIGATION. Pass a different array only for testing. */
  navigation?: Array<NavItem | NavSection>;
  pathname?: string | null;
  className?: string;
  /** When true, sidebar is shown as a mobile drawer overlay */
  mobileOpen?: boolean;
  /** Called when the mobile drawer should close */
  onMobileClose?: () => void;
}

export function LandlordSidebar({
  navigation,
  pathname = null,
  className,
  mobileOpen = false,
  onMobileClose,
}: LandlordSidebarProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const nav = navigation ?? LANDLORD_NAVIGATION;

  // Auto-expand sections containing the active route
  useEffect(() => {
    if (!pathname) return;
    const newOpen: Record<string, boolean> = {};
    nav.forEach((entry) => {
      if ('items' in entry) {
        const section = entry as NavSection;
        const hasActive = section.items.some((item) => isItemActive(pathname, item));
        if (hasActive) newOpen[section.title] = true;
      }
    });
    setOpenSections((prev) => ({ ...prev, ...newOpen }));
  }, [pathname, nav]);

  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // ── Mobile drawer mode ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[100] flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Landlord navigation"
      >
        {/* Mobile header with close */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
              <PropatiBoxLogo size="sm" variant="iconOnly" />
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground">PropatiBox</span>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarBody
          navigation={nav}
          pathname={pathname}
          collapsed={false}
          onSectionToggle={toggleSection}
          openSections={openSections}
          onMobileClose={onMobileClose}
        />
      </aside>
    );
  }

  // ── Desktop persistent mode ─────────────────────────────────────────
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out',
        collapsed && 'w-[68px]',
        className
      )}
      role="navigation"
      aria-label="Landlord navigation"
    >
      <SidebarBody
        navigation={nav}
        pathname={pathname}
        collapsed={collapsed}
        onSectionToggle={toggleSection}
        openSections={openSections}
        onMobileClose={onMobileClose}
      />

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center'
          )}
        >
          <Menu className={cn('h-4 w-4 shrink-0', collapsed && 'mx-auto')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default LandlordSidebar;
