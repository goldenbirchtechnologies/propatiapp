import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { revenueFiltersSchema } from '@/lib/validators';

/**
 * GET /api/admin/revenue
 * Revenue analytics and reports
 * Query: ?startDate=...&endDate=...&groupBy=day|week|month
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const validated = revenueFiltersSchema.parse(params);

    const { startDate, endDate, groupBy } = validated;

    // Set default date range if not provided (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all successful transactions in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        status: { in: ['released', 'in_escrow'] },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const platformFees = transactions.reduce((sum, t) => sum + Number(t.platformFee), 0);
    const agentCommissions = transactions.reduce((sum, t) => sum + Number(t.agentCommission), 0);
    const transactionCount = transactions.length;
    const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Revenue by transaction type
    const revenueByType: Record<string, number> = {};
    transactions.forEach((t) => {
      revenueByType[t.type] = (revenueByType[t.type] || 0) + Number(t.amount);
    });

    const revenueByTypeArray = Object.entries(revenueByType).map(([type, amount]) => ({
      type,
      amount,
    }));

    // Revenue by date (grouped)
    const revenueByDate: { date: string; amount: number }[] = [];

    if (groupBy === 'day') {
      // Group by day
      const dayMap: Record<string, number> = {};
      transactions.forEach((t) => {
        const day = t.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
        dayMap[day] = (dayMap[day] || 0) + Number(t.amount);
      });

      Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, amount]) => {
          revenueByDate.push({ date, amount });
        });
    } else if (groupBy === 'week') {
      // Group by week (ISO week)
      const weekMap: Record<string, number> = {};
      transactions.forEach((t) => {
        const date = new Date(t.createdAt);
        const week = getISOWeek(date);
        const year = date.getFullYear();
        const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
        weekMap[weekKey] = (weekMap[weekKey] || 0) + Number(t.amount);
      });

      Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, amount]) => {
          revenueByDate.push({ date, amount });
        });
    } else {
      // Group by month
      const monthMap: Record<string, number> = {};
      transactions.forEach((t) => {
        const month = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
        monthMap[month] = (monthMap[month] || 0) + Number(t.amount);
      });

      Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, amount]) => {
          revenueByDate.push({ date, amount });
        });
    }

    // Top earning listings
    const listingRevenue: Record<string, { listingId: string; title: string; revenue: number }> = {};
    transactions.forEach((t) => {
      if (t.listing) {
        const key = t.listing.id;
        if (!listingRevenue[key]) {
          listingRevenue[key] = {
            listingId: t.listing.id,
            title: t.listing.title,
            revenue: 0,
          };
        }
        listingRevenue[key].revenue += Number(t.amount);
      }
    });

    const topEarningListings = Object.values(listingRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const data = {
      totalRevenue,
      platformFees,
      agentCommissions,
      transactionCount,
      averageTransactionValue,
      revenueByType: revenueByTypeArray,
      revenueByDate,
      topEarningListings,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };

    return successResponse(data);
  } catch (error) {
    console.error('Revenue reports error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get ISO week number
function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
