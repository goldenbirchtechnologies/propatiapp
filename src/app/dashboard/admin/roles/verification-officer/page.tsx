import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VerificationOfficerRolePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Fetch users that function as verification officers:
  // Prioritise admins (who own all verification access) plus any non-standard-role users;
  // fall back gracefully when none found.
  const verifierUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'admin' },
        { role: 'estate_manager' },
      ],
    },
    orderBy: { fullName: 'asc' },
    take: 50,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  // Derive stats about current verifications in each status bucket
  const [pendingCount, inProgressCount, certifiedCount] = await Promise.all([
    prisma.verification.count({ where: { status: 'pending' } }),
    prisma.verification.count({ where: { status: 'in_progress' } }),
    prisma.verification.count({ where: { status: 'certified' } }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <VerificationOfficerClient
        users={verifierUsers}
        counts={{ pendingCount, inProgressCount, certifiedCount }}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function VerificationOfficerClient({
  users,
  counts,
}: {
  users: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    createdAt: Date;
    lastLogin: Date | null;
  }[];
  counts: { pendingCount: number; inProgressCount: number; certifiedCount: number };
}) {
  'use client';

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-xs text-muted-foreground mb-2">
            <a className="hover:text-primary transition-colors text-xs" href="/dashboard/admin">
              Admin
            </a>
            <ChevronRight className="text-xs" />
            <span className="text-primary font-semibold text-xs">Verification Officers</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Verification Officer Roles
          </h1>
          <p className="text-muted-foreground font-body-md mt-1">
            Manage users with verification permissions and review the current queue.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-xs text-muted-foreground">{users.length} officer(s) configured</span>
        </div>
      </div>

      {/* Queue Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: counts.pendingCount, color: 'bg-tertiary-container text-on-tertiary-container' },
          { label: 'In Progress', value: counts.inProgressCount, color: 'bg-secondary-container text-on-secondary-container' },
          { label: 'Certified', value: counts.certifiedCount, color: 'bg-primary-container text-on-primary-container' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm"
          >
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${stat.color}`}>
              {stat.label}
            </div>
            <div className="font-headline-md text-headline-md text-primary">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Assigned Users */}
      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <h3 className="font-headline-sm text-primary">Assigned Users</h3>
          <span className="text-xs text-muted-foreground">
            {users.filter((u) => u.isActive && !u.isBanned).length} active
          </span>
        </div>
        {users.length === 0 ? (
          <p className="p-lg text-sm text-muted-foreground text-center">No verification officers assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-muted-foreground border-b border-outline-variant">
                  <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">User</th>
                  <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Role</th>
                  <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Status</th>
                  <th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-primary">
                          {initials(u.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-primary text-sm">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md text-body-sm capitalize">{u.role.replace('_', ' ')}</td>
                    <td className="px-lg py-md">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          u.isBanned
                            ? 'bg-error/10 text-error'
                            : u.isActive
                              ? 'bg-on-tertiary-container/10 text-on-tertiary-container'
                              : 'bg-outline-variant/30 text-muted-foreground'
                        }`}
                      >
                        {u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-body-sm text-muted-foreground">
                      {u.lastLogin
                        ? u.lastLogin.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
