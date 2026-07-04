import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { embedStampCertificate } from '@/lib/stamp-duty';
import crypto from 'crypto';

const REMITA_API_KEY = process.env.REMITA_API_KEY;

function verifyRemitaSignature(payload: string, signature: string): boolean {
  if (!REMITA_API_KEY) return false;
  const expected = crypto
    .createHash('sha512')
    .update(`${payload}${REMITA_API_KEY}`)
    .digest('hex');
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-remita-signature') ?? '';

    if (REMITA_API_KEY && !verifyRemitaSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as RemitaWebhookEvent;

    if (event.type !== 'STAMP_DUTY_PAYMENT' && event.type !== 'PAYMENT_NOTIFICATION') {
      return NextResponse.json({ received: true });
    }

    const rrr: string = event.data?.RRR ?? event.data?.rrr ?? '';
    if (!rrr) {
      return NextResponse.json({ received: true });
    }

    const stampDuty = await prisma.stampDuty.findFirst({
      where: { remitaRrr: rrr },
    });

    if (!stampDuty) {
      return NextResponse.json({ received: true });
    }

    if (
      stampDuty.status === 'paid' ||
      stampDuty.status === 'issued'
    ) {
      return NextResponse.json({ received: true });
    }

    const paymentStatus: string = event.data?.status ?? event.data?.paymentStatus ?? '';
    const isPaid = paymentStatus === '00' || paymentStatus === '01' || paymentStatus === 'SUCCESSFUL';

    if (!isPaid) {
      const isFailed =
        paymentStatus === 'FAILED' ||
        paymentStatus === '021' ||
        paymentStatus === '062';

      if (isFailed) {
        await prisma.stampDuty.update({
          where: { id: stampDuty.id },
          data: { status: 'failed' },
        });
      }

      return NextResponse.json({ received: true });
    }

    const transactionId: string = event.data?.transactionId ?? event.data?.paymentId ?? '';
    const certificateNumber: string =
      event.data?.firsStampCertNo ??
      event.data?.certificateNumber ??
      `FIRS-WH-${rrr}-${Date.now()}`;
    const certificateUrl: string = event.data?.certificateUrl ?? '';
    const paidAt = new Date();

    await prisma.stampDuty.update({
      where: { id: stampDuty.id },
      data: {
        status: 'paid',
        transactionId: transactionId || null,
        certificateNumber,
        certificateUrl: certificateUrl || null,
        paidAt,
      },
    });

    if (certificateNumber && certificateUrl) {
      try {
        await embedStampCertificate({
          agreementId: stampDuty.agreementId,
          certificateNumber,
          certificateUrl,
          paidAt,
        });

        await prisma.stampDuty.update({
          where: { id: stampDuty.id },
          data: {
            status: 'issued',
            issuedAt: new Date(),
          },
        });
      } catch (embedError) {
        console.error('[Remita Webhook] Embed error:', embedError);
      }
    }

    await prisma.notification.create({
      data: {
        userId: (
          await prisma.agreement.findUnique({
            where: { id: stampDuty.agreementId },
            select: { tenantId: true },
          })
        )?.tenantId ?? '',
        type: 'payment',
        title: 'Stamp Duty Certificate Issued',
        body: `Your stamp duty has been paid and an e-certificate (${certificateNumber}) has been issued for your tenancy agreement.`,
        data: {
          agreementId: stampDuty.agreementId,
          certificateNumber,
          certificateUrl,
        },
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Remita Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface RemitaWebhookEvent {
  type: string;
  data: {
    RRR?: string;
    rrr?: string;
    status?: string;
    paymentStatus?: string;
    transactionId?: string;
    paymentId?: string;
    firsStampCertNo?: string;
    certificateNumber?: string;
    certificateUrl?: string;
    amount?: string;
    [key: string]: unknown;
  };
}
