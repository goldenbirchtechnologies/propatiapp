'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, Save, RotateCcw, ArrowLeft, Functions, Apartment, Gavel, Fuel,
  Shield, Wrench, Wallet, CheckCircle2, AlertTriangle, Download, Copy,
  Settings2, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatNairaFull } from '@/lib/utils';

type ScenarioKey = 'baseline' | 'optimistic' | 'pessimistic';

const SCENARIOS: Record<ScenarioKey, { occ: number; units: number; rent: number; label: string; delta: string; tone: string }> = {
  baseline: { occ: 72, units: 18, rent: 1250000, label: 'Baseline (Active)', delta: '+34.1%', tone: 'primary' },
  optimistic: { occ: 88, units: 22, rent: 1350000, label: 'Optimistic (+18.9%)', delta: '+50.9%', tone: 'primary' },
  pessimistic: { occ: 55, units: 14, rent: 1100000, label: 'Pessimistic (-24.3%)', delta: '-0.7% Deficit', tone: 'error' },
};

export default function ScenarioBuilderClient() {
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

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyGross = (units * rent) * (occ / 100);
  const annualized = monthlyGross * 12;

  const selectScenario = (key: ScenarioKey) => {
    const s = SCENARIOS[key];
    setScenario(key);
    setOcc(s.occ);
    setUnits(s.units);
    setRent(s.rent);
    toast.success(`${s.label} activated`);
  };

  const removeExpense = (idx: number) => {
    setExpenses((e) => e.filter((_, i) => i !== idx));
    toast.info('Line item removed');
  };

  const addExpense = () => {
    setExpenses((e) => [...e, { title: 'Supplementary Contingency', amount: 1500000, icon: Wrench }]);
    toast.success('Line item added');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
          <span className="hover:text-primary cursor-pointer">Home</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Financials &amp; Payouts</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Revenue Forecasting</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Scenario Builder</span>
        </nav>
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full shadow-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Ledger Node: Lagos Sovereign Core (Active)</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Scenario Builder</h1>
            <span className="bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-bold tracking-wider">v2.4 Pro</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-1">
            Model forward-looking cash flow projections, stress-test occupancy risk, and adjust baseline yield assumptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Forecast Overview</Button>
          <Button variant="outline" className="gap-2" onClick={() => selectScenario('baseline')}><RotateCcw className="w-4 h-4" /> Reset</Button>
          <Button className="gap-2" onClick={() => toast.success('Scenario saved')}><Save className="w-4 h-4" /> Save Scenario</Button>
          <Button className="gap-2 bg-primary-container text-on-primary-container hover:bg-primary" onClick={() => toast.success('Applied to forecast')}><TrendingUp className="w-4 h-4" /> Apply to Forecast</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
          const s = SCENARIOS[key];
          const active = scenario === key;
          return (
            <div key={key} onClick={() => selectScenario(key)} className={`relative bg-surface-container-lowest rounded-xl p-5 shadow-sm cursor-pointer flex flex-col justify-between transition-all ${active ? 'shadow-md' : 'hover:shadow-md'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider font-bold ${key === 'pessimistic' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container/40 text-on-secondary-container'}`}>{s.label}</span>
                {active ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full border-2 border-outline-variant" />}
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Occupancy Rate</span>
                    <span className="font-mono-numeric text-mono-numeric font-bold text-on-surface">{s.occ}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div className={`${key === 'pessimistic' ? 'bg-error' : 'bg-primary'} h-full rounded-full`} style={{ width: `${s.occ}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Monthly Gross</span>
                    <span className="font-mono-numeric text-title-sm font-bold text-on-surface">{formatNairaFull(s.units * s.rent * (s.occ / 100))}</span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Monthly OpEx</span>
                    <span className="font-mono-numeric text-title-sm font-bold text-on-surface">{formatNairaFull(totalExpenses)}</span>
                  </div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Net Operating Margin</span>
                    <span className={`font-label-sm text-label-sm font-bold px-1.5 py-0.5 rounded ${key === 'pessimistic' ? 'text-error bg-error-container' : 'text-primary bg-secondary-container/30'}`}>{s.delta}</span>
                  </div>
                </div>
              </div>
              <Button className={`w-full ${active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface hover:bg-surface-dim'}`} onClick={() => selectScenario(key)}>
                {active ? 'Active Selection' : `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-1 text-primary font-title-sm text-title-sm">
            <Functions className="w-5 h-5" />
            <span className="uppercase tracking-wider font-bold">Reactive Valuation Formula</span>
          </div>
          <p className="font-mono-numeric text-mono-numeric text-on-surface-variant">projectedRevenue = (activeUnits × avgMonthlyRent) × occupancyRate</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-surface-container-low p-4 rounded-xl">
          <div className="flex flex-col"><span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Active Units</span><span className="font-mono-numeric text-title-md font-bold text-on-surface">{units}</span></div>
          <span className="text-on-surface-variant font-title-md">×</span>
          <div className="flex flex-col"><span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Avg Unit Rent</span><span className="font-mono-numeric text-title-md font-bold text-on-surface">{formatNairaFull(rent)}</span></div>
          <span className="text-on-surface-variant font-title-md">×</span>
          <div className="flex flex-col"><span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Occupancy</span><span className="font-mono-numeric text-title-md font-bold text-primary">{occ}%</span></div>
          <span className="text-on-surface-variant font-title-md">=</span>
          <div className="bg-surface-container-lowest px-3 py-1 rounded-lg shadow-sm">
            <span className="font-label-sm text-label-sm uppercase text-primary font-bold block">Annualized Run-Rate</span>
            <span className="font-mono-numeric text-title-md font-bold text-primary">{formatNairaFull(annualized)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 bg-surface-container-low px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="font-title-md text-title-md text-on-surface font-semibold">Tenancy &amp; Portfolio Parameters</h2>
            </div>
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Real-Time Core</span>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="font-title-sm text-title-sm text-on-surface flex justify-between"><span>Active Tenancies (Portfolio Units)</span><span className="text-on-surface-variant font-body-sm">Capacity: 25 Units</span></label>
              <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-1.5">
                <Apartment className="w-4 h-4 text-on-surface-variant mr-2" />
                <Input type="number" min={1} max={50} value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)} className="bg-transparent font-mono-numeric" />
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-2">Units</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-title-sm text-title-sm text-on-surface flex justify-between"><span>Defaulted / At-Risk Leases</span><span className="text-error font-label-sm uppercase font-semibold">Legal Notice Active</span></label>
              <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-1.5">
                <Gavel className="w-4 h-4 text-error mr-2" />
                <Input type="number" min={0} max={10} value={atRisk} onChange={(e) => setAtRisk(Number(e.target.value) || 0)} className="bg-transparent font-mono-numeric" />
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-2">Contracts</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-title-sm text-title-sm text-on-surface">Target Occupancy Rate (%)</label>
                <span className="font-mono-numeric text-title-sm font-bold text-primary">{occ}%</span>
              </div>
              <input type="range" min={30} max={100} value={occ} onChange={(e) => setOcc(Number(e.target.value))} className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer" />
              <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm"><span>Stress Floor (30%)</span><span>Break-Even (62%)</span><span>Full Occupancy (100%)</span></div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-title-sm text-title-sm text-on-surface">Average Monthly Rent per Unit</label>
              <div className="flex items-center bg-surface-container-low rounded-lg overflow-hidden">
                <div className="bg-surface-container-high px-3 py-2 font-mono-numeric text-mono-numeric font-bold text-on-surface">₦</div>
                <Input type="number" step={50000} value={rent} onChange={(e) => setRent(Number(e.target.value) || 0)} className="bg-transparent font-mono-numeric px-3" />
                <div className="pr-3 font-label-sm text-label-sm text-on-surface-variant uppercase">/ Unit / Mo</div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-title-sm text-title-sm text-on-surface">Annual Inflation Indexation Factor</label>
              <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-1.5">
                <Settings2 className="w-4 h-4 text-on-surface-variant mr-2" />
                <Input type="number" step={0.5} value={inflation} onChange={(e) => setInflation(Number(e.target.value) || 0)} className="bg-transparent font-mono-numeric" />
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold ml-2">% p.a.</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-surface-container-low rounded-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">Figures anchored to LASRERA statutory caps and active tenancy escrow contracts.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 bg-surface-container-low px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="font-title-md text-title-md text-on-surface font-semibold">Operating Expenses Breakdown</h2>
            </div>
            <Button variant="ghost" className="font-label-sm text-label-sm text-primary uppercase font-bold gap-1" onClick={addExpense}>
              <PlusIcon /> Add Line Item
            </Button>
          </div>
          <div className="space-y-2 flex-1">
            {expenses.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className="w-4 h-4 text-on-surface-variant" />
                    <span className="font-title-sm text-title-sm text-on-surface">{e.title}</span>
                  </div>
                  <div className="font-mono-numeric text-title-sm font-semibold text-on-surface">{formatNairaFull(e.amount)}</div>
                  <button onClick={() => removeExpense(i)} className="text-on-surface-variant hover:text-error transition-colors"><AlertTriangle className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 bg-surface-container p-4 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Total Monthly Operating Expenses</span>
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold">Auto-Summed</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="font-headline-md text-headline-md font-bold text-on-surface">{formatNairaFull(totalExpenses)}</div>
              <div className="font-mono-numeric text-body-sm text-on-surface-variant">Annualized: <span className="font-bold text-on-surface">{formatNairaFull(totalExpenses * 12)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3 h-40 rounded-xl overflow-hidden relative shadow-sm bg-surface-container">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed">Prime Asset</span>
            <span className="font-title-md text-title-md font-bold">Lekki Sovereign Tower 1</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Portfolio Anchor</span>
          <h3 className="font-title-md text-title-md text-on-surface font-bold">Asset Rebalancing &amp; Vacancy Hedge Analysis</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Sustaining occupancy above 68.4% fully covers fixed charges, protecting investor dividends.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-container" />
          <span className="font-body-md text-body-md text-on-surface-variant">All scenario assumptions synchronized.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Cloned')}><Copy className="w-4 h-4" /> Save as New Model</Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success('CSV exported')}><Download className="w-4 h-4" /> Export CSV</Button>
          <Button className="gap-2" onClick={() => toast.success('Applied')}><CheckCircle2 className="w-4 h-4" /> Apply to Financial Forecast</Button>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return <span className="text-lg leading-none">+</span>;
}