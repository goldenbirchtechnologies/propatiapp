'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function withdrawalsfundmanagementpropatifinancialsPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Withdrawals Fund Management Financials</h1>
          <p className="text-muted-foreground mt-1">Payout & Withdrawal Management | VerifProp Admin VerifProp Admin Verified Enterprise dashboard Overview payments Rent Co...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>₦ 4,820,500.00</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from withdrawals_fund_management_propati_financials.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>₦ 1,240,000.00</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from withdrawals_fund_management_propati_financials.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>₦ 28,500,750.00</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from withdrawals_fund_management_propati_financials.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Request Successful</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from withdrawals_fund_management_propati_financials.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Withdraw Funds</Button>
          <Button variant="default">Done</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Manage your earnings, bank accounts, and withdrawal history with bank-grade security protocols.</li>
              <li>Available for Withdrawal</li>
              <li>Pending Clearance</li>
              <li>Total Withdrawn</li>
              <li>Min: ₦1,000 | Max: ₦1,000,000/day</li>
              <li>Funds will be deposited within 2-24 business hours following security validation.</li>
              <li>Access Bank PLC</li>
              <li>**** 8821 • Primary</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>withdrawals_fund_management_propati_financials.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
