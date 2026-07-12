import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantScreeningClient from './TenantScreeningClient';

export default async function TenantScreeningPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const screenings = await prisma.screeningCall.findMany({
    where: { tenantId: user.id },
    include: {
      listing: { select: { id: true, title: true, address: true } },
      landlord: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialScreenings = screenings.map((s) => ({
    id: s.id,
    landlord: s.landlord.fullName,
    property: s.listing.title,
    date: s.scheduledAt.toISOString(),
    status: s.status,
    notes: s.notes || '—',
  }));

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TenantScreeningClient initialScreenings={initialScreenings} />
    </DashboardShell>
  );
}
