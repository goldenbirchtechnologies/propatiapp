import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { OrgPlanTier, SubscriptionStatus } from '@prisma/client';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  plan: z.enum(['starter', 'growth', 'enterprise']),
  paymentMethod: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, planTier: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner, manager, or accountant can view subscription
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'accountant'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const subscription = await prisma.orgSubscription.findUnique({
      where: { orgId: id },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        planTier: org.planTier,
        maxUnits: org.maxUnits,
        maxSeats: org.maxSeats,
      },
    });
  } catch (error) {
    console.error('Org Subscription GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership - only owner can manage subscription
    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, planTier: true, paystackCustomerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (org.ownerId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner can manage subscription' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    // Check if subscription already exists
    const existingSub = await prisma.orgSubscription.findUnique({
      where: { orgId: id },
    });

    if (existingSub) {
      return NextResponse.json({ error: 'Subscription already exists. Use PATCH to update.' }, { status: 400 });
    }

    // Plan pricing (in kobo)
    const planPricing: Record<OrgPlanTier, { amount: number; interval: string }> = {
      starter: { amount: 1500000, interval: 'monthly' }, // 15,000 NGN/month
      growth: { amount: 5000000, interval: 'monthly' },   // 50,000 NGN/month
      enterprise: { amount: 15000000, interval: 'monthly' }, // 150,000 NGN/month
    };

    const pricing = planPricing[validated.plan as OrgPlanTier];

    // Create Paystack subscription
    let paystackSub;
    try {
      paystackSub = await paystack.createSubscription({
        customer: org.paystackCustomerId || '',
        plan: validated.plan,
        authorization: validated.paymentMethod,
      });
    } catch (e) {
      console.error('Paystack subscription creation failed:', e);
      return NextResponse.json({ error: 'Failed to create payment subscription' }, { status: 500 });
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create subscription record
    const subscription = await prisma.orgSubscription.create({
      data: {
        orgId: id,
        paystackSubId: paystackSub.subscription_code,
        plan: validated.plan,
        status: 'active',
        amount: BigInt(pricing.amount),
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
      },
    });

    // Update org plan tier and limits
    const planTier = validated.plan as OrgPlanTier;
    const maxUnits = planTier === 'starter' ? 20 : planTier === 'growth' ? 100 : -1;
    const maxSeats = planTier === 'starter' ? 1 : planTier === 'growth' ? 5 : -1;

    await prisma.organisation.update({
      where: { id },
      data: { planTier, maxUnits, maxSeats },
    });

    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    console.error('Org Subscription POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}