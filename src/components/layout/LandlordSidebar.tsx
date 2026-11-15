'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Wrench,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import type { NavItem, NavSection } from '@/lib/navigation';

const SECTION_META: Record<string, { label: string; icon: LucideIcon }> = {
  'Properties & Portfolio': { label: 'Properties', icon: Building2 },
  'Leasing & Tenants': { label: 'Leasing & Tenants', icon: Users },
  Operations: { label: 'Operations', icon: Wrench },
  'Finances & Analytics': { label: 'Finances', icon: DollarSign },
  Account: { label: 'Account', icon: Settings },
};

const SECTION_LEAD: Record<string, string> = {
  'Properties & Portfolio': 'Dashboard',
  'Leasing & Tenants': 'Applications',
  Operations: 'Maintenance & Turnover',
  'Finances & Analytics': 'Financials',
  Account: 'Profile',
};

const DEFAULT_OPEN: Record<string, boolean> = {
  'Properties & Portfolio': true,
  'Leasing & Tenants': false,
  Operations: false,
  'Finances & Analytics': false,
  Account: false,
};

function isActivePath(pathname: string | null, href?: string): boolean {
  if (!href) return false;
  if (pathname === href) return true;
  return pathname?.startsWith(`${href}/`) ?? false;
}

function isItemActive(pathname: string | null, item: NavItem): boolean {
  if (isActivePath(pathname, item.href)) return true;
  return !!item.children?.some((child) => isActivePath(pathname, child.href));
}

function SectionGroup({
  section,
  open,
  onToggle,
  pathname,
}: {
  section: NavSection;
  open: boolean;
  onToggle: () => void;
  pathname: string | null;
}) {
  const meta = SECTION_META[section.title] ?? { label: section.title, icon: Building2 };
  const Icon = meta.icon;

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {meta.label}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-1 space-y-1 pl-3 border-l border-zinc-200 ml-3 dark:border-zinc-800">
          {section.items.map((item) => (
            <Link
              key={item.href || item.label}
              href={item.href || '#'}
              aria-current={isItemActive(pathname, item) ? 'page' : undefined}
              className={cn(
                'block px-3 py-1.5 rounded-md text-xs transition',
                isItemActive(pathname, item)
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export interface LandlordSidebarProps {
  /** Defaults to LANDLORD_NAVIGATION. Pass a different array only for testing. */
  navigation?: Array<NavItem | NavSection>;
  pathname?: string | null;
  className?: string;
  /** When true, collapse the section groups off-canvas to 160px. */
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function LandlordSidebar({
  navigation,
  pathname = null,
  className,
  collapsed: collapsedProp,
  onCollapseChange,
}: LandlordSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(DEFAULT_OPEN);
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const collapsed = collapsedProp ?? localCollapsed;
  const setCollapsed = (v: boolean) => {
    setLocalCollapsed(v);
    onCollapseChange?.(v);
  };

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const entries = navigation ?? LANDLORD_NAVIGATION;

  const renderEntries = useMemo(() => {
    type Lead = { kind: 'lead'; item: NavItem };
    type Group = { kind: 'group'; section: NavSection };
    const out: Array<Lead | Group> = [];

    for (const entry of entries) {
      if (!('items' in entry)) {
        out.push({ kind: 'lead', item: entry as NavItem });
        continue;
      }
      const section = entry as NavSection;
      const leadLabel = SECTION_LEAD[section.title];
      const lead = section.items.find((item) => item.label === leadLabel);

      if (lead) out.push({ kind: 'lead', item: lead });
      out.push({
        kind: 'group',
        section: {
          ...section,
          items: lead
            ? section.items.filter((item) => item.label !== leadLabel)
            : section.items,
        },
      });
    }

    return out;
  }, [entries]);

  return (
    <aside
      className={cn(
        'w-64 h-screen bg-white border-r border-zinc-200 flex flex-col shrink-0 sticky top-0 dark:bg-[#09090b] dark:border-zinc-800',
        collapsedProp && 'collapsed',
        className
      )}
      role="navigation"
      aria-label="Landlord navigation"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between dark:border-zinc-800">
        <span className="font-bold text-lg text-zinc-900 dark:text-white">PropatiBox</span>
        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
          Landlord
        </span>
      </div>

      {/* Quick Search */}
      <div className="p-3">
        <Link
          href="/search"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs hover:border-zinc-300 transition dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
        >
          <span>Search properties, tenants...</span>
          <kbd className="ml-auto text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            ⌘K
          </kbd>
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
        {renderEntries.map((entry) => (
          <React.Fragment key={entry.kind === 'lead' ? `lead-${entry.item.href || entry.item.label}` : `group-${entry.section.title}`}>
            {entry.kind === 'lead' ? (
              <Link
                href={entry.item.href || '#'}
                aria-current={isItemActive(pathname, entry.item) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition',
                  isItemActive(pathname, entry.item)
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900'
                )}
              >
                {entry.item.icon ?? <Building2 className="w-4 h-4 text-zinc-400 dark:text-zinc-400" />}
                <span>{entry.item.label}</span>
              </Link>
            ) : (
              <SectionGroup
                section={entry.section}
                open={!!openSections[entry.section.title]}
                onToggle={() => toggleSection(entry.section.title)}
                pathname={pathname}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Footer: Messages, Notifications, Settings & Profile */}
      <div className="space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <Link
          href="/dashboard/landlord/messages"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
        >
          <MessageSquare className="w-4 h-4 text-zinc-400 dark:text-zinc-400" />
          <span>Messages</span>
        </Link>
        <Link
          href="/dashboard/landlord/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
        >
          <ShieldCheck className="w-4 h-4 text-zinc-400 dark:text-zinc-400" />
          <span>Notifications</span>
        </Link>
        <Link
          href="/dashboard/landlord/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
        >
          <Settings className="w-4 h-4 text-zinc-400 dark:text-zinc-400" />
          <span>Settings & Profile</span>
        </Link>
      </div>
    </aside>
  );
}

export default LandlordSidebar;
