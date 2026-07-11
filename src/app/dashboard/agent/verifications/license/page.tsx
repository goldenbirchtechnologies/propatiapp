'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function professionallicenseuploadpropatiagentportalPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Professional License Upload Agent Portal</h1>
          <p className="text-muted-foreground mt-1">Professional License Upload | Propati Agent Portal Agent Portal Verified Professional dashboard Overview badge Identity ...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Professional License</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Content from professional_license_upload_propati_agent_portal.</p></CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">List Property</Button>
          <Button variant="default">Browse Files</Button>
          <Button variant="default">Save Draft</Button>
          <Button variant="default">Submit for Verification</Button>
          <Button variant="default">Fix & Re-upload</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Verified Professional</li>
              <li>Oluwaseun Adeyemi</li>
              <li>ID: PROP-8821</li>
              <li>To ensure the integrity of our marketplace, all agents must provide valid regulatory documentation. Verified agents receive a 'Certified' badge on all listings.</li>
              <li>Drag & drop your certificate</li>
              <li>Support for PDF, PNG, or JPEG. Maximum file size 5MB.</li>
              <li>NIESV_Cert_Adeyemi.pdf</li>
              <li>2.4 MB • Ready to upload</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This page was ported from the reference design: <strong>professional_license_upload_propati_agent_portal.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
