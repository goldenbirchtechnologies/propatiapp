'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';

const LISTINGS_PATH = '/listings';

const publicNavLinks = [
  { href: '/listings', label: 'Find Property' },
  { href: '/compare', label: 'Compare' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || '';

  if (!isLoaded) {
    return (
      <div className="cursor-pointer min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isHome = pathname === '/';
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const isListingsPage = pathname === LISTINGS_PATH;
  const navLinks = isListingsPage
    ? publicNavLinks.filter((link) => link.href !== LISTINGS_PATH)
    : publicNavLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled || !isHome
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.08]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">PROPATI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isAuthPage && !isListingsPage && (
              <Link href="/listings" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
            )}

            {userId ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                  Dashboard
                </Link>
                <button
                  onClick={() => clerk.signOut({ redirectUrl: '/sign-in' })}
                  className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-white/[0.08] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.08] mt-2 pt-2 flex gap-2">
              <Link to="/sign-in" className="flex-1 text-center py-2 text-sm text-zinc-400 border border-zinc-800 rounded-lg">
                Sign in
              </Link>
              <Link to="/signup" className="flex-1 text-center py-2 text-sm font-medium bg-white text-black rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
