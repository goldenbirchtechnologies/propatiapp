'use client';

import Link from 'next/link';
import MaterialIcon from '@/components/icons/material-icon';
import { useState } from 'react';

export default function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
              PROPATI
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className="text-sm font-bold text-primary border-b-2 border-secondary-container">
                Buy
              </Link>
              <Link href="/properties?tab=rent" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Rent
              </Link>
              <Link href="/properties?tab=shortlet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Short-let
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined p-2 hover:bg-muted rounded-full text-muted-foreground">
              notifications
            </button>
            <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[64px] min-h-screen flex flex-col">
        {/* Sticky Filter Bar */}
        <section className="sticky top-[64px] z-40 bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-4">
            {/* Property Type */}
            <div className="relative group">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Property Type
              </label>
              <select className="appearance-none bg-muted border border-outline-variant rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[160px]">
                <option>Apartments</option>
                <option>Duplexes</option>
                <option>Townhouses</option>
                <option>Land</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 bottom-2 pointer-events-none text-muted-foreground text-[18px]">
                expand_more
              </span>
            </div>

            {/* Location */}
            <div className="relative group flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Location
              </label>
              <div className="flex items-center bg-muted border border-outline-variant rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-muted-foreground mr-2 text-[18px]">
                  location_on
                </span>
                <input
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full"
                  placeholder="Lekki, VI, Ikeja..."
                  type="text"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="relative group min-w-[180px]">
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">
                Price (₦)
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="bg-muted border border-outline-variant rounded-lg px-2 py-2 text-sm w-20"
                  placeholder="Min"
                  type="number"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  className="bg-muted border border-outline-variant rounded-lg px-2 py-2 text-sm w-24"
                  placeholder="Max"
                  type="number"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-[1px] bg-border hidden sm:block" />
              <button className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span className="text-sm font-medium">All Filters</span>
              </button>
              <div className="h-10 w-[1px] bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden lg:inline">Sort by:</span>
                <select className="bg-transparent border-none font-bold text-sm focus:ring-0 cursor-pointer">
                  <option>Verification Tier</option>
                  <option>Newest</option>
                  <option>Price: High to Low</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Results & Map View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Results Column */}
          <aside className="w-full lg:w-[60%] xl:w-[55%] overflow-y-auto bg-background px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Properties in Lagos</h1>
                  <p className="text-sm text-muted-foreground">Showing 1,248 verified results</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md material-symbols-outlined ${
                      view === 'grid'
                        ? 'bg-primary-container text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    grid_view
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md material-symbols-outlined ${
                      view === 'list'
                        ? 'bg-primary-container text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    format_list_bulleted
                  </button>
                </div>
              </div>

              {/* Property Cards Grid */}
              <div className={`grid gap-6 pb-8 ${
                view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}>
                {[
                  {
                    title: 'The Obsidian Penthouse',
                    price: '₦450,000,000',
                    location: 'Lekki Phase 1, Lagos',
                    beds: 5,
                    baths: 6,
                    area: '1,200',
                    tier: 'Certified',
                    tierColor: 'bg-primary-container text-white',
                    inspected: 'Inspected May 2024',
                  },
                  {
                    title: 'Vantage Terrace',
                    price: '₦210,000,000',
                    location: 'Victoria Island, Lagos',
                    beds: 4,
                    baths: 4,
                    area: '850',
                    tier: 'Verified',
                    tierColor: 'bg-green-600 text-white',
                    inspected: null,
                  },
                  {
                    title: 'Smart Central Suite',
                    price: '₦85,000,000',
                    location: 'Ikeja GRA, Lagos',
                    beds: 3,
                    baths: 3,
                    area: '450',
                    tier: 'Inspected',
                    tierColor: 'bg-secondary-container text-primary',
                    inspected: null,
                  },
                  {
                    title: 'Metro Loft Yaba',
                    price: '₦45,000,000',
                    location: 'Yaba, Lagos',
                    beds: 2,
                    baths: 2,
                    area: '320',
                    tier: 'Basic',
                    tierColor: 'bg-muted text-muted-foreground',
                    inspected: null,
                  },
                ].map((listing, i) => (
                  <article
                    key={i}
                    className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-card-hover transition-all cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div className="w-full h-full bg-muted group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${listing.tierColor}`}>
                          {listing.tier}
                        </span>
                      </div>
                      <button className="absolute top-3 right-3 bg-background/80 backdrop-blur-md p-2 rounded-full text-primary hover:text-destructive transition-colors">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </button>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <div className="text-right ml-4">
                          <span className="block font-heading font-bold text-secondary text-lg">
                            {listing.price}
                          </span>
                          {listing.inspected && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {listing.inspected}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                        <MaterialIcon name="location_on" className="material-symbols-outlined text-[18px]" />
                        <span className="text-sm">{listing.location}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MaterialIcon name=""bed"" className="material-symbols-outlined text-[20px] text-primary" />
                            <span className="text-sm font-medium">{listing.beds}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MaterialIcon name=""bathtub"" className="material-symbols-outlined text-[20px] text-primary" />
                            <span className="text-sm font-medium">{listing.baths}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MaterialIcon name=""square_foot"" className="material-symbols-outlined text-[20px] text-primary" />
                            <span className="text-sm font-medium">{listing.area}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center items-center gap-4 pb-8">
                <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-lg bg-primary text-white font-bold">1</button>
                  <button className="w-10 h-10 rounded-lg hover:bg-muted transition-colors">2</button>
                  <button className="w-10 h-10 rounded-lg hover:bg-muted transition-colors">3</button>
                  <span className="flex items-end px-2 text-muted-foreground">...</span>
                  <button className="w-10 h-10 rounded-lg hover:bg-muted transition-colors">15</button>
                </div>
                <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Map View Column */}
          <section className="hidden lg:block lg:w-[40%] xl:w-[45%] relative border-l border-border">
            <div className="absolute inset-0 bg-muted">
              <div className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                {/* Map Legend */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border max-w-[200px]">
                  <h4 className="text-sm font-bold mb-2">Verification Legend</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      Certified (Top Tier)
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-600" />
                      Verified Agent
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary-container" />
                      Physically Inspected
                    </div>
                  </div>
                </div>
                {/* Map placeholder label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm font-medium">Interactive Map View</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-primary-container text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="text-lg font-bold text-secondary-fixed">PROPATI</span>
              <p className="mt-3 text-sm text-on-primary-container">
                Nigeria&apos;s most trusted property verification platform. Real listings, real agents, real peace of mind.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-on-primary-container">
                <li><Link href="/about-us" className="hover:text-secondary-fixed transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-secondary-fixed transition-colors">Careers</Link></li>
                <li><Link href="/contact-us" className="hover:text-secondary-fixed transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-on-primary-container">
                <li><Link href="/terms-of-service" className="hover:text-secondary-fixed transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-secondary-fixed transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  className="bg-white/10 border border-on-primary-container/30 rounded-lg px-3 py-2 text-white w-full text-sm focus:ring-1 focus:ring-secondary-fixed"
                  placeholder="Email address"
                  type="email"
                />
                <button className="bg-secondary text-primary font-bold px-3 py-2 rounded-lg material-symbols-outlined text-[18px]">
                  arrow_forward
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-on-primary-container">
              &copy; {new Date().getFullYear()} PROPATI Marketplace. All rights reserved.
            </p>
            <span className="text-[10px] text-on-primary-container uppercase tracking-widest">NIGERIA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
