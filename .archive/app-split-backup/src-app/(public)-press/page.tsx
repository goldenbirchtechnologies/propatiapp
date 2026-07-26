'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  Newspaper,
  Download,
  Mail,
  ExternalLink,
  ArrowRight,
  FileText,
  Image,
  BookOpen,
  Quote,
} from 'lucide-react';

/* ================================================================
   PRESS — press kit, latest mentions, contact media CTA
   ================================================================ */

const pressKit = [
  {
    title: 'Brand Guidelines',
    description: 'Logotypes, typography, colors, and usage rules.',
    href: '#',
    meta: 'PDF · 4.2 MB',
  },
  {
    title: 'Executive Headshots',
    description: 'High-resolution biography-ready photos.',
    href: '#',
    meta: 'ZIP · 18 MB',
  },
  {
    title: 'Product Screenshots',
    description: 'Verified property, payments, and agent dashboards.',
    href: '#',
    meta: 'ZIP · 32 MB',
  },
  {
    title: 'Company Fact Sheet',
    description: 'Quick facts for reporters and analysts.',
    href: '#',
    meta: 'PDF · 1.1 MB',
  },
];

const mentions = [
  {
    publication: 'TechCabal',
    title: 'How PROPATI is digitizing rental agreements in Nigeria',
    date: 'May 2026',
    href: '#',
  },
  {
    publication: 'BusinessDay',
    title: 'Proptech platforms see surge in verified listings',
    date: 'Apr 2026',
    href: '#',
  },
  {
    publication: 'Vanguard',
    title: 'Landlords embrace escrow-backed tenancy management',
    date: 'Mar 2026',
    href: '#',
  },
  {
    publication: 'The Guardian',
    title: 'Women-led fintechs reshaping property and payments',
    date: 'Feb 2026',
    href: '#',
  },
];

const awards = [
  {
    title: 'Best Proptech Startup',
    event: 'Nigeria Tech Awards 2025',
    year: '2025',
  },
  {
    title: 'Financial Innovation of the Year',
    event: 'AFRINNO Summit',
    year: '2025',
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Press & Media
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              News, stories, and resources about PROPATI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Accreditations, press releases, brand assets, and coverage from the media.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link href="#kit">
                  Press Kit <Download className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="#contact">Media Inquiries</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Kit */}
      <section id="kit" className="py-16 md:py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Press Kit</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Resources for media</h2>
              <p className="mt-3 text-muted-foreground">
                Download official assets and backgrounders for articles, broadcasts, and reports.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pressKit.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-xl border border-border bg-background p-5 shadow-1 transition hover:shadow-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">{item.meta}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Mentions */}
      <section className="py-16 md:py-24 bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Coverage</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest Mentions</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Selected features, interviews, and analyses featuring PROPATI across Nigerian and international outlets.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:inline-flex gap-1" asChild>
              <Link href="#">
                All press <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {mentions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-xl border border-border bg-background p-5 shadow-1 transition hover:shadow-2 group"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                  {item.publication} · {item.date}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  Read article <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-bold text-foreground mb-4">Awards &amp; Recognition</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {awards.map((award) => (
                <Card key={award.title} className="rounded-lg border-border shadow-1 bg-card">
                  <CardContent className="pt-6">
                    <p className="text-lg font-bold text-foreground">{award.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{award.event}</p>
                    <p className="text-xs text-muted-foreground mt-2">{award.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Media CTA */}
      <section id="contact" className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Media inquiries</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            For interview requests, quotes, or story ideas, reach out to the communications team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <Link href="mailto:press@propati.ng">
                <Mail className="h-4 w-4" /> press@propati.ng
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/contact-us">General Contact</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
