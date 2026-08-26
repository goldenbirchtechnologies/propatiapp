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
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-zinc-500 mt-1">Stay updated on payments, maintenance, and listing activity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Unread</p>
            <p className="text-2xl font-bold mt-1">{unreadCount}</p>
            <p className="text-xs text-warning mt-1">Needs attention</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Requires Action</p>
            <p className="text-2xl font-bold mt-1">{actionCount}</p>
            <p className="text-xs text-red-500 mt-1">Open tickets</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold mt-1">{notifications.length}</p>
            <p className="text-xs text-zinc-500 mt-1">All time</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">All Notifications</h3>
          </div>
          <div className="p-6">
            {notifications.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-3 divide-y divide-[#262626]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border ${n.read ? 'bg-zinc-950/50 border-white/[0.08]' : 'bg-zinc-900 border-white/[0.08]'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${n.read ? 'text-zinc-500' : 'text-white'}`}>{n.title}</p>
                        <p className="text-sm text-zinc-500 mt-1">{n.body}</p>
                      </div>
                      <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">
                        {new Date(n.createdAt).toLocaleDateString('en-NG')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="mt-2 capitalize text-[11px]">{n.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
