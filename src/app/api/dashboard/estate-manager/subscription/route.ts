import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getSubscriptionPlans } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const ownedOrg = await prisma.organisation.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const membership = ownedOrg
      ? null
      : await prisma.orgMember.findFirst({
          where: { userId: user.id, status: 'active' },
          select: { orgId: true, org: { select: { id: true } } },
        });

    const orgId = ownedOrg?.id || membership?.orgId || membership?.org?.id;

    if (!orgId) {
      return NextResponse.json({
        noOrg: true,
        org: null,
        subscription: null,
        planDetails: null,
        unitCount: 0,
        teamMemberCount: 0,
        billingHistory: [],
        availablePlans: [],
      });
    }

    // Estate managers can only view their own org data
    if (user.role === 'estate_manager') {
      const ownerOnly = await prisma.organisation.findFirst({
        where: { id: orgId, ownerId: user.id },
        select: { id: true },
      });
      const isMember = await prisma.orgMember.findFirst({
        where: { orgId, userId: user.id, status: 'active' },
      });
      if (!ownerOnly && !isMember) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const [org, subscription, unitCount, teamMemberCount, billingTransactions] =
      await Promise.all([
        prisma.organisation.findUnique({
          where: { id: orgId },
          select: {
            id: true,
            name: true,
            planTier: true,
            maxUnits: true,
            maxSeats: true,
            billingEmail: true,
            createdAt: true,
          },
        }),
        prisma.orgSubscription.findUnique({
          where: { orgId },
        }),
        prisma.unit.count({
          where: { organizationId: orgId },
        }),
        prisma.orgMember.count({
          where: { orgId, status: 'active', userId: { not: null } },
        }),
        prisma.transaction.findMany({
          where: {
            payerId: user.id,
            type: 'subscription',
            status: { in: ['released', 'success'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            reference: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            description: true,
          },
        }),
      ]);

    if (!org) {
      return NextResponse.json({
        noOrg: true,
        org: null,
        subscription: null,
        planDetails: null,
        unitCount: 0,
        teamMemberCount: 0,
        billingHistory: [],
        availablePlans: [],
      });
    }

    // Map tier to plan key (growth -> professional)
    const planKey = org.planTier === 'growth' ? 'professional' : org.planTier;
    const planDetails = getSubscriptionPlans().find((p) => p.id === planKey) || null;

    // Build billing history: recent subscription transactions + current org subscription snapshot
    const currentBillingEntry = subscription
      ? {
          id: subscription.id,
          date: subscription.currentPeriodStart.toISOString(),
          plan: (planDetails?.name || subscription.plan || 'Unknown').toLowerCase(),
          amount: Number(subscription.amount) / 100,
          status: subscription.status === 'active' ? 'paid' : subscription.status,
          createdAt: subscription.createdAt.toISOString(),
        }
      : null;

    const billingFromTransactions = billingTransactions.map((txn) => ({
      id: txn.id,
      date: txn.createdAt,
      plan: subscription?.plan || org.planTier,
      amount: Number(txn.amount) / 100,
      status: txn.status === 'released' || txn.status === 'success' ? 'paid' : txn.status,
      reference: txn.reference,
      createdAt: txn.createdAt,
    }));

    const billingHistory = currentBillingEntry
      ? [currentBillingEntry, ...billingFromTransactions]
      : billingFromTransactions;

    return NextResponse.json({
      noOrg: false,
      org: {
        id: org.id,
        name: org.name,
        planTier: org.planTier,
        maxUnits: org.maxUnits,
        maxSeats: org.maxSeats,
        billingEmail: org.billingEmail,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            amount: Number(subscription.amount) / 100,
            currentPeriodStart: subscription.currentPeriodStart.toISOString(),
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            nextBillingDate: subscription.nextBillingDate.toISOString(),
            createdAt: subscription.createdAt.toISOString(),
          }
        : null,
      planDetails,
      unitCount,
      teamMemberCount,
      billingHistory,
      availablePlans: getSubscriptionPlans(),
    });
  } catch (error) {
    console.error('Estate Manager Subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
