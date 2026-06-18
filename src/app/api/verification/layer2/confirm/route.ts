import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { confirmIdentitySchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = confirmIdentitySchema.parse(body);

    const verification = await verificationService.confirmLayer2(
      validated.listingId,
      validated.confirmed,
      user.id
    );

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification Layer 2 confirm error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}