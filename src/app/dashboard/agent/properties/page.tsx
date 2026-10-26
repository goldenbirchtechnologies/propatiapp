import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentPropertiesClient, { type AgentPropertyListing } from './AgentPropertiesClient';

export const metadata: Metadata = {
  title: 'Managed Properties | PROPTI',
  description: 'View and manage landlord properties assigned to you.',
};

const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0;

export default async function AgentPropertiesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { agentId: user.id },
        {
          assignments: {
            some: {
              agentId: user.id,
              status: 'active',
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
      images: {
        where: { isCover: true },
        take: 1,
        select: { id: true, url: true },
      },
      units: {
        select: {
          id: true,
          unitNumber: true,
          buildingName: true,
          type: true,
          listingType: true,
          rent: true,
          status: true,
          occupancy: true,
          currentTenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          isListed: true,
        },
      },
      assignments: {
        where: {
          agentId: user.id,
          status: 'active',
        },
        select: {
          id: true,
          permissions: true,
          scope: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const normalized: AgentPropertyListing[] = listings.map((listing) => {
    const totalUnits = listing.units.length;
    const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;
    const listedUnits = listing.units.filter((u) => u.isListed).length;
    const permissions = listing.assignments.flatMap((a) => (a.permissions as string[]) || []);
    return {
      id: listing.id,
      title: listing.title,
      address: listing.address,
      area: listing.area,
      state: listing.state,
      listingType: listing.listingType,
      propertyType: listing.propertyType,
      price: toNumber(listing.price),
      pricePeriod: listing.pricePeriod,
      status: listing.status,
      verificationTier: listing.verificationTier,
      viewsCount: listing.viewsCount,
      createdAt: listing.createdAt.toISOString(),
      owner: listing.owner,
      mandateType: listing.agentId === user.id ? 'direct' : 'cobrokered',
      coverImage: listing.images?.[0]?.url || null,
      unitCount: totalUnits,
      vacantUnitCount: vacantUnits,
      listedUnitCount: listedUnits,
      permissions,
      units: listing.units.map((unit) => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName,
        type: unit.type,
        listingType: unit.listingType,
        pricePeriod: unit.pricePeriod,
        rent: toNumber(unit.rent),
        status: unit.status,
        occupancy: unit.occupancy,
        isListed: unit.isListed,
        currentTenant: unit.currentTenant,
      })),
    };
  });

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
      hideGlobalSearch
    >
      <ErrorBoundary>
        <AgentPropertiesClient listings={normalized} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
