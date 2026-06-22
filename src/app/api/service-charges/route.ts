import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { createServiceChargeSchema, updateServiceChargeSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const where: Record<string, unknown> = {};
    if (user.role === 'estate_manager') {
      where.estateManagerId = user.id;
    } else if (user.role === 'landlord') {
      where.listing = { ownerId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const listingId = searchParams.get('listingId');
    const orgId = searchParams.get('orgId');

    if (status) where.status = status;
    if (listingId) where.listingId = listingId;
    if (orgId) where.organizationId = orgId;

    const charges = await prisma.serviceCharge.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        organization: { select: { id: true, name: true } },
        estateManager: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ charges });
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
      return NextResponse.json({ error: 'Only estate managers and admins can create service charges' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createServiceChargeSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, organizationId: true },
    });

    if (!listing || !listing.organizationId) {
      return NextResponse.json({ error: 'Listing not found or has no organisation' }, { status: 404 });
    }

    if (validated.organizationId !== listing.organizationId) {
      return NextResponse.json({ error: 'Listing does not belong to the provided organisation' }, { status: 400 });
    }

    const charge = await prisma.serviceCharge.create({
      data: {
        listingId: validated.listingId,
        organizationId: validated.organizationId,
        estateManagerId: user.id,
        period: validated.period,
        amount: validated.amount,
        currency: validated.currency,
        dueDate: new Date(validated.dueDate),
        description: validated.description,
      },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        organization: { select: { id: true, name: true } },
        estateManager: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ charge }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
