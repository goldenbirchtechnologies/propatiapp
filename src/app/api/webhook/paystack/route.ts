import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { TransactionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature');
  if (!signature) {
    console.error('[Webhook] No Paystack signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await request.text();
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const expectedSignature = crypto.createHmac('sha512', secret).update(body).digest('hex');
  if (signature !== expectedSignature) {
    console.error('[Webhook] Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch (error) {
    console.error('[Webhook] Invalid JSON payload:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log(`[Webhook] Received Paystack event: ${event.event}`);

  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
      case 'charge.dispute.create':
        await handleDisputeCreate(event.data);
        break;
      case 'charge.dispute.resolve':
        await handleDisputeResolve(event.data);
        break;
      case 'subscription.create':
      case 'subscription.disable':
      case 'subscription.not_renew':
        await handleSubscriptionEvent(event.event, event.data);
        break;
      default:
        console.log(`[Webhook] Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true, event: event.event });
  } catch (error) {
    console.error('[Webhook] Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
  }
}

async function handleChargeSuccess(data: any) {
  const { reference, amount, status, gateway_response, paid_at, channel, currency, metadata, customer, authorization } = data;

  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    include: { listing: true, payer: true, payee: true, agent: true },
  });

  if (!transaction) {
    console.error(`Transaction not found for reference: ${reference}`);
    return;
  }

  if (transaction.status === 'in_escrow' || transaction.status === 'released') {
    console.log(`Transaction ${reference} already processed`);
    return;
  }

  const isManaged = metadata?.collectionType === 'managed';
  const agentCommissionKobo = Number(transaction.agentCommission || 0);
  const platformFeeKobo = Number(transaction.platformFee || 0);
  const payeeAmountKobo = Number(transaction.payeeAmount || 0);
  const amountNaira = Number(amount) / 100;

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'in_escrow', paystackData: data, updatedAt: new Date() },
  });

  await prisma.notification.create({
    data: { userId: transaction.payerId, type: 'payment', title: 'Payment Successful', body: `Your payment of ₦${amountNaira.toLocaleString()} has been received and is held in escrow.`, data: { transactionId: transaction.id, reference } },
  });
  await prisma.notification.create({
    data: { userId: transaction.payeeId, type: 'payment', title: 'Payment Received in Escrow', body: `₦${amountNaira.toLocaleString()} has been paid and is held in escrow awaiting release.`, data: { transactionId: transaction.id, reference } },
  });
  if (transaction.agentId) {
    await prisma.notification.create({
      data: { userId: transaction.agentId, type: 'payment', title: 'Commission Pending', body: `A payment of ₦${amountNaira.toLocaleString()} was made. Your commission of ₦${(agentCommissionKobo / 100).toLocaleString()} will be paid after escrow release.`, data: { transactionId: transaction.id, reference } },
    });
  }

  // Wallet splits
  const splits: Array<{ userId: string; amountNaira: number; type: 'deposit'; currency: string; description: string; meta: Record<string, unknown> }> = [];
  if (isManaged && metadata?.managedById) {
    splits.push({
      userId: String(metadata.managedById),
      amountNaira: payeeAmountKobo / 100,
      type: 'escrow_credit',
      currency: data.currency || 'NGN',
      description: `Managed collection for ${reference}`,
      meta: { reference, transactionId: transaction.id, flow: 'managed_collection' },
    });
  } else if (!isManaged) {
    splits.push({
      userId: transaction.payeeId,
      amountNaira: payeeAmountKobo / 100,
      type: 'escrow_credit',
      data.currency || 'NGN',
      description: `Direct collection for ${reference}`,
      meta: { reference, transactionId: transaction.id, flow: 'direct_collection' },
    });
  }
  if (agentCommissionKobo > 0 && transaction.agentId) {
    splits.push({
      userId: transaction.agentId,
      amountNaira: agentCommissionKobo / 100,
      type: 'adjustment',
      currency: data.currency || 'NGN',
      description: `Agent commission for ${reference}`,
      meta: { reference, transactionId: transaction.id, flow: 'agent_commission' },
    });

    // Auto payout agent commission if recipient is available and balance permits
    const agentAccount = await prisma.userPaystackAccount.findUnique({ where: { userId: transaction.agentId } });
    if (agentAccount?.recipientCode) {
      const opening = Number((await prisma.wallet.findUnique({ where: { userId: transaction.agentId } }))?.balance ?? 0);
      const commissionNaira = agentCommissionKobo / 100;
      if (opening >= commissionNaira) {
        const payout = await paystack.createTransfer({
          source: 'balance',
          amount: agentCommissionKobo,
          recipient: agentAccount.recipientCode,
          reference: `AGT_PAY_${Date.now()}_${Buffer.from(transaction.agentId).toString('hex').slice(0,8)}`,
          reason: `Agent commission ${reference}`,
        });
        if (payout.status) {
          const agentWallet = await prisma.wallet.findUnique({ where: { userId: transaction.agentId } });
          if (agentWallet) {
            const aOpening = Number(agentWallet.balance);
            const aClosing = aOpening - commissionNaira;
            await prisma.wallet.update({ where: { id: agentWallet.id }, data: { balance: aClosing } });
            await prisma.walletTransaction.create({
              data: { walletId: agentWallet.id, userId: transaction.agentId, type: 'withdrawal', status: 'success', amount: commissionNaira, currency: 'NGN', openingBalance: aOpening, closingBalance: aClosing, description: `Auto payout commission for ${reference}`, providerRef: payout.data.transfer_code, meta: { reference, transactionId: transaction.id, flow: 'agent_auto_payout' } },
            });
          }
        }
      }
    }
  }

  if (splits.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const split of splits) {
        const wallet = await tx.wallet.findUnique({ where: { userId: split.userId } });
        const walletId = wallet?.id;
        if (!walletId) continue;
        const current = wallet ? Number(wallet.balance) : 0;
        const closing = current + split.amountNaira;
        await tx.wallet.update({ where: { id: walletId }, data: { balance: closing } });
        await tx.walletTransaction.create({
          data: { walletId, userId: split.userId, reference: `${reference}_${split.type}_${split.userId}`, type: split.type as any, status: 'success', amount: split.amountNaira, currency: split.currency, openingBalance: current, closingBalance: closing, description: split.description, providerRef: String(data.id), meta: split.meta },
        });
      }
    });
  }

  if (metadata?.walletDeposit && metadata?.userId) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: metadata.userId } });
    if (wallet) {
      const opening = Number(wallet.balance);
      const closing = opening + amountNaira;
      await prisma.$transaction([
        prisma.wallet.update({ where: { id: wallet.id }, data: { balance: closing } }),
        prisma.walletTransaction.upsert({
          where: { reference },
          update: { status: 'success', providerRef: String(data.id), meta },
          create: { walletId: wallet.id, userId: metadata.userId, reference, type: 'deposit', status: 'success', amount: amountNaira, openingBalance: opening, closingBalance: closing, providerRef: String(data.id), description: 'Wallet top-up', meta },
        }),
      ]);
    }
  }

  console.log(`Transaction ${reference} moved to IN_ESCROW with wallets split`);
}

async function handleChargeFailed(data: any) {
  const { reference, amount, gateway_response, metadata } = data;
  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction) {
    console.error(`Transaction not found for reference: ${reference}`);
    return;
  }
  await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'failed', paystackData: data, description: `Failed: ${gateway_response}`, updatedAt: new Date() } });
  await prisma.notification.create({
    data: { userId: transaction.payerId, type: 'payment', title: 'Payment Failed', body: `Your payment of ₦${(amount / 100).toLocaleString()} failed: ${gateway_response}`, data: { transactionId: transaction.id, reference } },
  });
  console.log(`Transaction ${reference} marked as FAILED`);
}

async function handleTransferSuccess(data: any) {
  const { reference, amount, recipient, reason, transfer_code } = data;
  console.log(`[Webhook] Transfer successful: ${reference} - ₦${(amount / 100).toLocaleString()}`);

  await prisma.$transaction(async (tx) => {
    const transactions = await tx.transaction.findMany({
      where: { status: 'in_escrow', paystackData: { path: ['transfer_reference'], equals: reference } },
      take: 1,
    });

    if (transactions.length > 0) {
      const transaction = transactions[0];
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'released', paystackData: { ...transaction.paystackData as object, transfer: data }, updatedAt: new Date() },
      });
      await tx.notification.create({
        data: { userId: transaction.payeeId, type: 'payment', title: 'Funds Transferred', body: `₦${(amount / 100).toLocaleString()} has been successfully transferred to your account.`, data: { transactionId: transaction.id, transferCode: transfer_code } },
      });
      console.log(`[Webhook] Transaction ${transaction.id} marked as RELEASED`);
    }
  });
}

async function handleTransferFailed(data: any) {
  const { reference, amount, recipient, reason } = data;
  console.error(`[Webhook] Transfer failed: ${reference} - ${reason}`);

  await prisma.$transaction(async (tx) => {
    const transactions = await tx.transaction.findMany({
      where: { status: 'in_escrow', paystackData: { path: ['transfer_reference'], equals: reference } },
      take: 1,
    });

    if (transactions.length > 0) {
      const transaction = transactions[0];
      await tx.notification.create({
        data: { userId: transaction.payeeId, type: 'payment', title: 'Transfer Failed', body: `A transfer of ₦${(amount / 100).toLocaleString()} failed: ${reason}`, data: { transactionId: transaction.id, reference } },
      });
    }
  });
}

async function handleDisputeCreate(data: any) {
  console.log('[Webhook] Dispute created', data.reference);
}

async function handleDisputeResolve(data: any) {
  console.log('[Webhook] Dispute resolved', data.reference);
}

async function handleSubscriptionEvent(event: string, data: any) {
  console.log(`[Webhook] Subscription event: ${event}`, data.reference);
}
