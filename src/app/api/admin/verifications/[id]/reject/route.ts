import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { rejectVerificationSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/verifications/[id]/reject
 * Reject verification with reason
 * Body: { reason: string, layer?: number }
 * Allows landlord to resubmit
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = rejectVerificationSchema.parse(body);
    const verificationId = id;

    // Get verification
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Determine which layer to reject (default to current layer or layer 5)
    const layerToReject = validated.layer || verification.currentLayer || 5;

    // Build update data
    const updateData: Record<string, unknown> = {
      overallStatus: 'rejected',
      adminNotes: validated.reason,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    };

    // Set the specific layer status to rejected
    updateData[`l${layerToReject}Status`] = 'rejected';

    // Update verification
    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: updateData,
    });

    // Update listing tier back to basic
    await prisma.listing.update({
      where: { id: verification.listingId },
      data: {
        verificationTier: 'basic',
      },
    });

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: verification.listing.ownerId,
        type: 'verification',
        title: 'Verification Rejected',
        body: `Your property "${verification.listing.title}" verification was rejected at Layer ${layerToReject}. Reason: ${validated.reason}`,
        data: {
          verificationId: verification.id,
          listingId: verification.listingId,
          layer: layerToReject,
          reason: validated.reason,
          canResubmit: true,
        },
      },
    });

    // Create audit log
    await createAuditLog({
      adminId: user.id,
      action: 'reject_verification',
      targetType: 'verification',
      targetId: verificationId,
      details: {
        listingId: verification.listingId,
        listingTitle: verification.listing.title,
        layer: layerToReject,
        reason: validated.reason,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(updatedVerification, 'Verification rejected successfully');
  } catch (error) {
    console.error('Reject verification error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
