import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

/**
 * GET /api/payments/verify/[reference]
 * Verifies a payment with Paystack and updates transaction status
 *
 * Returns: { success, transaction, status }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { reference } = await params;

  try {
    // Find transaction by reference
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
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

    // Only payer, payee, or admin can verify
    const canVerify =
      transaction.payerId === user.id ||
      transaction.payeeId === user.id ||
      user.role === 'admin';

    if (!canVerify) {
      return NextResponse.json({ error: 'FORBIDDEN: Not authorized to verify this transaction' }, { status: 403 });
    }

    // Check if already verified
    if (transaction.status === 'in_escrow' || transaction.status === 'released') {
      return NextResponse.json({
        success: true,
        transaction,
        status: transaction.status,
        message: 'Transaction already verified',
      });
    }

    // Verify with Paystack
    console.log(`Verifying payment with Paystack: ${reference}`);
    const paystackResponse = await paystack.verifyTransaction(reference);

    if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
      // Update transaction as failed
      const updated = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          paystackData: paystackResponse.data,
          description: `Payment failed: ${paystackResponse.data.gateway_response || 'Unknown error'}`,
          updatedAt: new Date(),
        },
        include: {
          listing: { select: { id: true, title: true } },
          payer: { select: { id: true, fullName: true, email: true } },
          payee: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Create notification for payer
      await prisma.notification.create({
        data: {
          userId: transaction.payerId,
          type: 'payment',
          title: 'Payment Verification Failed',
          body: `Payment verification failed: ${paystackResponse.data.gateway_response || 'Unknown error'}`,
          data: { transactionId: transaction.id, reference },
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed',
          details: paystackResponse.data.gateway_response || 'Payment was not successful',
          transaction: updated,
        },
        { status: 400 }
      );
    }

    // Update transaction to in_escrow
    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
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
        body: `Your payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} for ${transaction.listing?.title || 'property'} has been verified and is held in escrow.`,
        data: { transactionId: transaction.id, reference },
      },
    });

    await prisma.notification.create({
      data: {
        userId: transaction.payeeId,
        type: 'payment',
        title: 'Payment Received in Escrow',
        body: `₦${(Number(transaction.amount) / 100).toLocaleString()} has been paid for ${transaction.listing?.title || 'property'} and is held in escrow awaiting release.`,
        data: { transactionId: transaction.id, reference },
      },
    });

    if (transaction.agentId) {
      await prisma.notification.create({
        data: {
          userId: transaction.agentId,
          type: 'payment',
          title: 'Commission Pending',
          body: `A payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} has been verified for ${transaction.listing?.title || 'property'}. Your commission will be released upon escrow completion.`,
          data: { transactionId: transaction.id, reference },
        },
      });
    }

    console.log(`Transaction ${reference} moved to IN_ESCROW`);

    return NextResponse.json({
      success: true,
      transaction: updated,
      status: 'in_escrow',
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Paystack')) {
        return NextResponse.json({ error: 'Payment provider error', details: error.message }, { status: 502 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
