'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Newspaper,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

/* ================================================================
   RESOURCES HUB — Docs, Legal, Press, Onboarding Guides
   ================================================================ */

const resourceCategories = [
  {
    title: 'Documentation',
    description: 'Technical and product documentation for developers and partners.',
    href: '#docs',
    icon: BookOpen,
    color: 'bg-primary/10 text-primary',
    items: [
      { title: 'API Reference', desc: 'REST endpoints, schemas, and error codes.', href: '/resources/docs/api' },
      { title: 'Webhooks Guide', desc: 'Event payloads, retries, and security.', href: '/resources/docs/webhooks' },
      { title: 'Integration Playbook', desc: 'Connect PROPATI payments, listings, and CRM.', href: '/resources/docs/integrations' },
      { title: 'Security & Compliance', desc: 'SOC2, data handling, and escrow policies.', href: '/resources/docs/compliance' },
    ],
  },
  {
    title: 'Legal',
    description: 'Policies, agreements, and regulatory disclosures.',
    href: '#legal',
    icon: FileText,
    color: 'bg-tertiary/10 text-tertiary',
    items: [
      { title: 'Privacy Policy', desc: 'How we collect, use, and protect your data.', href: '/privacy-policy' },
      { title: 'Terms of Service', desc: 'Platform rules, account terms, and liability limits.', href: '/terms-of-service' },
      { title: 'Terms of Agreement', desc: 'Partnership and agent-specific clauses.', href: '/terms-of-agreement' },
      { title: 'Cookie Policy', desc: 'Tracking preferences and consent management.', href: '/resources/legal/cookies' },
    ],
  },
  {
    title: 'Press & Media',
    description: 'News, releases, and brand assets for journalists and creators.',
    href: '#press',
    icon: Newspaper,
    color: 'bg-commercial-gold/10 text-commercial-gold',
    items: [
      { title: 'Press Releases', desc: 'Latest company announcements and milestones.', href: '/resources/press/releases' },
      { title: 'Media Kit', desc: 'Logos, photos, fact sheets, and brand colors.', href: '/resources/press/media-kit' },
      { title: 'Founding Story', desc: 'Why we started PROPATI and where we are headed.', href: '/resources/press/founding-story' },
      { title: 'Contact PR', desc: 'Request interviews, quotes, or media coverage.', href: '/resources/press/contact' },
    ],
  },
  {
    title: 'Onboarding Guides',
    description: 'Quick-start paths tailored to tenants, landlords, and agents.',
    href: '#onboarding',
    icon: GraduationCap,
    color: 'bg-residential-teal/10 text-residential-teal',
    items: [
      { title: 'Tenant Quick Start', desc: 'Search, inspect, and move in — in four steps.', href: '/resources/onboarding/tenant' },
      { title: 'Landlord Quick Start', desc: 'List, verify, and collect rent securely.', href: '/resources/onboarding/landlord' },
      { title: 'Agent Quick Start', desc: 'Broadcast listings, convert, and earn.', href: '/resources/onboarding/agent' },
      { title: 'Video Walkthroughs', desc: 'Screen recordings for dashboard navigation.', href: '/resources/onboarding/videos' },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Resources Hub
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Everything you need to build, rent, and report
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Documentation, legal frameworks, press materials, and onboarding guides — organized by role and use case.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full', category.color)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{category.title}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-3">
                    {category.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="group flex items-start justify-between rounded-lg border border-transparent bg-background p-3 transition-all hover:border-border hover:shadow-1"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-border">
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
    </div>
  );
}
