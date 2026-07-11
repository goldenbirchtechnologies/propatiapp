'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function officesiteinspectionpropatiagentportalPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Office Site Inspection Agent Portal</h1>
          <p className="text-muted-foreground mt-1">Office Site Inspection | PROPATI Agent Portal Agent Portal Verification ID: PR-9021 dashboard Overview fingerprint Ident...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Office Site Inspection</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from office_site_inspection_propati_agent_portal.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Request Inspection</Button>
          <Button variant="default">Support</Button>
          <Button variant="default">Change Address</Button>
          <Button variant="default">Confirm Schedule</Button>
          <Button variant="default">Return to Dashboard</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verification ID: PR-9021</li>
              <li>Verification officers usually arrive within the first hour of the selected slot.</li>
              <li>The 30-minute walkthrough includes:</li>
              <li>Physical sighting of all original documentation.</li>
              <li>Verification of office operational capacity and staff.</li>
              <li>Date</li>
              <li>Wednesday, Oct 9th, 2024</li>
              <li>Time Window</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>office_site_inspection_propati_agent_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
