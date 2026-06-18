'use client';

import Link from 'next/link';
import { Home, Menu, X, User, LogIn, Search, Building2, Shield, DollarSign, Users, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Dynamic import to handle Clerk not being configured
let useAuth: any;
let useUser: any;
try {
  const clerk = require('@clerk/nextjs');
  useAuth = clerk.useAuth;
  useUser = clerk.useUser;
} catch (e) {
  // Clerk not available - use mock hooks
  useAuth = () => ({ userId: null, isLoaded: true });
  useUser = () => ({ user: null });
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Try to use Clerk hooks, fall back to null if not available
  let userId = null;
  let isLoaded = true;
  let user = null;

  try {
    const auth = useAuth();
    const userHook = useUser();
    userId = auth.userId;
    isLoaded = auth.isLoaded;
    user = userHook.user;
  } catch (e) {
    // Clerk not configured - proceed without auth
    isLoaded = true;
    userId = null;
    user = null;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/listings"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/listings'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                Find Property
              </Link>
              <Link
                href="/listings?listingType=rent"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Rent
              </Link>
              <Link
                href="/listings?listingType=sale"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Buy
              </Link>
              <Link
                href="/listings?listingType=short_let"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Short Let
              </Link>
              <Link
                href="/listings?listingType=commercial"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Commercial
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {!isAuthPage && (
                <>
                  <Link href="/listings">
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </Link>
                </>
              )}

              {userId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                        <AvatarFallback className="text-xs">
                          {user?.fullName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {(user?.publicMetadata?.role as string) || 'tenant'}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => window.location.href = `/api/auth/sign-out?redirect_url=/`}
                      className="text-destructive focus:text-destructive flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-72 bg-card border-l shadow-xl p-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2">
            <Link
              href="/listings"
              className={cn(
                'block px-3 py-2 rounded-lg text-sm font-medium',
                pathname === '/listings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              Find Property
            </Link>
            <Link href="/listings?listingType=rent" className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
              Rent
            </Link>
            <Link href="/listings?listingType=sale" className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
              Buy
            </Link>
            <Link href="/listings?listingType=short_let" className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
              Short Let
            </Link>
            <Link href="/listings?listingType=commercial" className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
              Commercial
            </Link>
            {!userId && (
              <div className="mt-6 space-y-2 pt-4 border-t">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full gap-2">
                    <User className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                <Home className="h-6 w-6" />
                PROPATI
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Nigeria's most trusted property marketplace. Verified listings, secure payments, happy homes.
              </p>
            </div>
            <nav>
              <h3 className="font-semibold">For Tenants</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings?listingType=rent" className="hover:text-foreground transition-colors">Rent Apartments</Link></li>
                <li><Link href="/listings?listingType=short_let" className="hover:text-foreground transition-colors">Short Let</Link></li>
                <li><Link href="/tenant/search" className="hover:text-foreground transition-colors">Tenant Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">For Landlords & Agents</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up?role=landlord" className="hover:text-foreground transition-colors">List Property</Link></li>
                <li><Link href="/sign-up?role=agent" className="hover:text-foreground transition-colors">Agent Tools</Link></li>
                <li><Link href="/dashboard/properties" className="hover:text-foreground transition-colors">Landlord Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PROPATI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}