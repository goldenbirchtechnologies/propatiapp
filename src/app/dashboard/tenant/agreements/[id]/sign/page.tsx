import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TenantAgreementSignPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  return (
    <DashboardShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName || 'Tenant'} userAvatar={user.avatarUrl || undefined}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Agreement signing for {params.id} will be available once the signing flow is connected.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
