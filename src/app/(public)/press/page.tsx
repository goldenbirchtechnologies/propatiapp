'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { Download, Mail, ExternalLink, Image as ImageIcon } from 'lucide-react';

const coverage = [
  { outlet: 'TechCabal', title: 'PropatiBox launches verified property marketplace for Lagos', date: 'Jan 2026' },
  { outlet: 'BusinessDay', title: 'How escrow and 5-layer verification are rebuilding trust in Nigerian rentals', date: 'Dec 2025' },
  { outlet: 'Nairametrics', title: 'Proptech in Nigeria: why verified listings matter', date: 'Nov 2025' },
];

export default function PressPage() {
  return (
    <div className="bg-black min-h-screen pt-16">
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>Press</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">Newsroom</h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            The latest from PropatiBox — boilerplate, press kit, and coverage. For media enquiries, reach{' '}
            <a href="mailto:press@propati.ng" className="text-emerald-400 hover:text-emerald-300">
              press@propati.ng
            </a>
            .
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            {/* Boilerplate + kit */}
            <div className="space-y-6">
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-lg font-bold text-white">Boilerplate</h2>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  PropatiBox is Nigeria&apos;s first verified property marketplace. Every listing is verified through a 5-layer process — document, identity, live
                  video, physical inspection, and admin certification — before it earns a certified badge. Payments are held in licensed escrow until
                  handover is confirmed, and tenancy agreements are e-signed and stamped via Remita (FIRS). PropatiBox serves tenants, landlords, agents, and
                  estate managers from a single platform. Founded in Lagos, PropatiBox is registered as PropatiBox Technologies Ltd.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/10">
                    <a href="/brand/propatibox-logo-dark.jpg" download>
                      <Download className="mr-2 h-4 w-4" /> Logo (dark)
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/10">
                    <a href="/brand/propatibox-logo-light.jpg" download>
                      <Download className="mr-2 h-4 w-4" /> Logo (light)
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/10">
                    <a href="mailto:press@propati.ng?subject=Press%20enquiry">
                      <Mail className="mr-2 h-4 w-4" /> Contact press
                    </a>
                  </Button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-zinc-600" /> Brand usage
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-500 leading-relaxed list-disc list-inside">
                  <li>Use PropatiBox in all caps. Do not write &quot;Propati&quot; or &quot;Propatibox&quot;.</li>
                  <li>Primary color is emerald (#10b981). Do not recolor the wordmark.</li>
                  <li>Minimum clear space around the logo is the height of the &quot;P&quot;.</li>
                </ul>
              </div>
            </div>

            {/* Coverage */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white">Coverage</h3>
              <p className="mt-1 text-sm text-zinc-500">Selected press mentions. Full list on request.</p>
              <div className="mt-6 space-y-4">
                {coverage.map((c) => (
                  <div key={c.title} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{c.outlet} · {c.date}</p>
                    <p className="mt-1.5 text-sm font-medium text-white leading-relaxed">{c.title}</p>
                    <a href="#" className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
                      Read <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-200">Are you a journalist?</p>
                <p className="mt-1 text-sm text-amber-200/70 leading-relaxed">
                  Email press@propati.ng with your outlet, deadline, and angle — we respond within one business day and can arrange founder interviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
