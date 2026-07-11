'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function tenantsupportcenterpropatihelphubPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Tenant Support Center Help Hub</h1>
          <p className="text-muted-foreground mt-1">Tenant Support | PROPATI PROPATI Marketplace Support Properties help notifications account_circle Tenant Profile support...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from tenant_support_center_propati_help_hub.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Nigeria's Safest Marketplace</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from tenant_support_center_propati_help_hub.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">New Support Ticket</Button>
          <Button variant="default">Search Help</Button>
          <Button variant="default">close</Button>
          <Button variant="default">send</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tenant Support</li>
              <li>Verified Marketplace</li>
              <li>Access 24/7 support, track your requests, and manage your tenancy with Nigeria's most trusted property platform.</li>
              <li>Rent status, auto-pay setup, and payment history.</li>
              <li>Report issues, track repairs, and view schedules.</li>
              <li>Renewals, digital contracts, and terms of use.</li>
              <li>Checklists, key collection, and deposit returns.</li>
              <li>Building policies, parking, and neighbor relations.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>tenant_support_center_propati_help_hub.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
