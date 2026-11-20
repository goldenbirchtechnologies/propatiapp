import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

/** Verify the setup charge, persist the reusable authorization, then refund the setup charge. */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const reference = request.nextUrl.searchParams.get('reference');

  if (!reference) return NextResponse.json({ error: 'Missing card setup reference.' }, { status: 400 });

  const method = await prisma.paymentMethod.findUnique({ where: { setupReference: reference } });
  if (!method || method.userId !== user.id || method.type !== 'card') {
    return NextResponse.json({ error: 'Card setup request not found.' }, { status: 404 });
  }
  if (method.status === 'active') {
    return NextResponse.json({ success: true, status: 'active', cardLast4: method.cardLast4, cardBrand: method.cardBrand, refunded: true });
  }

  try {
    const verified = await paystack.verifyPayment(reference);
    const authorization = verified.data?.authorization;
    const cardPayment = verified.status && verified.data?.status === 'success' && verified.data?.channel === 'card';

    if (!cardPayment || !authorization?.authorization_code || !authorization.reusable) {
      await prisma.paymentMethod.update({ where: { id: method.id }, data: { status: 'failed', metadata: verified.data as object } });
      return NextResponse.json({ error: 'Paystack did not return a reusable card authorization.' }, { status: 400 });
    }

    await prisma.paymentMethod.update({
      where: { id: method.id },
      data: {
        status: 'active',
        authorizationCode: authorization.authorization_code,
        authorizationSignature: authorization.signature || null,
        cardBrand: authorization.brand || null,
        cardType: authorization.card_type || null,
        cardLast4: authorization.last4 || null,
        cardExpMonth: authorization.exp_month || null,
        cardExpYear: authorization.exp_year || null,
        bankName: authorization.bank || null,
        metadata: { verifiedReference: reference, channel: verified.data.channel, reusable: authorization.reusable },
      },
    });

    let refunded = false;
    try {
      const refund = await paystack.createRefund({
        transaction: reference,
        amount: 5000,
        currency: 'NGN',
        customer_note: 'Card verification charge refund',
        merchant_note: `Refund for reusable card setup ${reference}`,
        reference: `REFUND_${reference}`.slice(0, 64),
      });
      refunded = Boolean(refund?.status);
    } catch (refundError) {
      console.error('[card setup] refund initiation failed:', refundError);
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      refunded,
      cardLast4: authorization.last4,
      cardBrand: authorization.brand || authorization.card_type,
      message: refunded ? 'Card saved and verification charge refund initiated.' : 'Card saved. The verification charge refund needs attention.',
    });
  } catch (error) {
    console.error('[card setup] completion failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to verify card setup.' }, { status: 502 });
  }
}
