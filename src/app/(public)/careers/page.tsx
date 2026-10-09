'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { MapPin, Clock, ArrowRight, Mail } from 'lucide-react';

const roles = [
  {
    title: 'Senior Frontend Engineer',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    team: 'Engineering',
    desc: 'Own the listings, verification, and agreements surfaces in Next.js 14 (App Router). You ship accessible, performant UI on a Vercel Dark system.',
  },
  {
    title: 'Product Designer',
    location: 'Lagos · Remote',
    type: 'Full-time',
    team: 'Design',
    desc: 'Design the trust layer — verification flows, escrow states, and tenancy journeys for 5 roles. Systems thinking over dribbble shots.',
  },
  {
    title: 'Operations Associate — Verification',
    location: 'Abuja · On-site',
    type: 'Full-time',
    team: 'Operations',
    desc: 'Run the 5-layer verification pipeline: document review, identity checks, and inspection scheduling. Detail-obsessed.',
  },
  {
    title: 'Growth & Partnerships Lead',
    location: 'Lagos · Hybrid',
    type: 'Full-time',
    team: 'Growth',
    desc: 'Bring landlords, agents, and estate managers onto PROPATI. You understand Nigerian property and can sell trust.',
  },
];

export default function CareersPage() {
  return (
    <div className="bg-black min-h-screen pt-16">
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>Careers</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">Build the verified marketplace</h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            We&apos;re a small team fixing Nigerian property&apos;s trust problem. If you care about craft, compliance, and doing right by users — we want to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="mailto:careers@propati.ng?subject=Application">
                Send your CV <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/about-us">About PROPATI</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Open roles</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Don&apos;t see your role? Email{' '}
              <a href="mailto:careers@propati.ng" className="text-emerald-400 hover:text-emerald-300">
                careers@propati.ng
              </a>{' '}
              with your CV and a note on what you&apos;d own.
            </p>
          </div>

          <div className="grid gap-4">
            {roles.map((r) => (
              <div key={r.title} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{r.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-zinc-400">{r.team}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed max-w-2xl">{r.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {r.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {r.type}
                    </span>
                  </div>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <a href={`mailto:careers@propati.ng?subject=Application:%20${encodeURIComponent(r.title)}`}>Apply</a>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">General application</p>
              <p className="mt-1 text-sm text-zinc-500">No perfect fit? We still want to meet exceptional people.</p>
            </div>
            <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <a href="mailto:careers@propati.ng?subject=General%20application">
                <Mail className="mr-2 h-4 w-4" /> Email us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
