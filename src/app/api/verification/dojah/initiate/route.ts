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
        return_url: new URL('/verification/submitted', request.nextUrl.origin).toString(),
      },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    await prisma.userKyc.update({
      where: { userId: user.id },
      data: {
        dojahRef: result.referenceId || referenceId,
        status: KycStatus.in_progress,
        metadata: result.data,
      },
    });

    const redirectUrl =
      (result.data && typeof result.data === 'object' && 'redirect_url' in result.data && typeof (result.data as Record<string, unknown>).redirect_url === 'string'
        ? ((result.data as Record<string, unknown>).redirect_url as string)
        : undefined);

    return NextResponse.json({
      success: true,
      data: {
        referenceId: result.referenceId || referenceId,
        widgetId: appWidgetId,
        type,
        redirectUrl: redirectUrl || null,
      },
    });
  } catch (error) {
    console.error('Dojah initiate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
