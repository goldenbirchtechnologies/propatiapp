import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateServiceChargeSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const charge = await prisma.serviceCharge.findUnique({
      where: { id: id },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        organization: { select: { id: true, name: true } },
        estateManager: { select: { id: true, fullName: true } },
      },
    });

    if (!charge) return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });

    return NextResponse.json({ charge });
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
    const validated = updateServiceChargeSchema.parse(body);

    const existing = await prisma.serviceCharge.findUnique({
      where: { id: id },
    });

    if (!existing) return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });

    const isManager = existing.estateManagerId === user.id;
    const isOrgOwner = await prisma.organisation.count({
      where: { id: existing.organizationId, ownerId: user.id },
    }) > 0;
    if (!isManager && !isOrgOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const charge = await prisma.serviceCharge.update({
      where: { id: id },
      data: {
        amount: validated.amount,
        currency: validated.currency,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        status: validated.status,
        description: validated.description,
        estateManagerId: validated.estateManagerId,
        paidAt: validated.status === 'paid' ? new Date() : undefined,
      },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        organization: { select: { id: true, name: true } },
        estateManager: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ charge });
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
    const existing = await prisma.serviceCharge.findUnique({
      where: { id: id },
      select: { estateManagerId: true, organizationId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });

    const isManager = existing.estateManagerId === user.id;
    const isOrgOwner = await prisma.organisation.count({
      where: { id: existing.organizationId, ownerId: user.id },
    }) > 0;
    if (!isManager && !isOrgOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.serviceCharge.update({
      where: { id: id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
