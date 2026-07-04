import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createListingSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const body = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20), status: z.string().optional() }).parse(params);

    const skip = (body.page - 1) * body.limit;
    const where: Record<string, unknown> = { ownerId: user.id };
    if (body.status) where.status = body.status;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          ownerId: true,
          agentId: true,
          title: true,
          description: true,
          listingType: true,
          propertyType: true,
          address: true,
          area: true,
          state: true,
          price: true,
          pricePeriod: true,
          cautionDeposit: true,
          serviceCharge: true,
          bedrooms: true,
          bathrooms: true,
          toilets: true,
          sizeSqm: true,
          floorLevel: true,
          furnished: true,
          parkingSpaces: true,
          amenities: true,
          availableFrom: true,
          minimumStay: true,
          status: true,
          verificationTier: true,
          isFeatured: true,
          allowShortlet: true,
          viewsCount: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: body.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: { page: body.page, limit: body.limit, total, totalPages: Math.ceil(total / body.limit) },
    });
  } catch (error) {
    console.error('Landlord properties GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createListingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        ownerId: user.id,
      },
      select: {
        id: true,
        ownerId: true,
        agentId: true,
        title: true,
        description: true,
        listingType: true,
        propertyType: true,
        address: true,
        area: true,
        state: true,
        price: true,
        pricePeriod: true,
        cautionDeposit: true,
        serviceCharge: true,
        bedrooms: true,
        bathrooms: true,
        toilets: true,
        sizeSqm: true,
        floorLevel: true,
        furnished: true,
        parkingSpaces: true,
        amenities: true,
        availableFrom: true,
        minimumStay: true,
        status: true,
        verificationTier: true,
        isFeatured: true,
        allowShortlet: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: listing }, { status: 201 });
  } catch (error) {
    console.error('Landlord properties POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
