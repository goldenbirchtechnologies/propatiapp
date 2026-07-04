import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // Format: YYYY-MM

    const agreements = await prisma.agreement.findMany({
      where: { landlordId: user.id },
      select: { id: true },
    });

    const agreementIds = agreements.map((a) => a.id);

    const rentSchedules = await prisma.rentSchedule.findMany({
      where: { agreementId: { in: agreementIds }, ...(month ? { dueDate: { startsWith: month } } : {}) },
      select: {
        id: true,
        agreementId: true,
        dueDate: true,
        amount: true,
        status: true,
        paidAt: true,
        transactionId: true,
        reminderSent: true,
        agreement: {
          select: {
            id: true,
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                area: true,
                state: true,
                price: true,
                listingType: true,
                owner: { select: { id: true, fullName: true } },
                agent: { select: { id: true, fullName: true } },
              },
            },
            tenant: { select: { id: true, fullName: true } },
            landlord: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    const summary = rentSchedules.reduce(
      (acc, rs) => {
        const key = rs.dueDate.substring(0, 7);
        if (!acc[key]) acc[key] = { month: key, totalExpected: 0, totalPaid: 0, totalOverdue: 0, count: 0 };
        acc[key].totalExpected += Number(rs.amount);
        if (rs.status === 'paid' || rs.paidAt) acc[key].totalPaid += Number(rs.amount);
        if (rs.status === 'overdue' || (!rs.paidAt && new Date(rs.dueDate) < new Date())) acc[key].totalOverdue += Number(rs.amount);
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { month: string; totalExpected: number; totalPaid: number; totalOverdue: number; count: number }>,
    );

    return NextResponse.json({
      success: true,
      data: rentSchedules,
      summary: Object.values(summary).sort((a, b) => b.month.localeCompare(a.month)),
    });
  } catch (error) {
    console.error('Landlord rent GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
