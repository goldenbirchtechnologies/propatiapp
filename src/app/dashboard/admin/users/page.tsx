import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminUsersPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalUsers, roleCounts, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, isActive: true },
    }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Users</h1>
            <p className="text-zinc-500 mt-1">Manage user accounts and platform access.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            Add User
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white mt-2">{totalUsers.toLocaleString()}</p>
          </div>
          {roleCounts.map((rc) => (
            <div key={rc.role} className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
              <p className="text-zinc-500 text-sm capitalize">{rc.role.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-white mt-2">{rc._count.role.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          </div>
          {recentUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-zinc-500">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.08] last:border-0 hover:bg-zinc-900/50">
                      <td className="p-3 text-white">{u.fullName}</td>
                      <td className="p-3 text-white">{u.email}</td>
                      <td className="p-3 text-white capitalize">{u.role}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${u.isActive ? 'bg-green-100 text-emerald-400' : 'bg-red-100 text-red-400'}`}>
                          {u.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="p-3 text-white">{new Date(u.createdAt).toLocaleDateString('en-NG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
