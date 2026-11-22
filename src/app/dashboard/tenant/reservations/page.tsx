import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantReservationsClient, { type TenantReservation } from './TenantReservationsClient';

export const metadata = {
  title: 'Shortlet reservations',
  description: 'View and manage your shortlet reservation requests.',
};

export default async function TenantReservationsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'tenant') redirect(getRoleRedirectPath(user.role));

  const bookings = await prisma.booking.findMany({
    where: { guestId: user.id },
    orderBy: [{ checkIn: 'asc' }, { createdAt: 'desc' }],
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const reservations: TenantReservation[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    adults: booking.adults,
    children: booking.children,
    totalPrice: Number(booking.totalPrice),
    basePrice: Number(booking.basePrice),
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt.toISOString(),
    listing: {
      id: booking.listing.id,
      title: booking.listing.title,
      address: booking.listing.address,
      image: booking.listing.images[0]?.url || null,
    },
  }));

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole="tenant" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantReservationsClient initialReservations={reservations} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
