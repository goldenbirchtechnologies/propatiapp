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
  unitCategory: z.string().trim().min(2).max(80).optional(),
  rentalArrangement: z.enum(['long_term', 'shortlet', 'room_share', 'bed_space', 'commercial_lease', 'hospitality']).optional(),
  listingMethod: z.enum(['single_unit', 'multi_arrangement', 'room_or_bed', 'booking_calendar']).optional(),
  occupancyModel: z.enum(['long_term', 'shortlet', 'room_share', 'hotel', 'commercial']).optional(),
  occupancyState: z.enum(['vacant', 'occupied', 'reserved', 'available', 'checked_in', 'checked_out', 'cleaning', 'partially_occupied', 'fully_occupied', 'under_maintenance', 'leased', 'out_of_service']).optional(),
  categoryAttributes: z.record(z.string(), z.unknown()).optional(),
  parentUnitId: z.string().cuid().nullable().optional(),
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
      select: { id: true, currentTenantId: true, rentalArrangement: true, unitCategory: true },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateUnitSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error }, { status: 400 });
    }

    if (validated.data.parentUnitId === unitId) {
      return NextResponse.json({ error: 'A unit cannot be its own parent' }, { status: 400 });
    }
    if (validated.data.parentUnitId) {
      const parent = await prisma.unit.findFirst({ where: { id: validated.data.parentUnitId, organizationId: id }, select: { id: true } });
      if (!parent) return NextResponse.json({ error: 'Parent unit not found in this organisation' }, { status: 400 });
    }
    if ((validated.data.rentalArrangement && validated.data.rentalArrangement !== unit.rentalArrangement || validated.data.unitCategory && validated.data.unitCategory !== unit.unitCategory) && unit.currentTenantId) {
      return NextResponse.json({ error: 'Classification cannot change while an active tenant is assigned. End the tenancy first.' }, { status: 409 });
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
