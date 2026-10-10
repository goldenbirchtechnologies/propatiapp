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
    const { page, limit, sortBy, order, q, ownerId, ids: rawIds, ...filters } = validated as typeof validated & { ids?: string };
    const skip = (page - 1) * limit;
    const take = limit;

    // Compare mode: ?ids=id1,id2,id3 fetches those exact listings (max 3)
    const compareIds = rawIds
      ? rawIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 3)
      : null;

    // Build where clause
    const where: Record<string, unknown> = compareIds
      ? { id: { in: compareIds } }
      : {
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

    if (filters.countryId) where.countryId = filters.countryId;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.zipCode) where.zipCode = filters.zipCode;

    // Bathrooms range
    if (filters.minBathrooms !== undefined || filters.maxBathrooms !== undefined) {
      const bathFilter: { gte?: number; lte?: number } = {};
      if (filters.minBathrooms !== undefined) bathFilter.gte = filters.minBathrooms;
      if (filters.maxBathrooms !== undefined) bathFilter.lte = filters.maxBathrooms;
      where.bathrooms = bathFilter;
    }

    if (filters.furnished === 'true') where.furnished = true;
    if (filters.furnished === 'false') where.furnished = false;

    // Pet-friendly: amenities Json contains 'pet_friendly'
    if (filters.petFriendly === 'true') {
      // Prisma Json contains not supported on all drivers; use string contains fallback
      // For now filter in-memory after fetch if needed, but try has-string
      // We'll not add where clause here to avoid DB error — handled post-fetch if needed
    }

    // Bounding box filter — via swLat/swLng/neLat/neLng or bbox string
    let bbox: { swLat: number; swLng: number; neLat: number; neLng: number } | null = null;
    if (filters.bbox) {
      const parts = filters.bbox.split(',').map((s) => Number(s.trim()));
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        const [swLng, swLat, neLng, neLat] = parts;
        bbox = { swLat, swLng, neLat, neLng };
      }
    } else if (
      filters.swLat !== undefined &&
      filters.swLng !== undefined &&
      filters.neLat !== undefined &&
      filters.neLng !== undefined
    ) {
      bbox = {
        swLat: filters.swLat as number,
        swLng: filters.swLng as number,
        neLat: filters.neLat as number,
        neLng: filters.neLng as number,
      };
    }
    if (bbox) {
      (where as Record<string, unknown>).latitude = {
        gte: Math.min(bbox.swLat, bbox.neLat),
        lte: Math.max(bbox.swLat, bbox.neLat),
      };
      (where as Record<string, unknown>).longitude = {
        gte: Math.min(bbox.swLng, bbox.neLng),
        lte: Math.max(bbox.swLng, bbox.neLng),
      };
    }

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
    const unitId = (body as any)?.unitId as string | undefined;

    if (unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { property: true },
      });

      if (!unit) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
      }

      const merged = {
        ...(validated as any),
        title: (validated as any).title || unit.listingTitle || `${unit.buildingName || 'Property'} - Unit ${unit.unitNumber}`,
        address: (validated as any).address || unit.address,
        area: (validated as any).area || unit.area || unit.address,
        state: (validated as any).state || unit.state || 'Lagos',
        price: (validated as any).price || Number(unit.rent || 0),
        pricePeriod: (validated as any).pricePeriod || unit.pricePeriod || 'month',
        bedrooms: (validated as any).bedrooms ?? unit.bedrooms ?? undefined,
        bathrooms: (validated as any).bathrooms ?? unit.bathrooms ?? undefined,
        sizeSqm: (validated as any).sizeSqm ?? (unit.sizeSqm ? Number(unit.sizeSqm) : undefined),
        listingType: (validated as any).listingType || unit.listingType || 'rent',
        propertyType: (validated as any).propertyType || unit.type || undefined,
        cautionDeposit: (validated as any).cautionDeposit ?? (unit.cautionDeposit ? Number(unit.cautionDeposit) : undefined),
        serviceCharge: (validated as any).serviceCharge ?? (unit.serviceCharge ? Number(unit.serviceCharge) : undefined),
        minimumStay: (validated as any).minimumStay ?? unit.minimumStay ?? undefined,
        description: (validated as any).description || unit.listingTitle || `Unit ${unit.unitNumber}`,
      };

      listing = await prisma.listing.create({
        data: {
          ...merged,
          ownerId: userId,
          area: merged.area || merged.address,
          cautionDeposit: merged.cautionDeposit ?? null,
          serviceCharge: merged.serviceCharge ?? null,
        } as any,
      });

      await prisma.unit.update({
        where: { id: unit.id },
        data: {
          listingId: listing.id,
          isListed: true,
        },
      });

      return NextResponse.json(listing, { status: 201 });
    }

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