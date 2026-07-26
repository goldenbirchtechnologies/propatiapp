import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must use `var` so assignments inside the vi.mock() factory (which is hoisted above this line)
// do not hit the TDZ of `let`.
var mockListingFindMany: ReturnType<typeof vi.fn>;
var mockListingCount: ReturnType<typeof vi.fn>;
var mockListingCreate: ReturnType<typeof vi.fn>;
var mockVerificationCreate: ReturnType<typeof vi.fn>;
var mockWithAuth: ReturnType<typeof vi.fn>;
var mockWithRateLimit: ReturnType<typeof vi.fn>;
var mockGetRateLimitHeaders: ReturnType<typeof vi.fn>;
var mockFormatCurrencyKobo: ReturnType<typeof vi.fn>;

// Mock prisma
vi.mock('@/lib/prisma', () => {
  mockListingFindMany = vi.fn();
  mockListingCount = vi.fn();
  mockListingCreate = vi.fn();
  mockVerificationCreate = vi.fn();

  return {
    prisma: {
      listing: {
        findMany: mockListingFindMany,
        count: mockListingCount,
        create: mockListingCreate,
      },
      verification: {
        create: mockVerificationCreate,
      },
    },
  };
});

// Mock rate-limit module
vi.mock('@/lib/rate-limit', () => {
  mockWithRateLimit = vi.fn();
  mockGetRateLimitHeaders = vi.fn(() => ({}));

  return {
    withRateLimit: (...args: unknown[]) => (mockWithRateLimit as any)(...args),
    apiRateLimiter: {},
    getRateLimitHeaders: (...args: unknown[]) => (mockGetRateLimitHeaders as any)(...args),
  };
});

// Mock auth module (used by POST)
vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();

  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
    errorResponse: vi.fn(),
  };
});

// Mock fees
vi.mock('@/lib/fees', () => {
  mockFormatCurrencyKobo = vi.fn((amount: number) => `${amount / 100}`);

  return {
    formatCurrencyKobo: (...args: unknown[]) => (mockFormatCurrencyKobo as any)(...args),
  };
});

import { GET, POST } from '@/app/api/listings/route';
import { NextRequest } from 'next/server';

// --- Helpers ---

function makeGet(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

function makePost(url: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// --- Tests ---

describe('Listings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockReset();
    mockGetRateLimitHeaders.mockReset();
    mockWithAuth.mockReset();
    mockListingFindMany.mockReset();
    mockListingCount.mockReset();
    mockListingCreate.mockReset();
    mockVerificationCreate.mockReset();
  });

  // ---------------- GET happy paths ----------------

  it('GET /api/listings returns 200 with listings and pagination', async () => {
    const mockListings = [
      {
        id: 'listing-1',
        title: 'Luxury Apartment',
        description: 'Nice place',
        listingType: 'rent',
        propertyType: 'apartment',
        address: '123 Main St',
        area: 'Ikoyi',
        state: 'Lagos',
        price: 150000000,
        bedrooms: 3,
        bathrooms: 2,
        images: [{ url: 'cover.jpg', isCover: true }],
        owner: { id: 'user-1', fullName: 'John Doe', avatarUrl: null, phoneVerified: true },
        agent: null,
        verification: { overallStatus: 'certified', currentLayer: 3 },
      },
    ];

    mockListingFindMany.mockResolvedValue(mockListings);
    mockListingCount.mockResolvedValue(1);
    mockWithRateLimit.mockResolvedValue({ success: true });

    const response = await GET(makeGet('/api/listings?page=1&limit=20'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.listings).toHaveLength(1);
    expect(body.listings[0].title).toBe('Luxury Apartment');
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(20);
    expect(body.pagination.total).toBe(1);
    expect(body.pagination.totalPages).toBe(1);
    expect(body.pagination.hasNext).toBe(false);
  });

  it('GET /api/listings returns filtered results when filters are provided', async () => {
    mockListingFindMany.mockResolvedValue([]);
    mockListingCount.mockResolvedValue(0);
    mockWithRateLimit.mockResolvedValue({ success: true });

    const response = await GET(makeGet('/api/listings?listingType=rent&state=Lagos&page=1&limit=10'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.listings).toHaveLength(0);
    expect(body.pagination.total).toBe(0);
    expect(mockListingFindMany).toHaveBeenCalledTimes(1);
    const whereArg = mockListingFindMany.mock.calls[0][0].where;
    expect(whereArg.listingType).toBe('rent');
    expect(whereArg.state).toBe('Lagos');
    expect(whereArg.status).toBe('active');
  });

  it('GET /api/listings returns 429 when rate limit is exceeded', async () => {
    mockWithRateLimit.mockResolvedValue({
      success: false,
      reset: '2025-01-01T00:00:00Z',
      remaining: 0,
    });
    mockGetRateLimitHeaders.mockReturnValue({ 'Retry-After': '60' });

    const response = await GET(makeGet('/api/listings'));

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe('Too Many Requests');
  });

  it('GET /api/listings returns 400 on invalid query parameters', async () => {
    mockWithRateLimit.mockResolvedValue({ success: true });

    const response = await GET(makeGet('/api/listings?sortBy=invalid_option'));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid query parameters');
  });

  // ---------------- POST happy path ----------------

  it('POST /api/listings returns 201 for authorized landlord with valid body', async () => {
    mockWithAuth.mockResolvedValue({ user: { id: 'landlord-1' } });
    mockListingCreate.mockResolvedValue({
      id: 'listing-new',
      title: 'New Rental',
      price: 50000000,
      ownerId: 'landlord-1',
    });
    mockVerificationCreate.mockResolvedValue({
      id: 'verification-1',
      listingId: 'listing-new',
    });

    const validBody = {
      title: 'New Rental',
      description: 'A nice place',
      listingType: 'rent',
      address: '456 Main St',
      area: 'Victoria Island',
      state: 'Lagos',
      price: 50000000,
      status: 'active',
    };

    const response = await POST(makePost('/api/listings', validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockListingCreate).toHaveBeenCalledTimes(1);
    expect(body.id).toBe('listing-new');
    expect(body.title).toBe('New Rental');
    expect(mockVerificationCreate).toHaveBeenCalledTimes(1);
  });
});
