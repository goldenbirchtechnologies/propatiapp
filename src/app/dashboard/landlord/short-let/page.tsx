import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ShortLetClient from './ShortLetClient';

export const metadata = {
  title: 'Short-let Requests',
  description: 'Manage short-let requests and tenant access.',
};

export default async function LandlordShortLetPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [shortlets, listings] = await Promise.all([
    prisma.tenantShortlet.findMany({
      where: { landlordId: user.id },
      include: { listing: { select: { title: true, address: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.listing.findMany({
      where: { ownerId: user.id },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  const requests = await Promise.all(
    shortlets.map(async (s): Promise<{
      id: string;
      listingId: string;
      listingTitle: string;
      tenantName: string;
      tenantEmail?: string;
      tenantPhone?: string;
      status: string;
      notes?: string;
    }> => {
      const tenant = await prisma.user.findUnique({
        where: { id: s.tenantId },
        select: { fullName: true, email: true, phone: true },
      });
      return {
        id: s.id,
        listingId: s.listingId,
        listingTitle: s.listing?.title || 'Property',
        tenantName: tenant?.fullName || 'Tenant',
        tenantEmail: tenant?.email,
        tenantPhone: tenant?.phone,
        status: s.status,
        notes: s.notes,
      };
    })
  );

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <ShortLetClient initialRequests={requests} listings={listings} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
