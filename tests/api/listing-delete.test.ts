import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

var mockListingFindUnique: ReturnType<typeof vi.fn>;
var mockListingDelete: ReturnType<typeof vi.fn>;
var mockListingUpdate: ReturnType<typeof vi.fn>;
var mockUnitFindMany: ReturnType<typeof vi.fn>;
var mockUnitUpdateMany: ReturnType<typeof vi.fn>;
var mockTransaction: ReturnType<typeof vi.fn>;
var mockGetCurrentUser: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma', () => {
  mockListingFindUnique = vi.fn();
  mockListingDelete = vi.fn();
  mockListingUpdate = vi.fn();
  mockUnitFindMany = vi.fn();
  mockUnitUpdateMany = vi.fn();
  mockTransaction = vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations));

  return {
    prisma: {
      listing: {
        findUnique: mockListingFindUnique,
        delete: mockListingDelete,
        update: mockListingUpdate,
      },
      unit: {
        findMany: mockUnitFindMany,
        updateMany: mockUnitUpdateMany,
      },
      $transaction: (...args: unknown[]) => (mockTransaction as any)(...args),
    },
  };
});

vi.mock('@/lib/auth', () => {
  mockGetCurrentUser = vi.fn();
  return { getCurrentUser: (...args: unknown[]) => (mockGetCurrentUser as any)(...args) };
});

vi.mock('@/lib/api-auth', () => ({ requireAgentPermission: vi.fn() }));

import { DELETE } from '@/app/api/listings/[id]/route';

function makeDelete(id: string) {
  return new NextRequest(`http://localhost/api/listings/${id}`, { method: 'DELETE' });
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('DELETE /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'landlord-1', role: 'landlord' });
    mockListingFindUnique.mockResolvedValue({ ownerId: 'landlord-1', title: 'Sunrise Court' });
    mockListingUpdate.mockResolvedValue({ id: 'parent-1', status: 'draft' });
    mockUnitUpdateMany.mockResolvedValue({ count: 2 });
  });

  it('unpublishes a building listing without deleting the parent or its units', async () => {
    mockUnitFindMany.mockResolvedValue([{ id: 'unit-1' }, { id: 'unit-2' }]);

    const response = await makeDeleteCall();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockListingDelete).not.toHaveBeenCalled();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockUnitUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['unit-1', 'unit-2'] } },
      data: { isListed: false },
    });
    expect(mockListingUpdate).toHaveBeenCalledWith({
      where: { id: 'parent-1' },
      data: { status: 'draft' },
    });
  });

  it('still hard-deletes a legacy listing with no units', async () => {
    mockUnitFindMany.mockResolvedValue([]);

    const response = await makeDeleteCall();

    expect(response.status).toBe(200);
    expect(mockListingDelete).toHaveBeenCalledWith({ where: { id: 'parent-1' } });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

function makeDeleteCall() {
  return DELETE(makeDelete('parent-1'), context('parent-1'));
}
