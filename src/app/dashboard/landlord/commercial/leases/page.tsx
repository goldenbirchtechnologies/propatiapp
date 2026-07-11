'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function commercialleaseshopcollectionpropaticommercialconsolePage() {
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
          <h1 className="text-2xl font-bold text-foreground">Commercial Lease Shop Collection Commercial Console</h1>
          <p className="text-muted-foreground mt-1">VerifProp Admin | Commercial Lease Management VerifProp Admin Verified Enterprise dashboard Overview payments Rent Colle...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Commercial Lease Collection</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from commercial_lease_shop_collection_propati_commercial_console.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Withdraw Funds</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verified Enterprise</li>
              <li>Managing revenue for The Platinum Plaza &amp; Business District. Automated billing for rent, service charges, and utility recoveries.</li>
              <li>Lekki Phase 1, Lagos State</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>commercial_lease_shop_collection_propati_commercial_console.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
