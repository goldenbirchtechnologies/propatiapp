import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDojahService } from '@/lib/dojah';
import { KycStatus, Prisma } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * POST /api/verification/dojah/webhook
 *
 * Dojah calls this when a widget session finishes. Two signature headers are in
 * circulation — `x-dojah-signature` (HMAC of the body, per-subscription secret)
 * and `x-dojah-signature-v2` (SHA256 of the API secret key) — so both are
 * offered to the verifier and either is enough.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-dojah-signature') || request.headers.get('x-signature');
    const signatureV2 = request.headers.get('x-dojah-signature-v2');

    const dojahService = getDojahService();
    const signatureValid = dojahService.verifyWebhookSignature(rawBody, { signature, signatureV2 });
    if (!signatureValid) {
      console.warn('[Dojah] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      referenceId?: string;
      reference_id?: string;
      verification_status?: string;
      status?: boolean | string;
      event?: string;
      data?: Record<string, unknown>;
    };

    // Widget callbacks nest the result under `data`; older payloads are flat.
    const body = (payload.data && typeof payload.data === 'object' ? payload.data : payload) as Record<
      string,
      unknown
    >;

    const referenceId =
      readString(body, 'reference_id', 'referenceId') ||
      readString(payload as Record<string, unknown>, 'reference_id', 'referenceId');
    const eventStatus = readString(payload as Record<string, unknown>, 'status', 'event');

    if (!referenceId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 });
    }

    const kyc = await prisma.userKyc.findFirst({
      where: { dojahRef: referenceId },
      include: { user: true },
    });

    if (!kyc) {
      console.warn(`[Dojah] Webhook for unknown reference: ${referenceId}`);
      // Acknowledge so Dojah stops retrying an id we never issued.
      return NextResponse.json({ success: true, message: 'Reference not found' }, { status: 200 });
    }

    // `Completed` only means the session reached the end — whether the user
    // passed is the boolean `status`. The service owns that reading.
    const mappedStatus = dojahService.mapDojahStatus({
      ...(body as Record<string, unknown>),
      status: body.status ?? eventStatus,
    }) as KycStatus;
    const isFinalStatus = mappedStatus === KycStatus.approved || mappedStatus === KycStatus.rejected;

    await prisma.userKyc.update({
      where: { id: kyc.id },
      data: {
        status: mappedStatus,
        metadata: {
          ...((typeof kyc.metadata === 'object' && kyc.metadata) || {}),
          lastWebhook: payload as unknown as Prisma.InputJsonValue,
          updatedAt: new Date().toISOString(),
        },
        verifiedAt: isFinalStatus && mappedStatus === KycStatus.approved ? new Date() : undefined,
        rejectedAt: isFinalStatus && mappedStatus === KycStatus.rejected ? new Date() : undefined,
        ...(isFinalStatus && mappedStatus === KycStatus.approved
          ? { rejectionReason: null }
          : {}),
      },
    });

    return NextResponse.json({ success: true, status: mappedStatus });
  } catch (error) {
    console.error('Dojah webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function readString(node: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!node) return undefined;
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}
