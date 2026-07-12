'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@clerk/nextjs';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

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
                <li><Link href="/dashboard/search" className="hover:text-foreground transition-colors">Tenant Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">For Landlords & Agents</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up?role=landlord" className="hover:text-foreground transition-colors">List Property</Link></li>
                <li><Link href="/sign-up?role=agent" className="hover:text-foreground transition-colors">Agent Tools</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Landlord Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mortgage-calculator" className="hover:text-foreground transition-colors">Mortgage Calculator</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/community" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="/about-us" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/team" className="hover:text-foreground transition-colors">Team</Link></li>
                <li><Link href="/investors" className="hover:text-foreground transition-colors">Investors</Link></li>
                <li><Link href="/press" className="hover:text-foreground transition-colors">Press</Link></li>
                <li><Link href="/testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/onboarding" className="hover:text-foreground transition-colors">Onboarding</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
                <li><Link href="/contact-us" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-12 border-t pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} PROPATI. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/terms-of-agreement" className="hover:text-foreground transition-colors">Terms of Agreement</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
