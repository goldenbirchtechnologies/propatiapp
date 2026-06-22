import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { approveBusinessVerificationSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/business/verifications/[id]/approve
 * Approve business CAC verification and mark the linked entity as verified
 * Body: { notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = approveBusinessVerificationSchema.parse(body);
    const verificationId = params.id;

    const verification = await prisma.businessVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Business verification not found' },
        { status: 404 }
      );
    }

    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Verification has already been reviewed' },
        { status: 400 }
      );
    }

    // Update verification record
    const updatedVerification = await prisma.businessVerification.update({
      where: { id: verificationId },
      data: {
        status: 'approved',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        adminNotes: validated.notes || null,
      },
    });

    // Mark the linked entity as verified
    if (verification.entityType === 'law_firm') {
      await prisma.lawFirm.update({
        where: { id: verification.entityId },
        data: { verified: true },
      });
    } else if (verification.entityType === 'organisation') {
      await prisma.organisation.update({
        where: { id: verification.entityId },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });
    } else if (verification.entityType === 'business_profile') {
      await prisma.businessProfile.update({
        where: { id: verification.entityId },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });
    }

    // Create audit log
    await createAuditLog({
      adminId: user.id,
      action: 'approve_business_verification',
      targetType: 'business_verification',
      targetId: verificationId,
      details: {
        entityType: verification.entityType,
        entityId: verification.entityId,
        cacNumber: verification.cacNumber,
        notes: validated.notes,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(updatedVerification, 'Business verification approved successfully');
  } catch (error) {
    console.error('Approve business verification error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
