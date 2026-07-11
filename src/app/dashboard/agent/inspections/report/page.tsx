'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function inspectionreportmainlandregionalhqpropatiagentportalPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole="agent"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Agent'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Inspection Report Mainland Regional Hq Agent Portal</h1>
          <p className="text-muted-foreground mt-1">Inspection Report | PROPATI Admin domain_verification Admin Portal Inspection Suite v2.4 dashboard Overview fact_check V...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Admin Portal</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from inspection_report_mainland_regional_hq_propati_agent_portal.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Mainland Regional Office HQ</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from inspection_report_mainland_regional_hq_propati_agent_portal.</p></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Inspection Suite v2.4</li>
              <li>Real Estate Audit Document</li>
              <li>Final Accreditation Status</li>
              <li>This property has successfully navigated the comprehensive Tier 2 audit framework, confirming legal residency, operational capacity, and structural compliance.</li>
              <li>Audit Score</li>
              <li>Elite Performance Category</li>
              <li>Verified via physical visit</li>
              <li>Official equipment confirmed</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>inspection_report_mainland_regional_hq_propati_agent_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
