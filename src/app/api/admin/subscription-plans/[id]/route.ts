import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest, successResponse, errorResponse } from '@/lib/api-auth';

/**
 * GET /api/admin/subscription-plans/[id]
 * Fetch a single plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: id },
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
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return successResponse({ plan });
  } catch (error) {
    console.error('Admin get plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/subscription-plans/[id]
 * Update a plan
 * Body: { name?, description?, priceMonthly?, priceYearly?, currency?, features?, maxListings?, maxUsers?, maxProperties?, supportLevel?, isActive? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();

    const plan = await prisma.subscriptionPlan.update({
      where: { id: id },
      data: {
        name: body.name?.trim(),
        description: body.description !== undefined ? body.description?.trim() || null : undefined,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        currency: body.currency,
        features: body.features,
        maxListings: body.maxListings,
        maxUsers: body.maxUsers,
        maxProperties: body.maxProperties,
        supportLevel: body.supportLevel !== undefined ? body.supportLevel || null : undefined,
        isActive: body.isActive,
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

    return successResponse({ plan }, 'Plan updated successfully');
  } catch (error: unknown) {
    console.error('Admin update plan error:', error);
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    if ((error as { code?: string })?.code === 'P2002') {
      return errorResponse('A plan with this name already exists', 409);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/subscription-plans/[id]
 * Delete a plan (blocked if subscriptions exist)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const subCount = await prisma.userSubscription.count({
      where: { planId: id },
    });

    if (subCount > 0) {
      return errorResponse('Cannot delete plan with active subscriptions', 400);
    }

    await prisma.subscriptionPlan.delete({
      where: { id: id },
    });

    return successResponse({}, 'Plan deleted successfully');
  } catch (error: unknown) {
    console.error('Admin delete plan error:', error);
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
