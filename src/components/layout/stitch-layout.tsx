'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, useAuth, useClerk, useUser } from '@clerk/nextjs';
import { ChevronDown, Heart, Menu, Moon, MoveUpRight, Settings2, ShieldCheck, Sun, UserRound, X } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';
import { cn } from '@/lib/utils';

const discoveryLinks = [
  { href: '/properties/buy', label: 'Buy' },
  { href: '/properties/rent', label: 'Rent' },
  { href: '/properties/short-let', label: 'Short-let' },
  { href: '/properties/commercial', label: 'Commercial' },
  { href: '/properties/land', label: 'Land' },
];

const footerGroups = [
  { title: 'Discover', links: [['All properties', '/properties'], ['Buy', '/properties/buy'], ['Rent', '/properties/rent'], ['Short-let', '/properties/short-let'], ['Commercial', '/properties/commercial'], ['Land', '/properties/land']] },
  { title: 'Tools & trust', links: [['Compare', '/compare'], ['Mortgage calculators', '/mortgage-calculator'], ['Find an agent', '/find-agent'], ['Verification', '/verification'], ['How it works', '/how-it-works']] },
  { title: 'Company', links: [['About', '/about-us'], ['Press', '/press'], ['Contact us', '/contact-us'], ['Careers', '/careers'], ['Digital agreements', '/agreements']] },
];

const rolePaths: Record<string, { dashboard: string; profile: string; messages: string; properties?: string }> = {
  landlord: { dashboard: '/dashboard/landlord', profile: '/dashboard/landlord/profile', messages: '/dashboard/landlord/messages', properties: '/dashboard/landlord/properties' },
  tenant: { dashboard: '/dashboard/tenant', profile: '/dashboard/tenant/profile', messages: '/dashboard/tenant/messages' },
  agent: { dashboard: '/dashboard/agent', profile: '/dashboard/agent/profile', messages: '/dashboard/agent/messages', properties: '/dashboard/agent/properties' },
  estate_manager: { dashboard: '/dashboard/estate-manager', profile: '/dashboard/estate-manager/profile', messages: '/dashboard/estate-manager/messages', properties: '/dashboard/estate-manager/portfolio' },
  admin: { dashboard: '/dashboard/admin', profile: '/dashboard/admin/profile', messages: '/dashboard/admin/messages' },
};

function isActive(pathname: string, href: string) { return pathname === href || pathname.startsWith(`${href}/`); }

function ThemeButton({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`} className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', compact ? 'min-h-10 w-full justify-between border-t border-border pt-3' : 'h-10 justify-center px-2')}><span className={compact ? '' : 'sr-only'}>{resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}</span>{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}</button>;
}

function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const role = typeof user?.publicMetadata?.role === 'string' ? user.publicMetadata.role : 'tenant';
  const paths = rolePaths[role] ?? rolePaths.tenant;
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Account';
  useEffect(() => {
    const pointer = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', pointer); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', key); };
  }, []);
  const close = () => { setOpen(false); onNavigate?.(); };
  return <div className="relative" ref={menuRef}>
    <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-md bg-primary/10 text-primary">{user?.imageUrl ? <img src={user.imageUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}</span><span className="hidden max-w-24 truncate lg:block">{firstName}</span><ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" /></button>
    {open && <div role="menu" className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-[0_14px_36px_rgba(16,24,40,0.14)]"><div className="border-b border-border px-3 pb-3 pt-2"><p className="truncate text-sm font-semibold">{user?.fullName || 'Your account'}</p><p className="truncate text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p></div><div className="py-1"><Link role="menuitem" href={paths.dashboard} onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><MoveUpRight className="h-4 w-4 text-muted-foreground" />Dashboard</Link><Link role="menuitem" href="/saved" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><Heart className="h-4 w-4 text-muted-foreground" />Saved properties</Link><Link role="menuitem" href={paths.profile} onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><UserRound className="h-4 w-4 text-muted-foreground" />Profile</Link><Link role="menuitem" href={paths.messages} onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><ShieldCheck className="h-4 w-4 text-muted-foreground" />Messages</Link>{paths.properties && <Link role="menuitem" href={paths.properties} onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"><Settings2 className="h-4 w-4 text-muted-foreground" />My properties</Link>}</div><div className="border-t border-border pt-1"><Link role="menuitem" href="/onboarding" onClick={close} className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Switch role</Link><button role="menuitem" type="button" onClick={() => signOut({ redirectUrl: '/' })} className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Sign out</button></div></div>}
  </div>;
}

export function StitchHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userId } = useAuth();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 8); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => setMobileMenuOpen(false), [pathname]);
  const listHref = userId ? '/dashboard/landlord/properties/new' : '/sign-up?role=landlord';
  return <><button aria-label="Close menu" className={cn('fixed inset-0 z-40 cursor-default bg-black/30 xl:hidden', !mobileMenuOpen && 'hidden')} onClick={() => setMobileMenuOpen(false)} /><header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200', scrolled ? 'border-border bg-background/95 backdrop-blur-sm' : 'border-border/70 bg-background')}><div className="mx-auto flex h-[4.5rem] w-full max-w-[1360px] items-center gap-4 px-4 sm:px-6 lg:px-8"><Link href="/" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="PropatiBox home"><PropatiBoxLogo size="sm" href={null} /></Link><nav aria-label="Property discovery" className="hidden flex-1 items-center justify-center gap-1 xl:flex">{discoveryLinks.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? 'page' : undefined} className={cn('relative px-3 py-2 text-sm transition-colors hover:text-foreground', isActive(pathname, link.href) ? 'font-semibold text-foreground after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:bg-primary' : 'text-muted-foreground')}>{link.label}</Link>)}<Link href="/about-us" aria-current={isActive(pathname, '/about-us') ? 'page' : undefined} className={cn('px-3 py-2 text-sm transition-colors hover:text-foreground', isActive(pathname, '/about-us') ? 'font-semibold text-foreground' : 'text-muted-foreground')}>About</Link></nav><div className="ml-auto flex items-center gap-1.5"><ThemeButton /><SignedOut><Link href="/sign-in" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">Sign in</Link></SignedOut><Link href={listHref} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">List property</Link><SignedOut><Link href="/sign-up" className="hidden rounded-md border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex">Get started</Link></SignedOut><SignedIn><AccountMenu /></SignedIn><button type="button" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div></div>{mobileMenuOpen && <div className="absolute inset-x-0 top-[4.5rem] z-50 border-t border-border bg-background xl:hidden"><div className="mx-auto max-h-[calc(100dvh-4.5rem)] max-w-[1360px] overflow-y-auto px-4 py-5 sm:px-6"><nav aria-label="Mobile property discovery" className="space-y-1">{discoveryLinks.map((link) => <Link key={link.href} href={link.href} className={cn('block rounded-md px-3 py-3 text-base', isActive(pathname, link.href) ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-muted')}>{link.label}</Link>)}<Link href="/about-us" className="block rounded-md px-3 py-3 text-base text-foreground hover:bg-muted">About</Link></nav><div className="mt-5 border-t border-border pt-4"><div className="flex items-center justify-between px-3"><span className="text-sm text-muted-foreground">Appearance</span><ThemeButton compact /></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><Link href="/compare" className="rounded-md border border-border px-3 py-3 text-sm font-medium hover:bg-muted">Compare properties</Link><Link href="/find-agent" className="rounded-md border border-border px-3 py-3 text-sm font-medium hover:bg-muted">Find an agent</Link><Link href="/how-it-works" className="rounded-md border border-border px-3 py-3 text-sm font-medium hover:bg-muted">How it works</Link><Link href="/mortgage-calculator" className="rounded-md border border-border px-3 py-3 text-sm font-medium hover:bg-muted">Mortgage calculators</Link></div></div><SignedOut><div className="mt-5 flex gap-2 border-t border-border pt-4"><Link href="/sign-in" className="flex-1 rounded-md border border-border px-3 py-3 text-center text-sm font-semibold">Sign in</Link><Link href="/sign-up" className="flex-1 rounded-md bg-foreground px-3 py-3 text-center text-sm font-semibold text-background">Get started</Link></div></SignedOut></div></div>}</header></>;
}

export function StitchFooter() {
  return <footer className="border-t border-border bg-muted/30"><div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-12 lg:grid-cols-[1.35fr_2fr]"><div className="max-w-sm"><PropatiBoxLogo size="sm" /><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">Verified property discovery and clearer next steps for buying, renting and managing real estate in Nigeria.</p><Link href="/verification" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">How verification works <MoveUpRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">{footerGroups.map((group) => <div key={group.title}><h2 className="text-sm font-semibold text-foreground">{group.title}</h2><ul className="mt-4 space-y-3">{group.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link></li>)}</ul></div>)}</div></div><div className="mt-14 flex flex-col gap-4 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>© 2026 PropatiBox Technologies Ltd. All rights reserved.</p><div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy-policy" className="hover:text-foreground">Privacy policy</Link><Link href="/terms-of-agreement" className="hover:text-foreground">Terms of agreement</Link><Link href="/cookies" className="hover:text-foreground">Cookies</Link><Link href="/contact-us" className="hover:text-foreground">Contact us</Link></div></div></div></footer>;
}
