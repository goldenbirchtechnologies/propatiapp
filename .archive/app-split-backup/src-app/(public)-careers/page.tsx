'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Building2,
  Users,
  HeartHandshake,
  Rocket,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';

/* ================================================================
   CAREERS — Culture, Open Roles, and Apply CTA
   ================================================================ */

const cultureValues = [
  {
    title: 'Ownership',
    description: 'We give teammates end-to-end accountability and the tools to ship.',
    icon: Rocket,
  },
  {
    title: 'Customer-first',
    description: 'Every decision starts with the tenant, landlord, or agent.',
    icon: HeartHandshake,
  },
  {
    title: 'Transparency',
    description: 'Open decisions, visible roadmaps, and honest feedback by default.',
    icon: Users,
  },
  {
    title: 'Craft',
    description: 'We care about design, code quality, and measurable impact.',
    icon: Building2,
  },
];

const openRoles = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    salary: '₦4M–7M',
    tags: ['React', 'TypeScript', 'Design Systems'],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    salary: '₦2.5M–5M',
    tags: ['Figma', 'Spatial UI', 'Prototyping'],
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote · Nigeria',
    type: 'Full-time',
    salary: '₦3.5M–6.5M',
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    title: 'Growth & Partnerships Lead',
    department: 'Marketing',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    salary: '₦2M–3.5M',
    tags: ['B2B', 'Events', 'Content'],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Join Us
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Build the future of property in Nigeria
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              We are a small team obsessed with trust, design, and speed. If that sounds like you, let&apos;s build together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link href="#open-roles">
                  View open roles <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/resources/onboarding/agent">Partner with us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Our Culture</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                High trust, low process
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                We believe the best work happens when people feel safe, informed, and in control of their time.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cultureValues.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-1"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-xl border border-border bg-card/50 p-6 md:p-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                PROPATI is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees, regardless of background, identity, or experience level. We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-16 md:py-24 bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Open Roles</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                We&apos;re hiring
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Join a squad that ships fast, learns faster, and always keeps the customer at the center.
              </p>
            </div>

            <div className="space-y-4">
              {openRoles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-xl border border-border bg-background p-5 md:p-6 shadow-1 transition-all hover:shadow-2 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {role.title}
                        </h3>
                        <Badge variant="outline" className="rounded-full text-xs font-semibold">
                          {role.department}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {role.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {role.type}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {role.salary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {role.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/careers/${encodeURIComponent(role.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`} className="gap-1">
                          Apply
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Don&apos;t see a fit?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            We still want to hear from you. Send an open application and tell us what you would bring to PROPATI.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <Link href="/careers/apply">
                Open application <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="mailto:careers@propati.ng">Email us directly</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
