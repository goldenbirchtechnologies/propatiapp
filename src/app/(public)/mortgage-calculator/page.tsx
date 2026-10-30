'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/utils';
import { Calculator, Share2, Home, ArrowRight } from 'lucide-react';

export default function MortgageCalculatorPage() {
  const [price, setPrice] = React.useState(50000000);
  const [downPayment, setDownPayment] = React.useState(10000000);
  const [annualRate, setAnnualRate] = React.useState(18);
  const [years, setYears] = React.useState(20);

  const principal = Math.max(0, price - downPayment);
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;

  const monthlyPayment = React.useMemo(() => {
    if (principal <= 0 || n <= 0) return 0;
    if (monthlyRate === 0) return principal / n;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }, [principal, monthlyRate, n]);

  const totalPayment = monthlyPayment * n + downPayment;
  const totalInterest = monthlyPayment * n - principal;

  const share = async () => {
    const url = window.location.href;
    const text = `Mortgage estimate: ${formatNaira(Math.round(monthlyPayment))}/mo for ${formatNaira(price)} at ${annualRate}% over ${years}y`;
    try {
      if (navigator.share) await navigator.share({ title: 'PropatiBox Mortgage Estimate', text, url });
      else await navigator.clipboard.writeText(`${text} — ${url}`);
    } catch {}
  };

  return (
    <div className="bg-black min-h-screen pt-16">
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0, 108, 73,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 relative">
          <SectionLabel>Tools</SectionLabel>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">Mortgage calculator</h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Estimate monthly repayments for a Nigerian property purchase. Purely client-side — no data leaves your browser.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Controls */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#4edea3]" /> Your loan
              </h2>

              <div>
                <label htmlFor="price" className="text-xs font-medium text-zinc-400">
                  Property price (₦)
                </label>
                <Input
                  id="price"
                  type="range"
                  min={1000000}
                  max={500000000}
                  step={1000000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-2"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{formatNaira(price)}</span>
                  <span className="text-xs text-zinc-600">₦1M — ₦500M</span>
                </div>
              </div>

              <div>
                <label htmlFor="down" className="text-xs font-medium text-zinc-400">
                  Down payment (₦)
                </label>
                <Input
                  id="down"
                  type="range"
                  min={0}
                  max={price}
                  step={500000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="mt-2"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{formatNaira(downPayment)}</span>
                  <span className="text-xs text-zinc-600">{price > 0 ? Math.round((downPayment / price) * 100) : 0}% down</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rate" className="text-xs font-medium text-zinc-400">
                    Interest (annual %)
                  </label>
                  <Input
                    id="rate"
                    type="range"
                    min={1}
                    max={40}
                    step={0.5}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="mt-2 text-sm font-semibold text-white">{annualRate}%</p>
                </div>
                <div>
                  <label htmlFor="years" className="text-xs font-medium text-zinc-400">
                    Loan term (years)
                  </label>
                  <Input
                    id="years"
                    type="range"
                    min={1}
                    max={35}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="mt-2 text-sm font-semibold text-white">{years} years</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Formula: <code className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400">M = P·r(1+r)ⁿ / ((1+r)ⁿ − 1)</code> where P is principal, r is monthly
                rate, n is months. Uses the same math as the archived calculator — no server call.
              </p>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="glass-card p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Estimated monthly payment</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-white">{formatNaira(Math.round(monthlyPayment))}</p>
                <p className="mt-1 text-xs text-zinc-600">Principal {formatNaira(principal)} · {n} payments</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-zinc-500">Total paid</p>
                    <p className="mt-1 text-sm font-bold text-white">{formatNaira(Math.round(totalPayment))}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-zinc-500">Total interest</p>
                    <p className="mt-1 text-sm font-bold text-white">{formatNaira(Math.round(totalInterest))}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={share} variant="outline" className="border-white/15 text-white hover:bg-white/10 gap-2">
                    <Share2 className="h-4 w-4" /> Share estimate
                  </Button>
                  <Button asChild>
                    <Link href="/listings">
                      <Home className="mr-2 h-4 w-4" /> Browse listings
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-white">What this doesn&apos;t include</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-zinc-500 leading-relaxed list-disc list-inside">
                  <li>Stamp duty (0.78% of annual rent for tenancies) — see <Link href="/agreements" className="text-[#4edea3] hover:text-[#6ffbbe]">Agreements</Link>.</li>
                  <li>Agency, legal, and valuation fees.</li>
                  <li>NHF / PMB-specific terms — confirm with your lender.</li>
                </ul>
                <p className="mt-4 text-xs text-zinc-600">This is an estimate, not a loan offer. PropatiBox does not originate mortgages.</p>
              </div>

              <div className="glass-card p-5 flex items-center justify-between">
                <p className="text-sm text-zinc-400">Found a property you like?</p>
                <Button asChild size="sm">
                  <Link href="/listings">
                    View listings <ArrowRightIcon />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowRightIcon() {
  return <ArrowRight className="ml-1 h-3.5 w-3.5" />;
}
