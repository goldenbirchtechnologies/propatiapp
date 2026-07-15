'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, User, Settings, LogOut, BellRing, Moon, Sun, Monitor, MapPin, Building, CreditCard, FileText, Mail, Shield, HelpCircle, ChevronUp, Home } from 'lucide-react';
import { NotificationsBell } from '@/components/notifications/notifications-bell';

interface TopbarProps {
  onMenuClick?: () => void;
  onSidebarCollapse?: () => void;
  sidebarCollapsed?: boolean;
  showSidebarToggle?: boolean;
  showMobileMenu?: boolean;
  userRole?: string;
  className?: string;
}



function PurposeSwitcher({ userRole }: { userRole?: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const purposes = [
    { value: 'rent', label: 'Rent', icon: <Home className="h-4 w-4" />, href: '/dashboard/tenant/search?purpose=rent' },
    { value: 'buy', label: 'Buy', icon: <Building className="h-4 w-4" />, href: '/dashboard/tenant/search?purpose=sale' },
    { value: 'short_let', label: 'Short Let', icon: <MapPin className="h-4 w-4" />, href: '/dashboard/tenant/search?purpose=short_let' },
    { value: 'share', label: 'Share', icon: <Users className="h-4 w-4" />, href: '/dashboard/tenant/search?purpose=share' },
  ];

  const currentPurpose = pathname?.includes('purpose=') ? pathname.split('purpose=')[1]?.split('&')[0] : 'rent';
  const current = purposes.find((p) => p.value === currentPurpose) || purposes[0];

  if (userRole !== 'tenant') return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hidden sm:flex items-center px-3 py-2"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
        >
          {current.icon}
          <span className="font-medium text-sm">{current.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Switch Purpose
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {purposes.map((purpose) => (
          <DropdownMenuItem
            key={purpose.value}
            onSelect={() => window.location.href = purpose.href}
            className={cn('flex items-center gap-2', pathname?.includes(purpose.value) && 'bg-accent/10 text-accent')}
            inset={false}
          >
            {purpose.icon}
            <span className="font-medium">{purpose.label}</span>
            {pathname?.includes(purpose.value) && <Check className="ml-auto h-4 w-4 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-lg"
          style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
          aria-label="Theme"
        >
          {theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioItem
          {...{ value: 'light', checked: theme === 'light', onCheckedChange: () => setTheme('light') } as unknown}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          {...{ value: 'dark', checked: theme === 'dark', onCheckedChange: () => setTheme('dark') } as unknown}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          {...{ value: 'system', checked: theme === 'system', onCheckedChange: () => setTheme('system') } as unknown}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuRadioItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Users, Check } from 'lucide-react';

function UserMenu({ userRole }: { userRole?: string }) {
  const { user } = useUser();

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'w-8 h-8',
          userButtonPopover: 'rounded-lg shadow-lg border border-border bg-background',
          userButtonPopoverActions: 'flex-col gap-2',
        },
      }}
    />
  );
}

export function Topbar({
  onMenuClick,
  onSidebarCollapse,
  sidebarCollapsed = false,
  showSidebarToggle = true,
  showMobileMenu = true,
  userRole,
  className,
}: TopbarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className={cn('topbar', className)}>
      <div className="flex items-center gap-2">
        {showMobileMenu && onMenuClick && (
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        {showSidebarToggle && onSidebarCollapse && (
          <button
            className="hidden md:flex p-2 rounded-lg"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
            onClick={onSidebarCollapse}
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
        )}
        <div className="hidden md:block w-px h-6" style={{ background: 'var(--border)' }} />
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <span className="text-xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
            PROPATI
          </span>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <PurposeSwitcher userRole={userRole} />
        <NotificationsBell userRole={userRole} />
        <ThemeToggle />
        <UserMenu userRole={userRole} />
      </div>
    </header>
  );
}

export function TopbarMobile({
  onMenuClick,
  title,
  showBack = false,
  onBack,
  actions,
}: {
  onMenuClick?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <header className="topbar md:hidden">
      <div className="flex items-center gap-2">
        {showBack && onBack ? (
          <button
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : onMenuClick ? (
          <button
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        ) : null}
        {title && (
          <h1 className="font-heading font-semibold text-lg flex-1" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'transition-colors',
                  index === items.length - 1 ? 'font-medium' : 'text-muted-foreground hover:text-foreground'
                )}
                style={{ color: index === items.length - 1 ? 'var(--text)' : 'var(--muted)' }}
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium" style={{ color: 'var(--text)' }}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}