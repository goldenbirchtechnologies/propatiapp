import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { updatePricingRuleSchema } from '@/lib/validators.short-let';

export async function PATCH(request: NextRequest, { params }: { params: { id: string; ruleId: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = updatePricingRuleSchema.parse(body);

    const rule = await prisma.pricingRule.findUnique({
      where: { id: params.ruleId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!rule || rule.listingId !== params.id) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    if (rule.listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const updated = await prisma.pricingRule.update({
      where: { id: params.ruleId },
      data: {
        name: validated.name,
        ruleType: validated.ruleType,
        priority: validated.priority,
        multiplier: validated.multiplier,
        fixedPrice: validated.fixedPrice,
        dayOfWeek: validated.dayOfWeek,
        minNights: validated.minNights,
        maxNights: validated.maxNights,
        advanceDays: validated.advanceDays,
        startDate: validated.startDate,
        endDate: validated.endDate,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json({ rule: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; ruleId: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const rule = await prisma.pricingRule.findUnique({
      where: { id: params.ruleId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!rule || rule.listingId !== params.id) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    if (rule.listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.pricingRule.delete({ where: { id: params.ruleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
