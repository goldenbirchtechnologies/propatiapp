import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { rejectBusinessVerificationSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/business/verifications/[id]/reject
 * Reject business CAC verification with reason
 * Body: { reason: string }
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
    const validated = rejectBusinessVerificationSchema.parse(body);
    const verificationId = id;

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

    const updatedVerification = await prisma.businessVerification.update({
      where: { id: verificationId },
      data: {
        status: 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        adminNotes: validated.reason,
      },
    });

    // Create audit log
    await createAuditLog({
      adminId: user.id,
      action: 'reject_business_verification',
      targetType: 'business_verification',
      targetId: verificationId,
      details: {
        entityType: verification.entityType,
        entityId: verification.entityId,
        cacNumber: verification.cacNumber,
        reason: validated.reason,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(updatedVerification, 'Business verification rejected successfully');
  } catch (error) {
    console.error('Reject business verification error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
