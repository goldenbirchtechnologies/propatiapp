'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionLabel } from '@/components/ui/section-label';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const offices = [
  { city: 'Lagos (HQ)', address: '15 Akin Adesola Street, Victoria Island, Lagos', phone: '+234 1 234 5678', email: 'lagos@propati.ng' },
  { city: 'Abuja', address: '22 Usuma Street, Maitama, Abuja', phone: '+234 9 888 9999', email: 'abuja@propati.ng' },
  { city: 'Port Harcourt', address: '7 Old Aba Road, GRA Phase 2, Port Harcourt', phone: '+234 84 333 2222', email: 'ph@propati.ng' },
];

export default function ContactUsPage() {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim() || undefined,
      subject: String(fd.get('subject') || '').trim() || undefined,
      message: String(fd.get('message') || '').trim(),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not send message.');
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-black min-h-screen pt-16 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Message sent</h2>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Thank you for contacting PROPATI. Our team will respond within one business day. If you need faster help, email support@propati.ng.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/15 text-white hover:bg-white/10">
              Send another
            </Button>
            <Button asChild>
              <Link href="/listings">Browse listings</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <SectionLabel>Get in touch</SectionLabel>
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
              Let&apos;s talk about your property goals
            </h1>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
              Whether you&apos;re buying, selling, or leasing — our team is ready to assist. Replies within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Offices */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Form */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-lg font-bold text-white">Send a message</h2>
              <p className="mt-1 text-sm text-zinc-500">We read every message. No bots, no auto-replies.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-xs font-medium text-zinc-400">
                      Full name
                    </label>
                    <Input id="name" name="name" required placeholder="Chidi Okafor" className="mt-1 bg-zinc-950 border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-xs font-medium text-zinc-400">
                      Phone <span className="text-zinc-600">(optional)</span>
                    </label>
                    <Input id="phone" name="phone" placeholder="+234 801 234 5678" className="mt-1 bg-zinc-950 border-white/[0.08] text-white" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-zinc-400">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" required placeholder="you@company.com" className="mt-1 bg-zinc-950 border-white/[0.08] text-white" />
                </div>
                <div>
                  <label htmlFor="subject" className="text-xs font-medium text-zinc-400">
                    Subject <span className="text-zinc-600">(optional)</span>
                  </label>
                  <Input id="subject" name="subject" placeholder="Rent enquiry · Partnership · Support" className="mt-1 bg-zinc-950 border-white/[0.08] text-white" />
                </div>
                <div>
                  <label htmlFor="message" className="text-xs font-medium text-zinc-400">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help?"
                    className="mt-1 bg-zinc-950 border-white/[0.08] text-white"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </Button>
                <p className="text-xs text-zinc-600 text-center">
                  By sending this message you agree to our <Link href="/privacy-policy" className="underline hover:text-zinc-400">Privacy Policy</Link>.
                </p>
              </form>
            </div>

            {/* Offices */}
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-white">Offices</h3>
                <div className="mt-4 space-y-5">
                  {offices.map((o) => (
                    <div key={o.city} className="border-b border-white/[0.06] pb-5 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-white">{o.city}</p>
                      <p className="mt-1 flex items-start gap-2 text-sm text-zinc-500 leading-relaxed">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-zinc-600" />
                        {o.address}
                      </p>
                      <p className="mt-1.5 flex items-center gap-2 text-sm text-zinc-500">
                        <Phone className="h-3.5 w-3.5 text-zinc-600" />
                        <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="hover:text-white">
                          {o.phone}
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-zinc-500">
                        <Mail className="h-3.5 w-3.5 text-zinc-600" />
                        <a href={`mailto:${o.email}`} className="hover:text-white">
                          {o.email}
                        </a>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 bg-emerald-950/20 border-emerald-500/15">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Need faster help?</p>
                    <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                      For tenancy, payment, or verification issues, email{' '}
                      <a href="mailto:support@propati.ng" className="text-emerald-400 hover:text-emerald-300">
                        support@propati.ng
                      </a>{' '}
                      — we prioritize active transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

