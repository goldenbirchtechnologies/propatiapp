'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

const navLinks = [
  { href: '/listings', label: 'Properties', match: (p: string) => p === '/listings' || p === '/properties' },
  { href: '/verification', label: 'Verification', match: (p: string) => p.startsWith('/verification') },
  { href: '/find-agent', label: 'Agents & Brokers', match: (p: string) => p.startsWith('/find-agent') || p.startsWith('/find-my-agent') || p.startsWith('/find-an-agent') },
  { href: '/listings?listingType=short_let', label: 'Shortlet', match: (p: string) => p.includes('short_let') || p.startsWith('/shortlet') },
  { href: '/compare', label: 'Compare', match: (p: string) => p.startsWith('/compare') },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 h-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-white/[0.06] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        className={cn(
          'fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300',
          'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b shadow-[0_1px_8px_rgba(0,0,0,0.04)]',
          scrolled ? 'border-zinc-200 dark:border-white/[0.06]' : 'border-zinc-200/80 dark:border-white/[0.06]'
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: PropatiBox */}
          <Link href="/" className="flex items-center shrink-0 group">
            <PropatiBoxLogo size="sm" variant="horizontal" href={null} />
          </Link>

          {/* Center: text nav — underline active, CTA reserved for List Property */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
                    active
                      ? 'text-zinc-900 dark:text-white border-primary'
                      : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              type="button"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href={userId ? '/dashboard' : '/sign-in'}
              className="hidden sm:inline-flex items-center justify-center h-10 px-3.5 rounded-xl border border-zinc-300 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              Switch Role
            </Link>

            <Link
              href={userId ? '/dashboard/landlord/properties/new' : '/signup'}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary hover:bg-[var(--sovereign-hover)] dark:bg-primary dark:hover:bg-[var(--sovereign-hover)] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span className="hidden sm:inline">List Property</span>
              <span className="sm:hidden">List</span>
            </Link>

            {userId ? (
              <Link href="/dashboard" className="hidden md:inline-flex ml-1">
                <img
                  src={user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=10b981&color=fff`}
                  alt={user?.fullName || 'User'}
                  className="w-9 h-9 rounded-full ring-2 ring-primary/30 object-cover shadow-sm"
                />
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link href="/sign-in" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-2">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:bg-black dark:hover:bg-zinc-100 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
          <div className="lg:hidden absolute top-20 inset-x-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/[0.06] shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'block px-3 py-2.5 rounded-xl text-sm font-semibold',
                      active ? 'bg-primary text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-2">
                <Link
                  href={userId ? '/dashboard' : '/sign-in'}
                  className="block w-full text-center py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Switch Role
                </Link>
                <Link
                  href={userId ? '/dashboard/landlord/properties/new' : '/signup'}
                  className="block w-full text-center py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
                >
                  List Property
                </Link>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] flex gap-2">
                {userId ? (
                  <>
                    <Link href="/dashboard" className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                      Dashboard
                    </Link>
                    <a href="/api/auth/sign-out" className="flex-1 text-center py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Sign Out
                    </a>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" className="flex-1 text-center py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Sign in
                    </Link>
                    <Link href="/signup" className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
