import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { getAppUrl } from '@/lib/urls';

const CARD_SETUP_AMOUNT_KOBO = 5000;

/** Start Paystack's required first card transaction for a reusable authorization. */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  if (user.role !== 'tenant') {
    return NextResponse.json({ error: 'Only tenants can add tenant payment methods.' }, { status: 403 });
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Your account needs an email address before a card can be linked.' }, { status: 400 });
  }

  const reference = `PROPATI_CARD_SETUP_${Date.now()}_${randomBytes(4).toString('hex')}`.toUpperCase();
  const callbackUrl = `${getAppUrl()}/dashboard/tenant/payments/methods/card/callback?reference=${encodeURIComponent(reference)}`;

  try {
    await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: 'card',
        provider: 'paystack',
        emailUsed: user.email,
        setupReference: reference,
        status: 'pending',
        metadata: { purpose: 'reusable_card_setup', amountKobo: CARD_SETUP_AMOUNT_KOBO },
      },
    });

    const response = await paystack.initializePayment({
      email: user.email,
      amount: CARD_SETUP_AMOUNT_KOBO,
      reference,
      callback_url: callbackUrl,
      channels: ['card'],
      metadata: {
        purpose: 'reusable_card_setup',
        userId: user.id,
        paymentMethodReference: reference,
      },
    });

    if (!response.status || !response.data?.authorization_url) {
      await prisma.paymentMethod.update({ where: { setupReference: reference }, data: { status: 'failed' } });
      return NextResponse.json({ error: response.message || 'Paystack could not start card verification.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference,
      amountNaira: CARD_SETUP_AMOUNT_KOBO / 100,
    });
  } catch (error) {
    await prisma.paymentMethod.updateMany({ where: { setupReference: reference, userId: user.id }, data: { status: 'failed' } }).catch(() => undefined);
    console.error('[card setup] initiation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start card verification.' }, { status: 502 });
  }
}
