import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// `var` so assignments inside the hoisted vi.mock() factory avoid the TDZ.
var mockUserFindMany: ReturnType<typeof vi.fn>;
var mockUserCount: ReturnType<typeof vi.fn>;
var mockLicenseFindMany: ReturnType<typeof vi.fn>;
var mockWithRateLimit: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma', () => {
  mockUserFindMany = vi.fn();
  mockUserCount = vi.fn();
  mockLicenseFindMany = vi.fn();

  return {
    prisma: {
      user: { findMany: mockUserFindMany, count: mockUserCount },
      agentLicense: { findMany: mockLicenseFindMany },
    },
  };
});

vi.mock('@/lib/rate-limit', () => {
  mockWithRateLimit = vi.fn();
  return {
    withRateLimit: (...args: unknown[]) => (mockWithRateLimit as any)(...args),
    apiRateLimiter: {},
    getRateLimitHeaders: () => ({}),
  };
});

import { GET } from '@/app/api/public/agents/route';

type Row = Record<string, unknown>;

function makeRow(overrides: Row = {}): Row {
  return {
    id: 'usr_1',
    fullName: 'Adaeze Okafor',
    avatarUrl: null,
    agentBio: 'Residential sales across the Island.',
    agentTier: 'standard',
    agentAreas: null,
    agentOnboardingProfile: {
      legalName: 'Lekki Prime Realty Ltd.',
      isAgency: true,
      operationalTerritories: ['Lekki', 'Ikoyi'],
    },
    licenses: [{ board: 'LASRERA', validUntil: null }],
    reviewsReceived: [{ rating: 4 }, { rating: 5 }],
    _count: { managedListings: 7 },
    ...overrides,
  };
}

/** Rows returned to `getAgentDirectoryFacets` (that select has no `id`). */
const facetUserRows = [{ agentAreas: null, agentOnboardingProfile: { operationalTerritories: ['Lekki'] } }];

function prime(rows: Row[]) {
  mockUserFindMany.mockImplementation((args: { take?: number }) =>
    Promise.resolve(args?.take !== undefined ? rows : facetUserRows)
  );
  mockUserCount.mockResolvedValue(rows.length);
  mockLicenseFindMany.mockResolvedValue([{ board: 'LASRERA' }]);
  mockWithRateLimit.mockResolvedValue({ success: true });
}

function call(url: string) {
  return GET(new NextRequest(`http://localhost${url}`));
}

beforeEach(() => {
  vi.clearAllMocks();
  prime([makeRow()]);
});

describe('GET /api/public/agents', () => {
  it('gates on live confirmed agent accounts, not on agentApproved alone', async () => {
    await call('/api/public/agents');

    const where = mockUserFindMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      role: 'agent',
      isActive: true,
      isBanned: false,
      agentApproved: true,
    });
  });

  it('never returns identity or contact fields', async () => {
    // Deliberately include the PII a careless `include` would surface.
    prime([
      makeRow({
        email: 'adaeze@example.com',
        phone: '+2348000000000',
        ninEncrypted: 'ciphertext',
        bvnEncrypted: 'ciphertext',
        password: 'hash',
        clerkId: 'user_abc',
        agentOnboardingProfile: {
          legalName: 'Lekki Prime Realty Ltd.',
          isAgency: true,
          operationalTerritories: ['Lekki'],
          homeAddress: '12 Admiralty Way',
          businessPhone: '+2348000000001',
          accountNumberEnc: 'ciphertext',
          crmNotes: 'internal',
        },
      }),
    ]);

    const res = await call('/api/public/agents');
    const body = await res.json();
    const agent = body.data[0];

    const serialised = JSON.stringify(agent);
    for (const field of [
      'email',
      'phone',
      'ninEncrypted',
      'bvnEncrypted',
      'password',
      'clerkId',
      'homeAddress',
      'businessPhone',
      'accountNumberEnc',
      'crmNotes',
    ]) {
      expect(Object.keys(agent)).not.toContain(field);
      expect(serialised).not.toContain(field);
    }
    expect(serialised).not.toContain('ciphertext');
    expect(serialised).not.toContain('adaeze@example.com');
  });

  it('maps licences, reviews and listings onto the card fields', async () => {
    const res = await call('/api/public/agents');
    const { data } = await res.json();

    expect(data[0]).toMatchObject({
      id: 'usr_1',
      name: 'Lekki Prime Realty Ltd.',
      isAgency: true,
      tier: 'standard',
      territories: ['Lekki', 'Ikoyi'],
      boards: ['LASRERA'],
      rating: 4.5,
      reviewCount: 2,
      listingCount: 7,
    });
  });

  it('ignores expired licences when deriving badges', async () => {
    prime([
      makeRow({
        licenses: [
          { board: 'LASRERA', validUntil: new Date(Date.now() - 86_400_000) },
          { board: 'NIESV', validUntil: new Date(Date.now() + 86_400_000) },
        ],
      }),
    ]);

    const res = await call('/api/public/agents');
    const { data } = await res.json();

    expect(data[0].boards).toEqual(['NIESV']);
  });

  it('reports no rating rather than inventing one', async () => {
    prime([makeRow({ reviewsReceived: [] })]);

    const res = await call('/api/public/agents');
    const { data } = await res.json();

    expect(data[0].rating).toBeNull();
    expect(data[0].reviewCount).toBe(0);
  });

  it('only counts verified reviews', async () => {
    await call('/api/public/agents');

    const select = mockUserFindMany.mock.calls[0][0].select;
    expect(select.reviewsReceived.where).toEqual({ status: 'verified' });
  });

  it('filters by licence board using approved credentials only', async () => {
    await call('/api/public/agents?board=ESVARBON');

    const where = mockUserFindMany.mock.calls[0][0].where;
    expect(where.licenses).toEqual({ some: { board: 'ESVARBON', status: 'approved' } });
  });

  it('treats blank parameters as absent rather than rejecting them', async () => {
    const res = await call('/api/public/agents?q=&board=&territory=&page=');

    expect(res.status).toBe(200);
    const where = mockUserFindMany.mock.calls[0][0].where;
    expect(where.OR).toBeUndefined();
    expect(where.licenses).toBeUndefined();
    expect(where.agentOnboardingProfile).toBeUndefined();
  });

  it('rejects an unknown board with 400 before touching the database', async () => {
    const res = await call('/api/public/agents?board=BOGUS');

    expect(res.status).toBe(400);
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it('caps the page size', async () => {
    await call('/api/public/agents?limit=5000');

    expect(mockUserFindMany.mock.calls[0][0].take).toBe(50);
  });

  it('reports 429 when the rate limiter refuses', async () => {
    mockWithRateLimit.mockResolvedValue({ success: false });

    const res = await call('/api/public/agents');

    expect(res.status).toBe(429);
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });
});
