import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { TransactionStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, ownerId: true, agentId: true } },
        payer: { select: { id: true, fullName: true, email: true } },
        payee: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Only payer or admin can verify
    if (transaction.payerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Check if already verified
    if (transaction.status === 'in_escrow' || transaction.status === 'released') {
      return NextResponse.json({ error: 'Transaction already verified', details: { status: transaction.status } }, { status: 400 });
    }

    if (!transaction.reference) {
      return NextResponse.json({ error: 'No Paystack reference found' }, { status: 400 });
    }

    // Verify with Paystack
    const paystackResponse = await paystack.verifyTransaction(transaction.reference);

    if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
      // Update transaction as failed
      await prisma.transaction.update({
        where: { id },
        data: {
          status: 'failed',
          paystackData: paystackResponse.data,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: 'Payment verification failed', details: paystackResponse.data.gateway_response },
        { status: 400 }
      );
    }

    // Update transaction to in_escrow
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'in_escrow',
        paystackData: paystackResponse.data,
        updatedAt: new Date(),
      },
      include: {
        listing: { select: { id: true, title: true } },
        payer: { select: { id: true, fullName: true, email: true } },
        payee: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: transaction.payerId,
        type: 'payment',
        title: 'Payment Verified',
        body: `Your payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} for ${transaction.listing?.title ?? "property"} has been verified and is held in escrow.`,
        data: { transactionId: transaction.id, reference: transaction.reference },
      },
    });

    await prisma.notification.create({
      data: {
        userId: transaction.payeeId,
        type: 'payment',
        title: 'Payment Received in Escrow',
        body: `₦${(Number(transaction.amount) / 100).toLocaleString()} has been paid for ${transaction.listing?.title ?? "property"} and is held in escrow.`,
        data: { transactionId: transaction.id, reference: transaction.reference },
      },
    });

    if (transaction.agentId) {
      await prisma.notification.create({
        data: {
          userId: transaction.agentId,
          type: 'payment',
          title: 'Commission Pending',
          body: `A payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} has been made for ${transaction.listing?.title ?? "property"}. Your commission will be calculated upon escrow release.`,
          data: { transactionId: transaction.id, reference: transaction.reference },
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}