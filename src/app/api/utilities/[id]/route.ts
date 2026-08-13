import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateUtilityAllocationSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const allocation = await prisma.utilityAllocation.findUnique({
      where: { id: id },
      include: {
        unit: { select: { id: true, unitNumber: true, buildingName: true, organization: { select: { id: true, name: true } } } },
      },
    });

    if (!allocation) return NextResponse.json({ error: 'Utility allocation not found' }, { status: 404 });

    return NextResponse.json({ allocation });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const body = await request.json();
    const validated = updateUtilityAllocationSchema.parse(body);

    const existing = await prisma.utilityAllocation.findUnique({
      where: { id: id },
      include: { unit: { select: { organizationId: true } } },
    });

    if (!existing) return NextResponse.json({ error: 'Utility allocation not found' }, { status: 404 });

    const isOrgOwner = await prisma.organisation.count({
      where: { id: existing.unit.organizationId, ownerId: user.id },
    }) > 0;
    if (!isOrgOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const allocation = await prisma.utilityAllocation.update({
      where: { id: id },
      data: {
        type: validated.type,
        reading: validated.reading,
        amount: validated.amount,
        currency: validated.currency,
        billingPeriod: validated.billingPeriod,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        status: validated.status,
        paidAt: validated.status === 'paid' ? new Date() : undefined,
      },
      include: {
        unit: { select: { id: true, unitNumber: true, buildingName: true } },
      },
    });

    return NextResponse.json({ allocation });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const existing = await prisma.utilityAllocation.findUnique({
      where: { id: id },
      include: { unit: { select: { organizationId: true } } },
    });

    if (!existing) return NextResponse.json({ error: 'Utility allocation not found' }, { status: 404 });

    const isOrgOwner = await prisma.organisation.count({
      where: { id: existing.unit.organizationId, ownerId: user.id },
    }) > 0;
    if (!isOrgOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.utilityAllocation.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
