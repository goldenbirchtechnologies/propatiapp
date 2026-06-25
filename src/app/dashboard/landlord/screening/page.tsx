import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordScreeningClient from './LandlordScreeningClient';

export default async function LandlordScreeningPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const screenings = await prisma.screeningCall.findMany({
    where: { landlordId: user.id },
    include: {
      listing: { select: { id: true, title: true, address: true } },
      tenant: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialScreenings = screenings.map((s) => ({
    id: s.id,
    tenant: s.tenant.fullName,
    property: s.listing.title,
    date: s.scheduledAt.toISOString(),
    status: s.status,
    notes: s.notes || '—',
  }));

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <LandlordScreeningClient initialScreenings={initialScreenings} />
    </DashboardShell>
  );
}
