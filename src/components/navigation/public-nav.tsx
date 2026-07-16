'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Menu, X, User, LogIn, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';

const publicNavLinks = [
  { href: '/search', label: 'Search' },
  { href: '/listings', label: 'Find Property' },
  { href: '/compare', label: 'Compare' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/terms-of-agreement', label: 'Terms of Agreement' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <>
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {!isAuthPage && (
                <Link href="/listings" className="hidden md:inline-flex">
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </Link>
              )}

              {userId ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clerk.signOut({ redirectUrl: '/' })}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}

              <button
                className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-y-0 right-0 z-50 w-72 bg-background border-l shadow-xl p-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {publicNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t space-y-1">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Legal
              </p>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
