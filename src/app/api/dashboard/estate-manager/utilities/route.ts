import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { updateUtilityAllocationSchema } from '@/lib/validators.commercial';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get('unitId');
    const status = searchParams.get('status');

    if (!unitId) {
      return NextResponse.json({ error: 'unitId is required' }, { status: 400 });
    }

    // Verify estate manager has access to the unit's org
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { organizationId: true },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    if (user.role === 'estate_manager') {
      const org = await prisma.organisation.findUnique({
        where: { id: unit.organizationId },
        select: { ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const where: Record<string, unknown> = { unitId };
    if (status) where.status = status;

    const allocations = await prisma.utilityAllocation.findMany({
      where,
      select: {
        id: true,
        unitId: true,
        type: true,
        reading: true,
        amount: true,
        currency: true,
        billingPeriod: true,
        dueDate: true,
        status: true,
        paidAt: true,
        transactionId: true,
        createdAt: true,
        updatedAt: true,
        unit: {
          select: {
            id: true,
            unitNumber: true,
            buildingName: true,
            organizationId: true,
            organization: {
              select: {
                id: true,
                name: true,
                owner: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: allocations });
  } catch (error) {
    console.error('Utilities GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Utility allocation id is required' }, { status: 400 });
    }

    const allocation = await prisma.utilityAllocation.findUnique({
      where: { id },
      select: { id: true, unitId: true },
    });

    if (!allocation) {
      return NextResponse.json({ error: 'Utility allocation not found' }, { status: 404 });
    }

    if (user.role === 'estate_manager') {
      const unit = await prisma.unit.findUnique({
        where: { id: allocation.unitId },
        select: { organizationId: true },
      });
      const org = await prisma.organisation.findUnique({
        where: { id: unit?.organizationId || '' },
        select: { ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const validated = updateUtilityAllocationSchema.parse(updates);

    const updated = await prisma.utilityAllocation.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        unitId: true,
        type: true,
        reading: true,
        amount: true,
        currency: true,
        billingPeriod: true,
        dueDate: true,
        status: true,
        paidAt: true,
        transactionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Utilities PUT error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
