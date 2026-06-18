import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { uploadVideoSchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = uploadVideoSchema.parse(body);

    // QR code generation would typically happen client-side or via a service
    // For now, generate a simple QR code reference
    const qrCode = `L3-${validated.listingId}-${Date.now()}`;

    const verification = await verificationService.uploadVideo(
      validated.listingId,
      validated.videoUrl,
      qrCode
    );

    return NextResponse.json({ success: true, data: verification }, { status: 201 });
  } catch (error) {
    console.error('Verification Layer 3 upload error:', error);
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