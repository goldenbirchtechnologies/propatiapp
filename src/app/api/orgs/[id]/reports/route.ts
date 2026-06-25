import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  type: z.enum(['portfolio', 'financial', 'maintenance', 'occupancy', 'revenue']),
  format: z.enum(['json', 'csv']).default('json'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  listingIds: z.array(z.string().uuid()).optional(),
});

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

    // Only owner, manager, or accountant can view reports
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'accountant'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'portfolio';
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const orgListingIds = await prisma.orgListing.findMany({
      where: { orgId: id },
      select: { listingId: true },
    });
    const listingIds = orgListingIds.map(l => l.listingId);

    // Hardening: user-controlled filter type is not validated by zod here;
    // enforce an explicit allowlist before any data access.
    const ALLOWED_REPORT_TYPES = new Set([
      'portfolio',
      'financial',
      'maintenance',
      'occupancy',
      'revenue',
    ]);
    if (!ALLOWED_REPORT_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (listingIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { message: 'No listings in organization' },
      });
    }

    let reportData: Record<string, unknown> = {};

    switch (type) {
      case 'portfolio': {
        const [listings, statusCounts, typeCounts, verificationCounts] = await Promise.all([
          prisma.listing.findMany({
            where: { id: { in: listingIds } },
            include: {
              images: { where: { isCover: true }, take: 1 },
              verification: { select: { overallStatus: true, currentLayer: true } },
              _count: { select: { agreements: true, maintenanceTickets: true } },
            },
          }),
          prisma.listing.groupBy({ by: ['status'], where: { id: { in: listingIds } }, _count: true }),
          prisma.listing.groupBy({ by: ['listingType'], where: { id: { in: listingIds } }, _count: true }),
          prisma.listing.groupBy({ by: ['verificationTier'], where: { id: { in: listingIds } }, _count: true }),
        ]);

        reportData = {
          totalListings: listings.length,
          listings,
          breakdown: {
            byStatus: statusCounts.reduce((acc, s) => { acc[s.status] = s._count; return acc; }, {} as Record<string, number>),
            byType: typeCounts.reduce((acc, s) => { acc[s.listingType] = s._count; return acc; }, {} as Record<string, number>),
            byVerification: verificationCounts.reduce((acc, s) => { acc[s.verificationTier] = s._count; return acc; }, {} as Record<string, number>),
          },
        };
        break;
      }

      case 'financial': {
        const transactionWhere: Record<string, unknown> = { listingId: { in: listingIds } };
        if (startDate || endDate) {
          transactionWhere.createdAt = {};
          const createdAt = transactionWhere.createdAt as Record<string, Date>;
          if (startDate) createdAt.gte = new Date(startDate);
          if (endDate) createdAt.lte = new Date(endDate);
        }

        // ===================================================================
        // HARDENING: strict allowlist for tables/columns referenced in raw SQL.
        // The user-controlled `type` parameter selects a report path whose
        // $queryRaw may touch specific tables and columns.  Reject anything
        // outside the allowlist here.  Values stay parameterized via Prisma.sql
        // and Prisma.join.
        // ===================================================================
        {
          const ALLOWED_TABLES = new Set([
            'transactions',
            'maintenanceTickets',
            'agreements',
            'orgListings',
          ]);
          const ALLOWED_COLUMNS = new Set([
            'createdAt',
            'type',
            'amount',
            'platformFee',
            'agentCommission',
            'payeeAmount',
            'status',
          ]);

          const REPORT_TYPE_TO_TABLE: Record<string, string> = {
            financial: 'transactions',
            maintenance: 'maintenanceTickets',
            occupancy: 'agreements',
            revenue: 'transactions',
          };

          const selectedTable = REPORT_TYPE_TO_TABLE[type];
          if (!selectedTable || !ALLOWED_TABLES.has(selectedTable)) {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
          }

          const REQUIRED_COLUMNS = [
            'createdAt',
            'type',
            'amount',
            'platformFee',
            'agentCommission',
            'payeeAmount',
            'status',
          ];
          for (const col of REQUIRED_COLUMNS) {
            if (!ALLOWED_COLUMNS.has(col)) {
              return NextResponse.json({ error: 'Invalid column reference' }, { status: 400 });
            }
          }
        }

        const [transactions, typeSummaries, statusSummaries, monthlyRevenue] = await Promise.all([
          prisma.transaction.findMany({
            where: transactionWhere,
            orderBy: { createdAt: 'desc' },
            include: {
              listing: { select: { id: true, title: true, listingType: true } },
              payer: { select: { id: true, fullName: true } },
            },
          }),
          prisma.transaction.groupBy({
            by: ['type'],
            where: transactionWhere,
            _sum: { amount: true, platformFee: true, agentCommission: true, payeeAmount: true },
            _count: true,
          }),
          prisma.transaction.groupBy({
            by: ['status'],
            where: transactionWhere,
            _sum: { amount: true },
            _count: true,
          }),
          prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "createdAt") as month,
              "type",
              SUM("amount")::numeric as total_amount,
              COUNT(*) as count
            FROM "transactions"
            WHERE "listingId" IN (${Prisma.join(listingIds)})
            ${startDate ? Prisma.sql`AND "createdAt" >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND "createdAt" <= ${new Date(endDate)}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "createdAt"), "type"
            ORDER BY month DESC
          `,
        ]);

        const totalRevenue = typeSummaries
          .filter(s => ['rent', 'sale', 'short_let'].includes(s.type))
          .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

        reportData = {
          period: { start: startDate, end: endDate },
          totalTransactions: transactions.length,
          totalRevenue,
          transactions,
          byType: typeSummaries.map(s => ({
            type: s.type,
            count: s._count,
            totalAmount: Number(s._sum.amount || 0),
            totalPlatformFee: Number(s._sum.platformFee || 0),
            totalAgentCommission: Number(s._sum.agentCommission || 0),
            totalPayeeAmount: Number(s._sum.payeeAmount || 0),
          })),
          byStatus: statusSummaries.map(s => ({
            status: s.status,
            count: s._count,
            totalAmount: Number(s._sum.amount || 0),
          })),
          monthlyRevenue,
        };
        break;
      }

      case 'maintenance': {
        const ticketWhere: Record<string, unknown> = { orgId: id };
        if (startDate || endDate) {
          ticketWhere.createdAt = {};
          const createdAt = ticketWhere.createdAt as Record<string, Date>;
          if (startDate) createdAt.gte = new Date(startDate);
          if (endDate) createdAt.lte = new Date(endDate);
        }

        const [tickets, statusCounts, categoryCounts, priorityCounts, avgResolutionTime] = await Promise.all([
          prisma.maintenanceTicket.findMany({
            where: ticketWhere,
            orderBy: { createdAt: 'desc' },
            include: {
              listing: { select: { id: true, title: true } },
              tenant: { select: { id: true, fullName: true } },
              raisedByUser: { select: { id: true, fullName: true } },
              assignedToUser: { select: { id: true, fullName: true } },
            },
          }),
          prisma.maintenanceTicket.groupBy({ by: ['status'], where: ticketWhere, _count: true }),
          prisma.maintenanceTicket.groupBy({ by: ['category'], where: ticketWhere, _count: true }),
          prisma.maintenanceTicket.groupBy({ by: ['priority'], where: ticketWhere, _count: true }),
          prisma.$queryRaw`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt"))/3600) as avg_hours
            FROM "maintenance_tickets"
            WHERE "orgId" = ${id}
            AND "resolvedAt" IS NOT NULL
            ${startDate ? Prisma.sql`AND "createdAt" >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND "createdAt" <= ${new Date(endDate)}` : Prisma.empty}
          `,
        ]);

        reportData = {
          period: { start: startDate, end: endDate },
          totalTickets: tickets.length,
          tickets,
          byStatus: statusCounts.reduce((acc, s) => { acc[s.status] = s._count; return acc; }, {} as Record<string, number>),
          byCategory: categoryCounts.reduce((acc, s) => { acc[s.category] = s._count; return acc; }, {} as Record<string, number>),
          byPriority: priorityCounts.reduce((acc, s) => { acc[s.priority] = s._count; return acc; }, {} as Record<string, number>),
          avgResolutionTimeHours: (avgResolutionTime as Array<{ avg_hours: number | null }>)[0]?.avg_hours || 0,
        };
        break;
      }

      case 'occupancy': {
        const [agreements, activeAgreements, expiringSoon, vacantListings] = await Promise.all([
          prisma.agreement.findMany({
            where: {
              listingId: { in: listingIds },
              status: { in: ['fully_signed', 'tenant_signed', 'landlord_signed'] },
            },
            include: {
              listing: { select: { id: true, title: true, bedrooms: true, price: true, listingType: true } },
              tenant: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          }),
          prisma.agreement.count({
            where: {
              listingId: { in: listingIds },
              status: 'fully_signed',
              endDate: { gte: new Date() },
            },
          }),
          prisma.agreement.findMany({
            where: {
              listingId: { in: listingIds },
              status: 'fully_signed',
              endDate: { gte: new Date(), lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
            },
            include: {
              listing: { select: { id: true, title: true } },
              tenant: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          }),
          prisma.listing.findMany({
            where: {
              id: { in: listingIds },
              NOT: {
                agreements: {
                  some: {
                    status: 'fully_signed',
                    endDate: { gte: new Date() },
                  },
                },
              },
            },
            select: { id: true, title: true, listingType: true, price: true },
          }),
        ]);

        const occupiedCount = activeAgreements;
        const totalCount = listingIds.length;
        const occupancyRate = totalCount > 0 ? (occupiedCount / totalCount) * 100 : 0;

        reportData = {
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          totalUnits: totalCount,
          occupiedUnits: occupiedCount,
          vacantUnits: totalCount - occupiedCount,
          activeAgreements: agreements.length,
          agreements,
          expiringSoon,
          vacantListings,
        };
        break;
      }

      case 'revenue': {
        const transactionWhere: Record<string, unknown> = { 
          listingId: { in: listingIds },
          type: { in: ['rent', 'sale', 'short_let'] },
          status: 'released',
        };
        if (startDate || endDate) {
          transactionWhere.createdAt = {};
          const createdAt = transactionWhere.createdAt as Record<string, Date>;
          if (startDate) createdAt.gte = new Date(startDate);
          if (endDate) createdAt.lte = new Date(endDate);
        }

        const [transactions, byListing, byMonth, byType] = await Promise.all([
          prisma.transaction.findMany({
            where: transactionWhere,
            orderBy: { createdAt: 'desc' },
            include: {
              listing: { select: { id: true, title: true, listingType: true } },
            },
          }),
          prisma.transaction.groupBy({
            by: ['listingId'],
            where: transactionWhere,
            _sum: { amount: true, payeeAmount: true },
            _count: true,
          }),
          prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "createdAt") as month,
              SUM("amount")::numeric as total_revenue,
              SUM("payeeAmount")::numeric as net_revenue,
              COUNT(*) as transaction_count
            FROM "transactions"
            WHERE "listingId" IN (${Prisma.join(listingIds)})
            AND "type" IN ('rent', 'sale', 'short_let')
            AND "status" = 'released'
            ${startDate ? Prisma.sql`AND "createdAt" >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND "createdAt" <= ${new Date(endDate)}` : Prisma.empty}
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY month DESC
          `,
          prisma.transaction.groupBy({
            by: ['type'],
            where: transactionWhere,
            _sum: { amount: true, payeeAmount: true },
            _count: true,
          }),
        ]);

        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const netRevenue = transactions.reduce((sum, t) => sum + Number(t.payeeAmount || 0), 0);

        // Get listing titles for byListing
        const listingMap = new Map();
        for (const l of await prisma.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, title: true },
        })) {
          listingMap.set(l.id, l.title);
        }

        reportData = {
          period: { start: startDate, end: endDate },
          totalRevenue,
          netRevenue,
          platformFees: totalRevenue - netRevenue,
          transactionCount: transactions.length,
          byListing: byListing.map(b => ({
            listingId: b.listingId,
            listingTitle: listingMap.get(b.listingId),
            count: b._count,
            totalRevenue: Number(b._sum.amount || 0),
            netRevenue: Number(b._sum.payeeAmount || 0),
          })),
          byMonth,
          byType: byType.map(b => ({
            type: b.type,
            count: b._count,
            totalRevenue: Number(b._sum.amount || 0),
            netRevenue: Number(b._sum.payeeAmount || 0),
          })),
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData, type);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      meta: { type, generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Org Reports GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function convertToCSV(data: Record<string, unknown>, type: string): string {
  // Simple CSV conversion for key report types
  const lines: string[] = [];

  if (type === 'portfolio' && data.listings) {
    lines.push('ID,Title,Type,Status,Price,Area,Bedrooms,Verification,Agreements,Maintenance Tickets');
    for (const l of data.listings as Array<Record<string, unknown>>) {
      const count = l._count as Record<string, number> | undefined;
      lines.push([
        l.id, l.title, l.listingType, l.status, l.price, l.area, 
        l.bedrooms || '', l.verificationTier, count?.agreements || 0, count?.maintenanceTickets || 0
      ].join(','));
    }
  } else if (type === 'financial' && data.transactions) {
    lines.push('Reference,Type,Status,Amount,Listing,Payer,Date');
    for (const t of data.transactions as Array<Record<string, unknown>>) {
      const listing = t.listing as Record<string, unknown> | undefined;
      const payer = t.payer as Record<string, unknown> | undefined;
      lines.push([
        t.reference, t.type, t.status, t.amount, listing?.title, payer?.fullName, t.createdAt
      ].join(','));
    }
  } else if (type === 'maintenance' && data.tickets) {
    lines.push('ID,Title,Category,Priority,Status,Listing,Tenant,Assigned,Created');
    for (const t of data.tickets as Array<Record<string, unknown>>) {
      const listing = t.listing as Record<string, unknown> | undefined;
      const tenant = t.tenant as Record<string, unknown> | undefined;
      const assigned = t.assignedToUser as Record<string, unknown> | undefined;
      lines.push([
        t.id, t.title, t.category, t.priority, t.status, 
        listing?.title, tenant?.fullName, assigned?.fullName || '', t.createdAt
      ].join(','));
    }
  } else {
    // Generic fallback - just output the summary fields
    lines.push('Field,Value');
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'object' || value === null) {
        lines.push(`${key},"${value}"`);
      }
    }
  }

  return lines.join('\n');
}