import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    if (user.role === 'estate_manager') {
      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
        select: { ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    // Unit distribution by type
    const units = await prisma.unit.findMany({
      where: { organizationId: orgId },
      select: { type: true },
    });

    const typeCounts: Record<string, number> = {};
    for (const unit of units) {
      const label = unit.type || 'Other';
      typeCounts[label] = (typeCounts[label] || 0) + 1;
    }
    const unitDistribution = Object.entries(typeCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // Recent transactions for the org's listings
    const orgListings = await prisma.listing.findMany({
      where: { organisationListings: { some: { orgId } } },
      select: { id: true },
    });
    const listingIds = orgListings.map((l) => l.id);

    const recentTransactions = listingIds.length
      ? await prisma.transaction.findMany({
          where: { listingId: { in: listingIds } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
            listing: { select: { title: true, address: true } },
            payer: { select: { fullName: true, email: true } },
          },
        })
      : [];

    // Aggregate monthly collection data (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; collection: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = monthStart.toLocaleString('en-US', { month: 'short' });

      let total = 0;
      if (listingIds.length) {
        const txns = await prisma.transaction.findMany({
          where: {
            listingId: { in: listingIds },
            status: { in: ['paid', 'released', 'completed'] },
            createdAt: { gte: monthStart, lt: monthEnd },
          },
          select: { amount: true },
        });
        total = txns.reduce((sum, t) => sum + Number(t.amount), 0);
      }
      monthlyData.push({ month: label, collection: total });
    }

    // Simple occupancy rate from units
    const totalUnitsCount = units.length;
    const occupiedCount = units.filter((u) => u.occupancy === 'OCCUPIED' || u.status === 'RENTED').length;
    const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedCount / totalUnitsCount) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        monthlyData,
        unitDistribution,
        recentTransactions,
        summary: {
          totalUnits: totalUnitsCount,
          occupiedUnits: occupiedCount,
          occupancyRate,
        },
      },
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
