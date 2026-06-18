import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { TransactionStatus } from '@prisma/client';

/**
 * POST /api/webhook/paystack
 * Handles Paystack webhook events with HMAC-SHA512 signature verification
 *
 * Events handled:
 * - charge.success → Move transaction to IN_ESCROW
 * - charge.failed → Mark transaction as FAILED
 * - transfer.success → Mark escrow as RELEASED
 * - transfer.failed → Handle failed transfers
 * - charge.dispute.create → Create dispute record
 * - subscription.* → Handle subscription events
 */
export async function POST(request: NextRequest) {
  // Get the Paystack signature from headers
  const signature = request.headers.get('x-paystack-signature');

  if (!signature) {
    console.error('[Webhook] No Paystack signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Get the raw body as text for signature verification
  const body = await request.text();

  // Verify the signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('[Webhook] Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Parse the event
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
    // Return 200 to prevent Paystack from retrying
    // Log error for manual investigation
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
  }
}

async function handleChargeSuccess(data: any) {
  const { reference, amount, status, gateway_response, paid_at, channel, currency, metadata, customer, authorization } = data;

  // Find transaction by reference
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    include: {
      listing: true,
      payer: true,
      payee: true,
      agent: true,
    },
  });

  if (!transaction) {
    console.error(`Transaction not found for reference: ${reference}`);
    return;
  }

  // Idempotency: only process if not already in escrow or released
  if (transaction.status === 'in_escrow' || transaction.status === 'released') {
    console.log(`Transaction ${reference} already processed`);
    return;
  }

  // Update transaction
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'in_escrow',
      paystackData: data,
      updatedAt: new Date(),
    },
  });

  // Create notification for payer
  await prisma.notification.create({
    data: {
      userId: transaction.payerId,
      type: 'payment',
      title: 'Payment Successful',
      body: `Your payment of ₦${(amount / 100).toLocaleString()} has been received and is held in escrow.`,
      data: { transactionId: transaction.id, reference },
    },
  });

  // Create notification for payee (landlord/agent)
  await prisma.notification.create({
    data: {
      userId: transaction.payeeId,
      type: 'payment',
      title: 'Payment Received in Escrow',
      body: `₦${(amount / 100).toLocaleString()} has been paid and is held in escrow awaiting release.`,
      data: { transactionId: transaction.id, reference },
    },
  });

  // If there's an agent, notify them
  if (transaction.agentId) {
    await prisma.notification.create({
      data: {
        userId: transaction.agentId,
        type: 'payment',
        title: 'Commission Pending',
        body: `A payment of ₦${(amount / 100).toLocaleString()} has been made. Your commission will be calculated upon escrow release.`,
        data: { transactionId: transaction.id, reference },
      },
    });
  }

  console.log(`Transaction ${reference} moved to IN_ESCROW`);
}

async function handleChargeFailed(data: any) {
  const { reference, amount, gateway_response, metadata } = data;

  const transaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  if (!transaction) {
    console.error(`Transaction not found for reference: ${reference}`);
    return;
  }

  // Update transaction status
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'failed',
      paystackData: data,
      description: `Failed: ${gateway_response}`,
      updatedAt: new Date(),
    },
  });

  // Notify payer
  await prisma.notification.create({
    data: {
      userId: transaction.payerId,
      type: 'payment',
      title: 'Payment Failed',
      body: `Your payment of ₦${(amount / 100).toLocaleString()} failed: ${gateway_response}`,
      data: { transactionId: transaction.id, reference },
    },
  });

  console.log(`Transaction ${reference} marked as FAILED`);
}

async function handleTransferSuccess(data: any) {
  const { reference, amount, recipient, reason, transfer_code } = data;

  console.log(`[Webhook] Transfer successful: ${reference} - ₦${(amount / 100).toLocaleString()}`);

  // Try to find transaction by reference in paystackData
  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'in_escrow',
      paystackData: {
        path: ['transfer_reference'],
        equals: reference,
      },
    },
    take: 1,
  });

  if (transactions.length > 0) {
    const transaction = transactions[0];
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'released',
        paystackData: { ...transaction.paystackData as object, transfer: data },
        updatedAt: new Date(),
      },
    });

    // Notify payee
    await prisma.notification.create({
      data: {
        userId: transaction.payeeId,
        type: 'payment',
        title: 'Funds Transferred',
        body: `₦${(amount / 100).toLocaleString()} has been successfully transferred to your account.`,
        data: { transactionId: transaction.id, transferCode: transfer_code },
      },
    });

    console.log(`[Webhook] Transaction ${transaction.id} marked as RELEASED`);
  }
}

async function handleTransferFailed(data: any) {
  const { reference, amount, recipient, reason } = data;

  console.error(`[Webhook] Transfer failed: ${reference} - ${reason}`);

  // Try to find transaction by reference
  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'in_escrow',
      paystackData: {
        path: ['transfer_reference'],
        equals: reference,
      },
    },
    take: 1,
  });

  if (transactions.length > 0) {
    const transaction = transactions[0];

    // Update paystackData with failure info
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paystackData: {
          ...transaction.paystackData as object,
          transfer_failed: { reason, timestamp: new Date().toISOString() }
        },
        updatedAt: new Date(),
      },
    });

    // Notify admin
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'system',
          title: 'Transfer Failed - Manual Action Required',
          body: `Transfer failed for transaction ${transaction.id}: ${reason}. Manual intervention required.`,
          data: { transactionId: transaction.id, reference, reason },
        },
      });
    }

    console.log(`[Webhook] Transfer failure logged for transaction ${transaction.id}`);
  }
}

async function handleDisputeCreate(data: any) {
  const { reference, amount, customer, transaction_reference, reason } = data;

  console.log(`[Webhook] Dispute created: ${reference}`);

  // Find transaction
  const transaction = await prisma.transaction.findUnique({
    where: { reference: transaction_reference },
    include: {
      listing: { select: { id: true, title: true } },
      payer: { select: { id: true } },
      payee: { select: { id: true } },
    },
  });

  if (!transaction) {
    console.error(`[Webhook] Transaction not found for dispute: ${transaction_reference}`);
    return;
  }

  // Create dispute record
  const dispute = await prisma.dispute.create({
    data: {
      listingId: transaction.listingId,
      raisedBy: transaction.payerId,
      type: 'refund',
      status: 'open',
      description: `Paystack chargeback dispute: ${reason || 'No reason provided'}`,
    },
  });

  // Notify both parties and admin
  await prisma.notification.create({
    data: {
      userId: transaction.payerId,
      type: 'system',
      title: 'Dispute Created',
      body: `A dispute has been raised for your payment of ₦${(Number(transaction.amount) / 100).toLocaleString()}`,
      data: { disputeId: dispute.id, transactionId: transaction.id },
    },
  });

  await prisma.notification.create({
    data: {
      userId: transaction.payeeId,
      type: 'system',
      title: 'Payment Dispute',
      body: `A dispute has been raised against payment ₦${(Number(transaction.amount) / 100).toLocaleString()}`,
      data: { disputeId: dispute.id, transactionId: transaction.id },
    },
  });

  console.log(`[Webhook] Dispute ${dispute.id} created for transaction ${transaction.id}`);
}

async function handleDisputeResolve(data: any) {
  const { reference, resolution, transaction_reference } = data;

  console.log(`[Webhook] Dispute resolved: ${reference} - ${resolution}`);

  // Find transaction and update any related disputes
  const transaction = await prisma.transaction.findUnique({
    where: { reference: transaction_reference },
    select: { id: true, listingId: true, payerId: true },
  });

  if (transaction) {
    await prisma.dispute.updateMany({
      where: {
        listingId: transaction.listingId,
        raisedBy: transaction.payerId,
        status: 'open',
      },
      data: {
        status: 'resolved',
        resolution: `Paystack dispute resolved: ${resolution}`,
        resolvedAt: new Date(),
      },
    });
  }
}

async function handleSubscriptionEvent(event: string, data: any) {
  const { subscription_code, status, customer, plan } = data;

  console.log(`[Webhook] Subscription event: ${event} - ${status} for ${subscription_code}`);

  // Find organization by Paystack subscription ID
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
    include: { org: { select: { ownerId: true } } },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Update subscription status based on event
  if (event === 'subscription.disable' || event === 'subscription.not_renew') {
    await prisma.orgSubscription.update({
      where: { id: subscription.id },
      data: {
        status: event === 'subscription.disable' ? 'cancelled' : 'paused',
      },
    });

    // Notify org owner
    await prisma.notification.create({
      data: {
        userId: subscription.org.ownerId,
        type: 'system',
        title: 'Subscription Status Changed',
        body: `Your subscription has been ${event === 'subscription.disable' ? 'cancelled' : 'paused'}.`,
        data: { subscriptionId: subscription.id, orgId: subscription.orgId },
      },
    });
  }
}