import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { createUtilityAllocationSchema, updateUtilityAllocationSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get('unitId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (user.role === 'estate_manager') {
      where.unit = { organization: { ownerId: user.id } };
    } else if (user.role === 'tenant') {
      where.unit = { currentTenantId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (unitId) where.unitId = unitId;
    if (status) where.status = status;

    const allocations = await prisma.utilityAllocation.findMany({
      where,
      orderBy: { billingPeriod: 'desc' },
      include: {
        unit: { select: { id: true, unitNumber: true, buildingName: true, organization: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ allocations });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    if (user.role !== 'estate_manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only estate managers and admins can create utility allocations' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createUtilityAllocationSchema.parse(body);

    const unit = await prisma.unit.findUnique({
      where: { id: validated.unitId },
      select: { id: true, organizationId: true },
    });

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 });

    const allocation = await prisma.utilityAllocation.create({
      data: {
        unitId: validated.unitId,
        type: validated.type,
        reading: validated.reading,
        amount: validated.amount,
        currency: validated.currency,
        billingPeriod: validated.billingPeriod,
        dueDate: new Date(validated.dueDate),
      },
      include: {
        unit: { select: { id: true, unitNumber: true, buildingName: true } },
      },
    });

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
