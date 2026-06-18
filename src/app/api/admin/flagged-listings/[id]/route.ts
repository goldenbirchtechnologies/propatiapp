import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { dismissFlagsSchema, suspendListingSchema, banUserSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/flagged-listings/[id]/dismiss
 * Dismiss all flags for a listing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    const listingId = params.id;

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        status: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (action === 'dismiss') {
      // Dismiss all flags
      const body = await request.json();
      const validated = dismissFlagsSchema.parse(body);

      await prisma.listingFlag.updateMany({
        where: {
          listingId,
          status: 'open',
        },
        data: {
          status: 'dismissed',
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: user.id,
        action: 'dismiss_flags',
        targetType: 'listing',
        targetId: listingId,
        details: {
          listingTitle: listing.title,
          reason: validated.reason,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse({ listingId, flagsDismissed: true }, 'All flags dismissed');
    }

    if (action === 'suspend') {
      // Suspend listing
      const body = await request.json();
      const validated = suspendListingSchema.parse(body);

      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          status: 'suspended',
        },
      });

      // Update all open flags to reviewed
      await prisma.listingFlag.updateMany({
        where: {
          listingId,
          status: 'open',
        },
        data: {
          status: 'reviewed',
        },
      });

      // Notify owner
      await prisma.notification.create({
        data: {
          userId: listing.ownerId,
          type: 'system',
          title: 'Listing Suspended',
          body: `Your listing "${listing.title}" has been suspended. Reason: ${validated.reason}`,
          data: {
            listingId,
            reason: validated.reason,
          },
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: user.id,
        action: 'suspend_listing',
        targetType: 'listing',
        targetId: listingId,
        details: {
          listingTitle: listing.title,
          reason: validated.reason,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse(updatedListing, 'Listing suspended successfully');
    }

    if (action === 'ban-user') {
      // Ban the user who owns the listing
      const body = await request.json();
      const validated = banUserSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id: listing.ownerId },
        data: {
          isBanned: true,
          isActive: false,
          banReason: validated.reason,
        },
      });

      // Suspend all their listings
      await prisma.listing.updateMany({
        where: { ownerId: listing.ownerId },
        data: {
          status: 'suspended',
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: listing.ownerId,
          type: 'system',
          title: 'Account Banned',
          body: `Your account has been banned. Reason: ${validated.reason}`,
          data: {
            reason: validated.reason,
          },
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: user.id,
        action: 'ban_user',
        targetType: 'user',
        targetId: listing.ownerId,
        details: {
          reason: validated.reason,
          triggeredByListing: listingId,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse({ userId: listing.ownerId, banned: true }, 'User banned successfully');
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Flag management error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
