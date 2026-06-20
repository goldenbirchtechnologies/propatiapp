import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UsersManagementClient from './UsersManagementClient';

export default async function UsersManagementPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  const roleRedirect = (u: typeof user) =>
    rolePaths[u.role] ?? '/dashboard/tenant';
  if (!user || user.role !== 'admin') redirect(roleRedirect(user));

  // Fetch all users with stats
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          ownedListings: true,
          participatedTransactions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <UsersManagementClient users={users} />
    </DashboardShell>
  );
}
