/**
 * Webhook Helper Utilities
 * For handling raw request bodies and signature verification
 */

import crypto from 'crypto';

/**
 * Get raw body from Next.js Request
 * Required for webhook signature verification
 *
 * Note: In Next.js 14 App Router, request.text() already gives us the raw body
 */
export async function getRawBody(req: Request): Promise<string> {
  // Next.js 14 provides request.text() which reads the raw body
  // We can use it directly for signature verification
  const rawBody = await req.text();
  return rawBody;
}

/**
 * Verify Paystack webhook signature
 * Uses HMAC-SHA512 algorithm
 */
export function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify webhook signature with constant-time comparison
 * Prevents timing attacks
 */
export function verifySignatureSecure(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');

    // Use crypto.timingSafeEqual for constant-time comparison
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('Secure signature verification error:', error);
    return false;
  }
}

/**
 * Parse webhook event safely
 */
export function parseWebhookEvent<T = any>(body: string): { success: true; event: T } | { success: false; error: string } {
  try {
    const event = JSON.parse(body);

    if (!event.event || !event.data) {
      return { success: false, error: 'Invalid webhook event structure' };
    }

    return { success: true, event };
  } catch (error) {
    return { success: false, error: 'Invalid JSON payload' };
  }
}

/**
 * Generate idempotency key for webhook processing
 * Helps prevent duplicate processing of the same webhook
 */
export function generateIdempotencyKey(eventType: string, eventId: string): string {
  return `webhook_${eventType}_${eventId}`;
}

/**
 * Check if webhook event was recently processed
 * Uses simple in-memory cache (in production, use Redis)
 */
const processedEvents = new Map<string, number>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function isWebhookProcessed(idempotencyKey: string): boolean {
  const timestamp = processedEvents.get(idempotencyKey);

  if (!timestamp) {
    return false;
  }

  // Check if cache entry is expired
  if (Date.now() - timestamp > CACHE_TTL) {
    processedEvents.delete(idempotencyKey);
    return false;
  }

  return true;
}

export function markWebhookProcessed(idempotencyKey: string): void {
  processedEvents.set(idempotencyKey, Date.now());

  // Clean up old entries periodically
  if (processedEvents.size > 1000) {
    const now = Date.now();
    for (const [key, timestamp] of processedEvents.entries()) {
      if (now - timestamp > CACHE_TTL) {
        processedEvents.delete(key);
      }
    }
  }
}

/**
 * Webhook response helpers
 */
export const WebhookResponse = {
  success: (message = 'Webhook received') => ({
    received: true,
    message,
  }),

  error: (error: string, code = 'WEBHOOK_ERROR') => ({
    error,
    code,
  }),

  invalidSignature: () => ({
    error: 'Invalid webhook signature',
    code: 'INVALID_SIGNATURE',
  }),

  invalidPayload: () => ({
    error: 'Invalid webhook payload',
    code: 'INVALID_PAYLOAD',
  }),

  eventNotSupported: (eventType: string) => ({
    error: `Event type not supported: ${eventType}`,
    code: 'EVENT_NOT_SUPPORTED',
  }),
};
