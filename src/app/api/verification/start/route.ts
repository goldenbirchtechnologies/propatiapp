import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
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
