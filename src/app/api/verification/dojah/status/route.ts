import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const kyc = await prisma.userKyc.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        level: true,
        dojahRef: true,
        verifiedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!kyc) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'not_started',
          level: 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...kyc,
      },
    });
  } catch (error) {
    console.error('Dojah status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
