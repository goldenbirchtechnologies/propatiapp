import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import RevenueSignatureClient from './RevenueSignatureClient';

export default async function RevenueSignaturePage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'estate_manager') {
    redirect(user.role === 'landlord' ? '/dashboard/landlord'
      : user.role === 'tenant' ? '/dashboard/tenant'
      : user.role === 'agent' ? '/dashboard/agent'
      : user.role === 'admin' ? '/admin'
      : '/dashboard/tenant');
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

  const fallbackMonths: MonthSummary[] = [
    { month: 'Jan 2026', totalRevenue: 28400000, serviceCharges: 4200000, rentTransactions: 24200000, net: 0 },
    { month: 'Feb 2026', totalRevenue: 29500000, serviceCharges: 4300000, rentTransactions: 25200000, net: 0 },
    { month: 'Mar 2026', totalRevenue: 31000000, serviceCharges: 4500000, rentTransactions: 26500000, net: 0 },
    { month: 'Apr 2026', totalRevenue: 30100000, serviceCharges: 4400000, rentTransactions: 25700000, net: 0 },
    { month: 'May 2026', totalRevenue: 32500000, serviceCharges: 4700000, rentTransactions: 27800000, net: 0 },
    { month: 'Jun 2026', totalRevenue: 33800000, serviceCharges: 4900000, rentTransactions: 28900000, net: 0 },
    { month: 'Jul 2026', totalRevenue: 34000000, serviceCharges: 5000000, rentTransactions: 29000000, net: 0 },
    { month: 'Aug 2026', totalRevenue: 35200000, serviceCharges: 5100000, rentTransactions: 30100000, net: 0 },
    { month: 'Sep 2026', totalRevenue: 34500000, serviceCharges: 5000000, rentTransactions: 29500000, net: 0 },
    { month: 'Oct 2026', totalRevenue: 36100000, serviceCharges: 5200000, rentTransactions: 30900000, net: 0 },
    { month: 'Nov 2026', totalRevenue: 37000000, serviceCharges: 5400000, rentTransactions: 31600000, net: 0 },
    { month: 'Dec 2026', totalRevenue: 38800000, serviceCharges: 5600000, rentTransactions: 33200000, net: 0 },
  ].map(m => ({ ...m, net: 0 }));

  const computedTotals = summaries.reduce(
    (acc, s) => {
      acc.totalRevenue += s.totalRevenue;
      acc.totalServiceCharges += s.serviceCharges;
      acc.totalRent += s.rentTransactions;
      acc.totalNet += s.net;
      return acc;
    },
    { totalRevenue: 0, totalServiceCharges: 0, totalRent: 0, totalNet: 0 }
  );

  const data = activeOrg && totalRevenue > 0
    ? { months: summaries, ...computedTotals, avgTransactionAmount, transactionCount, pendingSettlement }
    : { months: fallbackMonths, totalRevenue: fallbackMonths.reduce((a, b) => a + b.totalRevenue, 0), totalServiceCharges: fallbackMonths.reduce((a, b) => a + b.serviceCharges, 0), totalRent: fallbackMonths.reduce((a, b) => a + b.rentTransactions, 0), totalNet: fallbackMonths.reduce((a, b) => a + b.net, 0) };

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
