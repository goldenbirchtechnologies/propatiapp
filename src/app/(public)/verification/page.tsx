'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { ArrowRight, FileCheck, Fingerprint, Video, MapPin, Award, Shield, CheckCircle2, Clock } from 'lucide-react';

const layers = [
  {
    n: 1,
    title: 'Document Verification',
    tier: 'basic → verified',
    icon: FileCheck,
    status: 'l1Status',
    requires: ['Certificate of Occupancy (C of O) or Deed of Assignment', 'Building plan / survey plan', 'Tax clearance (where applicable)', 'Government-issued ID of owner'],
    proves: 'The property exists on paper and the submitter has a claim to it.',
  },
  {
    n: 2,
    title: 'Identity Match',
    tier: 'verified',
    icon: Fingerprint,
    status: 'l2Status',
    requires: ['NIN or BVN via Prembly — name match against document owner', 'Selfie liveness check'],
    proves: 'The person submitting documents is who they claim to be.',
  },
  {
    n: 3,
    title: 'Live Video Walkthrough',
    tier: '—',
    icon: Video,
    status: 'l3Status',
    requires: ['Guided video tour inside and around the property', 'QR anti-spoof check (l3QrCode)'],
    proves: 'The listing matches the real unit — not a reused photo set.',
  },
  {
    n: 4,
    title: 'Physical Inspection',
    tier: 'inspected',
    icon: MapPin,
    status: 'l4Status',
    requires: ['PropatiBox agent visit (scheduled via l4ScheduledAt)', 'On-site photos + inspection report (l4ReportUrl)', 'Agent sign-off (l4AgentId)'],
    proves: 'A trained inspector physically stood in the property and confirmed it.',
  },
  {
    n: 5,
    title: 'Admin Certification',
    tier: 'certified',
    icon: Award,
    status: 'l5Status',
    requires: ['Review of bundled L1–L4 evidence', 'Overall status → certified, priority placement, badge'],
    proves: 'PropatiBox stakes its name on the listing. Certified listings carry a verifiable badge.',
  },
];

export default function VerificationPage() {
  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0, 108, 73,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>Trust</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
            5 layers. One certified badge.
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Every certified listing on PropatiBox passes the same gauntlet — document, identity, video, inspection, and admin review. No layer can be skipped.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/listings?verificationTier=certified">
                View certified listings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/listings">Browse all listings</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {['basic', 'verified', 'inspected', 'certified'].map((tier) => (
              <span key={tier} className="px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-400 capitalize">
                {tier}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Layers */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">How verification works</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Progress is tracked as <code className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300">currentLayer 1→5</code> and{' '}
              <code className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300">overallStatus</code> (not_started, in_progress, certified, rejected, frozen). Each layer&apos;s
              status is <code className="px-1 py-0.5 rounded bg-white/[0.06] text-zinc-300">pending / approved / rejected</code>.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {layers.map((layer) => (
              <div key={layer.n} className="glass-card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[#4edea3]">
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">Layer {layer.n}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{layer.title}</h3>
                <p className="mt-1 text-xs font-medium text-[#4edea3]">{layer.tier}</p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Requires</p>
                  <ul className="space-y-1.5">
                    {layer.requires.map((r) => (
                      <li key={r} className="flex gap-2 text-sm text-zinc-400 leading-relaxed">
                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-lg bg-primary/30 border border-primary/15 p-3">
                  <p className="text-xs font-semibold text-[#6ffbbe] flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Proves
                  </p>
                  <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{layer.proves}</p>
                </div>

                <p className="mt-3 text-[11px] font-mono text-zinc-600">
                  {layer.status} · currentLayer {layer.n}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Rejected or frozen?</p>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed max-w-xl">
                  A rejected layer can be resubmitted. A frozen verification is locked by an admin (see <code className="px-1 py-0.5 rounded bg-white/[0.06] text-zinc-300">frozenReason</code>) and requires support.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10 shrink-0">
              <Link href="/contact-us">Contact support</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/listings?verificationTier=certified">
                Browse certified <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/about-us">Why we built this</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
