'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { Search, ShieldCheck, Home, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    n: '01',
    title: 'Search & shortlist',
    desc: 'Browse verified listings with photos, floor plans, and virtual tours. Filter by budget, area, and verification tier — certified listings surface first.',
    icon: Search,
    cta: { label: 'Browse listings', href: '/listings' },
    bullets: ['Photos + floor plans + video', 'Certified / verified / inspected badges', 'Save and compare up to 3 properties'],
  },
  {
    n: '02',
    title: 'Verify & agree',
    desc: 'Message landlords or agents directly, schedule viewings, and submit applications. When both sides agree, e-sign a stamp-duty-compliant tenancy agreement via Remita.',
    icon: ShieldCheck,
    cta: { label: 'How verification works', href: '/verification' },
    bullets: ['5-layer verification (document → certified)', 'In-app messaging, no middleman', 'E-signature + FIRS stamp certificate'],
  },
  {
    n: '03',
    title: 'Move in, pay with escrow',
    desc: 'Pay rent into escrow — funds are released only when handover is confirmed. Get receipts, rent schedules, and maintenance tracking in one dashboard.',
    icon: Home,
    cta: { label: 'How agreements work', href: '/agreements' },
    bullets: ['Escrow until handover confirmed', 'Automated receipts + rent schedule', 'Maintenance & turnover in one place'],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-black min-h-screen pt-16">
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>How it works</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">Renting reimagined — from search to keys</h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            A seamless, transparent process built for Nigeria. Three steps, one place — whether you rent, own, manage, or transact.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass-card p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white/[0.06]">{s.n}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed flex-1">{s.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-zinc-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-5 border-white/10 text-white hover:bg-white/10">
                  <Link href={s.cta.href}>
                    {s.cta.label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { role: 'Tenant', desc: 'Find verified homes, pay rent securely, track your lease lifecycle.', cta: 'Find a home', href: '/listings?listingType=rent' },
              { role: 'Landlord', desc: 'List property, verify tenants, collect rent in one place.', cta: 'List a property', href: '/signup?role=landlord' },
              { role: 'Agent', desc: 'Showcase listings, schedule viewings, close deals faster.', cta: 'Get started', href: '/signup?role=agent' },
            ].map((card) => (
              <div key={card.role} className="glass-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{card.role}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href={card.href}>{card.cta} →</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
