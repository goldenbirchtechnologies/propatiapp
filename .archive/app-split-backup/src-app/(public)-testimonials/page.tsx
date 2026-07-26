'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, Quote } from 'lucide-react';

/* ================================================================
   TESTIMONIALS PAGE — sections: hero, testimonialGrid, ctaBand
   ================================================================ */

const testimonials = [
  {
    name: 'Ngozi Eze',
    role: 'Tenant, Lekki',
    initials: 'NE',
    rating: 5,
    text: 'PROPATI made my apartment search so easy. Verified listings saved me from paying broker fees for fake listings. I signed my lease in 2 days.',
  },
  {
    name: 'Ibrahim Suleiman',
    role: 'Landlord, Abuja',
    initials: 'IS',
    rating: 5,
    text: 'As a landlord, I get verified tenants fast. The escrow payment means I know the money is secured before handing over keys.',
  },
  {
    name: 'Chioma Nwosu',
    role: 'Agent, Lagos',
    initials: 'CN',
    rating: 5,
    text: 'The agent dashboard is powerful. I can track pipeline, manage clients, and receive commission payouts directly through the platform.',
  },
  {
    name: 'Oluwaseun Adeyemi',
    role: 'Estate Manager, PH',
    initials: 'OA',
    rating: 4,
    text: 'Managing 120 units used to be a nightmare. PROPATI centralizes maintenance requests, payments, and document storage for every unit.',
  },
  {
    name: 'Fatima Ibrahim',
    role: 'Tenant, Abuja',
    initials: 'FI',
    rating: 5,
    text: 'Short-let booking was seamless. The property was exactly as shown, and payment was released to the owner only after I confirmed everything was fine.',
  },
  {
    name: 'Emeka Okonkwo',
    role: 'Landlord, Enugu',
    initials: 'EO',
    rating: 5,
    text: 'I listed my duplex and got a tenant within a week. The verification badge on my listing built immediate trust.',
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Testimonials
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Trusted by thousands across Nigeria
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Hear from tenants, landlords, agents, and estate managers who use PROPATI every day.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="rounded-lg border-border shadow-1 bg-card flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col">
                  <Quote className="h-6 w-6 text-primary/40 mb-4" />
                  <p className="text-foreground leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < t.rating ? 'text-secondary fill-secondary' : 'text-muted-foreground'
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to share your story?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            Join the PROPATI community and experience property the way it should be.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
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
