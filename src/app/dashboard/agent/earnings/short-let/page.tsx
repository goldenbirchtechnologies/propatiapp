'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function shortletrevenuedashboardpropatiagentconsolePage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole="agent"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Agent'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Short Let Revenue Dashboard Agent Console</h1>
          <p className="text-muted-foreground mt-1">Short-let Revenue Dashboard | VerifProp Admin VerifProp Admin Verified Enterprise dashboard Overview payments Rent Colle...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>₦12,450,000.00</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from short_let_revenue_dashboard_propati_agent_console.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Withdraw Funds</Button>
          <Button variant="default">History</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verified Enterprise</li>
              <li>Available Revenue</li>
              <li>Occupancy Rate</li>
              <li>Average across 14 properties</li>
              <li>Next Payout</li>
              <li>₦2,105,400</li>
              <li>Estimated amount</li>
              <li>May 2024 Bookings</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>short_let_revenue_dashboard_propati_agent_console.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
