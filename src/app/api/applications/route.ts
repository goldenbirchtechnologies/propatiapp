import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'under_review', 'accepted', 'rejected', 'withdrawn']).optional(),
  listingId: z.string().optional(),
});

const createBody = z.object({
  listingId: z.string().min(1),
  message: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, status, listingId } = listQuery.parse(params);

    const skip = (page - 1) * limit;
    const take = limit;
    const where: Record<string, unknown> = {};

    if (user.role === 'tenant') {
      where.tenantId = user.id;
    } else if (user.role === 'landlord') {
      where.landlordId = user.id;
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              area: true,
              state: true,
              price: true,
              pricePeriod: true,
              listingType: true,
              images: { where: { isCover: true }, take: 1, select: { url: true } },
            },
          },
          landlord: { select: { id: true, fullName: true, email: true } },
          tenant: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    const serialized = applications.map((app) => ({
      ...app,
      listing: {
        ...app.listing,
        price: app.listing.price.toString(),
      },
      screeningStatus: (app as any).screeningStatus || {},
      guarantorData: (app as any).guarantorData || {},
      applicantDocuments: (app as any).applicantDocuments || [],
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('applications GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { listingId, message } = createBody.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, status: true, title: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'active') return NextResponse.json({ error: 'Listing not available' }, { status: 400 });

    const resolvedTenantId = user.role === 'tenant' ? user.id : user.id;
    const existing = await prisma.application.findFirst({
      where: { listingId, tenantId: resolvedTenantId, status: { not: 'withdrawn' } },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ error: 'Application already exists' }, { status: 409 });

    const application = await prisma.application.create({
      data: {
        listingId,
        tenantId: resolvedTenantId,
        landlordId: listing.ownerId,
        message: message || null,
        status: 'pending',
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            pricePeriod: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
        tenant: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...application,
          listing: {
            ...application.listing,
            price: application.listing.price.toString(),
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('applications POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
