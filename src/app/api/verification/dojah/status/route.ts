import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getDojahService } from '@/lib/dojah';

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

    let dojahData = null;
    if (kyc.dojahRef && kyc.status !== 'not_started') {
      const dojahService = getDojahService();
      const details = await dojahService.getVerificationDetails(kyc.dojahRef);
      if (details.success && details.data) {
        dojahData = details.data;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...kyc,
        dojahData,
      },
    });
  } catch (error) {
    console.error('Dojah status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
