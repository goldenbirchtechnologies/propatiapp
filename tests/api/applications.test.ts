import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/applications/route';
import { NextRequest, NextResponse } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockApplicationFindMany: ReturnType<typeof vi.fn>;
var mockApplicationCount: ReturnType<typeof vi.fn>;
var mockListingFindUnique: ReturnType<typeof vi.fn>;
var mockApplicationFindFirst: ReturnType<typeof vi.fn>;
var mockApplicationCreate: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
  };
});

vi.mock('@/lib/prisma', () => {
  mockApplicationFindMany = vi.fn();
  mockApplicationCount = vi.fn();
  mockListingFindUnique = vi.fn();
  mockApplicationFindFirst = vi.fn();
  mockApplicationCreate = vi.fn();

  return {
    prisma: {
      application: {
        findMany: mockApplicationFindMany,
        count: mockApplicationCount,
        findFirst: mockApplicationFindFirst,
        create: mockApplicationCreate,
      },
      listing: {
        findUnique: mockListingFindUnique,
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

describe('Applications API — auth protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockWithAuth as any).mockReset();
    (mockApplicationFindMany as any).mockReset();
    (mockApplicationCount as any).mockReset();
    (mockListingFindUnique as any).mockReset();
    (mockApplicationFindFirst as any).mockReset();
    (mockApplicationCreate as any).mockReset();
  });

  it('GET returns 401 when withAuth rejects as unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await GET(makeGet('/api/applications'));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockApplicationFindMany).not.toHaveBeenCalled();
  });

  it('POST returns 401 when withAuth rejects as unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await POST(makePost('/api/applications', { listingId: 'listing-1' }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockApplicationCreate).not.toHaveBeenCalled();
  });

  it('GET returns 200 for authenticated tenant', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'tenant-1', role: 'tenant' } });
    (mockApplicationFindMany as any).mockResolvedValue([]);
    (mockApplicationCount as any).mockResolvedValue(0);

    const response = await GET(makeGet('/api/applications?page=1&limit=20'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('POST returns 201 for authenticated tenant with valid body', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'tenant-1', role: 'tenant' } });
    (mockListingFindUnique as any).mockResolvedValue({ id: 'listing-1', ownerId: 'landlord-1', status: 'active', title: 'Unit' });
    (mockApplicationFindFirst as any).mockResolvedValue(null);
    (mockApplicationCreate as any).mockResolvedValue({
      id: 'app-1',
      listingId: 'listing-1',
      tenantId: 'tenant-1',
      landlordId: 'landlord-1',
      status: 'pending',
      message: 'Interested',
      listing: { id: 'listing-1', title: 'Unit', address: '123', area: 'VI', state: 'Lagos', price: 50000000, pricePeriod: 'monthly', listingType: 'rent', images: [] },
      tenant: { id: 'tenant-1', fullName: 'Tenant', email: 't@test.com', avatarUrl: null },
      landlord: { id: 'landlord-1', fullName: 'Landlord', email: 'l@test.com' },
    });

    const response = await POST(makePost('/api/applications', { listingId: 'listing-1', message: 'Interested' }));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('app-1');
  });
});
