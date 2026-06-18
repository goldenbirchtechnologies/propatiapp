import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { verificationService } from '@/lib/verification';

const completeInspectionSchema = z.object({
  listingId: z.string().uuid(),
  reportUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = completeInspectionSchema.parse(body);

    const verification = await verificationService.completeInspection(
      validated.listingId,
      validated.reportUrl,
      user.id
    );

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification Layer 4 complete inspection error:', error);
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