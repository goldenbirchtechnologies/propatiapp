'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function autopayconfigurationpropatitenantportalPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Auto Pay Configuration Tenant Portal</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Auto-Pay Settings PROPATI Tenant Portal dashboard Dashboard domain My Properties payments Payments receipt_lon...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Manage Automated Payments</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from auto_pay_configuration_propati_tenant_portal.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">notifications</Button>
          <Button variant="default">help</Button>
          <Button variant="default">On due date</Button>
          <Button variant="default">3 days before</Button>
          <Button variant="default">5 days before</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tenant Portal</li>
              <li>Enable to allow the system to process scheduled charges automatically.</li>
              <li>Visa Card •••• 4242</li>
              <li>Expires 08/25</li>
              <li>GTBank Account •••• 0192</li>
              <li>A. Olumide</li>
              <li>PAYMENT TIMING</li>
              <li>MAXIMUM PAYMENT LIMIT (OPTIONAL)</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>auto_pay_configuration_propati_tenant_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
