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
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  if (!user) redirect("/login");
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  // Fetch all users with stats
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          ownedListings: true,
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
