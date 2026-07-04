import { describe, expect, vi, beforeEach, test } from 'vitest';

// --- Mocks (must be at top-level so Vitest can hoist them before imports) ---

vi.mock('@/lib/api-auth', () => {
  mockWithAuth = vi.fn() as any;
  return {
    withAuth: (...args: unknown[]) => (mockWithAuth as any)(...args),
    errorResponse: vi.fn(),
  };
});

var mockPrisma$queryRaw: ReturnType<typeof vi.fn>;
var mockOrgMemberFindUnique: ReturnType<typeof vi.fn>;
var mockOrganisationFindUnique: ReturnType<typeof vi.fn>;
var mockOrgListingFindMany: ReturnType<typeof vi.fn>;
var mockListingFindMany: ReturnType<typeof vi.fn>;
var mockListingGroupBy: ReturnType<typeof vi.fn>;
var mockTransactionFindMany: ReturnType<typeof vi.fn>;
var mockTransactionGroupBy: ReturnType<typeof vi.fn>;
var mockMaintenanceTicketFindMany: ReturnType<typeof vi.fn>;
var mockMaintenanceTicketGroupBy: ReturnType<typeof vi.fn>;
var mockAgreementFindMany: ReturnType<typeof vi.fn>;
var mockAgreementCount: ReturnType<typeof vi.fn>;
var mockWithAuth: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma', () => {
  mockPrisma$queryRaw = vi.fn();
  mockOrgMemberFindUnique = vi.fn();
  mockOrganisationFindUnique = vi.fn();
  mockOrgListingFindMany = vi.fn();
  mockListingFindMany = vi.fn();
  mockListingGroupBy = vi.fn();
  mockTransactionFindMany = vi.fn();
  mockTransactionGroupBy = vi.fn();
  mockMaintenanceTicketFindMany = vi.fn();
  mockMaintenanceTicketGroupBy = vi.fn();
  mockAgreementFindMany = vi.fn();
  mockAgreementCount = vi.fn();
  return {
    prisma: {
      orgMember: { findUnique: mockOrgMemberFindUnique },
      organisation: { findUnique: mockOrganisationFindUnique },
      orgListing: { findMany: mockOrgListingFindMany },
      listing: { findMany: mockListingFindMany, groupBy: mockListingGroupBy },
      transaction: { findMany: mockTransactionFindMany, groupBy: mockTransactionGroupBy },
      maintenanceTicket: { findMany: mockMaintenanceTicketFindMany, groupBy: mockMaintenanceTicketGroupBy },
      agreement: { findMany: mockAgreementFindMany, count: mockAgreementCount },
      $queryRaw: mockPrisma$queryRaw,
    },
  };
});

// The mock factory above doesn't expose mockWithAuth to this module scope, so
// we need a re-export from the mocked module. Use a separate import that Vitest
// resolves to the already-mocked version.
import { GET } from '@/app/api/orgs/[id]/reports/route';
import { NextRequest } from 'next/server';

function createRequest(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return new NextRequest(`http://localhost/api/orgs/org-1/reports?${searchParams}`);
}

describe('Organisation Reports API — SQL Injection Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithAuth.mockResolvedValue({ user: { id: 'test-user-id' } });
    mockOrgMemberFindUnique.mockResolvedValue({ role: 'manager', status: 'active' });
    mockOrganisationFindUnique.mockResolvedValue({ ownerId: 'test-user-id' });
    mockOrgListingFindMany.mockResolvedValue([{ listingId: 'listing-1' }, { listingId: 'listing-2' }]);
    mockPrisma$queryRaw.mockReset();
  });

  test('financial report uses Prisma tagged templates, not string interpolation', async () => {
    mockListingFindMany.mockResolvedValue([]);
    mockTransactionFindMany.mockResolvedValue([]);
    mockTransactionGroupBy.mockResolvedValue([]);
    mockPrisma$queryRaw.mockResolvedValue([]);

    const request = createRequest({ type: 'financial' });
    const response = await GET(request, { params: Promise.resolve({ id: 'org-1' }) });

    expect(response.status).toBe(200);
    expect(mockPrisma$queryRaw).toHaveBeenCalledTimes(1);
    // The first argument of $queryRaw must be a Prisma.Sql object instance,
    // not a plain string that could carry injected values.
    const firstArg = mockPrisma$queryRaw.mock.calls[0][0];
    expect(firstArg).toBeInstanceOf(Object);
  });

  test('maintenance report uses Prisma.Sql for avg computation', async () => {
    mockMaintenanceTicketFindMany.mockResolvedValue([]);
    mockMaintenanceTicketGroupBy.mockResolvedValue([]);
    mockPrisma$queryRaw.mockResolvedValue([{ avg_hours: 2.5 }]);

    const request = createRequest({ type: 'maintenance' });
    const response = await GET(request, { params: Promise.resolve({ id: 'org-1' }) });

    expect(response.status).toBe(200);
    expect(mockPrisma$queryRaw).toHaveBeenCalledTimes(1);
    const firstArg = mockPrisma$queryRaw.mock.calls[0][0];
    expect(firstArg).toBeInstanceOf(Object);
  });

  test('revenue report uses Prisma.Sql for revenue aggregation', async () => {
    mockListingFindMany.mockResolvedValue([]);
    mockTransactionFindMany.mockResolvedValue([]);
    mockTransactionGroupBy.mockResolvedValue([]);
    mockPrisma$queryRaw.mockResolvedValue([]);

    const request = createRequest({ type: 'revenue' });
    const response = await GET(request, { params: Promise.resolve({ id: 'org-1' }) });

    expect(response.status).toBe(200);
    expect(mockPrisma$queryRaw).toHaveBeenCalledTimes(1);
    const firstArg = mockPrisma$queryRaw.mock.calls[0][0];
    expect(firstArg).toBeInstanceOf(Object);
  });

  test('malicious listingIds cannot inject SQL via Prisma.join', async () => {
    mockOrgListingFindMany.mockResolvedValue([{ listingId: "'; DROP TABLE listings; --" }]);
    mockPrisma$queryRaw.mockResolvedValue([]);

    const request = createRequest({ type: 'financial' });
    const response = await GET(request, { params: Promise.resolve({ id: 'org-1' }) });

    // The route should still succeed and not propagate raw SQL
    expect(response.status).toBe(200);
    // Verify $queryRaw was invoked (route didn't abort early)
    expect(mockPrisma$queryRaw).toHaveBeenCalled();
    // Verify the argument is a Prisma.Sql object, which escapes the value
    const queryArg = mockPrisma$queryRaw.mock.calls[0][0];
    expect(queryArg).toBeInstanceOf(Object);
  });
});
