'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function moveincoordinationpropaticommercialPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Landlord'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Move In Coordination Commercial</h1>
          <p className="text-muted-foreground mt-1">PROPATI Commercial | Move-in Coordination Hub PROPATI Gold Verified Agent gavel Workspace description Agreements payment...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Welcome to your new HQ</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from move_in_coordination_propati_commercial.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">New Negotiation</Button>
          <Button variant="default">View Digital Key</Button>
          <Button variant="default">Download Welcome Pack</Button>
          <Button variant="default">Reschedule Appointment</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Gold Verified Agent</li>
              <li>Escrow Clearance</li>
              <li>₦12,450,000.00</li>
              <li>Collection Point</li>
              <li>Main Lobby Concierge</li>
              <li>Thursday, Oct 12th</li>
              <li>10:00 AM — 11:30 AM</li>
              <li>Preparation Checklist</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>move_in_coordination_propati_commercial.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
