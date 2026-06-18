import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Get dashboard overview statistics for admin
 * Returns: overview stats, user distribution, listing distribution, transaction stats, revenue data
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Overview stats
    const [
      totalUsers,
      totalListings,
      totalTransactions,
      totalRevenue,
      newUsersThisMonth,
      newListingsThisMonth,
      revenueThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['released', 'in_escrow'] } },
      }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.listing.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ['released', 'in_escrow'] },
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Listings by status
    const listingsByStatus = await prisma.listing.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Transactions by status
    const transactionsByStatus = await prisma.transaction.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Verifications by status
    const verificationsByStatus = await prisma.verification.groupBy({
      by: ['overallStatus'],
      _count: { overallStatus: true },
    });

    // Revenue by month (last 12 months)
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const transactions = await prisma.transaction.findMany({
      where: {
        status: { in: ['released', 'in_escrow'] },
        createdAt: { gte: last12Months },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group revenue by month
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthRevenue = transactions
        .filter((t) => t.createdAt.toISOString().slice(0, 7) === monthKey)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      revenueByMonth.push({
        month: monthName,
        revenue: monthRevenue,
      });
    }

    const overview = {
      totalUsers,
      totalListings,
      totalTransactions,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      newUsersThisMonth,
      newListingsThisMonth,
      revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
    };

    const data = {
      overview,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      listingsByStatus: listingsByStatus.map((l) => ({ status: l.status, count: l._count.status })),
      transactionsByStatus: transactionsByStatus.map((t) => ({ status: t.status, count: t._count.status })),
      verificationsByStatus: verificationsByStatus.map((v) => ({
        status: v.overallStatus,
        count: v._count.overallStatus
      })),
      revenueByMonth,
    };

    return successResponse(data);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
