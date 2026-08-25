'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';

interface ScenarioBuilderClientProps {
  baseRevenue: number;
}

export default function ScenarioBuilderClient({ baseRevenue }: ScenarioBuilderClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState(95);
  const [rentAppreciation, setRentAppreciation] = useState(5);
  const [inflationOffset, setInflationOffset] = useState(2.5);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Advanced Scenario Builder</h1>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-500 font-medium">Error</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-on-destructive rounded-lg hover:bg-destructive">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  const multiplier = (occupancy / 95) * (1 + (rentAppreciation - 5) / 100);
  const calculated = (baseRevenue * multiplier).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Advanced Scenario Builder</h1>
        <p className="text-zinc-400 mt-1">Model 'what-if' scenarios for your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 rounded-xl border border-[#262626] shadow-sm">
          <h3 className="font-heading font-bold text-white mb-4">Growth Trajectory (FY 24-26)</h3>
          <div className="h-64 flex items-end gap-2 border-b border-[#262626] relative">
            {[40, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <div className="w-full flex items-end gap-1">
                  <div className="w-1/2 bg-tertiary/40 rounded-t-sm h-[60%]" />
                  <div className="w-1/2 bg-secondary/40 rounded-t-sm h-[30%]" />
                </div>
                <span className="text-xs text-zinc-400">{['2023', '2024(P)', '2025', '2026'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 rounded-xl bg-emerald-500-container text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <AppIcon name="dynamic_form" className="lucide" />
            <h3 className="font-heading font-bold text-surface-bright">Scenario Builder</h3>
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm opacity-80">Occupancy Rate</label>
                <span className="text-sm font-bold text-secondary-container">{occupancy}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm opacity-80">Rent Appreciation</label>
                <span className="text-sm font-bold text-secondary-container">{rentAppreciation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={rentAppreciation}
                onChange={(e) => setRentAppreciation(Number(e.target.value))}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm opacity-80">Inflation Offset</label>
                <span className="text-sm font-bold text-secondary-container">{inflationOffset}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={inflationOffset}
                onChange={(e) => setInflationOffset(Number(e.target.value))}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-on-primary-container/20 bg-zinc-900/10">
            <p className="text-xs opacity-60 mb-1">Resulting Forecast</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-bright">₦{calculated}M</span>
              <span className="text-sm text-[#00ff66]">+₦{(Number(calculated) - baseRevenue).toFixed(1)}M impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
