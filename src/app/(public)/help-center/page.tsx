'use client'

import MaterialIcon from '@/components/icons/material-icon';

import Link from 'next/link';
import { useState } from 'react';


export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    { icon: 'person', label: 'Tenants', href: '#' },
    { icon: 'home_work', label: 'Landlords', href: '#' },
    { icon: 'support_agent', label: 'Agents', href: '#' },
    { icon: 'verified_user', label: 'Verification', href: '#', active: true },
  ];

  const articles = [
    {
      tag: 'VERIFICATION',
      tagColor: 'bg-secondary-container/10 text-secondary',
      readTime: '5 Min Read',
      title: 'How Property Verification Works in Nigeria',
      desc: 'Step-by-step guide to verifying Land Titles and C of O using PROPATI secure API.',
      image: '',
    },
    {
      tag: 'SECURITY',
      tagColor: 'bg-tertiary-container/10 text-on-tertiary-container',
      readTime: '8 Min Read',
      title: 'Handling Security Deposits in Lagos',
      desc: 'Learn about the 2024 updated tenancy laws regarding deposits and refund policies.',
      image: '',
    },
    {
      tag: 'ALERT',
      tagColor: 'bg-error-container/10 text-error',
      readTime: '4 Min Read',
      title: 'Avoiding Real Estate Scams',
      desc: 'Common red flags to look for when inspecting properties or dealing with agents.',
      image: '',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="bg-surface border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold text-primary">PROPATI</span>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/help-center" className="text-sm font-semibold text-primary border-b-2 border-secondary-container">
                Help Home
              </Link>
              <Link href="/guides" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/resources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center px-4 py-2 bg-primary-container text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Go to Dashboard
            </Link>
            <div className="w-10 h-10 rounded-full bg-muted border-2 border-primary-container overflow-hidden">
              <div className="w-full h-full bg-muted" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-primary-container text-white fixed h-[calc(100vh-64px)] top-16 shadow-md pt-6 px-4 gap-6 z-40">
          <div className="mb-4">
            <h2 className="font-heading font-bold text-lg text-secondary-fixed">Help Center</h2>
            <p className="text-xs text-on-primary-container/70 mt-1">Find your role</p>
          </div>
          <nav className="flex flex-col gap-2">
            {roles.map((role) => (
              <Link
                key={role.label}
                href={role.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                  role.active
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary translate-x-1'
                    : 'text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/20'
                }`}
              >
                <MaterialIcon name={role.icon} className="material-symbols-outlined" />
                <span className="text-sm font-medium">{role.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto pb-8 flex flex-col gap-4 border-t border-white/10 pt-6">
            <Link href="/privacy-policy" className="flex items-center gap-3 text-on-primary-container/70 hover:text-on-primary-container p-2">
              <MaterialIcon name="gavel" className="material-symbols-outlined" />
              <span className="text-xs">Privacy Policy</span>
            </Link>
            <Link href="/terms-of-service" className="flex items-center gap-3 text-on-primary-container/70 hover:text-on-primary-container p-2">
              <MaterialIcon name="description" className="material-symbols-outlined" />
              <span className="text-xs">Terms of Service</span>
            </Link>
            <button className="bg-secondary text-primary font-medium py-3 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all">
              Chat with Support
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 w-full">
          {/* Hero Section */}
          <section className="relative bg-primary overflow-hidden py-20 px-4 md:px-8">
            <div className="absolute inset-0 opacity-10" />
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-8">
                Secure Your Property Journey
              </h1>
              <div className="relative max-w-2xl mx-auto group">
                <MaterialIcon  className="material-symbols-outlined" />
                <input
                  type="text"
                  placeholder="How can we help you today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[60px] pl-16 pr-6 rounded-full border-none shadow-2xl text-lg font-body focus:ring-4 focus:ring-secondary/20 outline-none transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-container text-white px-8 h-[48px] rounded-full font-medium hover:bg-secondary transition-colors">
                  Search
                </button>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="text-white/60 text-sm font-medium">Popular:</span>
                <Link href="#" className="text-secondary-fixed hover:underline text-sm">Lagos Rental Laws</Link>
                <Link href="#" className="text-secondary-fixed hover:underline text-sm">Title Deed Verification</Link>
                <Link href="#" className="text-secondary-fixed hover:underline text-sm">Escrow Payments</Link>
              </div>
            </div>
          </section>

          {/* Role-based Bento Grid */}
          <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role) => (
                <div
                  key={role.label}
                  className={`bg-surface-container-low p-8 rounded-xl border border-outline-variant transition-all hover:-translate-y-1 hover:shadow-card-hover flex flex-col h-full ${
                    role.active ? 'border-2 border-secondary' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    role.active ? 'bg-secondary text-primary' : 'bg-primary-container text-white'
                  }`}>
                    <MaterialIcon name={role.icon} className="material-symbols-outlined" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{role.label}</h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-1">
                    {role.label === 'Tenants' && 'Find verified homes, manage secure payments, and understand your rights.'}
                    {role.label === 'Landlords' && 'List properties to verified tenants and access professional management tools.'}
                    {role.label === 'Agents' && 'Supercharge your deals with verified leads and automated transaction tools.'}
                    {role.label === 'Verification' && 'Specifically built for the Nigerian market. Verify C of O, Governors Consent, and land titles instantly.'}
                  </p>
                  <ul className="space-y-3 mt-auto">
                    {role.label === 'Tenants' && (
                      <>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Rentals <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Secure Payments <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                      </>
                    )}
                    {role.label === 'Landlords' && (
                      <>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Listing Guide <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Verification <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                      </>
                    )}
                    {role.label === 'Agents' && (
                      <>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Agent Tools <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                        <li><Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">Lead Gen <MaterialIcon name="chevron_right" className="material-symbols-outlined" /></Link></li>
                      </>
                    )}
                    {role.label === 'Verification' && (
                      <li>
                        <button className="mt-auto bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-colors active:scale-95">
                          Start Verification
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Content Section */}
          <section className="bg-surface-container py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-heading font-bold text-xl">Trending Help Articles</h2>
                  <Link href="#" className="text-primary text-sm font-medium flex items-center gap-2">
                    View All <MaterialIcon name="arrow_forward" className="material-symbols-outlined" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {articles.map((article, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-outline-variant flex items-center gap-6 group hover:bg-surface-bright transition-colors cursor-pointer">
                      <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted" />
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${article.tagColor}`}>
                            {article.tag}
                          </span>
                          <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{article.readTime}</span>
                        </div>
                        <h4 className="font-heading font-bold text-base mb-1 group-hover:text-secondary transition-colors">{article.title}</h4>
                        <p className="text-muted-foreground text-sm line-clamp-1">{article.desc}</p>
                      </div>
                      <MaterialIcon name="open_in_new" className="material-symbols-outlined" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-80 flex flex-col gap-6">
                <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                  <h3 className="font-heading font-bold text-lg mb-4">Still need help?</h3>
                  <p className="text-sm text-on-primary-container mb-6 leading-relaxed">Our support team is available 24/7 to help you with property disputes, title checks, or account issues.</p>
                  <Link href="#" className="inline-flex items-center justify-center w-full bg-secondary text-primary font-bold py-3 rounded-lg hover:brightness-110 transition-all shadow-lg active:scale-95">
                    Contact Support
                  </Link>
                </div>
                <div className="bg-white p-8 rounded-xl border border-outline-variant">
                  <h3 className="font-heading font-bold text-lg mb-4">Market Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Verified Listings</span>
                      <span className="text-sm font-bold text-secondary">12,400+</span>
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div className="bg-secondary w-4/5 h-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <span className="text-sm font-bold text-secondary">850k+</span>
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div className="bg-secondary w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-highest w-full py-12 px-4 md:px-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="max-w-xs">
              <span className="font-heading font-black text-foreground mb-4 block text-2xl">PROPATI</span>
              <p className="text-muted-foreground text-sm mb-6">Nigeria's premier property marketplace built on trust, transparency, and verified transactions.</p>
              <div className="flex gap-4">
                <Link href="#" className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white hover:bg-secondary transition-colors">
                  <MaterialIcon name="public" className="material-symbols-outlined" />
                </Link>
                <Link href="#" className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white hover:bg-secondary transition-colors">
                  <MaterialIcon name="chat" className="material-symbols-outlined" />
                </Link>
                <Link href="#" className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white hover:bg-secondary transition-colors">
                  <MaterialIcon name="mail" className="material-symbols-outlined" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-primary">Company</h5>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">About Us</Link>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">Careers</Link>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">Security</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-primary">Legal</h5>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">Privacy</Link>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">Support</Link>
                <Link href="#" className="text-muted-foreground text-sm hover:underline decoration-secondary underline-offset-4">Terms</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h5 className="text-sm font-bold text-primary">Contact</h5>
                <span className="text-muted-foreground text-sm">Lagos Office:</span>
                <span className="text-primary text-xs font-medium">Victoria Island, Lagos, NG</span>
                <Link href="mailto:support@propati.com" className="text-muted-foreground text-sm hover:underline">support@propati.com</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} PROPATI Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
