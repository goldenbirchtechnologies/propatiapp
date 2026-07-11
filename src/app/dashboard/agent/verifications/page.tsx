'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function agentverificationportalpropatiPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Agent Verification Portal</h1>
          <p className="text-muted-foreground mt-1">Agent Verification Portal - Overview Agent Portal Verified Workspace dashboard Overview badge Identity verified_user Pro...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from agent_verification_portal_propati.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Submit for Review</Button>
          <Button variant="default">Complete Office Verification</Button>
          <Button variant="default">View All Activity</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verified Workspace</li>
              <li>ID: PROP-8291</li>
              <li>Tier 2 Verified</li>
              <li>Complete your profile to unlock premium marketplace listings.</li>
              <li>Profile Progress</li>
              <li>Upload your Office Verification documents to schedule your mandatory physical site inspection.</li>
              <li>NIN and facial recognition biometric data have been successfully cross-referenced.</li>
              <li>Estate Agent Registry (EAR) certificate #88120 is currently undergoing verification.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>agent_verification_portal_propati.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
