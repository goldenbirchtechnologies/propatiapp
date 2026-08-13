import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import LandlordDashboardClient from './LandlordDashboardClient';

export const metadata = {
  title: 'Dashboard',
  description: 'Overview of your properties, applications, and revenue.',
};

export default async function LandlordDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'landlord') {
    redirect('/dashboard/tenant');
  }

  const displayName = user.fullName || 'Landlord';

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let listingCount = 0;
  let activeListingCount = 0;
  let pendingApplicationCount = 0;
  let openMaintenanceCount = 0;
  let totalRevenue = 0;
  let recentListings: any[] = [];

  try {
    const [
      lCount,
      aLCount,
      pAppCount,
      oMCount,
      revenueAgg,
      rListings,
    ] = await Promise.all([
      prisma.listing.count({ where: { ownerId: user.id } }),
      prisma.listing.count({ where: { ownerId: user.id, status: 'active' } }),
      prisma.application.count({ where: { landlordId: user.id, status: 'pending' } }),
      prisma.maintenanceTicket.count({
        where: {
          listing: { ownerId: user.id },
          status: { in: ['open', 'assigned', 'in_progress'] },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          payeeId: user.id,
          status: 'released',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.listing.findMany({
        where: { ownerId: user.id },
        take: 12,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, listingType: true, status: true, price: true, createdAt: true },
      }),
    ]);

    listingCount = lCount;
    activeListingCount = aLCount;
    pendingApplicationCount = pAppCount;
    openMaintenanceCount = oMCount;
    totalRevenue = Number(revenueAgg._sum.amount ?? 0);
    recentListings = rListings;
  } catch (error) {
    console.error('Error loading Landlord dashboard data:', error);
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <LandlordDashboardClient
          displayName={displayName}
          totalRevenue={totalRevenue}
          listingCount={listingCount}
          activeListingCount={activeListingCount}
          pendingApplicationCount={pendingApplicationCount}
          openMaintenanceCount={openMaintenanceCount}
          recentListings={recentListings}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
