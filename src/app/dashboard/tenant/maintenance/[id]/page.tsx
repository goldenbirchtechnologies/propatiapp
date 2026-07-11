'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function maintenancetrackingacrepairpropatitenantportalPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Tenant'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Maintenance Tracking Ac Repair Tenant Portal</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Request Tracking PROPATI Dashboard Properties Maintenance Financials notifications settings corporate_fare Hub...</p>
        </section>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">notifications</Button>
          <Button variant="default">settings</Button>
          <Button variant="default">Edit Details</Button>
          <Button variant="default">Reschedule Appointment</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verified Management</li>
              <li>Plumbing Specialist • 4.9 ★</li>
              <li>Scheduled Date</li>
              <li>Monday, Oct 28, 2024</li>
              <li>Time Window</li>
              <li>10:00 AM - 12:00 PM</li>
              <li>Leaking pipe under the kitchen island sink. The leak started after running the dishwasher last night. There is visible water damage to the wood base and a constant drip even when faucets are off.</li>
              <li>Azure Heights, Unit 402</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>maintenance_tracking_ac_repair_propati_tenant_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
