import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/applications/[id]/route';
import { NextRequest, NextResponse } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockApplicationFindUnique: ReturnType<typeof vi.fn>;
var mockApplicationUpdate: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
  };
});

vi.mock('@/lib/prisma', () => {
  mockApplicationFindUnique = vi.fn();
  mockApplicationUpdate = vi.fn();

  return {
    prisma: {
      application: {
        findUnique: mockApplicationFindUnique,
        update: mockApplicationUpdate,
      },
    },
  };
});

// --- Helpers ---

function makeGet(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

function makePatch(url: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${url}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// --- Tests ---

describe('Applications [id] API — auth protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockWithAuth as any).mockReset();
    (mockApplicationFindUnique as any).mockReset();
    (mockApplicationUpdate as any).mockReset();
  });

  it('GET returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await GET(makeGet('/api/applications/app-1'), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockApplicationFindUnique).not.toHaveBeenCalled();
  });

  it('PATCH returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await PATCH(makePatch('/api/applications/app-1', { status: 'accepted' }), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockApplicationFindUnique).not.toHaveBeenCalled();
  });

  it('GET returns 404 when application does not exist', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'user-1', role: 'tenant' } });
    (mockApplicationFindUnique as any).mockResolvedValue(null);

    const response = await GET(makeGet('/api/applications/app-1'), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Not found');
  });

  it('GET returns 403 when user is neither landlord, tenant, nor admin', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'user-1', role: 'agent' } });
    (mockApplicationFindUnique as any).mockResolvedValue({
      id: 'app-1',
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      listing: { id: '1', title: 'Unit', price: 50000000, address: '123', area: 'VI', state: 'Lagos', pricePeriod: 'monthly', listingType: 'rent', images: [] },
      tenant: { id: 'tenant-1', fullName: 'Tenant', email: 't@test.com', phone: '', avatarUrl: '', employmentStatus: '', employerName: '', jobTitle: '', yearlyIncome: null, profileBio: '', idVerified: false, ninVerified: false },
      landlord: { id: 'landlord-1', fullName: 'Landlord', email: 'l@test.com' },
    });

    const response = await GET(makeGet('/api/applications/app-1'), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('FORBIDDEN');
  });

  it('GET returns 200 for the tenant associated with the application', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'tenant-1', role: 'tenant' } });
    (mockApplicationFindUnique as any).mockResolvedValue({
      id: 'app-1',
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      listing: { id: '1', title: 'Unit', price: 50000000, address: '123', area: 'VI', state: 'Lagos', pricePeriod: 'monthly', listingType: 'rent', images: [] },
      tenant: { id: 'tenant-1', fullName: 'Tenant', email: 't@test.com', phone: '', avatarUrl: '', employmentStatus: '', employerName: '', jobTitle: '', yearlyIncome: null, profileBio: '', idVerified: false, ninVerified: false },
      landlord: { id: 'landlord-1', fullName: 'Landlord', email: 'l@test.com' },
    });

    const response = await GET(makeGet('/api/applications/app-1'), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('app-1');
  });

  it('PATCH returns 403 when unauthorized user attempts to update', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'user-1', role: 'agent' } });
    (mockApplicationFindUnique as any).mockResolvedValue({
      id: 'app-1',
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      status: 'pending',
      listing: { price: 50000000 },
    });

    const response = await PATCH(makePatch('/api/applications/app-1', { status: 'accepted' }), {
      params: { id: 'app-1' },
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('FORBIDDEN');
    expect(mockApplicationUpdate).not.toHaveBeenCalled();
  });
});
