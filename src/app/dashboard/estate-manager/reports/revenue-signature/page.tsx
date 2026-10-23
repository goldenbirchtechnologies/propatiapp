import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import RevenueSignatureClient from './RevenueSignatureClient';

export default async function RevenueSignaturePage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'estate_manager') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Estate Manager';
  const activeOrg = user.ownedOrganisations[0] || user.orgMemberships[0]?.org;

  interface MonthSummary {
    month: string;
    totalRevenue: number;
    serviceCharges: number;
    rentTransactions: number;
    net: number;
  }

  const months: MonthSummary[] = [];
  let totalRevenue = 0;
  let totalServiceCharges = 0;
  let totalRent = 0;
  let totalNet = 0;
  let avgTransactionAmount = 0;
  let transactionCount = 0;
  let pendingSettlement = 0;

  const now = new Date();
  const currentYear = now.getFullYear();
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const summaries: MonthSummary[] = monthLabels.map((label, idx) => ({
    month: `${label} ${currentYear}`,
    totalRevenue: 0,
    serviceCharges: 0,
    rentTransactions: 0,
    net: 0,
  }));

  if (activeOrg) {
    const listingIds = (
      await prisma.orgListing.findMany({
        where: { orgId: activeOrg.id },
        select: { listingId: true },
      })
    ).map(l => l.listingId);

    const [serviceCharges, transactions, rentScheduleItems] = await Promise.all([
      prisma.serviceCharge.findMany({
        where: { organizationId: activeOrg.id },
        select: { amount: true, status: true, paidAt: true, createdAt: true },
      }),
      listingIds.length > 0
        ? prisma.transaction.findMany({
            where: {
              listingId: { in: listingIds },
              type: { in: ['rent', 'subscription'] },
            },
            select: { amount: true, type: true, status: true, createdAt: true },
          })
        : [],
      listingIds.length > 0
        ? prisma.rentSchedule.findMany({
            where: { listingId: { in: listingIds }, status: { in: ['pending', 'active'] } },
            select: { amount: true, dueAt: true, status: true },
          })
        : [],
    ]);

    for (const sc of serviceCharges) {
      const paidDate = sc.paidAt || sc.createdAt;
      const monthIdx = (paidDate instanceof Date ? paidDate : new Date(paidDate)).getMonth();
      const amount = Number(sc.amount);
      summaries[monthIdx].serviceCharges += amount;
      summaries[monthIdx].totalRevenue += amount;
    }

    for (const tx of transactions) {
      const dt = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const monthIdx = dt.getMonth();
      const amount = Number(tx.amount);
      summaries[monthIdx].rentTransactions += amount;
      summaries[monthIdx].totalRevenue += amount;
      totalRent += amount;
      transactionCount += 1;
      avgTransactionAmount = transactionCount ? totalRent / transactionCount : 0;
      if (tx.status === 'pending') {
        pendingSettlement += amount;
      }
    }

    for (const rs of rentScheduleItems) {
      const monthIdx = (rs.dueAt instanceof Date ? rs.dueAt : new Date(rs.dueAt)).getMonth();
      const amount = Number(rs.amount || 0);
      if (!summaries[monthIdx].rentTransactions && amount) {
        summaries[monthIdx].rentTransactions += amount;
        summaries[monthIdx].totalRevenue += amount;
        totalRent += amount;
      }
    }

    for (const s of summaries) {
      s.net = s.totalRevenue - s.serviceCharges;
      totalRevenue += s.totalRevenue;
      totalServiceCharges += s.serviceCharges;
      totalNet += s.net;
    }
  }

  const hasRealData = !!activeOrg && totalRevenue > 0;
  const data = hasRealData
    ? { months: summaries, totalRevenue, totalServiceCharges, totalRent, totalNet, avgTransactionAmount, transactionCount, pendingSettlement }
    : { months: summaries, totalRevenue, totalServiceCharges, totalRent, totalNet, avgTransactionAmount, transactionCount, pendingSettlement };

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <RevenueSignatureClient
        {...data}
        hasRealData={!!activeOrg && totalRevenue > 0}
        orgName={activeOrg?.name}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}