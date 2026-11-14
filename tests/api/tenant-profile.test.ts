import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/users/me/tenant-profile/route';
import { NextRequest } from 'next/server';

// --- Mocks ---

var mockWithAuth: ReturnType<typeof vi.fn>;
var mockDossierFindUnique: ReturnType<typeof vi.fn>;
var mockDossierUpsert: ReturnType<typeof vi.fn>;
var mockAddressFindMany: ReturnType<typeof vi.fn>;
var mockAddressDeleteMany: ReturnType<typeof vi.fn>;
var mockAddressCreateMany: ReturnType<typeof vi.fn>;
var mockContactFindMany: ReturnType<typeof vi.fn>;
var mockContactDeleteMany: ReturnType<typeof vi.fn>;
var mockContactCreateMany: ReturnType<typeof vi.fn>;
var mockUserFindUnique: ReturnType<typeof vi.fn>;
var mockUpsertDossier: ReturnType<typeof vi.fn>;

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn();
  return { withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args) };
});

vi.mock('@/lib/onboarding/dossier', () => {
  mockUpsertDossier = vi.fn();
  return { upsertDossier: (...args: unknown[]) => (mockUpsertDossier as any)(...args) };
});

vi.mock('@/lib/prisma', () => {
  mockDossierFindUnique = vi.fn();
  mockDossierUpsert = vi.fn();
  mockAddressFindMany = vi.fn();
  mockAddressDeleteMany = vi.fn();
  mockAddressCreateMany = vi.fn();
  mockContactFindMany = vi.fn();
  mockContactDeleteMany = vi.fn();
  mockContactCreateMany = vi.fn();
  mockUserFindUnique = vi.fn();

  return {
    prisma: {
      rentalApplicationDossier: {
        findUnique: (...a: unknown[]) => (mockDossierFindUnique as any)(...a),
        upsert: (...a: unknown[]) => (mockDossierUpsert as any)(...a),
      },
      tenantAddress: {
        findMany: (...a: unknown[]) => (mockAddressFindMany as any)(...a),
        deleteMany: (...a: unknown[]) => (mockAddressDeleteMany as any)(...a),
        createMany: (...a: unknown[]) => (mockAddressCreateMany as any)(...a),
      },
      emergencyContact: {
        findMany: (...a: unknown[]) => (mockContactFindMany as any)(...a),
        deleteMany: (...a: unknown[]) => (mockContactDeleteMany as any)(...a),
        createMany: (...a: unknown[]) => (mockContactCreateMany as any)(...a),
      },
      user: {
        findUnique: (...a: unknown[]) => (mockUserFindUnique as any)(...a),
      },
      // Runs the callback with the same mocked client standing in for `tx`.
      $transaction: async (fn: any) => fn(globalThis.__txClient),
    },
  };
});

// --- Helpers ---

const caller = { id: 'user_1', role: 'tenant' };

function makeGet() {
  return new NextRequest('http://localhost/api/users/me/tenant-profile');
}

function makePatch(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/users/me/tenant-profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeDossier(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dos_1',
    userId: 'user_1',
    status: 'draft',
    dateOfBirth: null,
    gender: null,
    nationality: null,
    stateOfResidence: null,
    lga: null,
    maritalStatus: null,
    addressLine1: null,
    city: null,
    employmentStatus: null,
    employmentType: null,
    employerName: null,
    jobTitle: null,
    yearlyIncome: BigInt(4_800_000),
    otherIncomeSources: null,
    guarantorName: null,
    guarantorPhone: null,
    guarantorRelationship: null,
    nokName: null,
    nokPhone: null,
    nokRelationship: null,
    preferredBedrooms: null,
    maxMonthlyBudget: BigInt(300_000),
    preferredState: null,
    ...overrides,
  };
}

const profileRow = {
  id: 'user_1',
  fullName: 'Ada Obi',
  email: 'ada@example.com',
  phone: '+2348012345678',
  avatarUrl: null,
  idType: 'nin',
  idVerified: false,
  phoneVerified: true,
  ninVerified: false,
  incomeVerified: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  (mockWithAuth as any).mockResolvedValue({ user: caller });
  (mockUserFindUnique as any).mockResolvedValue(profileRow);
  (mockDossierFindUnique as any).mockResolvedValue(makeDossier());
  (mockAddressFindMany as any).mockResolvedValue([]);
  (mockContactFindMany as any).mockResolvedValue([]);
  (globalThis as any).__txClient = {
    tenantAddress: {
      deleteMany: (...a: unknown[]) => (mockAddressDeleteMany as any)(...a),
      createMany: (...a: unknown[]) => (mockAddressCreateMany as any)(...a),
    },
    emergencyContact: {
      deleteMany: (...a: unknown[]) => (mockContactDeleteMany as any)(...a),
      createMany: (...a: unknown[]) => (mockContactCreateMany as any)(...a),
    },
  };
});

// --- Tests ---

describe('GET /api/users/me/tenant-profile', () => {
  it('returns the dossier, lists, verification and completion in one payload', async () => {
    const res = await GET(makeGet());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.dossier).toBeTruthy();
    expect(json.data.addresses).toEqual([]);
    expect(json.data.emergencyContacts).toEqual([]);
    expect(json.data.profile.phoneVerified).toBe(true);
    expect(json.data.completion.sections.length).toBe(10);
  });

  it('narrows BigInt money to a number instead of throwing', async () => {
    const res = await GET(makeGet());
    const json = await res.json();

    expect(json.data.dossier.yearlyIncome).toBe(4_800_000);
    expect(json.data.dossier.maxMonthlyBudget).toBe(300_000);
    expect(typeof json.data.dossier.yearlyIncome).toBe('number');
  });

  it('still reports completion when the user has no dossier row yet', async () => {
    (mockDossierFindUnique as any).mockResolvedValue(null);

    const res = await GET(makeGet());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.dossier).toBeNull();
    // phoneVerified alone satisfies one section.
    expect(json.data.completion.completedCount).toBe(1);
  });

  it('404s when the user row is gone', async () => {
    (mockUserFindUnique as any).mockResolvedValue(null);

    const res = await GET(makeGet());
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/users/me/tenant-profile — dossier sections', () => {
  it('upserts a partial personal section and returns a fresh summary', async () => {
    (mockDossierUpsert as any).mockResolvedValue(makeDossier());

    const res = await PATCH(makePatch({ section: 'personal', data: { gender: 'female' } }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockDossierUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_1' },
        update: expect.objectContaining({ gender: 'female' }),
      }),
    );
    expect(json.data.completion.sections).toHaveLength(10);
  });

  it('routes employment through upsertDossier so the User row stays in sync', async () => {
    (mockUpsertDossier as any).mockResolvedValue({});

    const res = await PATCH(
      makePatch({ section: 'employment', data: { employmentStatus: 'employed', jobTitle: 'Analyst' } }),
    );

    expect(res.status).toBe(200);
    expect(mockUpsertDossier).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({ employmentStatus: 'employed', jobTitle: 'Analyst' }),
    );
    // The generic path must not also have run.
    expect(mockDossierUpsert).not.toHaveBeenCalled();
  });

  it('rejects an invalid enum with 400 and details', async () => {
    const res = await PATCH(makePatch({ section: 'personal', data: { gender: 'wizard' } }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.details).toBeTruthy();
    expect(mockDossierUpsert).not.toHaveBeenCalled();
  });

  it('rejects an unknown section', async () => {
    const res = await PATCH(makePatch({ section: 'salary', data: {} }));
    expect(res.status).toBe(400);
  });

  it('rejects a body without section or data', async () => {
    const res = await PATCH(makePatch({ section: 'personal' }));
    expect(res.status).toBe(400);
  });

  it('never lets the caller write verification flags', async () => {
    (mockDossierUpsert as any).mockResolvedValue(makeDossier());

    await PATCH(makePatch({ section: 'personal', data: { idVerified: true, phoneVerified: true, gender: 'male' } }));

    const written = (mockDossierUpsert as any).mock.calls[0][0];
    expect(written.update).not.toHaveProperty('idVerified');
    expect(written.update).not.toHaveProperty('phoneVerified');
  });
});

describe('PATCH /api/users/me/tenant-profile — list sections', () => {
  it('replaces address history and marks the first entry current', async () => {
    const res = await PATCH(
      makePatch({
        section: 'addressHistory',
        data: [
          { addressLine1: '12 Bode Thomas', city: 'Surulere' },
          { addressLine1: '4 Allen Ave', city: 'Ikeja' },
        ],
      }),
    );

    expect(res.status).toBe(200);
    expect(mockAddressDeleteMany).toHaveBeenCalledWith({ where: { userId: 'user_1' } });

    const { data } = (mockAddressCreateMany as any).mock.calls[0][0];
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ sequence: 1, isCurrent: true, userId: 'user_1' });
    expect(data[1]).toMatchObject({ sequence: 2, isCurrent: false });
  });

  it('replaces emergency contacts and marks the first primary', async () => {
    const res = await PATCH(
      makePatch({
        section: 'emergencyContacts',
        data: [{ name: 'Ada Obi', relationship: 'Sister', phone: '+2348098765432' }],
      }),
    );

    expect(res.status).toBe(200);
    expect(mockContactDeleteMany).toHaveBeenCalledWith({ where: { userId: 'user_1' } });

    const { data } = (mockContactCreateMany as any).mock.calls[0][0];
    expect(data[0]).toMatchObject({ isPrimary: true, userId: 'user_1' });
  });

  it('clears a list without creating rows when given an empty array', async () => {
    const res = await PATCH(makePatch({ section: 'emergencyContacts', data: [] }));

    expect(res.status).toBe(200);
    expect(mockContactDeleteMany).toHaveBeenCalled();
    expect(mockContactCreateMany).not.toHaveBeenCalled();
  });

  it('rejects an address entry missing its city', async () => {
    const res = await PATCH(
      makePatch({ section: 'addressHistory', data: [{ addressLine1: '12 Bode Thomas' }] }),
    );

    expect(res.status).toBe(400);
    expect(mockAddressCreateMany).not.toHaveBeenCalled();
  });
});
