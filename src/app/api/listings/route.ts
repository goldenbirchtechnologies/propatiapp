import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { listingFilterSchema } from '@/lib/validators';
import { formatCurrencyKobo } from '@/lib/fees';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = listingFilterSchema.parse(params);
    const { page, limit, sortBy, order, q, ...filters } = validated;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'active',
    };

    // Text search across title, description, and area
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filters.listingType) where.listingType = filters.listingType;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.area) where.area = { contains: filters.area, mode: 'insensitive' };
    if (filters.state) where.state = filters.state;
    if (filters.minPrice || filters.maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {};
      if (filters.minPrice) priceFilter.gte = filters.minPrice;
      if (filters.maxPrice) priceFilter.lte = filters.maxPrice;
      where.price = priceFilter;
    }

    // Handle bedroom range filters
    if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) {
      const bedroomFilter: { gte?: number; lte?: number } = {};
      if (filters.minBedrooms !== undefined) bedroomFilter.gte = filters.minBedrooms;
      if (filters.maxBedrooms !== undefined) bedroomFilter.lte = filters.maxBedrooms;
      where.bedrooms = bedroomFilter;
    }

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

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
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
    const auth = await withAuth(request, ['landlord', 'estate_manager']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { createListingSchema } = await import('@/lib/validators');
    const validated = createListingSchema.parse(body);

    const userId = auth.user.id;

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