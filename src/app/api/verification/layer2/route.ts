import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { layer2IdentitySchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = layer2IdentitySchema.parse(body);

    const kyc = await prisma.userKyc.findUnique({ where: { userId: user.id }, select: { status: true } });
    if (kyc?.status !== 'approved') {
      return NextResponse.json({ error: 'Complete Dojah identity verification first.' }, { status: 403 });
    }
    const accountUser = await prisma.user.findUnique({ where: { id: user.id }, select: { idType: true } });

    await verificationService.submitLayer2(
      validated.listingId,
      (validated.idType || accountUser?.idType || 'nin') as 'nin' | 'bvn',
      user.id
    );
    const verification = await verificationService.confirmLayer2(validated.listingId, true, user.id);

    return NextResponse.json({ success: true, data: verification }, { status: 201 });
  } catch (error) {
    console.error('Verification Layer 2 submit error:', error);
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
