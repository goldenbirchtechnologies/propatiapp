import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner, manager, or accountant can view portfolio
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'accountant', 'maintenance'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status');
    const listingType = searchParams.get('listingType');
    const propertyType = searchParams.get('propertyType');

    const skip = (page - 1) * limit;
    const take = limit;

    const listingsWhere: Record<string, unknown> = {
      orgListings: { some: { orgId: id } },
    };

    if (status) listingsWhere.status = status;
    if (listingType) listingsWhere.listingType = listingType;
    if (propertyType) listingsWhere.propertyType = propertyType;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    const sortField = sort.replace(/^[-+]/, '');
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    orderBy = { [sortField]: sortOrder };

    const [listings, total, stats, unitStats] = await Promise.all([
      prisma.listing.findMany({
        where: listingsWhere,
        orderBy,
        skip,
        take,
        include: {
          images: { where: { isCover: true }, take: 1 },
          verification: { select: { overallStatus: true, currentLayer: true } },
          owner: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          _count: { select: { agreements: true, transactions: true, maintenanceTickets: true } },
        },
      }),
      prisma.listing.count({ where: listingsWhere }),
      prisma.listing.groupBy({
        by: ['status', 'listingType'],
        where: { orgListings: { some: { orgId: id } } },
        _count: true,
      }),
      // Get unit statistics
      prisma.unit.groupBy({
        by: ['status', 'occupancy', 'type'],
        where: { organizationId: id },
        _count: true,
        _sum: { rent: true },
      }),
    ]);

    // Calculate portfolio summary stats
    const activeListings = stats.filter(s => s.status === 'active').reduce((sum, s) => sum + s._count, 0);
    const draftListings = stats.filter(s => s.status === 'draft').reduce((sum, s) => sum + s._count, 0);
    const suspendedListings = stats.filter(s => s.status === 'suspended').reduce((sum, s) => sum + s._count, 0);

    const typeBreakdown = stats.reduce((acc, s) => {
      const key = `${s.listingType}_${s.status}`;
      acc[key] = (acc[key] || 0) + s._count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate unit statistics
    const totalUnits = unitStats.reduce((sum, s) => sum + s._count, 0);
    const occupiedUnits = unitStats.filter(s => s.occupancy === 'OCCUPIED').reduce((sum, s) => sum + s._count, 0);
    const vacantUnits = unitStats.filter(s => s.occupancy === 'VACANT').reduce((sum, s) => sum + s._count, 0);
    const underMaintenanceUnits = unitStats.filter(s => s.status === 'MAINTENANCE').reduce((sum, s) => sum + s._count, 0);

    const totalMonthlyRent = unitStats.reduce((sum, s) => {
      const rent = s._sum.rent ? Number(s._sum.rent) : 0;
      return sum + rent;
    }, 0);

    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const unitsByType = unitStats.reduce((acc, s) => {
      const existing = acc.find(item => item.type === s.type);
      if (existing) {
        existing.count += s._count;
      } else {
        acc.push({ type: s.type, count: s._count });
      }
      return acc;
    }, [] as Array<{ type: string; count: number }>);

    return NextResponse.json({
      success: true,
      data: {
        listings,
        summary: {
          total,
          active: activeListings,
          draft: draftListings,
          suspended: suspendedListings,
          byType: typeBreakdown,
        },
        units: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          underMaintenanceUnits,
          totalMonthlyRent,
          occupancyRate,
          unitsByType,
        },
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Org Portfolio GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}