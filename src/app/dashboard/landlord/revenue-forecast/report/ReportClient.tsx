'use client';

import { useState } from 'react';
import { Download, Table as TableIcon, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatNairaFull } from '@/lib/utils';

const MONTHS = [
  { month: 'January 2024', sector: 'Victoria Crest Towers', proj: 21500000, act: 22400000, var: '+4.19%', status: 'ON_TRACK', conf: 98.4 },
  { month: 'February 2024', sector: 'Capital Towers VI', proj: 23000000, act: 23800000, var: '+3.48%', status: 'ON_TRACK', conf: 97.2 },
  { month: 'March 2024', sector: 'Lekki Hub Zone (Phase 1)', proj: 22800000, act: 24100000, var: '+5.70%', status: 'ON_TRACK', conf: 96.5 },
  { month: 'April 2024', sector: 'Capital Towers VI', proj: 25000000, act: 26200000, var: '+4.80%', status: 'ON_TRACK', conf: 95.8 },
  { month: 'May 2024', sector: 'Victoria Crest Chambers', proj: 24500000, act: 25900000, var: '+5.71%', status: 'ON_TRACK', conf: 95.1 },
  { month: 'June 2024', sector: 'Lekki Hub Zone (Phase 2)', proj: 27200000, act: 28400000, var: '+4.41%', status: 'ON_TRACK', conf: 96.0 },
  { month: 'July 2024', sector: 'Ikoyi Reserve Sector', proj: 28000000, act: 29100000, var: '+3.93%', status: 'ON_TRACK', conf: 94.7 },
  { month: 'August 2024', sector: 'Victoria Crest Towers', proj: 26500000, act: 28000000, var: '+5.66%', status: 'ON_TRACK', conf: 93.9 },
  { month: 'September 2024', sector: 'Capital Towers VI', proj: 27500000, act: 29200000, var: '+6.18%', status: 'ON_TRACK', conf: 96.1 },
  { month: 'October 2024', sector: 'Lekki Hub Zone (Phase 1)', proj: 29000000, act: 28800000, var: '-0.69%', status: 'AT_RISK', conf: 91.0 },
  { month: 'November 2024', sector: 'Victoria Crest Towers', proj: 31000000, act: 31850000, var: '+2.74%', status: 'ON_TRACK', conf: 89.5 },
  { month: 'December 2024', sector: 'Capital Towers VI', proj: 33900000, act: 34200000, var: '+0.88%', status: 'ON_TRACK', conf: 88.0 },
];

export default function ReportClient() {
  const [filter, setFilter] = useState('ALL');
  const filtered = MONTHS.filter((m) => filter === 'ALL' || m.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Annual Revenue Forecast Report</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Comprehensive monthly variance audit and cash flow analysis.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
            {['current', 'projected', 'h1', 'h2'].map((k, i) => (
              <button key={k} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${i === 0 ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>{k.toUpperCase()}</button>
            ))}
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="appearance-none bg-surface-container-low text-on-surface text-xs font-semibold py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none">
            <option value="ALL">Status: All Months</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
          </select>
          <Button className="gap-2" onClick={() => toast.success('Exporting PDF...')}><Download className="w-4 h-4" /> Export Report (PDF)</Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Exporting CSV...')}><TableIcon className="w-4 h-4" /> Batch CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Projected Annual Run-Rate</span>
          <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 font-mono-numeric">{formatNairaFull(319900000)}</div>
          <div className="mt-2 text-xs text-primary font-semibold flex items-center gap-1"><TrendingUpIcon /> +28.6% expected</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">YTD Actual Revenue</span>
          <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 font-mono-numeric">{formatNairaFull(248650000)}</div>
          <div className="mt-2 text-xs text-on-surface-variant">94.2% collection pacing</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Net Variance Pacing</span>
          <div className="font-headline-sm text-headline-sm text-primary font-bold mt-1 font-mono-numeric">{formatNairaFull(12450000)}</div>
          <div className="mt-2 text-xs text-primary font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> +5.27% above projection</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Model Confidence Score</span>
          <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 font-mono-numeric">96.8%</div>
          <div className="mt-2 text-xs text-on-surface-variant">IFRS-16 &amp; Monte Carlo calibrated</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-primary" />
            <span className="font-title-sm text-on-surface font-bold">Institutional Monthly Ledger &amp; Calibrated Variance</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant font-mono-numeric">{filtered.length} Months</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4">Month / Cycle</th>
                <th className="py-3 px-4">Asset Sector</th>
                <th className="py-3 px-4 text-right">Projected (₦)</th>
                <th className="py-3 px-4 text-right">Actual (₦)</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-md text-on-surface">
              {filtered.map((m) => (
                <tr key={m.month} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-semibold">{m.month}</td>
                  <td className="py-3 px-4 text-xs text-on-surface-variant">{m.sector}</td>
                  <td className="py-3 px-4 text-right font-mono-numeric">{formatNairaFull(m.proj)}</td>
                  <td className="py-3 px-4 text-right font-mono-numeric font-semibold">{formatNairaFull(m.act)}</td>
                  <td className={`py-3 px-4 text-right font-mono-numeric font-bold ${m.status === 'AT_RISK' ? 'text-error' : 'text-primary'}`}>{m.var}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden"><div className="h-full bg-primary-container" style={{ width: `${m.conf}%` }} /></div>
                      <span className="text-xs font-mono-numeric text-on-surface-variant">{m.conf}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.status === 'AT_RISK' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container/40 text-on-secondary-container'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'AT_RISK' ? 'bg-error' : 'bg-primary-container'}`} /> {m.status.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-container text-on-surface font-semibold text-xs border-t border-outline-variant/30">
                <td className="py-3 px-4 uppercase font-bold text-primary">Aggregate Totals (FY24)</td>
                <td className="py-3 px-4 text-on-surface-variant">12 Active Portfolios</td>
                <td className="py-3 px-4 text-right font-mono-numeric font-bold">{formatNairaFull(319900000)}</td>
                <td className="py-3 px-4 text-right font-mono-numeric font-bold text-primary">{formatNairaFull(323750000)}</td>
                <td className="py-3 px-4 text-right font-mono-numeric font-bold text-primary">+5.27%</td>
                <td className="py-3 px-4"><span className="font-mono-numeric font-bold">94.6% Mean</span></td>
                <td className="py-3 px-4 text-center"><span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold">OPTIMAL</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'CAC / RC-1849204 Verified', sub: 'Corporate title compliance verified.' },
          { title: 'Zenith Real-Time Escrow Payouts', sub: 'Automated disburse routing active.' },
          { title: 'LIRS & FIRS Withholding Sync', sub: 'WHT remitted per Lagos tenancy laws.' },
        ].map((c) => (
          <div key={c.title} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary"><CheckCircle2 className="w-5 h-5" /></div>
            <div className="flex flex-col">
              <span className="font-title-sm text-on-surface font-semibold">{c.title}</span>
              <span className="font-body-sm text-on-surface-variant">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return <span className="inline-block">↗</span>;
}