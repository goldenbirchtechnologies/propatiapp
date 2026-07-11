'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function paymentsuccesspropatitenantportalPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Payment Success Tenant Portal</h1>
          <p className="text-muted-foreground mt-1">Payment Successful - PROPATI domain PROPATI Tenant Portal dashboard Dashboard domain My Properties payments Payments rec...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Payment Success</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from payment_success_propati_tenant_portal.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">notifications</Button>
          <Button variant="default">help</Button>
          <Button variant="default">Return to Dashboard</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tenant Portal</li>
              <li>Status</li>
              <li>Rent Status: Paid</li>
              <li>Your transaction has been processed securely. A confirmation email and receipt have been sent to your registered address.</li>
              <li>Total Amount Paid</li>
              <li>Connected Property</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>payment_success_propati_tenant_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
