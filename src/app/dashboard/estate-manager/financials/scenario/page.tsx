'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui';

export default function refinedrevenueforecastingadvancedscenariobuilderpropatiownerconsolePage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Estate_manager'}
      userAvatar={user?.imageUrl}
    >

      <ErrorBoundary>

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-none">
          <h1 className="text-2xl font-bold text-white">Refined Revenue Forecasting Advanced Scenario Builder Owner Console</h1>
          <p className="text-zinc-500 mt-1">Propati Finance | Revenue Forecasting Propati Finance Revenue Analytics dashboard Dashboard analytics Analytics domain A...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]"><h3 className="text-lg font-semibold text-white">Revenue Forecasting</h3></div>
            <div className="p-6"><p className="text-sm text-zinc-500">Content from refined_revenue_forecasting_advanced_scenario_builder_propati_owner_console.</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Upgrade to Premium</Button>
          <Button variant="default">View Detailed Ledger</Button>
        </div>
        <div className="glass-card">
          <div className="p-6 pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-500">
              <li>Revenue Analytics</li>
              <li>Predictive financial analysis for FY 2024-2026</li>
              <li>Projected Gross Revenue</li>
              <li>Expected Net Yield</li>
              <li>Forecasted Occupancy</li>
              <li>Risk Adjusted ROI</li>
              <li>Resulting Forecast</li>
              <li>High demand for short-lets in Victoria Island following corporate relocation trends. Expected yield increase by 1.2% in Q3.</li>
            </ul>
          </div>
        </div>
        <div className="glass-card">
          <div className="p-6 pt-6">
            <p className="text-sm text-zinc-500">This page was ported from the reference design: <strong>refined_revenue_forecasting_advanced_scenario_builder_propati_owner_console.html</strong></p>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
