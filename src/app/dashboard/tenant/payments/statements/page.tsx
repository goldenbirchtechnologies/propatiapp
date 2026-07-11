'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function automatedmonthlystatementpropatitenantportalPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Automated Monthly Statement Tenant Portal</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Tenant Monthly Statement PROPATI Tenant Portal dashboard Dashboard receipt_long Statements payments Payments d...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Statement Details</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from automated_monthly_statement_propati_tenant_portal.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>MONTHLY RENT & SERVICE STATEMENT</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from automated_monthly_statement_propati_tenant_portal.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Pay Balance</Button>
          <Button variant="default">Pay Now</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tenant Portal</li>
              <li>Trust & Verification Systems</li>
              <li>TOTAL AMOUNT DUE</li>
              <li>DUE DATE</li>
              <li>Nov 05, 2024</li>
              <li>Payment Status</li>
              <li>Unit 402, Victoria Tower, Lagos, NG</li>
              <li>Manager: David Kolawole</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>automated_monthly_statement_propati_tenant_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
