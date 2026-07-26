'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, Shield, Award, ArrowRight, Heart } from 'lucide-react';

/* ================================================================
   ABOUT US PAGE — sections: hero, mission, team, compliance, ctaBand
   ================================================================ */

const teamMembers = [
  { name: 'Chidi Okafor', role: 'Chief Executive Officer', initials: 'CO' },
  { name: 'Amina Bello', role: 'Chief Technology Officer', initials: 'AB' },
  { name: 'Emeka Nwosu', role: 'Head of Operations', initials: 'EN' },
  { name: 'Fatima Yusuf', role: 'General Counsel', initials: 'FY' },
];

const compliancePoints = [
  { title: 'NBA Regulated', description: 'Operates in full compliance with Nigerian Bar Association property practice guidelines.' },
  { title: 'FIRS Registered', description: 'Tax-compliant platform with full remittance to Federal Inland Revenue Service.' },
  { title: 'Escrow Protected', description: 'All payments held in licensed escrow until tenancy agreement is fulfilled.' },
  { title: 'Verified Landlords', description: '5-layer identity and property verification for every registered landlord and agent.' },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              About PROPATI
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Building trust in Nigerian property transactions
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              PROPATI connects tenants, landlords, agents, and estate managers through secure, verified, and transparent property dealings.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Stats */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              We make property leasing and sales secure, transparent, and accessible for every Nigerian.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, label: '50,000+ Users', sub: 'Trusted nationwide' },
              { icon: Shield, label: '12,000+ Verified Listings', sub: 'Multi-layer checks' },
              { icon: Award, label: '99.8% Satisfaction', sub: 'Across all roles' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-lg border-border shadow-1 bg-card text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-foreground">{stat.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Leadership Team</h2>
            <p className="mt-3 text-muted-foreground">Experienced professionals driving change across proptech.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="rounded-lg border-border shadow-1 bg-raised text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground font-bold text-lg">
                    {member.initials}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">Regulatory Compliance</h2>
            <p className="mt-3 text-muted-foreground text-center">
              PROPATI is built on a foundation of legal and operational integrity.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {compliancePoints.map((point) => (
                <Card key={point.title} className="rounded-lg border-border shadow-1 bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground">{point.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to experience secure property?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of Nigerians who trust PROPATI for their property needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Searching <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
