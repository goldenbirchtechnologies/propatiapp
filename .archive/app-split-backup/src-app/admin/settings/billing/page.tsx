import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import BillingSettingsClient from './BillingSettingsClient';

export default async function AdminBillingSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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

  // Fetch all active subscription plans
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  });

  const mappedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    priceMonthly: Number(p.priceMonthly),
    priceYearly: Number(p.priceYearly),
    currency: p.currency,
    features: p.features as string[],
    maxListings: p.maxListings,
    maxUsers: p.maxUsers,
    maxProperties: p.maxProperties,
    supportLevel: p.supportLevel ?? null,
    isActive: p.isActive,
  }));

  // Fetch all org subscriptions with org info
  const subscriptions = await prisma.orgSubscription.findMany({
    take: 200,
    orderBy: { nextBillingDate: 'asc' },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          billingEmail: true,
          planTier: true,
          ownerId: true,
        },
      },
    },
  });

  const mappedSubs = subscriptions.map((s) => ({
    id: s.id,
    orgId: s.orgId,
    orgName: s.org?.name ?? 'Unknown',
    orgBillingEmail: s.org?.billingEmail ?? null,
    plan: s.plan,
    status: s.status,
    amountKobo: Number(s.amount),
    currentPeriodStart: s.currentPeriodStart.toISOString(),
    currentPeriodEnd: s.currentPeriodEnd.toISOString(),
    nextBillingDate: s.nextBillingDate.toISOString(),
    paystackSubId: s.paystackSubId,
    createdAt: s.createdAt.toISOString(),
  }));

  // Summary billing stats
  const activeSubs = mappedSubs.filter((s) => s.status === 'active' || s.status === 'trialing');
  const totalMRR = activeSubs.reduce((sum, s) => sum + s.amountKobo, 0);
  const pastDue = mappedSubs.filter((s) => s.status === 'past_due').length;
  const cancelled = mappedSubs.filter((s) => s.status === 'cancelled' || s.status === 'paused').length;

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <BillingSettingsClient
        initialPlans={mappedPlans}
        initialSubscriptions={mappedSubs}
        summary={{ totalMRR, pastDue, cancelled }}
      />
    </DashboardShell>
  );
}
