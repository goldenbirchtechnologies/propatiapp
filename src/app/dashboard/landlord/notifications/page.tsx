import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Notifications – Landlord',
  description: 'Stay updated on payments, maintenance, and listing activity.',
};

export default async function LandlordNotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const actionCount = notifications.filter((n) => n.type === 'maintenance').length;

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on payments, maintenance, and listing activity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unread</p>
            <p className="text-2xl font-bold mt-1">{unreadCount}</p>
            <p className="text-xs text-warning mt-1">Needs attention</p>
          </div>
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requires Action</p>
            <p className="text-2xl font-bold mt-1">{actionCount}</p>
            <p className="text-xs text-destructive mt-1">Open tickets</p>
          </div>
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold mt-1">{notifications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-3 divide-y divide-outline-variant">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border ${n.read ? 'bg-surface-container-lowest border-outline-variant' : 'bg-primary/10 border-blue-500/20'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${n.read ? 'text-muted-foreground' : 'text-primary'}`}>{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(n.createdAt).toLocaleDateString('en-NG')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="mt-2 capitalize text-[11px]">{n.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
