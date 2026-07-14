/**
 * Server-side Stripe integration for PROPATI.
 *
 * Provides retry-safe helpers for Payment Intents, refunds, and webhook
 * handling. Must only be called from server components / route handlers /
 * server actions. Never exposes secret keys to the browser.
 */

import Stripe from 'stripe';
import { sleep } from './utils';

/** @internal Singleton Stripe client initialized from env. */
let client: Stripe | null = null;

/**
 * Get the server-side Stripe client.
 *
 * @returns Configured Stripe instance.
 * @throws If STRIPE_SECRET_KEY is missing.
 */
export function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!client) {
    client = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }

  return client as Stripe;
}

/**
 * Params required to create a payment intent.
 */
export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  paymentMethodTypes?: string[];
}

/**
 * Result produced by createPaymentIntent.
 */
export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Submit a base64-encoded webhook payload and signature.
 */
export interface WebhookInput {
  payload: string;
  signature: string;
  secret: string;
}

/**
 * Create a Stripe Payment Intent with bounded retries.
 *
 * @param params Payment details.
 * @returns Payment intent details for the client.
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  const stripe = getStripeInstance();
  const currency = params.currency || 'ngn';
  const paymentMethodTypes = params.paymentMethodTypes || ['card'];

  const paymentIntent = await retryStripeCall(
    () =>
      stripe.paymentIntents.create({
        amount: params.amount,
        currency,
        metadata: params.metadata || {},
        customer: params.customerId,
        payment_method_types: paymentMethodTypes,
      }),
    'createPaymentIntent'
  );

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret || '',
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}

/**
 * Retrieve a Payment Intent by ID.
 *
 * @param paymentIntentId - Stripe payment intent id.
 * @returns The Payment Intent record.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeInstance();
  const paymentIntent = await retryStripeCall(
    () => stripe.paymentIntents.retrieve(paymentIntentId),
    'getPaymentIntent'
  );

  return paymentIntent;
}

/**
 * Verify a Stripe webhook payload.
 *
 * @param input Raw payload, Stripe signature header, and webhook secret.
 * @returns Verified Stripe event.
 */
export async function verifyWebhook(
  input: WebhookInput
): Promise<unknown> {
  const stripe = getStripeInstance();
  const event = await retryStripeCall(
    () =>
      stripe.webhooks.constructEvent(
        input.payload,
        input.signature,
        input.secret
      ),
    'verifyWebhook'
  );

  return event as Stripe.Event;
}

/**
 * Create a refund for a completed payment.
 *
 * @param paymentIntentId - Source payment intent id.
 * @param amount - Amount to refund in the smallest currency unit.
 * @param reason - Refund reason code.
 * @returns The created refund object.
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<Stripe.Refund> {
  const stripe = getStripeInstance();
  const refund = await retryStripeCall(
    () =>
      stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      } as Stripe.RefundCreateParams),
    'createRefund'
  );

  return refund as Stripe.Refund;
}

/**
 * List payments with automatic pagination.
 *
 * @param options - Listing options.
 * @returns Paginated payment intents.
 */
export async function listPaymentIntents(options?: {
  customerId?: string;
  limit?: number;
  startingAfter?: string;
}): Promise<unknown> {
  const stripe = getStripeInstance();
  const paymentIntents = await retryStripeCall(
    () =>
      stripe.paymentIntents.list({
        customer: options?.customerId,
        limit: options?.limit || 10,
        starting_after: options?.startingAfter,
      }),
    'listPaymentIntents'
  );

  return paymentIntents;
}

/**
 * Internal retry wrapper for Stripe calls.
 *
 * Applies exponential backoff on 429 / 5xx Stripe responses.
 */
async function retryStripeCall<T>(
  callback: () => Promise<T>,
  operationName: string
): Promise<T> {
  const maxRetries = 3;
  const baseDelayMs = 200;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callback();
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof Stripe.errors.StripeIdempotencyError ||
        error instanceof Stripe.errors.StripeRateLimitError ||
        (error instanceof Stripe.errors.StripeError &&
          typeof error.statusCode === 'number' &&
          error.statusCode >= 500);

      if (!isRetryable || attempt >= maxRetries) {
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
