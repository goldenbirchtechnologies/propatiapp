'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function revenueforecastreportwithdigitalsignaturepropatiownerconsolePage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Estate_manager'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Revenue Forecast Report With Digital Signature Owner Console</h1>
          <p className="text-muted-foreground mt-1">Propati Finance - Revenue Forecast Report assessment Revenue Forecast Report download Export PDF share Share Report Prop...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Scenario Analysis: Q4 Growth Strategy</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from revenue_forecast_report_with_digital_signature_propati_owner_console.</p></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Premium Asset Intelligence Platform</li>
              <li>Report Generated: October 24, 2024</li>
              <li>DISCLAIMER: This revenue forecast is a simulation based on user-defined parameters and market estimates. It does not constitute a guarantee of future performance or financial advice. PROPATI Technologies Limited and its affiliates are not liable for investment decisions based on these projections. Professional real estate standards assured. © 2024 PROPATI Technologies Limited. All rights reserved.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>revenue_forecast_report_with_digital_signature_propati_owner_console.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
