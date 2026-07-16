// Simple in-memory rate limiter for development
// Can be swapped for @vercel/rate-limiter + @vercel/kv in production

// ===========================================================================
// PRODUCTION WARNING: The in-memory Map is invalid in serverless / edge
// runtimes (Vercel Edge Functions, Node.js Workers, Lambda, Cloud Run, etc.).
// Each invocation may land on a fresh isolate with no shared memory, so the
// limit state is lost after every request.
//
// To harden for production, swap the underlying store without changing the
// consumer API by using the exported stub createRateLimiterVercelKV() below
// (or an Upstash / Redis equivalent).  No new external dependencies are
// introduced in this file until you are ready to deploy.
// ===========================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  response?: Response;
}

export function createRateLimiter(config: RateLimiterConfig) {
  return {
    async limit(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const record = rateLimitStore.get(key);

      if (!record || record.resetTime < now) {
        // New window
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
        });
        return {
          success: true,
          limit: config.max,
          remaining: config.max - 1,
          reset: now + config.windowMs,
        };
      }

      if (record.count >= config.max) {
        return {
          success: false,
          limit: config.max,
          remaining: 0,
          reset: record.resetTime,
        };
      }

      record.count++;
      return {
        success: true,
        limit: config.max,
        remaining: config.max - record.count,
        reset: record.resetTime,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// ── Vercel KV stub (drop-in production replacement) ────────────────────────
// Install: npm install @vercel/kv
// Configure your Vercel KV store in the Vercel dashboard.
//
// Returns the same `{ limit(): Promise<RateLimitResult> }` shape as
// createRateLimiter, so withRateLimit can pivot between drivers with a
// single env flag (e.g. RATE_LIMIT_DRIVER=vercel_kv) without changing
// downstream call sites.
// ---------------------------------------------------------------------------

export type RateLimiterDriver = 'memory' | 'vercel_kv';

export async function createRateLimiterVercelKV(config: RateLimiterConfig) {
  // Documented production stub: keep this as a drop-in replacement once
  // `@vercel/kv` is installed. Until then it intentionally throws so call
  // sites can migrate to it behind an env flag without silent failures.
  //
  //   return {
  //     async limit(key: string): Promise<RateLimitResult> {
  //       const redisKey = `rate-limit:${key}`;
  //       const current = await kv.get<number>(redisKey) ?? 0;
  //
  //       if (current >= config.max) {
  //         const ttl = await kv.ttl(redisKey);
  //         return {
  //           success: false,
  //           limit: config.max,
  //           remaining: 0,
  //           reset: Date.now() + (ttl ?? config.windowMs / 1000) * 1000,
  //         };
  //       }
  //
  //       const remaining = config.max - current - 1;
  //       if (current === 0) {
  //         await kv.set(redisKey, 1, { ex: Math.ceil(config.windowMs / 1000) });
  //       } else {
  //         await kv.incr(redisKey);
  //       }
  //
  //       return {
  //         success: true,
  //         limit: config.max,
  //         remaining,
  //         reset: Date.now() + config.windowMs,
  //       };
  //     },
  //   };
  //
  throw new Error(
    'Vercel KV rate limiter not yet implemented — install @vercel/kv and uncomment the example above.'
  );
}

// General API rate limiter: 100 requests per minute
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

// Stricter rate limiter for auth endpoints: 10 requests per minute
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});

// Webhook rate limiter: 50 requests per minute
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
});

export async function withRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter> = apiRateLimiter
): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  return limiter.limit(ip);
}

export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  };
}