import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

    // Only owner, manager, or accountant can view ledger
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'accountant'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner, manager, or accountant can view ledger' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const listingId = searchParams.get('listingId');
    const unitId = searchParams.get('unitId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const exportFormat = searchParams.get('export');

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {};

    // Filter by org's listings through agreements/listings
    const orgListingIds = await prisma.orgListing.findMany({
      where: { orgId: id },
      select: { listingId: true },
    });
    const listingIds = orgListingIds.map(l => l.listingId);

    if (listingIds.length > 0) {
      where.listingId = { in: listingIds };
    } else {
      // No listings in org, return empty
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: { totalIncome: 0, totalExpenses: 0, netAmount: 0, byType: {}, byStatus: {} },
      });
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.createdAt = dateFilter;
    }

    // Filter by month/year if provided
    if (month || year) {
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      where.createdAt = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const [transactions, total, summaries] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, address: true, listingType: true } },
          payer: { select: { id: true, fullName: true, email: true } },
          payee: { select: { id: true, fullName: true, email: true } },
          agent: { select: { id: true, fullName: true, email: true } },
          agreements: { select: { id: true, type: true, status: true }, take: 1 },
        },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ['type', 'status'],
        where,
        _count: true,
        _sum: { amount: true, platformFee: true, agentCommission: true, payeeAmount: true },
      }),
    ]);

    // Calculate summary stats
    const totalIncome = summaries
      .filter(s => ['rent', 'sale', 'short_let'].includes(s.type))
      .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const totalExpenses = summaries
      .filter(s => s.type === 'subscription')
      .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const netAmount = totalIncome - totalExpenses;

    const byType = summaries.reduce((acc, s) => {
      acc[s.type] = {
        count: s._count,
        totalAmount: Number(s._sum.amount || 0),
        totalPlatformFee: Number(s._sum.platformFee || 0),
        totalAgentCommission: Number(s._sum.agentCommission || 0),
        totalPayeeAmount: Number(s._sum.payeeAmount || 0),
      };
      return acc;
    }, {} as Record<string, unknown>);

    const byStatus = summaries.reduce((acc, s) => {
      const key = `${s.type}_${s.status}`;
      acc[key] = {
        count: s._count,
        totalAmount: Number(s._sum.amount || 0),
      };
      return acc;
    }, {} as Record<string, unknown>);

    // Get unit-based rent ledger if requested
    let unitRentData = null;
    if (unitId || exportFormat === 'csv') {
      const units = await prisma.unit.findMany({
        where: {
          organizationId: id,
          ...(unitId ? { id: unitId } : {}),
        },
        select: {
          id: true,
          unitNumber: true,
          buildingName: true,
          rent: true,
          status: true,
          occupancy: true,
          currentTenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      unitRentData = units.map(unit => ({
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName,
        rent: Number(unit.rent),
        status: unit.status,
        occupancy: unit.occupancy,
        tenant: unit.currentTenant,
      }));
    }

    // Handle CSV export
    if (exportFormat === 'csv') {
      const csvRows = [
        ['Unit Number', 'Building', 'Tenant Name', 'Tenant Email', 'Rent Amount', 'Status', 'Occupancy'].join(','),
      ];

      if (unitRentData) {
        unitRentData.forEach(unit => {
          csvRows.push([
            unit.unitNumber,
            unit.buildingName || '',
            unit.tenant?.fullName || 'N/A',
            unit.tenant?.email || 'N/A',
            unit.rent.toString(),
            unit.status,
            unit.occupancy,
          ].join(','));
        });
      }

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="rent-ledger-${id}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: transactions,
      unitRentData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { totalIncome, totalExpenses, netAmount, byType, byStatus },
    });
  } catch (error) {
    console.error('Org Ledger GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}