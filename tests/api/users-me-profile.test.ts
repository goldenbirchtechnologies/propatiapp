import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/users/me/profile/route';
import { NextRequest } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockUserUpdate: ReturnType<typeof vi.fn>;
var mockUserFindUnique: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
  };
});

vi.mock('@/lib/prisma', () => {
  mockUserUpdate = vi.fn();
  mockUserFindUnique = vi.fn();
  return {
    prisma: {
      user: {
        update: mockUserUpdate,
        findUnique: mockUserFindUnique,
      },
    },
  };
});

// --- Helpers ---

const caller = { id: 'user_1', role: 'tenant' };

function asCaller() {
  (mockWithAuth as any).mockResolvedValue({ user: caller });
}

function makeGet() {
  return new NextRequest('http://localhost/api/users/me/profile');
}

function makePatch(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * A user row shaped as Prisma returns it — BigInt columns stay BigInt, which
 * is exactly what used to blow up in NextResponse.json.
 */
function makeUserRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user_1',
    role: 'tenant',
    fullName: 'Ada Obi',
    yearlyIncome: BigInt(12_000_000),
    email: 'ada@example.com',
    sentTransactions: [
      {
        id: 'txn_1',
        type: 'rent',
        status: 'success',
        amount: BigInt(250_000_00), // kobo
        createdAt: new Date('2026-01-05T10:00:00Z'),
        listing: null,
      },
    ],
    receivedTransactions: [],
    raisedTickets: [],
    notifications: [{ id: 'n_1', title: 'Hi' }],
    ownedListings: [],
    tenantAgreements: [],
    landlordAgreements: [],
    orgMemberships: [],
    ...overrides,
  };
}

// --- Tests ---

describe('GET /api/users/me/profile — BigInt serialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asCaller();
  });

  it('returns 200 instead of throwing on a BigInt yearlyIncome', async () => {
    (mockUserFindUnique as any).mockResolvedValue(makeUserRow());

    const res = await GET(makeGet());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // Widened to Number, not stringified as "12000000n".
    expect(json.data.yearlyIncome).toBe(12_000_000);
    expect(typeof json.data.yearlyIncome).toBe('number');
  });

  it('passes null yearlyIncome through as null', async () => {
    (mockUserFindUnique as any).mockResolvedValue(makeUserRow({ yearlyIncome: null }));

    const res = await GET(makeGet());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.yearlyIncome).toBeNull();
  });

  it('converts transaction amounts from kobo and keeps the formatted label', async () => {
    (mockUserFindUnique as any).mockResolvedValue(makeUserRow());

    const res = await GET(makeGet());
    const json = await res.json();

    const [txn] = json.data.sentTransactions;
    expect(txn.amount).toBe(250_000);
    expect(txn.amountFormatted).toContain('250,000');
    // The raw BigInt must not survive into the payload.
    expect(typeof txn.amount).not.toBe('bigint');
  });
});

describe('PATCH /api/users/me/profile — blank optional strings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asCaller();
    (mockUserUpdate as any).mockResolvedValue({ id: 'user_1' });
  });

  it('stores null rather than the string "null" when agentBio is cleared', async () => {
    await PATCH(makePatch({ agentBio: null }));

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ agentBio: null }) }),
    );
  });

  it('stores null rather than the string "null" when jobTitle is cleared', async () => {
    await PATCH(makePatch({ jobTitle: null }));

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ jobTitle: null }) }),
    );
  });

  it('stores null for an empty-string jobTitle', async () => {
    await PATCH(makePatch({ jobTitle: '   ' }));

    const call = (mockUserUpdate as any).mock.calls[0][0];
    expect(call.data.jobTitle).toBeNull();
  });

  it('still stores a real value verbatim', async () => {
    await PATCH(makePatch({ jobTitle: 'Pharmacist', agentBio: 'Lagos mainland' }));

    const call = (mockUserUpdate as any).mock.calls[0][0];
    expect(call.data.jobTitle).toBe('Pharmacist');
    expect(call.data.agentBio).toBe('Lagos mainland');
  });
});
