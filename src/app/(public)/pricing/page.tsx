'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

/* ================================================================
   PRICING PAGE — sections: hero, pricingToggle, pricingTable, faqTeaser, ctaBand
   ================================================================ */

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual landlords getting started.',
    monthlyPrice: 2500,
    annualPrice: 25000,
    highlight: false,
    features: [
      'Up to 2 active listings',
      'Basic verification',
      'Standard inbox support',
      'In-platform messaging',
      'Rent reminder emails',
    ],
  },
  {
    name: 'Professional',
    description: 'For active landlords and small estate managers.',
    monthlyPrice: 8500,
    annualPrice: 85000,
    highlight: true,
    features: [
      'Up to 12 active listings',
      'Priority verification',
      '24/7 phone support',
      'Escrow payment collection',
      'Analytics dashboard',
      'Bulk rent reminders',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Large portfolios, agencies, and corporate housing.',
    monthlyPrice: 25000,
    annualPrice: 250000,
    highlight: false,
    features: [
      'Unlimited listings',
      'Certified verification',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      'On-site onboarding',
      'SLA guarantee',
    ],
  },
];

const faqTeaserItems = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'Is there a free trial?', a: 'Professional and Enterprise plans include a 14-day trial with full feature access. No credit card required.' },
  { q: 'What payment methods are accepted?', a: 'Bank transfers, debit cards, and USSD via Paystack and Flutterwave.' },
];

function PricingToggle({
  value,
  onChange,
}: {
  value: 'monthly' | 'annual';
  onChange: (v: 'monthly' | 'annual') => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          value === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('annual')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          value === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Annual
        <span className="ml-2 text-xs text-secondary font-semibold">Save 17%</span>
      </button>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Pricing
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              No hidden charges. Choose the plan that fits your property portfolio.
            </p>
            <div className="mt-8">
              <PricingToggle value={billing} onChange={setBilling} />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const period = billing === 'monthly' ? '/month' : '/year';
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    'rounded-lg border-border shadow-1 bg-card flex flex-col',
                    plan.highlight && 'border-2 border-primary relative'
                  )}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <CardContent className="pt-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-6">
                      <span className="text-3xl font-bold text-foreground">₦{price.toLocaleString()}</span>
                      <span className="text-muted-foreground">{period}</span>
                    </div>
                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full"
                      variant={plan.highlight ? 'default' : 'secondary'}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">Pricing FAQs</h2>
            <div className="mt-10 space-y-4">
              {faqTeaserItems.map((item) => (
                <Card key={item.q} className="rounded-lg border-border shadow-1 bg-card">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="secondary" className="gap-2">
                View All FAQs <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to grow your property business?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            Join 50,000+ users who trust PROPATI for verified listings and secure payments.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
