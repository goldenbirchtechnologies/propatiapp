import { prisma } from '@/lib/prisma';

export async function userOrgIds(userId: string): Promise<string[]> {
  const orgs = await prisma.organisation.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId, status: 'active' } } },
      ],
    },
    select: { id: true },
  });
  return orgs.map((o) => o.id);
}

export async function managedListingWhere(userId: string) {
  const orgIds = await userOrgIds(userId);
  const orgClause = orgIds.length > 0 ? [{ orgListings: { some: { orgId: { in: orgIds } } } }] : [];
  return {
    OR: [{ ownerId: userId }, ...orgClause],
  };
}

export async function userManagesListing(userId: string, listingId: string): Promise<boolean> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      ownerId: true,
      orgListings: { select: { orgId: true } },
    },
  });
  if (!listing) return false;
  if (listing.ownerId === userId) return true;
  const linkedOrgIds = listing.orgListings.map((l) => l.orgId);
  if (linkedOrgIds.length === 0) return false;
  const managed = await prisma.organisation.count({
    where: {
      id: { in: linkedOrgIds },
      OR: [
        { ownerId: userId },
        { members: { some: { userId, status: 'active' } } },
      ],
    },
  });
  return managed > 0;
}
