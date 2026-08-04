import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { listingFilterSchema } from '@/lib/validators';
import { formatCurrencyKobo } from '@/lib/fees';
import { withRateLimit, apiRateLimiter, getRateLimitHeaders } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, apiRateLimiter);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = listingFilterSchema.parse(params);
    const { page, limit, sortBy, order, q, ownerId, ...filters } = validated;
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'active',
    };

    if (ownerId === 'me') {
      const auth = await withAuth(request);
      if (auth instanceof NextResponse) return auth;
      where.ownerId = auth.user.id;
    } else if (ownerId) {
      where.ownerId = ownerId;
    }

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

    return NextResponse.json(
      {
        listings: formattedListings,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
        },
      },
      { headers: rateLimitHeaders }
    );
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
    const { createListingSchema, createShortletListingSchema } = await import('@/lib/validators');

    let validated;
    const listingType = body.listingType;
    const isShortletWizardPayload =
      listingType === 'short_let' &&
      !!body.location &&
      !!body.floor_plan &&
      !!body.pricing;

    if (isShortletWizardPayload) {
      validated = createShortletListingSchema.parse(body);
    } else {
      validated = createListingSchema.parse(body);
    }

    const userId = auth.user.id;

    const [listingCount, subscription] = await Promise.all([
      prisma.listing.count({ where: { ownerId: userId } }),
      prisma.userSubscription.findFirst({
        where: { userId, status: 'active' },
        include: { plan: { select: { id: true, name: true, maxListings: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (subscription && subscription.plan && subscription.plan.maxListings > 0 && listingCount >= subscription.plan.maxListings) {
      return NextResponse.json(
        {
          error: `Listing limit reached. Your ${subscription.plan.name} plan allows up to ${subscription.plan.maxListings} listings.`,
        },
        { status: 403 }
      );
    }

    let listing;
    if (listingType === 'short_let') {
      const shortlet = validated as z.infer<typeof createShortletListingSchema>;
      const prismaData: Record<string, unknown> = {
        title: shortlet.title,
        description: shortlet.description ?? null,
        listingType: 'short_let',
        address: shortlet.location.formatted_address,
        state: 'Lagos',
        city: shortlet.location.coordinates ? undefined : undefined,
        bedrooms: shortlet.floor_plan.bedrooms_count,
        bathrooms: shortlet.floor_plan.bathrooms_count,
        toilets: 0,
        price: shortlet.pricing.base_price,
        pricePeriod: 'night',
        amenities: shortlet.amenities ?? [],
        availableFrom: new Date().toISOString(),
        allowShortlet: true,
        guests_count: shortlet.floor_plan.guests_count,
        beds_count: shortlet.floor_plan.beds_count,
        privacy_type: shortlet.privacy_type,
        property_structure: shortlet.property_structure,
        booking_model: shortlet.booking_model,
        weekend_pricing: shortlet.pricing.weekend_pricing ?? null,
        discounts: shortlet.discounts ?? null,
        highlights: shortlet.highlights ?? null,
        house_rules: shortlet.house_rules ?? null,
        safety_disclosures: shortlet.safety_disclosures ?? null,
        kyc_compliance: shortlet.kyc_compliance ?? null,
        photos: shortlet.photos ?? null,
        ownerId: userId,
        area: shortlet.location.formatted_address,
      };

      try {
        listing = await prisma.listing.create({ data: prismaData } as any);
      } catch (error) {
        console.warn('Shortlet listing create warning (missing Prisma fields?):', error);
        const {
          guests_count,
          beds_count,
          privacy_type,
          property_structure,
          booking_model,
          weekend_pricing,
          discounts,
          highlights,
          house_rules,
          safety_disclosures,
          kyc_compliance,
          photos,
          ...safeData
        } = prismaData;
        console.warn('Falling back to legacy fields only for shortlet listing create');
        listing = await prisma.listing.create({ data: safeData } as any);
      }
    } else {
      listing = await prisma.listing.create({
        data: {
          ...validated,
          area: validated.area || validated.address,
          ownerId: userId,
          price: validated.price,
          cautionDeposit: validated.cautionDeposit ?? null,
          serviceCharge: validated.serviceCharge ?? null,
        },
      });
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Listings POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: (error as Error & { errors?: unknown }).errors ?? error,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}