import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { KycStatus, Prisma } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * POST /api/verification/dojah/initiate
 *
 * Prepares a Dojah *widget* session. The widget itself is launched entirely
 * client-side with the public key — Dojah has no server endpoint that creates
 * a widget session, so this route only mints a reference id, records that the
 * user has started KYC, and hands the id back to the browser.
 *
 * Direct API lookups (NIN/BVN) live at /api/verification/dojah/lookup.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json().catch(() => ({}));
    const { widgetId, metadata } = body as {
      widgetId?: string;
      metadata?: Record<string, unknown>;
    };

    const appWidgetId = widgetId || process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID;
    if (!appWidgetId) {
      return NextResponse.json({ success: false, error: 'Missing widget ID' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_DOJAH_APP_ID || !process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY) {
      return NextResponse.json(
        { success: false, error: 'DOJAH_NOT_CONFIGURED', message: 'Dojah public credentials are not set' },
        { status: 503 }
      );
    }

    const kyc = await prisma.userKyc.findUnique({ where: { userId: user.id } });
    if (kyc?.status === KycStatus.approved) {
      return NextResponse.json(
        { success: false, error: 'KYC already approved', status: kyc.status },
        { status: 400 }
      );
    }

    // Reference ids are echoed to the browser and appear in URLs, so they carry
    // a random token rather than anything identifying the user.
    const referenceId = `propati-kyc-${randomUUID()}`;

    // Widget metadata is arbitrary JSON from the client, which Prisma's input
    // type needs narrowed explicitly. Prior metadata is merged rather than
    // replaced so a verified identity already stored there survives a re-run.
    const startedMetadata = {
      ...((kyc && typeof kyc.metadata === 'object' && kyc.metadata) || {}),
      ...(metadata || {}),
      startedAt: new Date().toISOString(),
    } as unknown as Prisma.InputJsonValue;

    if (!kyc) {
      await prisma.userKyc.create({
        data: {
          userId: user.id,
          role: user.role,
          status: KycStatus.in_progress,
          level: 1,
          dojahRef: referenceId,
          metadata: startedMetadata,
        },
      });
    } else {
      await prisma.userKyc.update({
        where: { userId: user.id },
        data: {
          dojahRef: referenceId,
          status: KycStatus.in_progress,
          metadata: startedMetadata,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        referenceId,
        widgetId: appWidgetId,
        type: 'custom',
        redirectUrl: null,
      },
    });
  } catch (error) {
    console.error('Dojah initiate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
