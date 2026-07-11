'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function portfolioanalyticsdashboardpropatiownerconsolePage() {
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
          <h1 className="text-2xl font-bold text-foreground">Portfolio Analytics Dashboard Owner Console</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Portfolio Analytics Dashboard PROPATI Portfolio Manager leaderboard Analytics dashboard Dashboard domain Prope...</p>
        </section>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">View Units</Button>
          <Button variant="default">Post Listing</Button>
          <Button variant="default">All Districts</Button>
          <Button variant="default">High Yield Hubs</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Portfolio Manager</li>
              <li>Total Portfolio Value</li>
              <li>Projected Annual Income</li>
              <li>Average Occupancy</li>
              <li>Total Properties</li>
              <li>Distribution across asset classes</li>
              <li>Residential Performance</li>
              <li>Consistent demand across Mainland and Island duplexes.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>portfolio_analytics_dashboard_propati_owner_console.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
