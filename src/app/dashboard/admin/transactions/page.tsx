import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminTransactionsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole={user.role} userName={user.fullName || 'Admin'} userAvatar={user.avatarUrl || undefined}>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500">Use the sidebar links to view escrow or withdrawal transactions.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
