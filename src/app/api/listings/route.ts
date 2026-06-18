import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listingFilterSchema } from '@/lib/validators';
import { formatCurrencyKobo } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = listingFilterSchema.parse(params);
    const { page, limit, sortBy, order, ...filters } = validated;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'active',
    };

    if (filters.listingType) where.listingType = filters.listingType;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.area) where.area = { contains: filters.area, mode: 'insensitive' };
    if (filters.state) where.state = filters.state;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price = { ...where.price, gte: filters.minPrice };
      if (filters.maxPrice) where.price = { ...where.price, lte: filters.maxPrice };
    }
    if (filters.minBedrooms) where.bedrooms = { gte: filters.minBedrooms };
    if (filters.maxBedrooms) where.bedrooms = { ...(where.bedrooms as object), lte: filters.maxBedrooms };
    if (filters.verificationTier) where.verificationTier = filters.verificationTier;

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'most_verified':
        orderBy = { verificationTier: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { where: { isCover: true }, take: 1 },
          owner: { select: { id: true, fullName: true, avatarUrl: true, phoneVerified: true } },
          agent: { select: { id: true, fullName: true, avatarUrl: true, agentTier: true } },
          verification: { select: { overallStatus: true, currentLayer: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const formattedListings = listings.map((listing) => ({
      ...listing,
      priceFormatted: formatCurrencyKobo(Number(listing.price) * 100), // Convert to kobo for formatting
      coverImage: listing.images[0]?.url || null,
      owner: listing.owner,
      agent: listing.agent,
      verification: listing.verification,
    }));

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Listings GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createListingSchema } = await import('@/lib/validators');
    const validated = createListingSchema.parse(body);

    // In a real app, get userId from Clerk auth
    const userId = 'usr_landlord_001'; // Placeholder

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        ownerId: userId,
        price: validated.price,
        cautionDeposit: validated.cautionDeposit ?? null,
        serviceCharge: validated.serviceCharge ?? null,
      },
    });

    // Create verification record
    await prisma.verification.create({
      data: {
        listingId: listing.id,
        ownerId: userId,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Listings POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}