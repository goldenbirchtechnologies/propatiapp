import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

/**
 * POST /api/webhooks/paystack-subscriptions
 * Dedicated webhook endpoint for Paystack subscription events
 *
 * Phase F: Estate Manager Subscription Management
 *
 * Events handled:
 * - subscription.create → Activate organization subscription
 * - subscription.disable → Deactivate organization
 * - subscription.not_renew → Pause subscription
 * - invoice.payment_failed → Notify admin of failed payment
 * - invoice.update → Update billing information
 */
export async function POST(request: NextRequest) {
  // Get the Paystack signature from headers
  const signature = request.headers.get('x-paystack-signature');

  if (!signature) {
    console.error('[Subscription Webhook] No Paystack signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Get the raw body as text for signature verification
  const body = await request.text();

  // Verify the signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('[Subscription Webhook] PAYSTACK_SECRET_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('[Subscription Webhook] Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Parse the event
  let event;
  try {
    event = JSON.parse(body);
  } catch (error) {
    console.error('[Subscription Webhook] Invalid JSON payload:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log(`[Subscription Webhook] Received event: ${event.event}`);

  try {
    switch (event.event) {
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;
      case 'invoice.update':
        await handleInvoiceUpdate(event.data);
        break;
      default:
        console.log(`[Subscription Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true, event: event.event });
  } catch (error) {
    console.error('[Subscription Webhook] Error processing webhook:', error);
    // Return 200 to prevent Paystack from retrying on application errors
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
  }
}

/**
 * Handle subscription.create event
 * Activates the organization subscription
 */
async function handleSubscriptionCreate(data: Record<string, unknown>) {
  const { subscription_code, status, customer, plan, amount, next_payment_date } = data;

  console.log(`[Subscription Webhook] Subscription created: ${subscription_code}`);

  // Find subscription by Paystack subscription ID
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
    include: { org: { select: { id: true, ownerId: true, name: true } } },
  });

  if (!subscription) {
    console.error(`[Subscription Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Update subscription status to active
  await prisma.orgSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active' as SubscriptionStatus,
    },
  });

  // Create notification for organization owner
  await prisma.notification.create({
    data: {
      userId: subscription.org.ownerId,
      type: 'system',
      title: 'Subscription Activated',
      body: `Your subscription for ${subscription.org.name} is now active. Next billing date: ${next_payment_date || 'N/A'}`,
      data: {
        orgId: subscription.orgId,
        subscriptionId: subscription.id,
        plan: subscription.plan,
        nextBillingDate: next_payment_date,
      },
    },
  });

  console.log(`[Subscription Webhook] Subscription ${subscription_code} activated`);
}

/**
 * Handle subscription.disable event
 * Deactivates the organization subscription
 */
async function handleSubscriptionDisable(data: Record<string, unknown>) {
  const { subscription_code, status } = data;

  console.log(`[Subscription Webhook] Subscription disabled: ${subscription_code}`);

  // Find subscription
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
    include: { org: { select: { id: true, ownerId: true, name: true } } },
  });

  if (!subscription) {
    console.error(`[Subscription Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Update subscription status to cancelled
  await prisma.orgSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled' as SubscriptionStatus,
    },
  });

  // Notify organization owner
  await prisma.notification.create({
    data: {
      userId: subscription.org.ownerId,
      type: 'system',
      title: 'Subscription Cancelled',
      body: `Your subscription for ${subscription.org.name} has been cancelled. Access will be limited.`,
      data: {
        orgId: subscription.orgId,
        subscriptionId: subscription.id,
        action: 'subscription_cancelled',
      },
    },
  });

  console.log(`[Subscription Webhook] Subscription ${subscription_code} cancelled`);
}

/**
 * Handle subscription.not_renew event
 * Pauses subscription renewal (auto-renew disabled)
 */
async function handleSubscriptionNotRenew(data: Record<string, unknown>) {
  const { subscription_code } = data;

  console.log(`[Subscription Webhook] Subscription set to not renew: ${subscription_code}`);

  // Find subscription
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
    include: { org: { select: { id: true, ownerId: true, name: true } } },
  });

  if (!subscription) {
    console.error(`[Subscription Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Update subscription status to paused
  await prisma.orgSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'paused' as SubscriptionStatus,
    },
  });

  // Notify organization owner
  await prisma.notification.create({
    data: {
      userId: subscription.org.ownerId,
      type: 'system',
      title: 'Subscription Will Not Renew',
      body: `Your subscription for ${subscription.org.name} is set to not renew. It will remain active until the current period ends.`,
      data: {
        orgId: subscription.orgId,
        subscriptionId: subscription.id,
        nextBillingDate: subscription.nextBillingDate,
      },
    },
  });

  console.log(`[Subscription Webhook] Subscription ${subscription_code} set to not renew`);
}

/**
 * Handle invoice.payment_failed event
 * Notifies admin and owner of payment failure
 */
async function handleInvoicePaymentFailed(data: Record<string, unknown>) {
  const { subscription_code, amount, customer, invoice_code, paid, description } = data;

  console.log(`[Subscription Webhook] Invoice payment failed: ${invoice_code || subscription_code}`);

  // Find subscription
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
    include: { org: { select: { id: true, ownerId: true, name: true } } },
  });

  if (!subscription) {
    console.error(`[Subscription Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Notify organization owner
  await prisma.notification.create({
    data: {
      userId: subscription.org.ownerId,
      type: 'system',
      title: 'Subscription Payment Failed',
      body: `Payment for your subscription (${subscription.org.name}) failed. Amount: ₦${(amount / 100).toLocaleString()}. Please update your payment method.`,
      data: {
        orgId: subscription.orgId,
        subscriptionId: subscription.id,
        invoiceCode: invoice_code,
        amount,
        description: description || 'Payment failed',
      },
    },
  });

  // Notify all admins
  const admins = await prisma.user.findMany({
    where: { role: 'admin', isActive: true },
    select: { id: true },
  });

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'system',
        title: 'Subscription Payment Failed - Admin Alert',
        body: `Payment failed for organization: ${subscription.org.name}. Subscription: ${subscription_code}. Amount: ₦${(amount / 100).toLocaleString()}`,
        data: {
          orgId: subscription.orgId,
          subscriptionId: subscription.id,
          subscriptionCode: subscription_code,
          invoiceCode: invoice_code,
          amount,
        },
      },
    });
  }

  console.log(`[Subscription Webhook] Payment failure notifications sent for ${subscription_code}`);
}

/**
 * Handle invoice.update event
 * Updates billing information
 */
async function handleInvoiceUpdate(data: Record<string, unknown>) {
  const { subscription_code, amount, next_payment_date, paid } = data;

  console.log(`[Subscription Webhook] Invoice updated: ${subscription_code}`);

  // Find subscription
  const subscription = await prisma.orgSubscription.findUnique({
    where: { paystackSubId: subscription_code },
  });

  if (!subscription) {
    console.error(`[Subscription Webhook] Subscription not found: ${subscription_code}`);
    return;
  }

  // Update next billing date if provided
  if (next_payment_date) {
    await prisma.orgSubscription.update({
      where: { id: subscription.id },
      data: {
        nextBillingDate: new Date(next_payment_date),
      },
    });

    console.log(`[Subscription Webhook] Updated next billing date for ${subscription_code}`);
  }
}
