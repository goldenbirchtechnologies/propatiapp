'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function leaseagreementreviewpropaticommercialPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Lease Agreement Review Commercial</h1>
          <p className="text-muted-foreground mt-1">Lease Agreement Review | PROPATI Commercial PROPATI Commercial Gold Verified Agent gavel Workspace description Agreement...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>1. PARTIES</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_agreement_review_propati_commercial.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>2. THE PREMISES</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_agreement_review_propati_commercial.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>3. TERM</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_agreement_review_propati_commercial.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>4. RENT AND DEPOSIT</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_agreement_review_propati_commercial.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>5. PERMITTED USE</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from lease_agreement_review_propati_commercial.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">New Negotiation</Button>
          <Button variant="default">Download PDF</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Gold Verified Agent</li>
              <li>Reference: PROP-2024-88492-L</li>
              <li>THIS LEASE AGREEMENT (the "Lease") is made this 24th day of May, 2024.</li>
              <li>The Premises shall be used solely for general corporate office purposes and for no other purpose without the prior written consent of the Landlord.</li>
              <li>The Landlord shall be responsible for structural repairs including the roof, exterior walls, and common areas. The Tenant shall be responsible for all internal non-structural repairs and day-to-day maintenance of the interior Premises.</li>
              <li>Landlord Signature</li>
              <li>Signed: 2024-05-23 14:22 WAT</li>
              <li>Tenant Signature</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>lease_agreement_review_propati_commercial.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
