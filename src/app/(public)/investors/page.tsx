'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Newspaper,
  Download,
  ExternalLink,
  ArrowRight,
  FileText,
  Quote,
} from 'lucide-react';

/* ================================================================
   INVESTORS — highlights, reports carousel, and CTA
   ================================================================ */

const highlights = [
  {
    label: 'Portfolio Value',
    value: '₦18.2B',
    sub: 'Managed across 12 states',
    icon: Building2,
  },
  {
    label: 'Active Users',
    value: '65,000+',
    sub: 'Tenants, landlords, agents',
    icon: Users,
  },
  {
    label: 'Annual Revenue',
    value: '₦4.1B',
    sub: 'FY 2025 (audited)',
    icon: DollarSign,
  },
  {
    label: 'YoY Growth',
    value: '+138%',
    sub: 'Property listings volume',
    icon: TrendingUp,
  },
];

const reports = [
  {
    title: 'Q1 2026 Earnings Release',
    type: 'Earnings',
    date: 'Apr 2026',
    href: '#',
  },
  {
    title: 'FY 2025 Annual Report',
    type: 'Annual',
    date: 'Mar 2026',
    href: '#',
  },
  {
    title: 'Investor Presentation',
    type: 'Presentation',
    date: 'Feb 2026',
    href: '#',
  },
  {
    title: 'Corporate Governance Report',
    type: 'Governance',
    date: 'Jan 2026',
    href: '#',
  },
  {
    title: 'ESG & Impact Report 2025',
    type: 'ESG',
    date: 'Dec 2025',
    href: '#',
  },
  {
    title: 'H1 2025 Earnings Release',
    type: 'Earnings',
    date: 'Sep 2025',
    href: '#',
  },
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Investor Relations
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Building Nigeria&apos;s most trusted property platform
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Transparent operations, verified transactions, and sustainable growth across residential and commercial property.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link href="#reports">
                  Latest Reports <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="#contact">Contact IR Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Key Highlights</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Operating metrics that demonstrate our momentum and platform health.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {highlights.map((item) => (
              <Card key={item.label} className="rounded-lg border-border shadow-1 bg-card text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reports Carousel */}
      <section id="reports" className="py-16 md:py-24 bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Library</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Reports &amp; Filings</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Browse our latest investor materials. For prior filings, reach out to the IR team.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:inline-flex gap-1" asChild>
              <Link href="#">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {reports.map((report) => (
                <Link
                  key={report.title}
                  href={report.href}
                  className="snap-start min-w-[260px] md:min-w-[280px] rounded-xl border border-border bg-background p-5 shadow-1 transition hover:shadow-2 group"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {report.type}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground leading-snug">{report.title}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{report.date}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Investor &amp; analyst inquiries</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            Our investor relations team is available for portfolio reviews, earnings Q&amp;As, and partnership discussions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <Link href="mailto:ir@propati.ng">ir@propati.ng</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/contact-us">Go to Contact Page</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
