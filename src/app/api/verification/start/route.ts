import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { verificationService } from '@/lib/verification';
import { startVerificationSchema } from '@/lib/validators';
import { ZodError } from 'zod';

/**
 * POST /api/verification/start
 * Create a new verification record for a listing
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { listingId } = startVerificationSchema.parse(body);

    // Ownership gate: createVerification() trusts the ownerId it is handed, so
    // the caller must be proven to own the listing (or be an admin) here.
    // Without this, any authenticated user could start verification on someone
    // else's property and become the verification owner.
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'FORBIDDEN: You do not own this listing' },
        { status: 403 }
      );
    }

    // Create verification record
    const verification = await verificationService.createVerification(listingId, user.id);

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.overallStatus,
        listingId: verification.listingId,
        currentLayer: verification.currentLayer,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Start verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
