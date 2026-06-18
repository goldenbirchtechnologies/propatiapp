import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { adminReviewSchema, verifyIdentitySchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = adminReviewSchema.parse(body);

    const verification = await verificationService.adminReviewLayer1(
      validated.listingId,
      validated.action === 'approve',
      validated.notes,
      user.id
    );

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification Layer 1 admin review error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('Invalid transition')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}