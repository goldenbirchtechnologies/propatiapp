import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AdminSubscriptionsClient from './SubscriptionsClient';

export default async function AdminSubscriptionsPage() {
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

  // Fetch initial data server-side so the page hydrates with real data
  const [plans, subscriptions] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      include: {
        _count: { select: { subscriptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userSubscription.findMany({
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            priceMonthly: true,
            priceYearly: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AdminSubscriptionsClient
        initialPlans={plans.map(({ _count, ...p }) => ({
          ...p,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
          features: typeof p.features === 'object' ? p.features : {}
        }))}
        initialSubscriptions={subscriptions.map(s => ({
          ...s,
          createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
          updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
          currentPeriodStart: s.currentPeriodStart instanceof Date ? s.currentPeriodStart.toISOString() : s.currentPeriodStart,
          currentPeriodEnd: s.currentPeriodEnd instanceof Date ? s.currentPeriodEnd.toISOString() : s.currentPeriodEnd,
        }))}
      />
    </DashboardShell>
  );
}
