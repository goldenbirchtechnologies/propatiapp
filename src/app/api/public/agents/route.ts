import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import {
  AGENT_BOARDS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  getAgentDirectoryFacets,
  listPublicAgents,
  type AgentDirectoryFacets,
} from '@/lib/agents/public-directory';
import { withRateLimit, apiRateLimiter, getRateLimitHeaders } from '@/lib/rate-limit';

export const revalidate = 300;

const querySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  board: z.enum(AGENT_BOARDS).optional(),
  territory: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  // Out-of-range page sizes are clamped rather than rejected: a caller asking for
  // more than we serve should get the maximum, not a 400.
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((value) => Math.min(value, MAX_LIMIT))
    .optional(),
});

function emptyFacets(): AgentDirectoryFacets {
  return {
    boards: AGENT_BOARDS.map((board) => ({ value: board, count: 0 })),
    territories: [],
  };
}

export async function GET(request: NextRequest) {
  const rateLimit = await withRateLimit(request, apiRateLimiter);
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: rateLimitHeaders });
  }

  // Drop blank params so `?q=&board=` behaves like an absent filter instead of
  // failing the enum / min-length checks.
  const params = Object.fromEntries(
    Object.entries(Object.fromEntries(request.nextUrl.searchParams)).filter(([, value]) => value.length > 0)
  );

  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse(params);
  } catch (error) {
    // Check before logging: a malformed query is a client error, not a server fault.
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: error.issues },
        { status: 400, headers: rateLimitHeaders }
      );
    }
    throw error;
  }

  try {
    const [result, facets] = await Promise.all([listPublicAgents(query), getAgentDirectoryFacets()]);

    return NextResponse.json(
      { ...result, facets },
      {
        headers: {
          ...rateLimitHeaders,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error(
      '[public/agents] directory query failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return NextResponse.json(
      { error: 'Agent directory is temporarily unavailable', data: [], total: 0, page: 1, limit: DEFAULT_LIMIT, facets: emptyFacets() },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
