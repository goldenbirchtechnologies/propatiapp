import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { requestInspectionSchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = requestInspectionSchema.parse(body);

    const verification = await verificationService.requestInspection(
      validated.listingId,
      new Date(validated.preferredDate)
    );

    return NextResponse.json({ success: true, data: verification }, { status: 201 });
  } catch (error) {
    console.error('Verification Layer 4 inspection request error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes('Must complete Layer')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}