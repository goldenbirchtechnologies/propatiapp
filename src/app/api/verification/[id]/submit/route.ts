import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { canSubmitForReview } from '@/lib/verification-helpers';

/**
 * POST /api/verification/[id]/submit
 * Submit verification for final admin review (Layer 5)
 * Checks that all layers 1-4 are complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Check permissions: only owner can submit
    if (verification.ownerId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Check if all layers are complete
    if (!canSubmitForReview(verification)) {
      return NextResponse.json(
        {
          error: 'Cannot submit for review',
          message: 'All layers (1-4) must be approved before submitting for final review',
          currentStatus: {
            layer1: verification.l1Status,
            layer2: verification.l2Status,
            layer3: verification.l3Status,
            layer4: verification.l4Status,
          },
        },
        { status: 400 }
      );
    }

    // Update verification to Layer 5 - Admin Review
    const updated = await prisma.verification.update({
      where: { id },
      data: {
        currentLayer: 5,
        l5Status: 'pending',
        updatedAt: new Date(),
      },
    });

    // Notify admin team
    const admins = await prisma.user.findMany({
      where: { role: 'admin', isActive: true },
    });

    // Create notifications for all admins
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'verification',
        title: 'New Verification Ready for Final Review',
        body: `Property "${verification.listing.title}" has completed all verification layers and is ready for certification.`,
        data: {
          verificationId: verification.id,
          listingId: verification.listingId,
          listingTitle: verification.listing.title,
          ownerId: verification.ownerId,
          ownerName: verification.owner.fullName,
        },
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification submitted for final admin review',
      data: updated,
    });
  } catch (error) {
    console.error('Verification submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
