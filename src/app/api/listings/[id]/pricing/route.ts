import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { createPricingRuleSchema, updatePricingRuleSchema } from '@/lib/validators.short-let';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const rules = await prisma.pricingRule.findMany({
      where: { listingId: params.id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ rules });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createPricingRuleSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, ownerId: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const rule = await prisma.pricingRule.create({
      data: {
        listingId: params.id,
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

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
