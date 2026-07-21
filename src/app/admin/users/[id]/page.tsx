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
  };
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  try {
    const [targetUser, revenueData] = await Promise.all([
      prisma.user.findUnique({
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
          _count: true,
        },
      }),
      prisma.transaction.aggregate({
        where: { payerId: params.id, status: 'released' },
        _sum: { amount: true, platformFee: true },
      }),
    ]);

    if (!targetUser) {
      redirect('/admin/users');
    }

    const normalizedRevenue = {
      _sum: {
        amount: typeof revenueData._sum.amount === 'bigint' ? Number(revenueData._sum.amount) : (revenueData._sum.amount ?? null),
        platformFee: typeof revenueData._sum.platformFee === 'bigint' ? Number(revenueData._sum.platformFee) : (revenueData._sum.platformFee ?? null),
      },
    };

    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <UserDetailClient
          user={{
            ...targetUser,
            ownedListings: targetUser.ownedListings.map((listing) => ({
              ...listing,
              propertyType: listing.propertyType ?? '',
              price: typeof listing.price === 'number' ? listing.price : Number(listing.price),
            })),
          }}
          revenueData={normalizedRevenue}
        />
      </DashboardShell>
    );
  } catch (error) {
    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <UserDetailClient
          user={{
            id: params.id,
            fullName: 'Unknown',
            email: '',
            phone: null,
            role: 'tenant',
            isActive: false,
            createdAt: new Date(),
            ownedListings: [],
            _count: { ownedListings: 0, participatedTransactions: 0 },
          }}
          revenueData={{ _sum: { amount: null, platformFee: null } }}
          initialError={error instanceof Error ? error.message : 'Failed to load user details'}
        />
      </DashboardShell>
    );
  }
}
