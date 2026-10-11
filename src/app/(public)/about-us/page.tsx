'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { ArrowRight, Shield, Users, Heart, Award, MapPin, Building2, Scale, CheckCircle2 } from 'lucide-react';

const teamMembers = [
  { name: 'Chidi Okafor', role: 'Chief Executive Officer', initials: 'CO' },
  { name: 'Amina Bello', role: 'Chief Technology Officer', initials: 'AB' },
  { name: 'Emeka Nwosu', role: 'Head of Operations', initials: 'EN' },
  { name: 'Fatima Yusuf', role: 'General Counsel', initials: 'FY' },
];

const compliancePoints = [
  { title: 'NDPR Compliant', description: 'Registered and compliant with the Nigeria Data Protection Regulation (NDPR) 2019.' },
  { title: 'FIRS Integrated', description: 'Stamp duty remittance via Remita — the official FIRS/GIFMIS gateway (Stamp Duties Act, CAP S8).' },
  { title: 'Escrow Protected', description: 'Rent and deposits held in licensed escrow until tenancy conditions are met — not released on a timer.' },
  { title: '5-Layer Verification', description: 'Document, identity, live video, physical inspection, and admin certification before a listing is certified.' },
];

export default function AboutUsPage() {
  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <SectionLabel>About PropatiBox</SectionLabel>
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
              Building trust in Nigerian property transactions
            </h1>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
              PropatiBox connects tenants, landlords, agents, and estate managers through verified listings, escrow-backed payments, and legally sound tenancy agreements — so no one rents blind.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/listings">
                  Browse verified listings <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/contact-us">Talk to us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <SectionLabel>Our mission</SectionLabel>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-white tracking-tight">Secure, transparent, and accessible for every Nigerian</h2>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Fraud and misrepresentation are the country&apos;s top property risks. PropatiBox was built to close that gap — not with slogans, but with verification, escrow, and enforceable agreements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">For tenants</h3>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">Verified listings, vetted landlords, and rent collection that creates a receipt ┬ÌÌÑ a dispute.</p>
            </div>
            <div className="glass-card p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">For landlords</h3>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">Identity-verified tenants, stamp-duty-compliant agreements, and escrow until handover is confirmed.</p>
            </div>
            <div className="glass-card p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">For the market</h3>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">A single source of truth where a certified badge actually means something.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Leadership</h2>
            <p className="mt-2 text-sm text-zinc-500">Operators from property, engineering, and legal — not a stock-photo team.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((m) => (
              <div key={m.name} className="glass-card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-white/[0.08] text-white font-semibold">
                  {m.initials}
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{m.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 md:py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Built for compliance</h2>
            <p className="mt-2 text-sm text-zinc-500">Trust is a legal standard, not a marketing word. Every flow is mapped to it.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {compliancePoints.map((c) => (
              <div key={c.title} className="glass-card p-5 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Address + CTA */}
      <section className="py-12 md:py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <MapPin className="h-3.5 w-3.5" /> Lagos · Nigeria
              </div>
              <h3 className="mt-2 text-lg font-bold text-white">PropatiBox Technologies Ltd.</h3>
              <p className="mt-1 text-sm text-zinc-500">15 Akin Adesola Street, Victoria Island, Lagos.</p>
              <p className="text-sm text-zinc-500">support@propati.ng · dpo@propati.ng</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link href="/contact-us">Contact us</Link></Button>
              <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
                <Link href="/verification">How verification works</Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> CAC Registered</span>
            <span className="inline-flex items-center gap-1.5"><Scale className="h-3.5 w-3.5" /> Stamp Duties Act, CAP S8</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> NDPA 2023</span>
          </div>
        </div>
      </section>
    </div>
  );
}
