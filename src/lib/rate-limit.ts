// Simple in-memory rate limiter for development
// Can be swapped for @vercel/rate-limiter + @vercel/kv in production

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