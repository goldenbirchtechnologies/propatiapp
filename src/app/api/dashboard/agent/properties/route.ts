import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

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
        ...(status ? { status } : {}),
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
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
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

    const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

    const normalized = listings.map((listing) => {
      const totalUnits = listing.units.length;
      const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;
      const listedUnits = listing.units.filter((u) => u.isListed).length;
      const assignedAgent = listing.agent ?? null;
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
        createdAt: listing.createdAt,
        owner: listing.owner,
        agent: assignedAgent,
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

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Agent properties GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
