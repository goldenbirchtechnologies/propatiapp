import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AgentDashboardClient from './AgentDashboardClient';

export default async function AgentDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'agent') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'User';

  const agentListingFilter = {
    OR: [
      { agentId: user.id },
      { assignments: { some: { agentId: user.id, status: 'active' } } },
    ],
  };

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);

  const [
    managedProperties,
    activeListings,
    pendingInvites,
    totalUnits,
    vacantUnits,
    enquiries,
    saleListingsCount,
    buyerApplicationsCount,
    pendingAgreementsCount,
    shortletListingsCount,
    shortletTotalUnits,
    shortletOccupiedUnits,
    shortletCheckinsToday,
    shortletCheckoutsToday,
    previewListings,
  ] = await Promise.all([
    prisma.listing.count({ where: agentListingFilter }),
    prisma.listing.count({ where: { ...agentListingFilter, status: 'active' } }),
    prisma.agentInvite.count({ where: { email: user.email, status: 'pending' } }),
    prisma.unit.count({ where: { listing: agentListingFilter } }),
    prisma.unit.count({ where: { listing: agentListingFilter, occupancy: 'VACANT' } }),
    prisma.conversation.count({ where: { agentId: user.id } }),
    prisma.listing.count({ where: { ...agentListingFilter, listingType: 'sale' } }),
    prisma.application.count({
      where: {
        listing: agentListingFilter,
        status: { in: ['pending', 'under_review', 'accepted'] },
      },
    }),
    prisma.agreement.count({
      where: {
        listing: agentListingFilter,
        status: { in: ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'] },
      },
    }),
    prisma.listing.count({ where: { ...agentListingFilter, listingType: 'short_let' } }),
    prisma.unit.count({ where: { listing: { ...agentListingFilter, listingType: 'short_let' } } }),
    prisma.unit.count({
      where: { listing: { ...agentListingFilter, listingType: 'short_let' }, occupancy: 'OCCUPIED' },
    }),
    prisma.booking.count({
      where: { listing: { ...agentListingFilter, listingType: 'short_let' }, checkIn: today },
    }),
    prisma.booking.count({
      where: { listing: { ...agentListingFilter, listingType: 'short_let' }, checkOut: today },
    }),
    prisma.listing.findMany({
      where: agentListingFilter,
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        title: true,
        address: true,
        listingType: true,
        price: true,
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
        units: {
          select: {
            id: true,
            unitNumber: true,
            occupancy: true,
            currentTenant: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  const saleListingsValue = previewListings
    .filter((l) => l.listingType === 'sale')
    .reduce((sum, l) => sum + Number(l.price || 0), 0);

  const shortletBookings = await prisma.booking.findMany({
    where: {
      listing: { ...agentListingFilter, listingType: 'short_let' },
      checkIn: { gte: monthStart },
      status: { not: 'cancelled' },
    },
    select: { totalPrice: true, basePrice: true },
  });

  const shortletRevenue = shortletBookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const shortletAvgDailyRate =
    shortletBookings.length > 0
      ? shortletBookings.reduce((sum, b) => sum + Number(b.basePrice || 0), 0) / shortletBookings.length
      : 0;

  const shortletOccupancyRate =
    shortletTotalUnits > 0 ? Math.round((shortletOccupiedUnits / shortletTotalUnits) * 100) : 0;

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <AgentDashboardClient
        userName={displayName}
        managedProperties={managedProperties}
        activeListings={activeListings}
        pendingInvites={pendingInvites}
        totalUnits={totalUnits}
        vacantUnits={vacantUnits}
        enquiries={enquiries}
        saleListingsCount={saleListingsCount}
        saleListingsValue={saleListingsValue}
        buyerApplicationsCount={buyerApplicationsCount}
        pendingAgreementsCount={pendingAgreementsCount}
        shortletListingsCount={shortletListingsCount}
        shortletTotalUnits={shortletTotalUnits}
        shortletOccupiedUnits={shortletOccupiedUnits}
        shortletOccupancyRate={shortletOccupancyRate}
        shortletCheckinsToday={shortletCheckinsToday}
        shortletCheckoutsToday={shortletCheckoutsToday}
        shortletRevenue={shortletRevenue}
        shortletAvgDailyRate={shortletAvgDailyRate}
        previewListings={previewListings.map((l) => ({
          id: l.id,
          title: l.title,
          address: l.address,
          listingType: l.listingType,
          price: toNumber(l.price),
          coverImage: l.images?.[0]?.url || null,
          unitCount: l.units.length,
          vacantCount: l.units.filter((u) => u.occupancy === 'VACANT').length,
          occupiedCount: l.units.filter((u) => u.occupancy === 'OCCUPIED').length,
          units: l.units.map((u) => ({
            id: u.id,
            unitNumber: u.unitNumber,
            occupancy: u.occupancy,
            currentTenant: u.currentTenant?.fullName || null,
          })),
        }))}
      />

      </ErrorBoundary>
</DashboardShell>
  );
}
