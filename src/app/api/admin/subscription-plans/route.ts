import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest, successResponse, errorResponse } from '@/lib/api-auth';
import { SubscriptionStatus } from '@prisma/client';

/**
 * GET /api/admin/subscription-plans
 * List all subscription plans (admin)
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { subscriptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ plans });
  } catch (error) {
    console.error('Admin subscription plans list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/subscription-plans
 * Create a new subscription plan (admin)
 * Body: { name, description?, priceMonthly, priceYearly, currency?, features?, maxListings?, maxUsers?, maxProperties?, supportLevel?, isActive? }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return errorResponse('name is required', 400);
    }
    if (typeof body.priceMonthly !== 'number' || typeof body.priceYearly !== 'number') {
      return errorResponse('priceMonthly and priceYearly are required', 400);
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        currency: body.currency || 'NGN',
        features: body.features || {},
        maxListings: body.maxListings ?? 0,
        maxUsers: body.maxUsers ?? 1,
        maxProperties: body.maxProperties ?? 0,
        supportLevel: body.supportLevel || null,
        isActive: body.isActive ?? true,
      },
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: plan, message: 'Plan created successfully' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Admin create plan error:', error);
    if (error.code === 'P2002') {
      return errorResponse('A plan with this name already exists', 409);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
