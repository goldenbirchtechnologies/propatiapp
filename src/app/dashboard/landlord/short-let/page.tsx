import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ShortLetClient from './ShortLetClient';

export const metadata = {
  title: 'Short-let Bookings',
  description: 'Manage guest reservations, review booking requests, and track short-stay earnings.',
};

export default async function LandlordShortLetPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [bookings, listings] = await Promise.all([
    prisma.booking.findMany({
      where: { listing: { ownerId: user.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        guest: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    }),
    prisma.listing.findMany({
      where: { ownerId: user.id },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  const normalized = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    paymentStatus: b.paymentStatus,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    totalPrice: Number(b.totalPrice || 0),
    basePrice: Number(b.basePrice || 0),
    guestName: b.guestName || b.guest?.fullName || 'Guest',
    guestPhone: b.guestPhone || b.guest?.phone,
    guestEmail: b.guestEmail || b.guest?.email,
    guestId: b.guest?.id,
    specialRequests: b.specialRequests,
    checkedInAt: b.checkedInAt,
    checkedOutAt: b.checkedOutAt,
    cancelledAt: b.cancelledAt,
    createdAt: b.createdAt,
    listingId: b.listing?.id,
    listingTitle: b.listing?.title || 'Property',
    listingAddress: b.listing?.address,
  }));

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <ShortLetClient initialBookings={normalized} listings={listings} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
