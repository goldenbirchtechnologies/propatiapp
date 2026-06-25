import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UserDetailClient from './UserDetailClient';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
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
    realtor: '/dashboard/realtor',
  };
  if (!user) redirect("/sign-in");
  if (user.role !== 'admin') redirect(rolePaths[user.role] ?? '/dashboard/tenant');

  // Fetch user details
  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      ownedListings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          propertyType: true,
          price: true,
          status: true,
          createdAt: true,
        },
      },
      participatedTransactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          ownedListings: true,
          participatedTransactions: true,
        },
      },
    },
  });

  if (!targetUser) {
    redirect('/admin/users');
  }

  // Calculate total revenue from user's transactions
  const revenueData = await prisma.transaction.aggregate({
    where: {
      payerId: params.id,
      status: 'released',
    },
    _sum: {
      amount: true,
      platformFee: true,
    },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <UserDetailClient user={targetUser} revenueData={revenueData} />
    </DashboardShell>
  );
}
