import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateListingSchema } from '@/lib/validators';

// GET /api/listings/[id] - Public access to view single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch listing with all relations
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            phoneVerified: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        agent: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            avatarUrl: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        verification: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Only show active listings to public (unless authenticated owner/admin)
    const user = await getCurrentUser();
    const isOwner = user?.id === listing.ownerId;
    const isAdmin = user?.role === 'admin';

    if (listing.status !== 'active' && !isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Listing not available' },
        { status: 403 }
      );
    }

    // Increment view count (async, don't wait)
    prisma.listing
      .update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {}); // Ignore errors

    // Format response
    const coverImage =
      listing.images.find((img) => img.isCover)?.url || listing.images[0]?.url;

    const response = {
      success: true,
      data: {
        ...listing,
        priceFormatted: `₦${Number(listing.price).toLocaleString()}`,
        coverImage,
        verification: listing.verification
          ? {
              overallStatus: listing.verification.overallStatus,
              currentLayer: listing.verification.currentLayer,
              l1Status: listing.verification.l1Status,
              l2Status: listing.verification.l2Status,
              l3Status: listing.verification.l3Status,
              l4Status: listing.verification.l4Status,
              l5Status: listing.verification.l5Status,
              reviewedAt: listing.verification.reviewedAt,
            }
          : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/listings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update listing (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    // Check if listing exists and get owner
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify ownership (or admin)
    const isOwner = user.id === listing.ownerId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only update your own listings' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = updateListingSchema.parse(body);

    // Restrict admin-only fields
    if (!isAdmin) {
      delete (validated as Record<string, unknown>).verificationTier;
      delete (validated as Record<string, unknown>).isFeatured;
    }

    if (validated.status === 'active' && listing.status !== 'active') {
      const activeListingCount = await prisma.listing.count({
        where: { ownerId: user.id, status: 'active', id: { not: id } },
      });

      const subscription = await prisma.userSubscription.findFirst({
        where: { userId: user.id, status: 'active' },
        include: { plan: { select: { id: true, name: true, maxListings: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (subscription && subscription.plan && subscription.plan.maxListings > 0 && activeListingCount >= subscription.plan.maxListings) {
        return NextResponse.json(
          {
            success: false,
            error: `Active listing limit reached. Your ${subscription.plan.name} plan allows up to ${subscription.plan.maxListings} active listings.`,
          },
          { status: 403 }
        );
      }
    }

    // Support partial updates for shortlet fields.
    // Flatten nested master-payload structures (floor_plan, pricing, location)
    // into top-level Prisma fields if provided.
    const prismaData: Record<string, unknown> = { ...validated };

    if (body.floor_plan && typeof body.floor_plan === 'object') {
      const fp = body.floor_plan;
      if (fp.guests_count !== undefined) prismaData.guests_count = fp.guests_count;
      if (fp.beds_count !== undefined) prismaData.beds_count = fp.beds_count;
      if (fp.bedrooms_count !== undefined) prismaData.bedrooms_count = fp.bedrooms_count;
      if (fp.bathrooms_count !== undefined) prismaData.bathrooms_count = fp.bathrooms_count;
    }

    if (body.pricing && typeof body.pricing === 'object') {
      const p = body.pricing;
      if (p.base_price !== undefined) prismaData.price = p.base_price;
      if (p.weekend_pricing !== undefined) prismaData.weekend_pricing = p.weekend_pricing;
    }

    if (body.location && typeof body.location === 'object') {
      const loc = body.location;
      if (loc.formatted_address !== undefined) prismaData.address = loc.formatted_address;
    }

    // Update listing
    let updated;
    try {
      updated = await prisma.listing.update({
        where: { id },
        data: prismaData,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          images: true,
          verification: true,
        },
      });
    } catch (error: unknown) {
      console.warn('Shortlet listing update warning (missing Prisma fields?):', error);
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
      console.warn('Falling back to legacy fields only for shortlet listing update');
      updated = await prisma.listing.update({
        where: { id },
        data: safeData,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          images: true,
          verification: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      data: updated,
    });
  } catch (error: unknown) {
    console.error('PATCH /api/listings/[id] error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true, title: true },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const isOwner = listing.ownerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete your own listings' },
        { status: 403 }
      );
    }

    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Listing "${listing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error('DELETE /api/listings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
