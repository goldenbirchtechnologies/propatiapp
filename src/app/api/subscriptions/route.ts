import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest, successResponse, errorResponse } from '@/lib/api-auth';
import { SubscriptionStatus } from '@prisma/client';

/**
 * GET /api/subscriptions
 * Returns the current user's active subscription with plan details.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: authResult.user.id },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            priceMonthly: true,
            priceYearly: true,
            currency: true,
            features: true,
            maxListings: true,
            maxUsers: true,
            maxProperties: true,
            supportLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ subscription });
  } catch (error) {
    console.error('User subscription fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Actions: create | upgrade | cancel
 * Body: { action: 'create', planId?: string } or { action: 'cancel' } or { action: 'upgrade', planId?: string }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'create':
      case 'upgrade': {
        const { planId } = body;
        if (!planId || typeof planId !== 'string') {
          return errorResponse('planId is required', 400);
        }

        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
        });

        if (!plan) {
          return errorResponse('Plan not found', 404);
        }

        if (!plan.isActive) {
          return errorResponse('This plan is no longer active', 400);
        }

        const existingSub = await prisma.userSubscription.findFirst({
          where: { userId: authResult.user.id },
          orderBy: { createdAt: 'desc' },
        });

        // If upgrading, mark current as cancelled/ended
        if (existingSub && action === 'upgrade') {
          await prisma.userSubscription.update({
            where: { id: existingSub.id },
            data: {
              status: SubscriptionStatus.cancelled,
              cancelledAt: new Date(),
              endedAt: new Date(),
              cancelAtPeriodEnd: false,
            },
          });
        }

        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const subscription = await prisma.userSubscription.create({
          data: {
            userId: authResult.user.id,
            planId: plan.id,
            status: SubscriptionStatus.active,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMonthly: true,
                priceYearly: true,
                currency: true,
                features: true,
              },
            },
          },
        });

        return NextResponse.json(
          { subscription },
          { status: 201, statusText: action === 'upgrade' ? 'Plan upgraded successfully' : 'Subscription created successfully' }
        );
      }

      case 'cancel': {
        const existingSub = await prisma.userSubscription.findFirst({
          where: { userId: authResult.user.id },
          orderBy: { createdAt: 'desc' },
        });

        if (!existingSub) {
          return errorResponse('No subscription found', 404);
        }

        if (existingSub.status === SubscriptionStatus.cancelled) {
          return errorResponse('Subscription is already cancelled', 400);
        }

        const updated = await prisma.userSubscription.update({
          where: { id: existingSub.id },
          data: {
            status: SubscriptionStatus.cancelled,
            cancelledAt: new Date(),
            endedAt: new Date(),
            cancelAtPeriodEnd: false,
          },
        });

        return successResponse({ subscription: updated }, 'Subscription cancelled');
      }

      default:
        return errorResponse('Invalid action. Use create, upgrade, or cancel.', 400);
    }
  } catch (error: any) {
    console.error('User subscription action error:', error);
    if (error.code === 'P2002') {
      return errorResponse('You already have an active subscription for this plan', 409);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
