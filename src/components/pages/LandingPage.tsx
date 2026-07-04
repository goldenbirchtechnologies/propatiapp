'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function LandingPage() {
  return (
    <div className="min-h-screen theme-landing">
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: '64px' }}>
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
                PROPATI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-sm font-medium transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text)' }}>
                Properties
              </Link>
              <Link href="/about" className="text-sm font-medium transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text)' }}>
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text)' }}>
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <SignInButton>
                Sign In
              </SignInButton>
              <SignUpButton>
                Get Started
              </SignUpButton>
            </div>
          </div>
        </nav>

        {/* Search Bar */}
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-2xl relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search properties in Lagos, Abuja, Port Harcourt..."
                  className="inp-field pl-10"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary text-sm px-4">All Types</button>
                <button className="btn btn-secondary text-sm px-4">Rent</button>
                <button className="btn btn-secondary text-sm px-4">Buy</button>
                <button className="btn btn-secondary text-sm px-4">Short-let</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden" style={{ padding: 'var(--space-hero) var(--space-lg)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-heading font-extrabold mb-6" style={{ fontSize: 'var(--text-hero)', color: 'var(--text)' }}>
                Find Your Perfect{' '}
                <span style={{ color: 'var(--accent)' }}>Property</span>
                in Nigeria
              </h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                Rent, buy, or list properties with confidence. Verified listings, secure payments, 
                and professional agents across Lagos, Abuja, and major Nigerian cities.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignUpButton>
                  Start Free →
                </SignUpButton>
                <Link href="/properties" className="btn btn-secondary text-lg px-8 py-4 w-full sm:w-auto" style={{ fontSize: '1rem' }}>
                  Browse Listings
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              {[
                { label: 'Active Listings', value: '12,500+' },
                { label: 'Verified Agents', value: '2,300+' },
                { label: 'Happy Tenants', value: '45,000+' },
                { label: 'Cities Covered', value: '18+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-heading font-bold mb-1" style={{ color: 'var(--accent)' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section style={{ padding: 'var(--space-section) var(--space-lg)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-bold" style={{ fontSize: '1.5rem', color: 'var(--text)' }}>
                Popular Categories
              </h2>
              <Link href="/properties" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Apartments', icon: '🏢', count: '5,200' },
                { label: 'Houses', icon: '🏠', count: '3,100' },
                { label: 'Short-lets', icon: '🏖️', count: '1,800' },
                { label: 'Land', icon: '🟫', count: '950' },
                { label: 'Commercial', icon: '🏢', count: '680' },
                { label: 'Shared', icon: '🤝', count: '420' },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={`/properties?type=${cat.label.toLowerCase()}`}
                  className="card p-6 text-center hover:border-[var(--accent)] transition-colors"
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-heading font-bold" style={{ color: 'var(--text)' }}>{cat.label}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{cat.count} listings</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 dark:bg-gray-900" style={{ padding: 'var(--space-section) var(--space-lg)' }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-center mb-12" style={{ fontSize: '1.5rem', color: 'var(--text)' }}>
              How PROPATI Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Search & Discover',
                  desc: 'Browse thousands of verified properties with photos, videos, and virtual tours.',
                },
                {
                  step: '02',
                  title: 'Connect & Apply',
                  desc: 'Message landlords directly, schedule viewings, and submit applications securely.',
                },
                {
                  step: '03',
                  title: 'Sign & Move In',
                  desc: 'Digital agreements, escrow payments, and seamless move-in process.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card-lg)' }}>
                  <div className="text-4xl font-heading font-bold mb-4" style={{ color: 'var(--accent)' }}>{item.step}</div>
                  <h3 className="font-heading font-bold mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'var(--space-section) var(--space-lg)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="card p-12" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', border: 'none' }}>
              <h2 className="font-heading font-bold mb-4" style={{ fontSize: '2rem', color: '#1a1a1a' }}>
                Ready to Find Your Home?
              </h2>
              <p className="mb-8" style={{ color: 'rgba(26, 26, 26, 0.8)', fontSize: '1.1rem' }}>
                Join thousands of Nigerians who trust PROPATI for their property needs.
              </p>
              <SignUpButton>
                Create Free Account
              </SignUpButton>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: 'var(--space-section) var(--space-lg)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-heading font-bold" style={{ color: 'var(--accent)' }}>PROPATI</span>
              </Link>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                The leading property management platform for landlords, tenants, and agents in Nigeria.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text)' }}>For Tenants</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li><Link href="/properties?purpose=rent" className="hover:text-[var(--accent)]">Rent a Property</Link></li>
                <li><Link href="/properties?purpose=buy" className="hover:text-[var(--accent)]">Buy a Property</Link></li>
                <li><Link href="/properties?purpose=short-let" className="hover:text-[var(--accent)]">Short-let Stays</Link></li>
                <li><Link href="/screening" className="hover:text-[var(--accent)]">Tenant Screening</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text)' }}>For Landlords</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li><Link href="/dashboard/landlord" className="hover:text-[var(--accent)]">List Property</Link></li>
                <li><Link href="/verification" className="hover:text-[var(--accent)]">Property Verification</Link></li>
                <li><Link href="/rent-collection" className="hover:text-[var(--accent)]">Rent Collection</Link></li>
                <li><Link href="/agreements" className="hover:text-[var(--accent)]">Digital Agreements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--text)' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li><Link href="/about" className="hover:text-[var(--accent)]">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-[var(--accent)]">Careers</Link></li>
                <li><Link href="/press" className="hover:text-[var(--accent)]">Press</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--accent)]">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                © 2024 PROPATI. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-sm hover:text-[var(--accent)]" style={{ color: 'var(--muted)' }}>Privacy</Link>
                <Link href="/terms" className="text-sm hover:text-[var(--accent)]" style={{ color: 'var(--muted)' }}>Terms</Link>
                <Link href="/cookies" className="text-sm hover:text-[var(--accent)]" style={{ color: 'var(--muted)' }}>Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}