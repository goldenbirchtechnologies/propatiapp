import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RevenueReportsClient from './RevenueReportsClient';

export default async function RevenueReportsPage() {
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
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(rolePaths[user.role] ?? '/dashboard/tenant');

  // Default to current month
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const currentMonthEnd = new Date();
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
  currentMonthEnd.setDate(0);
  currentMonthEnd.setHours(23, 59, 59, 999);

  // Fetch revenue data
  const [transactionsData, revenueByType, topListings] = await Promise.all([
    // Overall revenue stats
    prisma.transaction.aggregate({
      where: {
        status: 'released',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
        platformFee: true,
        agentFee: true,
      },
      _count: true,
      _avg: {
        amount: true,
      },
    }),

    // Revenue by transaction type
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        status: 'released',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    }),

    // Top earning listings
    prisma.listing.findMany({
      where: {
        transactions: {
          some: {
            status: 'released',
            createdAt: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        propertyType: true,
        transactions: {
          where: {
            status: 'released',
            createdAt: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
          select: {
            amount: true,
            platformFee: true,
          },
        },
      },
      take: 10,
    }),
  ]);

  const revenueData = {
    totalRevenue: transactionsData._sum.amount || 0,
    platformFees: transactionsData._sum.platformFee || 0,
    agentCommissions: transactionsData._sum.agentFee || 0,
    transactionCount: transactionsData._count,
    averageTransaction: transactionsData._avg.amount || 0,
  };

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <RevenueReportsClient
        initialData={{
          revenueData,
          revenueByType,
          topListings,
        }}
        dateRange={{
          from: currentMonthStart,
          to: currentMonthEnd,
        }}
      />
    </DashboardShell>
  );
}
