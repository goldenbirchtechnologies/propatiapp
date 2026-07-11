import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from '@/app/api/screening-calls/[id]/route';
import { NextRequest, NextResponse } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockScreeningCallFindUnique: ReturnType<typeof vi.fn>;
var mockScreeningCallUpdate: ReturnType<typeof vi.fn>;
var mockScreeningCallDelete: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
  };
});

vi.mock('@/lib/prisma', () => {
  mockScreeningCallFindUnique = vi.fn();
  mockScreeningCallUpdate = vi.fn();
  mockScreeningCallDelete = vi.fn();

  return {
    prisma: {
      screeningCall: {
        findUnique: mockScreeningCallFindUnique,
        update: mockScreeningCallUpdate,
        delete: mockScreeningCallDelete,
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

function makeDelete(url: string) {
  return new NextRequest(`http://localhost${url}`, { method: 'DELETE' });
}

// --- Tests ---

describe('Screening Calls [id] API — auth protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockWithAuth as any).mockReset();
    (mockScreeningCallFindUnique as any).mockReset();
    (mockScreeningCallUpdate as any).mockReset();
    (mockScreeningCallDelete as any).mockReset();
  });

  it('GET returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await GET(makeGet('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockScreeningCallFindUnique).not.toHaveBeenCalled();
  });

  it('PATCH returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await PATCH(makePatch('/api/screening-calls/call-1', { status: 'completed' }), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockScreeningCallFindUnique).not.toHaveBeenCalled();
  });

  it('DELETE returns 401 when unauthenticated', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
    );

    const response = await DELETE(makeDelete('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHENTICATED');
    expect(mockScreeningCallDelete).not.toHaveBeenCalled();
  });

  it('GET returns 404 when screening call does not exist', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'user-1', role: 'tenant' } });
    (mockScreeningCallFindUnique as any).mockResolvedValue(null);

    const response = await GET(makeGet('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Not found');
  });

  it('GET returns 403 when user is neither landlord, tenant, nor admin', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'user-1', role: 'agent' } });
    (mockScreeningCallFindUnique as any).mockResolvedValue({
      id: 'call-1',
      landlordId: 'landlord-1',
      tenantId: 'tenant-1',
      listing: { id: '1', title: 'Unit', address: '123' },
      landlord: { id: 'landlord-1', fullName: 'Landlord', email: 'l@test.com', phone: '' },
      tenant: { id: 'tenant-1', fullName: 'Tenant', email: 't@test.com', phone: '' },
    });

    const response = await GET(makeGet('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('FORBIDDEN');
  });

  it('DELETE rejects non-admin user when withAuth enforces admin role', async () => {
    (mockWithAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    );

    const response = await DELETE(makeDelete('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('FORBIDDEN');
    expect(mockScreeningCallDelete).not.toHaveBeenCalled();
  });

  it('DELETE succeeds for admin when call exists', async () => {
    (mockWithAuth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
    (mockScreeningCallFindUnique as any).mockResolvedValue({ id: 'call-1' });
    (mockScreeningCallDelete as any).mockResolvedValue({ id: 'call-1' });

    const response = await DELETE(makeDelete('/api/screening-calls/call-1'), {
      params: { id: 'call-1' },
    } as any);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(mockScreeningCallDelete).toHaveBeenCalledWith({ where: { id: 'call-1' } });
  });
});
