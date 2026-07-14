import crypto from 'crypto';

/**
 * Verify Paystack webhook signature
 * Paystack signs all webhook events with your secret key using HMAC SHA512
 *
 * @param payload - Raw request body as string
 * @param signature - x-paystack-signature header value
 * @returns true if signature is valid, false otherwise
 */
export function verifyPaystackSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.warn('[Paystack Webhook] PAYSTACK_SECRET_KEY not configured');
    // In development without Paystack configured, allow webhooks through
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('[Paystack Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Parse and validate Paystack webhook payload
 *
 * @param body - Parsed webhook body
 * @returns Parsed webhook event with type safety
 */
export interface PaystackWebhookBody {
  event: string;
  data: Record<string, unknown>;
}

export function parsePaystackWebhook(body: unknown): PaystackWebhookBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid webhook payload: body must be an object');
  }

  const asRecord = body as Record<string, unknown>;
  if (!asRecord.event || typeof asRecord.event !== 'string') {
    throw new Error('Invalid webhook payload: event is required');
  }

  if (!asRecord.data || typeof asRecord.data !== 'object') {
    throw new Error('Invalid webhook payload: data is required');
  }

  return {
    event: asRecord.event,
    data: (asRecord.data as Record<string, unknown>),
  };
}

/**
 * Webhook event types from Paystack
 */
export enum PaystackWebhookEvent {
  // Charge events
  CHARGE_SUCCESS = 'charge.success',
  CHARGE_FAILED = 'charge.failed',
  CHARGE_DISPUTE_CREATE = 'charge.dispute.create',
  CHARGE_DISPUTE_REMIND = 'charge.dispute.remind',
  CHARGE_DISPUTE_RESOLVE = 'charge.dispute.resolve',

  // Transfer events
  TRANSFER_SUCCESS = 'transfer.success',
  TRANSFER_FAILED = 'transfer.failed',
  TRANSFER_REVERSED = 'transfer.reversed',

  // Subscription events
  SUBSCRIPTION_CREATE = 'subscription.create',
  SUBSCRIPTION_DISABLE = 'subscription.disable',
  SUBSCRIPTION_NOT_RENEW = 'subscription.not_renew',

  // Customer events
  CUSTOMER_IDENTIFICATION_SUCCESS = 'customeridentification.success',
  CUSTOMER_IDENTIFICATION_FAILED = 'customeridentification.failed',

  // Invoice events
  INVOICE_CREATE = 'invoice.create',
  INVOICE_UPDATE = 'invoice.update',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
}

/**
 * Type guard to check if event is a charge success event
 */
export function isChargeSuccessEvent(event: string): boolean {
  return event === PaystackWebhookEvent.CHARGE_SUCCESS;
}

/**
 * Type guard to check if event is a transfer event
 */
export function isTransferEvent(event: string): boolean {
  return [
    PaystackWebhookEvent.TRANSFER_SUCCESS,
    PaystackWebhookEvent.TRANSFER_FAILED,
    PaystackWebhookEvent.TRANSFER_REVERSED,
  ].includes(event as PaystackWebhookEvent);
}

/**
 * Type guard to check if event is a subscription event
 */
export function isSubscriptionEvent(event: string): boolean {
  return [
    PaystackWebhookEvent.SUBSCRIPTION_CREATE,
    PaystackWebhookEvent.SUBSCRIPTION_DISABLE,
    PaystackWebhookEvent.SUBSCRIPTION_NOT_RENEW,
  ].includes(event as PaystackWebhookEvent);
}

/**
 * Extract transaction reference from webhook data
 */
export function extractReference(data: any): string | null {
  return data?.reference || null;
}

/**
 * Extract transaction amount from webhook data (in kobo)
 */
export function extractAmount(data: any): number | null {
  return typeof data?.amount === 'number' ? data.amount : null;
}

/**
 * Extract customer email from webhook data
 */
export function extractCustomerEmail(data: any): string | null {
  return data?.customer?.email || null;
}

/**
 * Extract metadata from webhook data
 */
export function extractMetadata(data: any): Record<string, unknown> {
  return data?.metadata || {};
}

/**
 * Check if transaction was successful
 */
export function isTransactionSuccessful(data: any): boolean {
  return data?.status === 'success';
}

/**
 * Get transaction status
 */
export function getTransactionStatus(data: any): 'success' | 'failed' | 'abandoned' | 'unknown' {
  const status = data?.status;
  if (status === 'success' || status === 'failed' || status === 'abandoned') {
    return status;
  }
  return 'unknown';
}

/**
 * Build webhook response for Paystack
 * Always return 200 OK to prevent retries for handled events
 */
export function buildWebhookResponse(success: boolean, message?: string) {
  return {
    status: success ? 200 : 200, // Always 200 to prevent retries
    body: {
      success,
      message: message || (success ? 'Webhook processed' : 'Webhook received'),
    },
  };
}
