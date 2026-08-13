import { NextRequest, NextResponse } from 'next/server';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { updatePricingRuleSchema } from '@/lib/validators.short-let';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; ruleId: string }> }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = updatePricingRuleSchema.parse(body);
    const v = validated as Record<string, unknown>;

    const { ruleId } = await params;
    const rule = await prisma.pricingRule.findUnique({
      where: { id: ruleId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!rule || rule.listingId !== id) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    const user = authResult.user;
    const isOwner = user.role === 'admin' || user.id === rule.listing.ownerId;
    if (!isOwner) {
      const approvedHost = await prisma.tenantShortlet.findFirst({
        where: { listingId: id, tenantId: user.id, status: 'approved' },
      });
      if (!approvedHost) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const updated = await prisma.pricingRule.update({
      where: { id: ruleId },
      data: {
        name: v.name,
        ruleType: v.ruleType,
        priority: v.priority,
        multiplier: v.multiplier,
        fixedPrice: v.fixedPrice,
        dayOfWeek: v.dayOfWeek,
        minNights: v.minNights,
        maxNights: v.maxNights,
        advanceDays: v.advanceDays,
        startDate: v.startDate,
        endDate: v.endDate,
        isActive: v.isActive,
      },
    });

    return NextResponse.json({ rule: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; ruleId: string }> }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const rule = await prisma.pricingRule.findUnique({
      where: { id: ruleId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!rule || rule.listingId !== id) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    if (rule.listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.pricingRule.delete({ where: { id: ruleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
