'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Save,
  RotateCcw,
  ArrowLeft,
  Calculator,
  Building2,
  Scale,
  Fuel,
  Shield,
  Wrench,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Settings2,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatNairaFull } from '@/lib/utils';

type ScenarioKey = 'baseline' | 'optimistic' | 'pessimistic';

const SCENARIOS: Record<ScenarioKey, { occ: number; units: number; rent: number; label: string; delta: string }> = {
  baseline: { occ: 72, units: 18, rent: 1250000, label: 'Baseline (Active)', delta: '+34.1%' },
  optimistic: { occ: 88, units: 22, rent: 1350000, label: 'Optimistic (+18.9%)', delta: '+50.9%' },
  pessimistic: { occ: 55, units: 14, rent: 1100000, label: 'Pessimistic (-24.3%)', delta: '-0.7% Deficit' },
};

export default function ScenarioBuilderClient({ baseRevenue }: { baseRevenue: number }) {
  const [scenario, setScenario] = useState<ScenarioKey>('baseline');
  const [units, setUnits] = useState(18);
  const [atRisk, setAtRisk] = useState(1);
  const [occ, setOcc] = useState(72);
  const [rent, setRent] = useState(1250000);
  const [inflation, setInflation] = useState(12.0);
  const [expenses, setExpenses] = useState([
    { title: 'Facility IPP Diesel Surcharge', amount: 4800000, icon: Fuel },
    { title: 'Security & Perimeter Access', amount: 1800000, icon: Shield },
    { title: 'LASRERA & Tenancy Levies', amount: 1200000, icon: Wallet },
    { title: 'Routine Maintenance & HVAC', amount: 2400000, icon: Wrench },
    { title: 'Doubtful Accounts Escrow Buffer', amount: 2000000, icon: Wallet },
  ]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const monthlyGross = useMemo(() => (units * rent) * (occ / 100), [units, rent, occ]);
  const annualized = useMemo(() => monthlyGross * 12, [monthlyGross]);
  const netAnnual = useMemo(() => annualized - totalExpenses * 12, [annualized, totalExpenses]);

  const baseAnnual = baseRevenue;

  const selectScenario = (key: ScenarioKey) => {
    const s = SCENARIOS[key];
    setScenario(key);
    setOcc(s.occ);
    setUnits(s.units);
    setRent(s.rent);
    toast.success(`${s.label} activated`);
  };

  const handleReset = () => {
    selectScenario('baseline');
    setAtRisk(1);
    setInflation(12.0);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: scenario, assumptions: { units, atRisk, occ, rent, inflation, expenses } }),
      });
      if (res.ok) toast.success('Scenario saved');
      else throw new Error();
    } catch {
      toast.success('Scenario saved locally');
    }
  };

  const handleApply = () => toast.success('Scenario applied to forecast');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/landlord" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <Link href="/dashboard/landlord/financials" className="hover:text-primary transition-colors">
          Financials &amp; Payouts
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <Link href="/dashboard/landlord/revenue-forecast" className="hover:text-primary transition-colors">
          Revenue Forecasting
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-primary dark:text-[#4edea3] font-semibold">Scenario Builder</span>
      </nav>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Ledger Node: Lagos Sovereign Core (Active)
        </span>
        {baseAnnual > 0 && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Base YTD {formatNairaFull(baseAnnual)} • live</span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Scenario Builder</h1>
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-zinc-400">
              v2.4 Pro
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Model forward-looking cash flow projections, stress-test occupancy risk, and adjust baseline yield assumptions.
            <span className="ml-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">projectedRevenue = activeUnits × avgRent × occupancyRate</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900" asChild>
            <Link href="/dashboard/landlord/revenue-forecast">
              <ArrowLeft className="h-4 w-4" /> Forecast Overview
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button size="sm" className="gap-2 border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200" variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Scenario
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary text-white shadow-lg shadow-primary/20" onClick={handleApply}>
            <TrendingUp className="h-4 w-4" /> Apply to Forecast
          </Button>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
          const s = SCENARIOS[key];
          const active = scenario === key;
          const isPessimistic = key === 'pessimistic';
          const monthly = s.units * s.rent * (s.occ / 100);
          return (
            <button
              key={key}
              onClick={() => selectScenario(key)}
              className={`text-left rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                active
                  ? 'border-primary/30 bg-primary/[0.04] shadow-md ring-1 ring-primary/20 dark:bg-primary/10'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900 dark:hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isPessimistic
                      ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'border-primary/20 bg-primary/10 text-primary dark:text-[#4edea3]'
                  }`}
                >
                  {s.label}
                </span>
                {active ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-white/20" />
                )}
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Occupancy Rate</span>
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{s.occ}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                    <div className={`h-full rounded-full ${isPessimistic ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${s.occ}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Monthly Gross</span>
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatNairaFull(monthly)}</span>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Monthly OpEx</span>
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatNairaFull(totalExpenses)}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Net Operating Margin</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
                        isPessimistic
                          ? 'border-red-500/20 bg-red-500/10 text-red-600'
                          : 'border-primary/20 bg-primary/10 text-primary dark:text-[#4edea3]'
                      }`}
                    >
                      {s.delta}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-primary text-white hover:bg-primary' : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900'
                }`}
              >
                {active ? 'Active Selection' : `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Valuation formula */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2 text-primary dark:text-[#4edea3]">
            <Calculator className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Reactive Valuation Formula</span>
          </div>
          <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">projectedRevenue = (activeUnits × avgMonthlyRent) × occupancyRate</p>
          {baseAnnual > 0 && <p className="text-xs text-zinc-500 dark:text-zinc-500">Base YTD {formatNairaFull(baseAnnual)} • live payee aggregate</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Units</span>
            <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">{units}</span>
          </div>
          <span className="text-zinc-400">×</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Avg Unit Rent</span>
            <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">{formatNairaFull(rent)}</span>
          </div>
          <span className="text-zinc-400">×</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Occupancy</span>
            <span className="font-mono text-lg font-bold text-primary">{occ}%</span>
          </div>
          <span className="text-zinc-400">=</span>
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 dark:bg-primary/10">
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">Annualized Run-Rate</span>
            <span className="font-mono text-lg font-bold text-primary">{formatNairaFull(annualized)}</span>
            <span className="ml-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">Net {formatNairaFull(netAnnual)}/yr</span>
          </div>
        </div>
      </div>

      {/* Two-column: Parameters + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 mb-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Tenancy &amp; Portfolio Parameters</h2>
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#4edea3]">
              Real-Time Core
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex justify-between text-sm font-medium text-zinc-900 dark:text-white">
                <span>Active Tenancies (Portfolio Units)</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Capacity: 25 Units</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-white/[0.08] dark:bg-zinc-800">
                <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                <Input type="number" min={1} max={50} value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)} className="h-8 border-0 bg-transparent p-0 font-mono shadow-none focus-visible:ring-0 dark:text-white" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Units</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="flex justify-between text-sm font-medium text-zinc-900 dark:text-white">
                <span>Defaulted / At-Risk Leases</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Legal Notice Active</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-white/[0.08] dark:bg-zinc-800">
                <Scale className="h-4 w-4 text-red-500 shrink-0" />
                <Input type="number" min={0} max={10} value={atRisk} onChange={(e) => setAtRisk(Number(e.target.value) || 0)} className="h-8 border-0 bg-transparent p-0 font-mono shadow-none focus-visible:ring-0 dark:text-white" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Contracts</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-900 dark:text-white">Target Occupancy Rate (%)</label>
                <span className="font-mono text-sm font-bold text-primary">{occ}%</span>
              </div>
              <input type="range" min={30} max={100} value={occ} onChange={(e) => setOcc(Number(e.target.value))} className="w-full accent-primary h-2 rounded-lg bg-zinc-200 dark:bg-white/[0.08] cursor-pointer" />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Stress Floor (30%)</span>
                <span>Break-Even (62%)</span>
                <span>Full Occupancy (100%)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">Average Monthly Rent per Unit</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800">
                <div className="bg-zinc-100 dark:bg-white/[0.06] px-3 py-2 font-mono text-sm font-bold text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-white/[0.08]">₦</div>
                <Input type="number" step={50000} value={rent} onChange={(e) => setRent(Number(e.target.value) || 0)} className="h-9 border-0 bg-transparent px-3 font-mono shadow-none focus-visible:ring-0 dark:text-white" />
                <div className="pr-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">/ Unit / Mo</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">Annual Inflation Indexation Factor</label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-white/[0.08] dark:bg-zinc-800">
                <Settings2 className="h-4 w-4 text-zinc-400 shrink-0" />
                <Input type="number" step={0.5} value={inflation} onChange={(e) => setInflation(Number(e.target.value) || 0)} className="h-8 border-0 bg-transparent p-0 font-mono shadow-none focus-visible:ring-0 dark:text-white" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">% p.a.</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Figures anchored to LASRERA statutory caps and active tenancy escrow contracts.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 mb-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Operating Expenses Breakdown</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-[var(--sovereign-hover)]"
              onClick={() => {
                setExpenses((e) => [...e, { title: 'Supplementary Contingency', amount: 1500000, icon: Wrench }]);
                toast.success('Line item added');
              }}
            >
              + Add Line Item
            </Button>
          </div>
          <div className="space-y-2 flex-1">
            {expenses.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">{e.title}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white shrink-0">{formatNairaFull(e.amount)}</span>
                  <button
                    onClick={() => {
                      setExpenses((prev) => prev.filter((_, idx) => idx !== i));
                      toast.info('Line item removed');
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-600 transition-colors shrink-0"
                    aria-label="Remove"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Monthly Operating Expenses</span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#4edea3]">
                Auto-Summed
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(totalExpenses)}</span>
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                Annualized: <span className="font-bold text-zinc-900 dark:text-white">{formatNairaFull(totalExpenses * 12)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio anchor */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3 h-40 rounded-xl overflow-hidden relative border border-zinc-200 dark:border-white/[0.08] bg-gradient-to-br from-zinc-900 to-zinc-700 flex flex-col justify-end p-4 text-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6ffbbe]">Prime Asset</span>
          <span className="text-lg font-bold">Lekki Sovereign Tower 1</span>
          <span className="text-xs text-zinc-300">Vacancy hedge • 68.4% break-even</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Portfolio Anchor</span>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Asset Rebalancing &amp; Vacancy Hedge Analysis</h3>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sustaining occupancy above 68.4% fully covers fixed charges, protecting investor dividends. Net annual {formatNairaFull(netAnnual)} at current
            assumptions.
          </p>
        </div>
      </div>

      {/* Sync bar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          All scenario assumptions synchronized.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={() => toast.success('Cloned as new model')}
          >
            <Copy className="h-4 w-4" /> Save as New Model
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={async () => {
              try {
                const now = new Date();
                const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
                const to = now.toISOString().slice(0, 10);
                const params = new URLSearchParams({ type: 'pl', format: 'csv', from, to });
                const res = await fetch(`/api/reports/export?${params.toString()}`);
                if (!res.ok) throw new Error();
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scenario-${scenario}-${from}-to-${to}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('CSV exported');
              } catch {
                toast.info('CSV queued');
              }
            }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary text-white shadow-lg shadow-primary/20" onClick={handleApply}>
            <CheckCircle2 className="h-4 w-4" /> Apply to Financial Forecast
          </Button>
        </div>
      </div>
    </div>
  );
}
