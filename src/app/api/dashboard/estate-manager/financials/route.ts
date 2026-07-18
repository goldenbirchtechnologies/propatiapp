import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const ownedOrg = await prisma.organisation.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const membership = ownedOrg
      ? null
      : await prisma.orgMember.findFirst({
          where: { userId: user.id, status: 'active' },
          select: { orgId: true, org: { select: { id: true } } },
        });

    const orgId = ownedOrg?.id || membership?.orgId || membership?.org?.id;

    if (!orgId) {
      return NextResponse.json({
        noOrg: true,
        pl: null,
      });
    }

    // Estate managers can only view their own org data
    if (user.role === 'estate_manager') {
      const ownerOnly = await prisma.organisation.findFirst({
        where: { id: orgId, ownerId: user.id },
        select: { id: true },
      });
      const isMember = await prisma.orgMember.findFirst({
        where: { orgId, userId: user.id, status: 'active' },
      });
      if (!ownerOnly && !isMember) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const [
      units,
      serviceCharges,
      utilityAllocations,
      releasedTransactions,
      allTxns,
    ] = await Promise.all([
      prisma.unit.findMany({
        where: { organizationId: orgId },
        select: { rent: true, occupancy: true },
      }),
      prisma.serviceCharge.findMany({
        where: { organizationId: orgId },
        select: { amount: true, status: true, createdAt: true },
      }),
      prisma.utilityAllocation.findMany({
        where: { unit: { organizationId: orgId } },
        select: { amount: true, createdAt: true },
      }),
      prisma.transaction.findMany({
        where: { payeeId: user.id, status: { in: ['released', 'completed', 'paid'] } },
        select: { amount: true, createdAt: true, type: true },
      }),
      prisma.transaction.findMany({
        where: { payerId: user.id, status: { in: ['released', 'completed', 'paid', 'in_escrow'] } },
        select: { amount: true, createdAt: true, type: true },
      }),
    ]);

    const now = new Date();

    const occupiedUnits = units.filter(u => u.occupancy === 'OCCUPIED');
    const occupiedUnitRent = occupiedUnits.reduce((sum, u) => sum + Number(u.rent), 0);

    const serviceChargesTotal = serviceCharges
      .filter(sc => sc.status !== 'cancelled')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);

    const serviceChargesPaid = serviceCharges
      .filter(sc => sc.status === 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);

    const pendingPaymentRecords = serviceCharges.filter(
      sc => sc.status !== 'paid' && sc.status !== 'cancelled'
    );
    const pendingPayments = pendingPaymentRecords.length;
    const pendingPaymentsAmount = pendingPaymentRecords.reduce((sum, sc) => sum + Number(sc.amount), 0);

    const utilitiesTotal = utilityAllocations.reduce((sum, ua) => sum + Number(ua.amount), 0);

    const otherIncomeTxns = releasedTransactions.filter(
      t => t.type !== 'rent' && t.type !== 'caution' && t.type !== 'sale'
    );
    const otherIncome = otherIncomeTxns.reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseTxns = allTxns.filter(t => t.type === 'subscription');
    const subscriptionExpenses = expenseTxns.reduce((sum, t) => sum + Number(t.amount), 0);

    const maintenanceExpense = 0;
    const salaryExpense = 0;
    const insuranceExpense = 0;
    const otherExpenses = subscriptionExpenses;

    const totalRevenue = occupiedUnitRent + serviceChargesTotal + otherIncome;
    const totalExpenses =
      maintenanceExpense + utilitiesTotal + salaryExpense + insuranceExpense + otherExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = monthStart.toLocaleString('en-US', { month: 'short' });

      const monthlySCs = serviceCharges.filter(
        sc => sc.createdAt >= monthStart && sc.createdAt <= monthEnd
      );
      const monthlyUtils = utilityAllocations.filter(
        ua => ua.createdAt >= monthStart && ua.createdAt <= monthEnd
      );

      const scRevenue = monthlySCs.reduce((sum, sc) => sum + Number(sc.amount), 0);
      const revenue = occupiedUnitRent + scRevenue;
      const expenses = monthlyUtils.reduce((sum, ua) => sum + Number(ua.amount), 0);

      monthlyTrend.push({
        month: monthLabel,
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(Math.max(0, revenue - expenses)),
      });
    }

    const unitCount = units.length;

    return NextResponse.json({
      noOrg: false,
      pl: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        netProfit: Math.round(netProfit),
        margin,
        revenueBreakdown: [
          { label: 'Rental Income', amount: Math.round(occupiedUnitRent) },
          { label: 'Service Charges', amount: Math.round(serviceChargesTotal) },
          { label: 'Other Income', amount: Math.round(otherIncome) },
        ],
        expenseBreakdown: [
          { label: 'Maintenance', amount: Math.round(maintenanceExpense) },
          { label: 'Utilities', amount: Math.round(utilitiesTotal) },
          { label: 'Salaries', amount: Math.round(salaryExpense) },
          { label: 'Insurance', amount: Math.round(insuranceExpense) },
          { label: 'Other Expenses', amount: Math.round(otherExpenses) },
        ],
        monthlyTrend,
        unitCount,
        occupiedUnits: occupiedUnits.length,
        pendingPayments,
        pendingPaymentsAmount: Math.round(pendingPaymentsAmount),
        hasData: unitCount > 0,
      },
    });
  } catch (error) {
    console.error('Financials API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
