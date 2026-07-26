'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  Rocket,
  Code2,
  ShieldCheck,
  HelpCircle,
  FileText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

/* ================================================================
   DOCUMENTATION HUB — categorized docs & resources
   ================================================================ */

const docCategories = [
  {
    title: 'Getting Started',
    description: 'New users — tenants, landlords, and agents — start here.',
    href: '/docs/getting-started',
    icon: Rocket,
    color: 'bg-primary/10 text-primary',
    items: [
      { title: 'Quick Start Guide', desc: 'Get up and running in five minutes.', href: '/docs/getting-started/quick-start' },
      { title: 'Account Setup', desc: 'Register, verify your identity, and configure preferences.', href: '/docs/getting-started/account-setup' },
      { title: 'Tenant Walkthrough', desc: 'Search listings, book viewings, and pay rent securely.', href: '/docs/getting-started/tenant-walkthrough' },
      { title: 'Landlord Walkthrough', desc: 'List properties, screen tenants, and track payments.', href: '/docs/getting-started/landlord-walkthrough' },
      { title: 'Agent Walkthrough', desc: 'Manage clients, broadcast listings, and close deals.', href: '/docs/getting-started/agent-walkthrough' },
    ],
  },
  {
    title: 'API & Integration',
    description: 'Developers and partners building on the PROPATI platform.',
    href: '/docs/api',
    icon: Code2,
    color: 'bg-secondary/10 text-secondary-foreground',
    items: [
      { title: 'REST API Reference', desc: 'Full endpoint reference, schemas, and error codes.', href: '/docs/api/rest' },
      { title: 'Authentication', desc: 'OAuth 2.0 flows, API keys, and scopes.', href: '/docs/api/auth' },
      { title: 'Webhooks', desc: 'Event payloads, retry logic, and signature verification.', href: '/docs/api/webhooks' },
      { title: 'SDK & Libraries', desc: 'Node.js, Python, and PHP wrappers.', href: '/docs/api/sdk' },
      { title: 'Integration Playbook', desc: 'Connect payments, CRM, and listing syndication.', href: '/docs/api/integrations' },
    ],
  },
  {
    title: 'Legal & Compliance',
    description: 'Regulatory disclosures, policies, and data handling rules.',
    href: '/docs/legal',
    icon: ShieldCheck,
    color: 'bg-tertiary/10 text-tertiary',
    items: [
      { title: 'Privacy Policy', desc: 'How we collect, use, and protect your personal data.', href: '/privacy-policy' },
      { title: 'Terms of Service', desc: 'Platform rules, account terms, and liability limits.', href: '/terms-of-service' },
      { title: 'Terms of Agreement', desc: 'Agent and partnership-specific contractual clauses.', href: '/terms-of-agreement' },
      { title: 'KYC & AML Policy', desc: 'Know-your-customer requirements and anti-money-laundering controls.', href: '/docs/legal/kyc-aml' },
      { title: 'Data Processing Addendum', desc: 'GDPR and NDPR-governed data processing terms.', href: '/docs/legal/dpa' },
    ],
  },
  {
    title: 'Help & Support',
    description: 'Troubleshooting guides, FAQs, and ways to reach the team.',
    href: '/docs/support',
    icon: HelpCircle,
    color: 'bg-residential-teal/10 text-residential-teal',
    items: [
      { title: 'FAQ', desc: 'Frequently asked questions across all user roles.', href: '/faq' },
      { title: 'Contact Support', desc: 'Submit a ticket or start a live chat with our team.', href: '/support' },
      { title: 'Community Forum', desc: 'Ask questions and share tips with other users.', href: '/community' },
      { title: 'System Status', desc: 'Real-time availability and incident history.', href: '/docs/support/status' },
      { title: 'Video Walkthroughs', desc: 'Recorded screen sessions for dashboard navigation.', href: '/docs/support/videos' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Documentation Hub
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Docs, guides, and resources — organized for you
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              From quick-start walkthroughs to full API references, everything you need is right here, grouped by topic and use case.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="#categories" className="gap-2">
                  Browse Docs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" asChild>
                <Link href="/support">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Doc Categories */}
      <section id="categories" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider px-4 py-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              All Documentation
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">
              Explore by topic
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Each category contains step-by-step guides and reference material tailored for different user roles.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-10 md:grid-cols-2">
            {docCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-1 transition-shadow hover:shadow-card-hover"
                >
                  {/* Category header */}
                  <div className="flex items-start gap-3 mb-5">
                    <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full', category.color)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{category.title}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="group flex items-start justify-between rounded-lg border border-transparent bg-background p-3.5 transition-all hover:border-border hover:shadow-1"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                          </div>
                          {item.href.startsWith('http') || item.href.startsWith('/privacy') || item.href.startsWith('/terms') ? (
                            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* View-all */}
                  <div className="mt-5 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={category.href} className="gap-1">
                        View all {category.title.toLowerCase()}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-primary mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Can&apos;t find what you need?</h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Our support team responds within 24 hours on weekdays.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/support">Open a Support Ticket</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/community">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
