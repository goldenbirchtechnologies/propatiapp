import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/verification/[id]/identity-status
 * Get identity verification status for a verification record
 *
 * Params:
 *   - id: Verification ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = params.id;

    if (!verificationId) {
      return NextResponse.json(
        { success: false, error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    // Fetch verification record
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
        owner: {
          select: {
            id: true,
            fullName: true,
            idVerified: true,
            idType: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Verification record not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin role
    const isOwner = verification.ownerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Return identity verification status
    return NextResponse.json(
      {
        success: true,
        data: {
          verified: verification.l2Status === 'approved',
          status: verification.l2Status,
          idType: verification.l2IdType,
          verifiedAt: verification.l2VerifiedAt,
          currentLayer: verification.currentLayer,
          overallStatus: verification.overallStatus,
          // If you add identityData field to schema, return it here
          // identityData: verification.identityData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get identity status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
