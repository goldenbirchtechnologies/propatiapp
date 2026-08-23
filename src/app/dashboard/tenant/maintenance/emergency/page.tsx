'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function refinedemergencyhotlinestatepropatimaintenancePage() {
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
        <section className="rounded-2xl border border-[#262626] bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-white">Refined Emergency Hotline State Maintenance</h1>
          <p className="text-muted-foreground mt-1">PROPATI - New Maintenance Request PROPATI Dashboard Properties Maintenance Financials notifications settings verified PR...</p>
        </section>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Low</Button>
          <Button variant="default">Standard</Button>
          <Button variant="default">Urgent</Button>
          <Button variant="default">Emergency</Button>
          <Button variant="default">Back</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Provide the details of your issue and we'll connect you with a certified technician from our verified network.</li>
              <li>For life-threatening emergencies, fire, or severe flooding, please call the local emergency services immediately before filing a report.</li>
              <li>Critical Issue</li>
              <li>If this is a life-threatening emergency, please use the hotline or call local emergency services immediately.</li>
              <li>High-resolution photos help our technicians diagnose the issue faster (Max 5 photos, 10MB each)</li>
              <li>Certified Techs</li>
              <li>All our technicians are background-checked and certified.</li>
              <li>Fast Response</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>refined_emergency_hotline_state_propati_maintenance.html</strong></p>
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
