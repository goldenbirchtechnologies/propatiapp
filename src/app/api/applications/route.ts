import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createApplicationSchema, applicationFiltersSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, status, listingId } = applicationFiltersSchema.parse(params);

    const skip = (page - 1) * limit;

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
        take: limit,
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
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              employmentStatus: true,
              employerName: true,
              jobTitle: true,
              yearlyIncome: true,
              profileBio: true,
              idVerified: true,
              ninVerified: true,
            },
          },
          landlord: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Applications GET error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
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
    const { listingId, message } = createApplicationSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, title: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 });
    }

    if (listing.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot apply to your own listing' }, { status: 400 });
    }

    const existing = await prisma.application.findFirst({
      where: { listingId, tenantId: user.id, status: { notIn: ['withdrawn', 'rejected'] } },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this listing' }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        listingId,
        tenantId: user.id,
        landlordId: listing.ownerId,
        message,
        status: 'pending',
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            state: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: 'screening',
        title: 'New Rental Application',
        body: `${user.fullName} has applied for ${listing.title}`,
        data: { applicationId: application.id, listingId },
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
