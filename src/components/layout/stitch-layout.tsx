'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Sun, Moon } from 'lucide-react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

const navLinks = [
  { href: '/properties/buy', label: 'Buy' },
  { href: '/properties/rent', label: 'Rent' },
  { href: '/properties/short-let', label: 'Short-let' },
  { href: '/properties/commercial', label: 'Commercial' },
  { href: '/properties/land', label: 'Land' },
  { href: '/about-us', label: 'About' },
];

const footerCols = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
  {
    title: 'Tenants',
    links: [
      { label: 'Buy', href: '/properties/buy' },
      { label: 'Rent', href: '/properties/rent' },
      { label: 'Short-let', href: '/properties/short-let' },
      { label: 'All Properties', href: '/properties' },
    ],
  },
  {
    title: 'Landlords',
    links: [
      { label: 'List Property', href: '/sign-up?role=landlord' },
      { label: 'Property Verification', href: '/verification' },
      { label: 'Rent Collection', href: '/dashboard/landlord/rent' },
      { label: 'Digital Agreements', href: '/agreements' },
    ],
  },
];

export function StitchHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-shadow duration-300 ${
          scrolled
            ? 'bg-background border-outline-variant/60 shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
            : 'bg-background border-outline-variant/40'
        }`}
      >
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center group">
            <PropatiBoxLogo size="sm" href={null} />
          </Link>

          <nav className="hidden xl:flex items-center gap-3 sm:gap-6 2xl:gap-8">
            {navLinks.map((link) => {
              const active = link.href === pathname || link.href === `/${pathname}`;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-2.5 text-sm font-medium ${
                    active
                      ? 'text-primary font-semibold border-b-2 border-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl border border-outline-variant bg-background text-foreground hover:text-primary hover:bg-surface-container transition-colors"
              type="button"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/sign-up?role=landlord"
              className="hidden sm:inline-flex items-center justify-center h-10 px-3.5 rounded-xl border border-outline-variant bg-background text-foreground hover:text-primary text-xs font-semibold transition-colors"
            >
              Switch Role
            </Link>
            <Link
              href="/sign-up"
              className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
            >
              List Property
            </Link>
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center justify-center h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-title-sm text-title-sm font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-xl bg-zinc-900 text-white font-title-sm text-title-sm font-semibold hover:bg-black transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
              >
                Dashboard
              </Link>
              <div className="flex items-center pl-1">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl border border-outline-variant/60 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden absolute top-20 inset-x-0 bg-background border-t border-outline-variant/40 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = link.href === pathname || link.href === `/${pathname}`;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block px-3.5 py-3 rounded-xl text-sm font-semibold ${
                      active ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-outline-variant/40 space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container">
                  <span className="text-xs font-semibold text-on-surface-variant">Theme</span>
                  <button
                    onClick={toggleTheme}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-foreground hover:text-primary"
                  >
                    {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    <span>{resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                  </button>
                </div>

                <Link
                  href="/sign-up?role=landlord"
                  className="block text-center py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Switch Role
                </Link>
              </div>

              <SignedOut>
                <div className="pt-2 flex gap-2">
                  <Link
                    href="/sign-in"
                    className="flex-1 text-center py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="block w-full text-center py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold"
                  >
                    Dashboard
                  </Link>
                </div>
              </SignedIn>
              <Link
                href="/sign-up"
                className="block w-full text-center py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold mt-2"
              >
                List Property
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function StitchFooter() {
  return (
    <footer className="bg-background border-t border-zinc-200 dark:border-zinc-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12 sm:mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-2">
            <div className="mb-4">
              <PropatiBoxLogo size="sm" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Nigeria&apos;s premier verified property marketplace. Find, rent, buy, and
              manage real estate with confidence.
            </p>
            <div className="flex gap-2.5 mt-5">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((sn) => (
                <div
                  key={sn}
                  className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary dark:hover:text-[#4edea3] dark:hover:border-[#4edea3] transition-all cursor-pointer shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-[#4edea3] transition-colors inline-block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              © 2026 PropatiBox Technologies Ltd. All rights reserved.
            </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Verified listings, clearer property decisions.</span>
              </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-agreement">Terms of Agreement</Link>
              <Link href="/contact-us">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
