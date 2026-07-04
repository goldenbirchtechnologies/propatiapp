'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ClipboardCheck,
  KeyRound,
  Plus,
  ShieldCheck,
  Wallet,
  UserPlus,
  Briefcase,
  HandCoins,
  CheckCircle2,
} from 'lucide-react';

/* ================================================================
   HOW IT WORKS — Timeline / Spatial Design
   ================================================================ */

type Role = 'tenant' | 'landlord' | 'agent';

const roles: { key: Role; label: string; description: string; color: string }[] = [
  {
    key: 'tenant',
    label: 'For Tenants',
    description: 'Find your dream home in minutes.',
    color: 'bg-residential-teal',
  },
  {
    key: 'landlord',
    label: 'For Landlords',
    description: 'List once and reach verified tenants.',
    color: 'bg-commercial-gold',
  },
  {
    key: 'agent',
    label: 'For Agents',
    description: 'Broadcast listings and earn more.',
    color: 'bg-primary',
  },
];

const steps: Record<Role, { title: string; description: string; icon: any }[]> = {
  tenant: [
    {
      title: 'Search & Filter',
      description:
        'Browse verified listings refined by price, location, and type.',
      icon: Search,
    },
    {
      title: 'Inspect & Verify',
      description:
        'Book inspections and review digital verification reports safely.',
      icon: ClipboardCheck,
    },
    {
      title: 'Sign & Move In',
      description:
        'Sign agreements online with escrow protection and move in seamlessly.',
      icon: KeyRound,
    },
  ],
  landlord: [
    {
      title: 'Create Listing',
      description:
        'Upload photos, set pricing, and publish your property in minutes.',
      icon: Plus,
    },
    {
      title: 'Get Verified',
      description:
        'Complete our 5-layer verification to build instant tenant trust.',
      icon: ShieldCheck,
    },
    {
      title: 'Collect Rent',
      description:
        'Receive payments via escrow with automated reminders and receipts.',
      icon: Wallet,
    },
  ],
  agent: [
    {
      title: 'Register Profile',
      description:
        'Sign up as an agent, complete KYC, and set your commission terms.',
      icon: UserPlus,
    },
    {
      title: 'Broadcast Listings',
      description:
        'Post properties on your dashboard and share across channels.',
      icon: Briefcase,
    },
    {
      title: 'Close & Earn',
      description:
        'Track leads, convert deals, and get paid upon successful closure.',
      icon: HandCoins,
    },
  ],
};

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<Role>('tenant');

  const currentRoleData = roles.find((r) => r.key === activeRole)!;
  const currentSteps = steps[activeRole];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              How It Works
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              A simple, secure flow for every role
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Whether you're renting, letting, or brokering — our platform keeps you
              protected at every step.
            </p>
          </div>
        </div>
      </section>

      {/* Role selector */}
      <section className="py-10 md:py-14 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((role) => {
              const Icon = role.key === activeRole ? CheckCircle2 : null;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveRole(role.key)}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-card text-sm font-semibold transition-all shadow-sm',
                    activeRole === role.key
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'text-foreground hover:border-primary hover:text-primary'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {role.label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {currentRoleData.description}
          </p>
        </div>
      </section>

      {/* Timeline / Spatial flow */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical timeline spine */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            <div className="space-y-10 md:space-y-16">
              {currentSteps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                return (
                  <div key={step.title} className="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Timeline node */}
                    <div
                      className={cn(
                        'absolute left-6 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-background z-10 border-2 shadow-sm md:-translate-y-1/2',
                        isEven ? 'md:translate-x-8' : 'md:-translate-x-8'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground shadow-md',
                          currentRoleData.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    {/* Card — left on desktop when index is even, right when odd */}
                    <div
                      className={cn(
                        'rounded-xl border border-border bg-card p-6 shadow-1 transition-all hover:shadow-2',
                        'md:text-right',
                        isEven ? 'md:col-start-1' : 'md:col-start-2'
                      )}
                    >
                      <div className="flex items-start gap-4 md:flex-row-reverse">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:hidden">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className={cn('text-left', !isEven && 'md:text-right')}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                            Step {index + 1}
                          </p>
                          <h3 className="text-lg font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className={cn('hidden md:block', isEven ? 'col-start-2' : 'col-start-1')} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Spatial feature band */}
      <section className="py-16 md:py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Why PROPATI
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Design tokens meet real-world trust
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Every step uses our spatial UI system: motion tokens keep flows fluid,
              elevation tokens signal priority, and radius tokens create tactile,
              friendly interfaces.
            </p>

            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Motion',
                  desc: 'cubic-bezier(0.22, 1, 0.36, 1) eases transitions between steps.',
                },
                {
                  title: 'Elevation',
                  desc: 'Depth cues guide attention from primary actions to context.',
                },
                {
                  title: 'Radius',
                  desc: 'Rounded surfaces build approachability and reduce cognitive load.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-xl border border-border bg-background shadow-1"
                >
                  <h3 className="font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to experience the spatial flow?
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of tenants, landlords, and agents already using PROPATI.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
