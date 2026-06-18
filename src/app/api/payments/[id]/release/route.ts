import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { TransactionStatus } from '@prisma/client';
import { z } from 'zod';

const releaseEscrowSchema = z.object({
  transactionId: z.string().uuid(),
  releaseTo: z.enum(['payee', 'payer', 'split']), // split = payee + agent commission
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['ADMIN', 'AGENT', 'LANDLORD']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = releaseEscrowSchema.parse({ ...body, transactionId: id });

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

    // Check permissions
    const canRelease =
      user.role === 'ADMIN' ||
      (user.role === 'LANDLORD' && transaction.payeeId === user.id) ||
      (user.role === 'AGENT' && transaction.agentId === user.id);

    if (!canRelease) {
      return NextResponse.json({ error: 'FORBIDDEN: Not authorized to release this escrow' }, { status: 403 });
    }

    // Check transaction is in escrow
    if (transaction.status !== 'IN_ESCROW') {
      return NextResponse.json({ error: `Cannot release transaction in ${transaction.status} status` }, { status: 400 });
    }

    // For landlord/agent releases, check if agreement is fully signed (if applicable)
    if (transaction.listingId) {
      const agreements = await prisma.agreement.findMany({
        where: { listingId: transaction.listingId, status: 'fully_signed' },
        select: { id: true },
      });

      if (agreements.length === 0 && user.role !== 'ADMIN') {
        // Allow if no agreement exists (direct payment)
        const hasAgreement = await prisma.agreement.findFirst({
          where: { listingId: transaction.listingId },
          select: { id: true },
        });
        if (hasAgreement) {
          return NextResponse.json({ error: 'Agreement must be fully signed before escrow release' }, { status: 400 });
        }
      }
    }

    // Process transfer via Paystack
    // Note: In production, you'd need to have recipient codes set up for payee and agent
    // For now, we'll just update the status and create transfer records

    const transferResults = [];

    // Transfer to payee (landlord)
    if (validated.releaseTo === 'payee' || validated.releaseTo === 'split') {
      // In production: await paystack.createTransfer({...})
      // For now, create transfer record
      const payeeTransfer = await prisma.transaction.create({
        data: {
          listingId: transaction.listingId,
          payerId: user.id,
          payeeId: transaction.payeeId,
          agentId: null,
          type: transaction.type,
          status: 'RELEASED',
          amount: transaction.payeeAmount || transaction.amount,
          platformFee: 0,
          agentCommission: 0,
          payeeAmount: transaction.payeeAmount || transaction.amount,
          description: `Escrow release to landlord for ${transaction.listing.title}`,
        },
      });
      transferResults.push({ to: 'payee', transferId: payeeTransfer.id, amount: transaction.payeeAmount });

      // Notify payee
      await prisma.notification.create({
        data: {
          userId: transaction.payeeId,
          type: 'payment',
          title: 'Funds Released',
          body: `₦${((Number(transaction.payeeAmount) || Number(transaction.amount)) / 100).toLocaleString()} has been released to your account for ${transaction.listing.title}.`,
          data: { transactionId: transaction.id, type: 'release' },
        },
      });
    }

    // Transfer to agent (commission)
    if (validated.releaseTo === 'split' && transaction.agentId && transaction.agentCommission > 0) {
      const agentTransfer = await prisma.transaction.create({
        data: {
          listingId: transaction.listingId,
          payerId: user.id,
          payeeId: transaction.agentId,
          agentId: null,
          type: transaction.type,
          status: 'RELEASED',
          amount: transaction.agentCommission,
          platformFee: 0,
          agentCommission: 0,
          payeeAmount: transaction.agentCommission,
          description: `Agent commission release for ${transaction.listing.title}`,
        },
      });
      transferResults.push({ to: 'agent', transferId: agentTransfer.id, amount: transaction.agentCommission });

      // Notify agent
      await prisma.notification.create({
        data: {
          userId: transaction.agentId,
          type: 'payment',
          title: 'Commission Released',
          body: `Your commission of ₦${(Number(transaction.agentCommission) / 100).toLocaleString()} for ${transaction.listing.title} has been released.`,
          data: { transactionId: transaction.id, type: 'commission_release' },
        },
      });
    }

    // Refund to payer (if releaseTo === 'payer')
    if (validated.releaseTo === 'payer') {
      const refundTransfer = await prisma.transaction.create({
        data: {
          listingId: transaction.listingId,
          payerId: transaction.payeeId, // reversed
          payeeId: transaction.payerId,
          agentId: null,
          type: transaction.type,
          status: 'REFUNDED',
          amount: transaction.amount,
          platformFee: 0,
          agentCommission: 0,
          payeeAmount: transaction.amount,
          description: `Refund for ${transaction.listing.title}`,
        },
      });
      transferResults.push({ to: 'payer', transferId: refundTransfer.id, amount: transaction.amount });

      // Notify payer
      await prisma.notification.create({
        data: {
          userId: transaction.payerId,
          type: 'payment',
          title: 'Refund Processed',
          body: `Your payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} for ${transaction.listing.title} has been refunded.`,
          data: { transactionId: transaction.id, type: 'refund' },
        },
      });
    }

    // Update original transaction
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'RELEASED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transaction: updated,
        transfers: transferResults,
      },
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('FORBIDDEN')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}