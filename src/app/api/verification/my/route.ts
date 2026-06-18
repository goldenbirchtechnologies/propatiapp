import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { verificationService } from '@/lib/verification';
import { VerificationOverallStatus } from '@prisma/client';

/**
 * GET /api/verification/my
 * Get all verifications for current user
 * Query params: ?status=...&listingId=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as VerificationOverallStatus | null;
    const listingId = searchParams.get('listingId');

    // Get user verifications
    let verifications = await verificationService.getUserVerifications(
      user.id,
      status || undefined
    );

    // Filter by listingId if provided
    if (listingId) {
      verifications = verifications.filter((v) => v.listingId === listingId);
    }

    return NextResponse.json({
      success: true,
      data: verifications,
      count: verifications.length,
    });
  } catch (error) {
    console.error('My verifications GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
