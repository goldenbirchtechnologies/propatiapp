import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDojahService } from '@/lib/dojah';
import { KycStatus } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-dojah-signature') || request.headers.get('x-signature');

    const dojahService = getDojahService();
    const signatureValid = dojahService.verifyWebhookSignature(rawBody, signature);
    if (!signatureValid) {
      console.warn('[Dojah] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      referenceId?: string;
      reference_id?: string;
      status?: string;
      event?: string;
      data?: Record<string, unknown>;
    };

    const referenceId = payload.referenceId || payload.reference_id;
    const eventStatus = payload.status || payload.event;

    if (!referenceId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 });
    }

    const kyc = await prisma.userKyc.findFirst({
      where: { dojahRef: referenceId },
      include: { user: true },
    });

    if (!kyc) {
      console.warn(`[Dojah] Webhook for unknown reference: ${referenceId}`);
      return NextResponse.json({ success: true, message: 'Reference not found' }, { status: 200 });
    }

    const mappedStatus = mapWebhookStatus(eventStatus);
    const isFinalStatus = ['approved', 'rejected'].includes(mappedStatus);

    await prisma.userKyc.update({
      where: { id: kyc.id },
      data: {
        status: mappedStatus,
        metadata: {
          ...((typeof kyc.metadata === 'object' && kyc.metadata) || {}),
          lastWebhook: payload,
          updatedAt: new Date().toISOString(),
        },
        verifiedAt: isFinalStatus && mappedStatus === KycStatus.approved ? new Date() : undefined,
        rejectedAt: isFinalStatus && mappedStatus === KycStatus.rejected ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, status: mappedStatus });
  } catch (error) {
    console.error('Dojah webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function mapWebhookStatus(status: string | undefined): KycStatus {
  if (!status) return 'in_progress';

  const normalized = status.toLowerCase();

  if (['approved', 'success', 'verified', 'complete', 'completed'].includes(normalized)) {
    return 'approved';
  }

  if (['rejected', 'failed', 'denied'].includes(normalized)) {
    return 'rejected';
  }

  if (['review', 'requires_review', 'manual_review', 'pending_review'].includes(normalized)) {
    return 'requires_review';
  }

  return 'in_progress';
}
