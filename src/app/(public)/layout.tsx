'use client';

import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import PublicNav from '@/components/navigation/public-nav';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full bg-black">
      <PublicNav />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/[0.08] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-2">
              <div className="mb-4">
                <PropatiBoxLogo size="sm" />
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                Nigeria&apos;s premier verified property marketplace and PropTech OS. Find, rent, buy, and manage real estate with confidence.
              </p>
              <div className="flex gap-3 mt-5">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((sn) => (
                  <div
                    key={sn}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Tenants',
                links: [
                  { label: 'Rent a Property', href: '/listings?listingType=rent' },
                  { label: 'Buy a Property', href: '/listings?listingType=sale' },
                  { label: 'Short-let Stays', href: '/listings?listingType=short_let' },
                  { label: 'Tenant Screening', href: '/verification' },
                ],
              },
              {
                title: 'Landlords',
                links: [
                  { label: 'List Property', href: '/signup?role=landlord' },
                  { label: 'Property Verification', href: '/verification' },
                  { label: 'Rent Collection', href: '/dashboard/landlord/rent' },
                  { label: 'Digital Agreements', href: '/agreements' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '/about-us' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Press', href: '/press' },
                  { label: 'Contact', href: '/contact-us' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-zinc-600">© 2026 PropatiBox Technologies Ltd. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-600">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
