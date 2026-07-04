'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Send, Loader2, X } from 'lucide-react';

/* ================================================================
   CONTACT US PAGE — sections: hero, contactForm, offices, mapTeaser
   ================================================================ */

const offices = [
  { city: 'Lagos', address: '15 Akin Adesola Street, Victoria Island, Lagos', phone: '+234 1 234 5678', email: 'lagos@propati.ng' },
  { city: 'Abuja', address: '22 Usuma Street, Maitama, Abuja', phone: '+234 9 888 9999', email: 'abuja@propati.ng' },
  { city: 'Port Harcourt', address: '7 Old Aba Road, GRA Phase 2, PH', phone: '+234 84 333 2222', email: 'ph@propati.ng' },
];

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-lg border-border shadow-1 bg-card">
          <CardContent className="pt-6 text-center">
            <Send className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground">Message Sent</h2>
            <p className="mt-2 text-muted-foreground">
              Thank you for contacting PROPATI. Our team will get back to you within 24 hours.
            </p>
            <Button className="mt-6" onClick={() => { setSubmitted(false); }}>
              Send Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Contact Us
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Let&apos;s talk about your property goals
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Whether you&apos;re buying, selling, or leasing, our team is ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form + Offices */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <Card className="rounded-lg border-border shadow-1 bg-card">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Send us a message</h2>
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <X className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <form action={handleSubmit} className="space-y-4">
                  <div>
                    <Input name="name" placeholder="Your full name" required className="h-11" />
                  </div>
                  <div>
                    <Input name="email" type="email" placeholder="Email address" required className="h-11" />
                  </div>
                  <div>
                    <Input name="phone" type="tel" placeholder="Phone number" className="h-11" />
                  </div>
                  <div>
                    <Textarea name="message" placeholder="How can we help?" rows={5} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Offices */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Our Offices</h2>
              <div className="space-y-4">
                {offices.map((office) => (
                  <Card key={office.city} className="rounded-lg border-border shadow-1 bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground">{office.city}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{office.address}</p>
                          <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{office.phone}</span>
                            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{office.email}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Teaser */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-lg border-border shadow-1 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="h-64 md:h-80 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-semibold text-foreground">Lagos · Abuja · Port Harcourt</p>
                  <p className="text-sm text-muted-foreground mt-1">Strategic locations across Nigeria</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
