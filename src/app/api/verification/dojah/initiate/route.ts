import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getDojahService } from '@/lib/dojah';
import { KycStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json().catch(() => ({}));
    const { type = 'custom', widgetId, userData, metadata } = body as {
      type?: 'custom' | 'verification' | 'identification' | 'liveness';
      widgetId?: string;
      userData?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };

    const appWidgetId = widgetId || process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID;
    if (!appWidgetId) {
      return NextResponse.json({ success: false, error: 'Missing widget ID' }, { status: 400 });
    }

    const kyc = await prisma.userKyc.findUnique({ where: { userId: user.id } });
    if (!kyc) {
      await prisma.userKyc.create({
        data: {
          userId: user.id,
          role: user.role,
          status: KycStatus.in_progress,
          level: 1,
          metadata: metadata || {},
        },
      });
    } else if (kyc.status === KycStatus.approved) {
      return NextResponse.json(
        { success: false, error: 'KYC already approved', status: kyc.status },
        { status: 400 }
      );
    }

    const referenceId = `propati-${user.id}-${Date.now()}`;
    const dojahService = getDojahService();
    const result = await dojahService.createVerification({
      type,
      widgetId: appWidgetId,
      referenceId,
      userData,
      metadata: {
        ...metadata,
        user_id: user.id,
        role: user.role,
      },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    await prisma.userKyc.update({
      where: { userId: user.id },
      data: {
        dojahRef: referenceId,
        status: KycStatus.in_progress,
        metadata: result.data,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        referenceId,
        widgetId: appWidgetId,
        type,
        appId: process.env.NEXT_PUBLIC_DOJAH_APP_ID,
        publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY,
      },
    });
  } catch (error) {
    console.error('Dojah initiate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
