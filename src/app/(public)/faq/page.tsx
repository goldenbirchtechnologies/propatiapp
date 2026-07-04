'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, ArrowRight, X } from 'lucide-react';

/* ================================================================
   FAQ PAGE — sections: hero, faqAccordion, contactTeaser
   ================================================================ */

const faqs = [
  {
    question: 'How does PROPATI verify property listings?',
    answer:
      'Every listing undergoes a 5-layer verification process including ownership check, physical inspection, document validation, agent accreditation, and landlord identity verification.',
  },
  {
    question: 'Are payments secure on PROPATI?',
    answer:
      'Yes. All payments are held in licensed escrow accounts managed by partner banks. Funds are only released to the landlord after the tenant has confirmed possession.',
  },
  {
    question: 'Who can list a property?',
    answer:
      'Registered landlords, certified real estate agents, and verified estate managers. All parties must complete our KYC process before listing.',
  },
  {
    question: 'Does PROPATI support short-let bookings?',
    answer:
      'Yes. You can search, book, and pay for short-let properties directly on the platform. Booking periods range from 1 night to 6 months.',
  },
  {
    question: 'How do I become a verified landlord?',
    answer:
      'Submit your property documents through the sign-up flow. Our team reviews within 48–72 hours. You will receive a digital verification badge upon approval.',
  },
  {
    question: 'Is PROPATI available outside Lagos?',
    answer:
      'We are currently operational in Lagos, Abuja, and Port Harcourt, with expansion to Ibadan, Enugu, and Calabar planned for 2026.',
  },
  {
    question: 'Can I cancel a booking?',
    answer:
      'Cancellation terms vary by property type. Residential tenancies follow the standard notice period in the signed agreement. Short-let cancellations are governed by the property-specific policy.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach our support team via the contact form on this page, email support@propati.ng, or call +234 800 PROPATI (776 284).',
  },
];

function FAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground hover:bg-accent/50 transition-colors"
      >
        <span className="pr-4">{question}</span>
        <X className={cn('h-5 w-5 transition-transform', isOpen ? 'rotate-45' : '')} />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="px-4 pb-4 text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Frequently Asked Questions
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Answers to common questions
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Get quick answers about listings, payments, verification, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAccordionItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Teaser */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-lg border-border shadow-1 bg-card">
            <CardContent className="py-10 md:py-14 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Still have questions?</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Our support team is available Monday–Saturday, 8am–7pm to help you.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <a href="mailto:support@propati.ng" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  <Mail className="h-4 w-4" /> support@propati.ng
                </a>
                <span className="text-muted-foreground">|</span>
                <a href="tel:+234800776284" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  <Phone className="h-4 w-4" /> +234 800 776 284
                </a>
              </div>
              <div className="mt-8">
                <Button size="lg" className="gap-2">
                  Contact Support <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
