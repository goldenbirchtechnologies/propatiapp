import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { flaggedListingsFiltersSchema } from '@/lib/validators';

/**
 * GET /api/admin/flagged-listings
 * List flagged listings with flag details
 * Query: ?resolved=false&flagType=...&page=...&limit=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const validated = flaggedListingsFiltersSchema.parse(params);

    const { page, limit, resolved, flagType } = validated;
    const skip = (page - 1) * limit;

    // Build where clause for flags
    const flagWhere: any = {};

    if (resolved !== undefined) {
      flagWhere.status = resolved ? { in: ['reviewed', 'dismissed'] } : 'open';
    }

    if (flagType) {
      flagWhere.type = flagType;
    }

    // Get flagged listings
    // Group by listing and count flags
    const flaggedListings = await prisma.listingFlag.groupBy({
      by: ['listingId'],
      where: flagWhere,
      _count: {
        listingId: true,
      },
      orderBy: {
        _count: {
          listingId: 'desc', // Most flagged first
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.listingFlag.groupBy({
      by: ['listingId'],
      where: flagWhere,
    }).then((results) => results.length);

    // Get full listing details for each flagged listing
    const listingIds = flaggedListings.map((f) => f.listingId);

    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            isBanned: true,
          },
        },
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
        flags: {
          where: flagWhere,
          include: {
            flaggedByUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Format response
    const formattedListings = listings.map((listing) => {
      const flagCount = flaggedListings.find((f) => f.listingId === listing.id)?._count.listingId || 0;

      // Group flags by type
      const flagsByType = listing.flags.reduce((acc, flag) => {
        acc[flag.type] = (acc[flag.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: listing.id,
        title: listing.title,
        address: listing.address,
        area: listing.area,
        propertyType: listing.propertyType,
        listingType: listing.listingType,
        status: listing.status,
        price: listing.price,
        coverImage: listing.images[0]?.url || null,
        owner: listing.owner,
        flagCount,
        flagsByType,
        flags: listing.flags.map((flag) => ({
          id: flag.id,
          type: flag.type,
          description: flag.description,
          status: flag.status,
          createdAt: flag.createdAt,
          reporter: flag.flaggedByUser,
        })),
        createdAt: listing.createdAt,
      };
    });

    return paginatedResponse(formattedListings, page, limit, total);
  } catch (error) {
    console.error('Flagged listings error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
