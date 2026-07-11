'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function leasenegotiationgradeaservicedofficepropaticommercialPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Lease Negotiation Grade A Serviced Office Commercial</h1>
          <p className="text-muted-foreground mt-1">Lease Negotiation Workspace | PROPATI Commercial PROPATI Commercial Gold Verified Agent Agent Profile gavel Workspace de...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Grade A Serviced Office</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_negotiation_grade_a_serviced_office_propati_commercial.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Sign Document</Button>
          <Button variant="default">Submit Counter-Offer</Button>
          <Button variant="default">Accept Proposed Terms</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Commercial</li>
              <li>Gold Verified Agent</li>
              <li>Agent Profile</li>
              <li>Ref ID: PR-1092-VI</li>
              <li>Finalize Negotiation</li>
              <li>Review the terms before proceeding to legal drafting.</li>
              <li>Based on the current market data for VI, we are proposing a 5% escalation instead of 10% for a longer 3-year term.</li>
              <li>The landlord is reviewing the request for 5% escalation. They value the 3-year commitment but need to offset facility costs.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>lease_negotiation_grade_a_serviced_office_propati_commercial.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
