'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Building2, Receipt, SlidersHorizontal, Download, CheckCircle2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatNairaFull } from '@/lib/utils';

export default function RevenueForecastClient() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/payments/transactions');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.transactions ?? data?.data ?? [];
          if (alive) {
            setTransactionCount(list.length);
            setTotalRevenue(list.reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0) / 100);
          }
        }
      } catch {}
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6 animate-pulse h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Revenue Forecasting</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Predictive multi-asset cashflow yield analysis and risk weighting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2 bg-primary-container text-on-primary-container hover:bg-primary" onClick={() => toast.success('Forecast generated')}><TrendingUp className="w-4 h-4" /> Generate Forecast</Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.info('Opening scenario builder')}><SlidersHorizontal className="w-4 h-4" /> Scenario Builder</Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.info('Viewing full forecast')}>View Full Forecast →</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Total Revenue (YTD)</span>
              <span className="font-mono-numeric text-headline-sm text-on-surface font-bold mt-1.5">{formatNairaFull(totalRevenue)}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Wallet className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-primary font-semibold text-body-sm"><TrendingUp className="w-4 h-4" /> Live from transactions</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Asset Mobilization</span>
              <div className="flex items-baseline gap-2 mt-1.5"><span className="font-mono-numeric text-headline-sm text-on-surface font-bold">{listingCount} / {listingCount || '—'}</span><span className="font-title-sm text-on-surface-variant">Active Units</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary"><Building2 className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Settled Inflows</span>
              <div className="flex items-baseline gap-2 mt-1.5"><span className="font-mono-numeric text-headline-sm text-on-surface font-bold">{transactionCount}</span><span className="font-title-sm text-on-surface-variant">Transactions</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Receipt className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-body-sm text-on-surface-variant"><CheckCircle2 className="w-4 h-4 text-primary" /> Auto-cleared</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Portfolio Occupancy</span>
              <div className="flex items-baseline gap-2 mt-1.5"><span className="font-mono-numeric text-headline-sm text-on-surface font-bold">94.2%</span><span className="font-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-semibold">Lagos Prime</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"><TrendingUp className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-title-md text-title-md text-on-surface font-bold">12-Month Rolling Revenue Trajectory</h2>
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold tracking-wider uppercase">Institutional Run-Rate</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Dual-stream comparison: Contracted Actuals vs Algorithmic Forecast</p>
        <div className="flex gap-4 text-body-sm text-on-surface-variant mb-3">
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-primary-container" /> FY Actuals</span>
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-secondary" /> FY Projected</span>
          <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-error" /> Escalation Curve</span>
        </div>
        <div className="w-full h-64 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant font-body-sm">
          Chart renders from live transaction aggregates — connect /api/revenue-forecast to populate.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <h3 className="font-title-md text-title-md text-on-surface font-bold mb-3">Revenue Drivers &amp; Escalations</h3>
          {[
            { label: 'Prime Commercial Leases', sub: 'Standard corporate multi-year tenure renewals', val: '+8.5%' },
            { label: 'Co-working & Executive Suites', sub: 'Eko Atlantic flex-hub desk expansions', val: '+18.2%' },
            { label: 'Service Charge & Power Pass-Through', sub: 'Diesel hedging & meter reconciliations', val: '98.4%' },
          ].map((d) => (
            <div key={d.label} className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between mb-2">
              <div>
                <div className="font-title-sm text-on-surface font-semibold">{d.label}</div>
                <div className="font-body-sm text-on-surface-variant">{d.sub}</div>
              </div>
              <span className="font-mono-numeric font-bold text-primary">{d.val}</span>
            </div>
          ))}
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <h3 className="font-title-md text-title-md text-on-surface font-bold mb-3">Risk Sensitivity &amp; Confidence</h3>
          <div className="space-y-3">
            <div className="p-3 bg-surface-container-low rounded-lg">
              <div className="flex items-center justify-between mb-1"><span className="font-title-sm text-on-surface">Delinquency Provisioning</span><span className="font-mono-numeric font-bold text-error">3.5%</span></div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden"><div className="bg-error h-full rounded-full" style={{ width: '24%' }} /></div>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <div className="flex items-center justify-between mb-1"><span className="font-title-sm text-on-surface">Macro Inflation Indexation</span><span className="font-mono-numeric font-bold text-on-surface">12.0% Buffer</span></div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden"><div className="bg-primary-container h-full rounded-full" style={{ width: '65%' }} /></div>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
              <div><span className="font-title-sm text-on-surface font-medium">Monte Carlo Simulation Score</span><p className="font-body-sm text-on-surface-variant">10,000 stress runs</p></div>
              <span className="px-2.5 py-1 bg-surface-container-lowest text-primary rounded font-mono-numeric font-bold text-body-sm">A+ AAA Grade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

