'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function overduepaymentnoticepropatifinancialsPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Tenant'}
      userAvatar={user?.imageUrl}
    >

      <ErrorBoundary>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Overdue Payment Notice Financials</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Overdue Notice PROPATI Dashboard Properties Payments Documents notifications settings person Reference: #PRO-9...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Debt Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from overdue_payment_notice_propati_financials.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Request Payment Plan</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Overdue Notice Dept.</li>
              <li>Urgent action required: Your account currently has an outstanding balance.</li>
              <li>OFFICIALLY ISSUED BY</li>
              <li>PROPATI COMPLIANCE DEPT.</li>
              <li>Connect with a financial advisor to discuss alternative arrangements.</li>
              <li>Visit our help center for troubleshooting payment portal issues.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>overdue_payment_notice_propati_financials.html</strong></p>
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
