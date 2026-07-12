'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { TrendingUp, Wallet, Building2, Shield } from 'lucide-react';

const kpis = [
  { label: 'Projected Gross Revenue', value: '₦512.4M', trend: '+8.2% YoY', icon: Wallet },
  { label: 'Expected Net Yield', value: '11.4%', trend: 'FY projection', icon: TrendingUp },
  { label: 'Forecasted Occupancy', value: '94.5%', trend: 'Stable', icon: Building2 },
  { label: 'Risk Adjusted ROI', value: '13.2%', trend: 'High confidence', icon: Shield },
];

const assetClasses = [
  { category: 'Residential Portfolio', currentRevenue: 285200000, growth: '+12.4%', yield: '13.8%', confidence: 'HIGH' },
  { category: 'Commercial Portfolio', currentRevenue: 227200000, growth: '+4.1%', yield: '10.2%', confidence: 'MODERATE' },
];

export default function LandlordRevenueForecastPage() {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Revenue Forecasting</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800 font-medium">Unable to load forecasts</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Forecasting</h1>
            <p className="text-muted-foreground mt-1">Predictive financial analysis for FY 2024-2026</p>
          </div>
          <div className="flex gap-2">
            {['Q1 Summary', 'FY Projections', 'Risk Assessment'].map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  idx === 1
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-container-lowest text-muted-foreground border-border hover:bg-surface-container-low'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="card p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-on-primary-container p-1.5 bg-surface-container rounded-lg">
                  {kpi.label.includes('Revenue') ? 'payments' : kpi.label.includes('Yield') ? 'trending_up' : kpi.label.includes('Occupancy') ? 'apartment' : 'security'}
                </span>
                <span className="text-xs font-medium text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">{kpi.trend}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-primary">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 card p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-primary">Growth Trajectory (FY 24-26)</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Residential
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Commercial
                </span>
              </div>
            </div>
            <div className="h-64 flex items-end gap-2 border-b border-outline-variant relative">
              {[40, 65, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                  <div className="w-full flex items-end gap-0.5">
                    <div className="w-1/2 bg-tertiary/40 rounded-t-sm h-[60%]" />
                    <div className="w-1/2 bg-secondary/40 rounded-t-sm h-[30%]" />
                  </div>
                  <span className="text-xs text-muted-foreground">{['2023', '2024(P)', '2025', '2026'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Builder */}
          <div className="card p-5 rounded-xl bg-primary-container text-on-primary shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary-container">dynamic_form</span>
              <h3 className="font-heading font-bold text-surface-bright">Scenario Builder</h3>
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm opacity-80">Occupancy Rate</label>
                  <span className="text-sm font-bold text-secondary-container">95%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm opacity-80">Rent Appreciation</label>
                  <span className="text-sm font-bold text-secondary-container">5%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm opacity-80">Inflation Offset</label>
                  <span className="text-sm font-bold text-secondary-container">2.5%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-on-primary-container/20 bg-surface-container/10">
              <p className="text-xs opacity-60 mb-1">Resulting Forecast</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-surface-bright">₦542.8M</span>
                <span className="text-sm text-on-tertiary-container">+₦30.4M impact</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Class Table */}
        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-heading font-bold text-primary">Asset Class Forecast</h3>
            <button className="text-sm text-secondary hover:underline font-medium">View Detailed Ledger</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Asset Category</th>
                  <th className="px-5 py-3">Current Revenue</th>
                  <th className="px-5 py-3">Growth Potential</th>
                  <th className="px-5 py-3">Projected Yield (24mo)</th>
                  <th className="px-5 py-3">Confidence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {assetClasses.map((asset) => (
                  <tr key={asset.category} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${asset.category.includes('Residential') ? 'bg-tertiary' : 'bg-secondary'}`} />
                      <span className="font-medium text-primary">{asset.category}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">₦{asset.currentRevenue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm font-bold text-tertiary">{asset.growth}</td>
                    <td className="px-5 py-4 text-sm text-primary">{asset.yield}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.confidence === 'HIGH' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                        {asset.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border-l-8 border-tertiary shadow-sm flex gap-4">
            <div className="p-2 bg-tertiary/10 rounded-full h-fit">
              <span className="material-symbols-outlined text-tertiary">holiday_village</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-tertiary-fixed-variant mb-1">Residential Outlook</h4>
              <p className="text-sm text-muted-foreground">High demand for short-lets in Victoria Island following corporate relocation trends. Expected yield increase by 1.2% in Q3.</p>
              <button className="mt-2 text-sm font-bold text-tertiary-fixed-variant hover:underline">Analyze Micro-Market →</button>
            </div>
          </div>
          <div className="p-5 rounded-xl border-l-8 border-secondary shadow-sm flex gap-4">
            <div className="p-2 bg-secondary/10 rounded-full h-fit">
              <span className="material-symbols-outlined text-secondary">business</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-on-secondary-fixed-variant mb-1">Commercial Outlook</h4>
              <p className="text-sm text-muted-foreground">Stable yields in Grade-A office space. Technology sector expansion driving long-term lease commitments in Lekki Phase 1.</p>
              <button className="mt-2 text-sm font-bold text-on-secondary-fixed-variant hover:underline">Analyze Micro-Market →</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
