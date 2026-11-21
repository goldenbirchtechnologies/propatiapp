'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/utils';
import { Calculator, Share2, Home, ArrowRight } from 'lucide-react';
import { MortgageFinancingDirectory } from '@/components/financials/MortgageFinancingDirectory';

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
    try { if (navigator.share) await navigator.share({ title: 'PropatiBox Mortgage Estimate', text, url }); else await navigator.clipboard.writeText(`${text} - ${url}`); } catch { void 0; }
  };

  return <div className="mortgage-calculator-page min-h-screen bg-black pt-16">
    <section className="relative overflow-hidden border-b border-white/[0.08]"><div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" /><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,108,73,0.12),transparent_60%)]" /><div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16"><SectionLabel>Tools</SectionLabel><h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">Mortgage Calculator</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">Calculate your monthly home loan repayments, estimate what you can afford, and explore mortgage financing options available in Nigeria.</p></div></section>
    <section className="py-12 md:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-card space-y-6 p-6 md:p-8"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><Calculator className="h-4 w-4 text-[#4edea3]" /> Your loan</h2><RangeField id="price" label="Property price (₦)" value={price} min={1000000} max={500000000} step={1000000} display={formatNaira(price)} hint="₦1M to ₦500M" onChange={setPrice} /><RangeField id="down" label="Down payment (₦)" value={downPayment} min={0} max={price} step={500000} display={formatNaira(downPayment)} hint={`${price > 0 ? Math.round((downPayment / price) * 100) : 0}% down`} onChange={setDownPayment} /><div className="grid gap-4 sm:grid-cols-2"><RangeField id="rate" label="Interest (annual %)" value={annualRate} min={1} max={40} step={0.5} display={`${annualRate}%`} onChange={setAnnualRate} /><RangeField id="years" label="Loan term (years)" value={years} min={1} max={35} step={1} display={`${years} years`} onChange={setYears} /></div><p className="text-xs leading-relaxed text-zinc-500">Your estimate updates instantly. The calculation is client-side and no loan application data leaves your browser.</p></div>
      <div className="space-y-4"><div className="glass-card p-6 md:p-8"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Estimated monthly payment</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{formatNaira(Math.round(monthlyPayment))}</p><p className="mt-1 text-xs text-zinc-500">Principal {formatNaira(principal)} · {n} payments</p><div className="mt-6 grid grid-cols-2 gap-3"><Metric label="Total repayment" value={formatNaira(Math.round(totalPayment))} /><Metric label="Total interest" value={formatNaira(Math.round(totalInterest))} /><Metric label="Down payment" value={formatNaira(Math.round(downPayment))} /><Metric label="Loan to value" value={`${price > 0 ? Math.round((principal / price) * 100) : 0}%`} /></div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={share} variant="outline" className="gap-2 border-white/15 text-white hover:bg-white/10"><Share2 className="h-4 w-4" /> Share estimate</Button><Button asChild><Link href="/listings"><Home className="mr-2 h-4 w-4" /> Browse listings</Link></Button></div></div><div className="glass-card p-5"><h3 className="text-sm font-semibold text-white">Keep in mind</h3><p className="mt-2 text-xs leading-relaxed text-zinc-500">Estimates are for informational purposes only. Actual repayment terms, fees, insurance, rates and eligibility depend on the lender. Propatibox does not originate mortgages.</p></div></div>
    </div></div></section>
    <MortgageFinancingDirectory />
    <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6"><div className="glass-card flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center"><p className="text-sm text-zinc-400">Found a property you like?</p><Button asChild size="sm"><Link href="/listings">View listings <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button></div></div>
  </div>;
}

function RangeField({ id, label, value, min, max, step, display, hint, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; display: string; hint?: string; onChange: (value: number) => void }) { return <div><label htmlFor={id} className="text-xs font-medium text-zinc-400">{label}</label><Input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2" /><div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold text-white">{display}</span>{hint && <span className="text-xs text-zinc-500">{hint}</span>}</div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-sm font-bold text-white">{value}</p></div>; }
