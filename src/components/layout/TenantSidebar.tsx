'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Home, Menu, X } from 'lucide-react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';
import { useIsMobile } from '@/components/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getActiveNavHref } from '@/lib/navigation';
import type { NavItem, NavSection } from '@/lib/navigation';

interface TenantSidebarProps {
  navigation: Array<NavItem | NavSection>;
  pathname: string | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function sectionId(title: string) {
  return `tenant-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="group relative">
      <Link
        href={item.href || '#'}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : undefined}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <span className={cn('shrink-0', collapsed && 'mx-auto')}>
          {item.icon || <Home className="h-4 w-4" />}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {item.label}
        </span>
      )}
    </div>
  );
}

function SidebarBody({
  navigation,
  activeHref,
  collapsed,
  openSections,
  onSectionToggle,
  onMobileClose,
}: {
  navigation: Array<NavItem | NavSection>;
  activeHref: string | null;
  collapsed: boolean;
  openSections: Record<string, boolean>;
  onSectionToggle: (title: string) => void;
  onMobileClose: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Tenant navigation">
      <div className="space-y-0.5">
        {navigation.map((entry) => {
          if (!('items' in entry)) {
            return (
              <NavLink
                key={entry.href || entry.label}
                item={entry}
                active={entry.href === activeHref}
                collapsed={collapsed}
                onNavigate={onMobileClose}
              />
            );
          }

          const section = entry as NavSection;
          const sectionActive = section.items.some((item) => item.href === activeHref);
          const open = !collapsed && !!openSections[section.title];

          return (
            <div key={section.title} className="pt-2">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => onSectionToggle(section.title)}
                  aria-expanded={open}
                  aria-controls={sectionId(section.title)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    sectionActive
                      ? 'text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80'
                  )}
                >
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{section.title}</span>
                </button>
              )}
              {(open || collapsed) && (
                <div
                  id={sectionId(section.title)}
                  className={cn('mt-1 space-y-0.5', collapsed ? '' : 'ml-3 border-l border-sidebar-border pl-2')}
                >
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href || `${section.title}-${item.label}`}
                      item={item}
                      active={item.href === activeHref}
                      collapsed={collapsed}
                      onNavigate={onMobileClose}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export function TenantSidebar({
  navigation,
  pathname,
  mobileOpen,
  onMobileClose,
}: TenantSidebarProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
 const initialHref = getActiveNavHref(navigation, pathname);
 const activeSection = navigation.find(
 (entry) => 'items' in entry && entry.items.some((item) => item.href === initialHref)
 );
 return activeSection && 'items' in activeSection ? { [activeSection.title]: true } : {};
 });

  const activeHref = useMemo(
    () => getActiveNavHref(navigation, pathname),
    [navigation, pathname]
  );

  useEffect(() => {
    if (!activeHref) return;
    const activeSection = navigation.find(
      (entry) => 'items' in entry && entry.items.some((item) => item.href === activeHref)
    );
    if (activeSection && 'items' in activeSection) {
      setOpenSections((prev) => ({ ...prev, [activeSection.title]: true }));
    }
  }, [activeHref, navigation]);

  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const sidebarBody = (
    <SidebarBody
      navigation={navigation}
      activeHref={activeHref}
      collapsed={collapsed}
      openSections={openSections}
      onSectionToggle={toggleSection}
      onMobileClose={onMobileClose}
    />
  );

  if (isMobile) {
    return (
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[100] flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Tenant navigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <PropatiBoxLogo size="sm" variant="iconOnly" />
            <span className="text-sm font-semibold text-sidebar-foreground">PropatiBox</span>
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
        {sidebarBody}
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out',
        collapsed && 'w-[68px]'
      )}
      role="navigation"
      aria-label="Tenant navigation"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn('flex items-center gap-2', collapsed && 'mx-auto')}>
          <PropatiBoxLogo size="sm" variant="iconOnly" />
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">PropatiBox</span>
          )}
        </div>
        {!collapsed && (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Tenant
          </span>
        )}
      </div>

      {sidebarBody}

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
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

export default TenantSidebar;
