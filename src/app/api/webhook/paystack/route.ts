import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { TransactionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  // Get the Paystack signature from headers
  const signature = request.headers.get('x-paystack-signature');

  if (!signature) {
    console.error('No Paystack signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Get the raw body
  const body = await request.text();

  // Verify the signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Parse the event
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    console.error('Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log(`Received Paystack event: ${event.event}`);

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
      case 'subscription.create':
      case 'subscription.disable':
      case 'subscription.not_renew':
        await handleSubscriptionEvent(event.data);
        break;
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
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
  if (transaction.status === 'IN_ESCROW' || transaction.status === 'RELEASED') {
    console.log(`Transaction ${reference} already processed`);
    return;
  }

  // Update transaction
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'IN_ESCROW',
      paystackData: data,
      updatedAt: new Date(),
    },
  });

  // Create notification for payer
  await prisma.notification.create({
    data: {
      userId: transaction.payerId,
      type: 'payment_success',
      title: 'Payment Successful',
      body: `Your payment of ₦${(amount / 100).toLocaleString()} has been received and is held in escrow.`,
      data: { transactionId: transaction.id, reference },
    },
  });

  // Create notification for payee (landlord/agent)
  await prisma.notification.create({
    data: {
      userId: transaction.payeeId,
      type: 'payment_received',
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
        type: 'commission_pending',
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
      status: 'FAILED',
      paystackData: data,
      description: `Failed: ${gateway_response}`,
      updatedAt: new Date(),
    },
  });

  // Notify payer
  await prisma.notification.create({
    data: {
      userId: transaction.payerId,
      type: 'payment_failed',
      title: 'Payment Failed',
      body: `Your payment of ₦${(amount / 100).toLocaleString()} failed: ${gateway_response}`,
      data: { transactionId: transaction.id, reference },
    },
  });

  console.log(`Transaction ${reference} marked as FAILED`);
}

async function handleTransferSuccess(data: any) {
  const { reference, amount, recipient, reason } = data;

  // Find transaction by transfer reference (stored in paystackData or metadata)
  // This would need to be linked when initiating the transfer
  console.log(`Transfer successful: ${reference}`);
}

async function handleTransferFailed(data: any) {
  const { reference, amount, recipient, reason } = data;
  console.log(`Transfer failed: ${reference} - ${reason}`);
}

async function handleSubscriptionEvent(data: any) {
  const { subscription_code, status, customer, plan } = data;
  console.log(`Subscription event: ${status} for ${subscription_code}`);
}