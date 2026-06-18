import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { verificationService } from '@/lib/verification';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { listingId } = await params;

  try {
    const verification = await verificationService.getVerificationStatus(listingId);

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification record not found' },
        { status: 404 }
      );
    }

    // Check permissions: owner, agent, or admin can view
    if (
      verification.ownerId !== user.id &&
      verification.listing.agentId !== user.id &&
      user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification status GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}