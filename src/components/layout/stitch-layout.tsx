'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

const navLinks = [
  { href: '/listings', label: 'Properties' },
  { href: '/verification', label: 'Verification' },
  { href: '/find-agent', label: 'Agents & Brokers' },
  { href: '/listings?listingType=short_let', label: 'Shortlet' },
  { href: '/compare', label: 'Compare' },
  { href: '/about-us', label: 'About Us' },
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
      { label: 'Rent a Property', href: '/listings?listingType=rent' },
      { label: 'Buy a Property', href: '/listings?listingType=-sale' },
      { label: 'Short-let Stays', href: '/listings?listingType=short_let' },
      { label: 'Tenant Verification', href: '/verification' },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-shadow duration-300 ${
        scrolled
          ? 'bg-white border-outline-variant/60 shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
          : 'bg-white border-outline-variant/40'
      }`}
    >
      <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center group">
          <PropatiBoxLogo size="sm" />
        </Link>

        <nav className="hidden xl:flex items-center gap-3 sm:gap-6 2xl:gap-8">
          {navLinks.map((link) => {
            const active = link.href === pathname || link.href === `/${pathname}`;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-on-surface-variant hover:text-on-surface transition-colors py-2.5 font-body-md text-body-md ${
                  active
                    ? 'font-title-sm text-primary font-semibold border-b-2 border-primary'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
          >
            List Property
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-title-sm text-title-sm font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StitchFooter() {
  return (
    <footer className="bg-white border-t border-outline-variant/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-2">
            <div className="mb-4">
              <PropatiBoxLogo size="sm" />
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Nigeria&apos;s premier verified property marketplace. Find, rent, buy, and
              manage real estate with confidence.
            </p>
            <div className="flex gap-2 mt-4">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((sn) => (
                <div
                  key={sn}
                  className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer"
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
              <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-outline-variant/40 pt-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-on-surface-variant">
              © 2026 PropatiBox Technologies Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-on-surface-variant">
                RC: 1849204 — CAC Registered — Verified Property Marketplace
              </span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1 font-mono text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              NDPA 2023 Compliant · FIRS Cap S8 · CBN Escrow Trustee
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
