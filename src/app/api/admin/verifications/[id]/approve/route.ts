import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { approveVerificationSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/verifications/[id]/approve
 * Approve verification and certify listing
 * Body: { notes?: string }
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
    const validated = approveVerificationSchema.parse(body);
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

    // Check if all previous layers are approved
    if (
      verification.l1Status !== 'approved' ||
      verification.l2Status !== 'approved' ||
      verification.l3Status !== 'approved' ||
      verification.l4Status !== 'approved'
    ) {
      return NextResponse.json(
        { error: 'Cannot approve: Previous layers are not all approved' },
        { status: 400 }
      );
    }

    // Update verification to certified
    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        l5Status: 'approved',
        overallStatus: 'certified',
        currentLayer: 5,
        adminNotes: validated.notes || null,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    // Update listing tier to certified
    await prisma.listing.update({
      where: { id: verification.listingId },
      data: {
        verificationTier: 'certified',
      },
    });

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: verification.listing.ownerId,
        type: 'verification',
        title: 'Property Verified!',
        body: `Your property "${verification.listing.title}" has been certified. It now has full verification status.`,
        data: {
          verificationId: verification.id,
          listingId: verification.listingId,
          tier: 'certified',
        },
      },
    });

    // Create audit log
    await createAuditLog({
      adminId: user.id,
      action: 'approve_verification',
      targetType: 'verification',
      targetId: verificationId,
      details: {
        listingId: verification.listingId,
        listingTitle: verification.listing.title,
        notes: validated.notes,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(updatedVerification, 'Verification approved successfully');
  } catch (error) {
    console.error('Approve verification error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
