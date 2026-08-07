import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('property_id');

    const where: Record<string, unknown> = {};
    if (user.role === 'landlord') {
      where.listing = { ownerId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (propertyId) {
      where.listingId = propertyId;
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const [
      pendingApprovals,
      upcomingCheckIns,
      monthlyBookings,
      monthlyCompleted,
      totalAvailableNights,
      bookedNights,
    ] = await Promise.all([
      prisma.booking.count({ where: { ...where, status: 'pending' } }),
      prisma.booking.count({
        where: {
          ...where,
          status: { in: ['confirmed', 'pending'] },
          checkIn: { lte: nextWeek.toISOString().slice(0, 10) },
          checkIn: { gte: now.toISOString().slice(0, 10) },
        },
      }),
      prisma.booking.findMany({
        where: {
          ...where,
          createdAt: { gte: currentMonthStart },
          status: { in: ['confirmed', 'completed'] },
        },
        select: { totalPrice: true },
      }),
      prisma.booking.count({
        where: {
          ...where,
          status: 'completed',
          createdAt: { gte: currentMonthStart },
        },
      }),
      prisma.listing.aggregate({
        where: user.role === 'landlord' ? { ownerId: user.id, ...(propertyId ? { id: propertyId } : {}) } : propertyId ? { id: propertyId } : {},
        _sum: { price: true },
      }),
      prisma.booking.aggregate({
        where: {
          ...where,
          status: { in: ['confirmed', 'completed'] },
          checkIn: { gte: currentMonthStart.toISOString().slice(0, 10) },
        },
        _sum: { nights: true },
      }),
    ]);

    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
    const occupancyRate =
      totalAvailableNights._sum.price && totalAvailableNights._sum.price > 0
        ? Math.min(100, Math.round((Number(bookedNights._sum.nights || 0) / 30) * 100))
        : 0;

    return NextResponse.json({
      stats: {
        pendingApprovals,
        upcomingCheckIns,
        monthlyRevenue,
        occupancyRate,
        monthlyCompleted,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch stats', 500);
  }
}
