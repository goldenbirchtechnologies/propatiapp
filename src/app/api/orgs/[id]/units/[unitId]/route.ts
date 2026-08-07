import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateUnitSchema = z.object({
  isListed: z.boolean().optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  occupancy: z.enum(['VACANT', 'OCCUPIED', 'NOTICE_GIVEN']).optional(),
  rent: z.number().nonnegative().optional(),
  listingType: z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']).optional(),
  pricePeriod: z.enum(['night', 'month', 'year', 'total']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, unitId } = await params;

  try {
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const unit = await prisma.unit.findFirst({
      where: { id: unitId, organizationId: id },
      select: { id: true },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateUnitSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error }, { status: 400 });
    }

    const updated = await prisma.unit.update({
      where: { id: unitId },
      data: validated.data,
      include: {
        currentTenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Units PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
