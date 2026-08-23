'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <section className="rounded-2xl border border-[#262626] bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-white">Refined Revenue Forecasting Advanced Scenario Builder Owner Console</h1>
          <p className="text-muted-foreground mt-1">Propati Finance | Revenue Forecasting Propati Finance Revenue Analytics dashboard Dashboard analytics Analytics domain A...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Revenue Forecasting</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from refined_revenue_forecasting_advanced_scenario_builder_propati_owner_console.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Upgrade to Premium</Button>
          <Button variant="default">View Detailed Ledger</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Revenue Analytics</li>
              <li>Predictive financial analysis for FY 2024-2026</li>
              <li>Projected Gross Revenue</li>
              <li>Expected Net Yield</li>
              <li>Forecasted Occupancy</li>
              <li>Risk Adjusted ROI</li>
              <li>Resulting Forecast</li>
              <li>High demand for short-lets in Victoria Island following corporate relocation trends. Expected yield increase by 1.2% in Q3.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>refined_revenue_forecasting_advanced_scenario_builder_propati_owner_console.html</strong></p>
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
