'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/utils';

function calculateStampDuty(annualRent: number): number {
  if (annualRent <= 10000) return 0;
  return Math.max(annualRent * 0.0078, 500);
}
import { ArrowRight, ScrollText, Shield, FileCheck, PenLine, Calendar, Receipt, AlertCircle } from 'lucide-react';

export default function AgreementsPage() {
  const [annualRent, setAnnualRent] = React.useState<string>('1200000');
  const n = Number(annualRent.replace(/,/g, '')) || 0;
  const duty = calculateStampDuty(n);

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>Legal</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
            Tenancy agreements, legally stamped
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Every PROPATI tenancy agreement is e-signed by landlord and tenant, then stamped via Remita — the official FIRS/GIFMIS gateway — with an e-certificate embedded in the document.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard/tenant/agreements">
                My agreements <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What the law says + calculator */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ScaleIcon />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Stamp Duties Act, CAP S8 LFN 2004</h2>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    Tenancy agreements for annual rent above ₦10,000 attract stamp duty at <span className="text-white font-semibold">0.78% of annual rent</span>, with a minimum of{' '}
                    <span className="text-white font-semibold">₦500</span>. At or below ₦10,000, duty is ₦0. PROPATI calculates this automatically — you don&apos;t need a manual table.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'Rate', v: '0.78%' },
                  { k: 'Minimum', v: '₦500' },
                  { k: 'Threshold', v: '₦10,000 (zero below)' },
                ].map((item) => (
                  <div key={item.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{item.k}</p>
                    <p className="mt-1 text-sm font-bold text-white">{item.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/90 leading-relaxed">
                  Duty is on <span className="font-semibold">annual rent</span> — not monthly, not total lease value. PROPATI always annualizes before computing.
                </p>
              </div>
            </div>

            {/* Live calculator */}
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                Stamp duty calculator
              </h3>
              <p className="mt-1 text-sm text-zinc-500">Preview what will be charged at signing. Uses the same function as the real flow.</p>

              <label htmlFor="annualRent" className="mt-6 block text-xs font-medium text-zinc-400">
                Annual rent (₦)
              </label>
              <Input
                id="annualRent"
                inputMode="numeric"
                value={annualRent}
                onChange={(e) => setAnnualRent(e.target.value.replace(/[^0-9,]/g, ''))}
                placeholder="1,200,000"
                className="mt-1 bg-zinc-950 border-white/[0.08] text-white"
              />
              <p className="mt-1.5 text-xs text-zinc-600">Tip: try 10,000 vs 10,001 to see the threshold, or 50,000 to see the ₦500 minimum.</p>

              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Stamp duty payable</p>
                <p className="mt-1 text-2xl font-bold text-white">{duty === 0 ? '₦0' : formatNaira(duty)}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {n <= 10000
                    ? 'No duty — at or below the ₦10,000 threshold.'
                    : duty === 500
                      ? 'Minimum duty applies (₦500).'
                      : '0.78% of annual rent.'}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold text-zinc-400">How it&apos;s paid</p>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                  Via Remita (SystemSpecs) — the FIRS/GIFMIS gateway. PROPATI generates an RRR, you pay through Remita, and the e-certificate{' '}
                  <code className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300">FIRS-SD-…</code> is embedded in your agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="py-12 md:py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Agreement lifecycle</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
            From draft to fully signed — each step is recorded with who signed, when, from which IP, and a SHA-256 checksum.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { step: 'Draft', desc: 'Landlord creates agreement from a verified listing.' },
              { step: 'Pending landlord', desc: 'Landlord reviews and signs first.' },
              { step: 'Pending tenant', desc: 'Tenant reviews rent, schedule, and clauses.' },
              { step: 'Tenant signed', desc: 'Tenant e-signs (consent text + IP + UA recorded).' },
              { step: 'Landlord signed', desc: 'Landlord countersigns.' },
              { step: 'Fully signed', desc: 'Both parties signed. Stamp duty + certificate follow.' },
            ].map((s, i) => (
              <div key={s.step} className="glass-card p-5">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{s.step}</p>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: PenLine, title: 'E-signature', desc: 'Typed consent + SHA-256 hash + IP/UA + timestamp. Tamper-evident.' },
              { icon: Shield, title: 'Escrow', desc: 'Rent held until handover is confirmed — not released on a timer.' },
              { icon: FileCheck, title: 'Rent schedule', desc: 'Prorated schedule generated from start date and tenancy length.' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-5 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Endorsement preview */}
          <div className="mt-8 rounded-xl border-2 p-6" style={{ borderColor: '#1a5276', background: '#eaf4fb' }}>
            <h3 className="text-center text-sm font-bold tracking-[0.2em] text-[#1a5276]">ELECTRONIC STAMP DUTY CERTIFICATE — PREVIEW</h3>
            <div className="mt-4 grid gap-2 text-sm" style={{ color: '#1a5276' }}>
              <div className="flex justify-between border-b border-[#1a5276]/10 py-2">
                <span className="font-semibold text-zinc-600">Certificate Number:</span>
                <span className="font-mono font-bold">FIRS-SD-XXXX-XXXX-NG</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-zinc-600">Amount Paid:</span>
                <span className="font-bold">{duty === 0 ? '₦0' : formatNaira(duty)}</span>
              </div>
              <div className="flex justify-between border-t border-[#1a5276]/10 py-2">
                <span className="font-semibold text-zinc-600">Verify Online:</span>
                <span className="text-xs underline">firs.gov.ng/verify</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs italic text-zinc-500">Duly stamped in accordance with the Stamp Duties Act, CAP S8, LFN 2004</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/listings">Find a verified property</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10">
              <Link href="/verification">How verification works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScaleIcon() {
  return <ScrollText className="h-5 w-5" />;
}
