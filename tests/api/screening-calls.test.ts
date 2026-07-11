import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/screening-calls/route';
import { NextRequest, NextResponse } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockScreeningCallFindMany: ReturnType<typeof vi.fn>;
var mockScreeningCallCount: ReturnType<typeof vi.fn>;
var mockListingFindUnique: ReturnType<typeof vi.fn>;
var mockUserFindUnique: ReturnType<typeof vi.fn>;
var mockScreeningCallCreate: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
  };
});

vi.mock('@/lib/prisma', () => {
  mockScreeningCallFindMany = vi.fn();
  mockScreeningCallCount = vi.fn();
  mockListingFindUnique = vi.fn();
  mockUserFindUnique = vi.fn();
  mockScreeningCallCreate = vi.fn();

  return {
    prisma: {
      screeningCall: {
        findMany: mockScreeningCallFindMany,
        count: mockScreeningCallCount,
        create: mockScreeningCallCreate,
      },
      listing: {
        findUnique: mockListingFindUnique,
      },
      user: {
        findUnique: mockUserFindUnique,
      },
    },
  };
});

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

describe('Screening Calls API — auth protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockWithAuth as any).mockReset();
    (mockScreeningCallFindMany as any).mockReset();
    (mockScreeningCallCount as any).mockReset();
    (mockListingFindUnique as any).mockReset();
    (mockUserFindUnique as any).mockReset();
    (mockScreeningCallCreate as any).mockReset();
  });

  it('GET returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await GET(makeGet('/api/screening-calls'));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockScreeningCallFindMany).not.toHaveBeenCalled();
  });

  it('POST returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await POST(makePost('/api/screening-calls', { listingId: '1', tenantId: '2', scheduledAt: '2025-01-01T00:00:00Z' }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockScreeningCallCreate).not.toHaveBeenCalled();
  });

  it('GET returns 200 for authenticated landlord', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'landlord-1', role: 'landlord' } });
    (mockScreeningCallFindMany as any).mockResolvedValue([]);
    (mockScreeningCallCount as any).mockResolvedValue(0);

    const response = await GET(makeGet('/api/screening-calls?page=1&limit=20'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('POST returns 201 for authenticated landlord creating a call', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'landlord-1', role: 'landlord' } });
    (mockListingFindUnique as any).mockResolvedValue({ id: 'listing-1', ownerId: 'landlord-1', status: 'active' });
    (mockUserFindUnique as any).mockResolvedValue({ id: 'tenant-1', role: 'tenant' });
    (mockScreeningCallCreate as any).mockResolvedValue({
      id: 'call-1',
      listingId: 'listing-1',
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      status: 'scheduled',
    });

    const response = await POST(
      makePost('/api/screening-calls', {
        listingId: 'listing-1',
        tenantId: 'tenant-1',
        scheduledAt: '2025-01-01T09:00:00Z',
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('call-1');
  });
});
