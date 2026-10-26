import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentShortLetEarningsClient, { type ShortLetStay } from './AgentShortLetEarningsClient';

export const dynamic = 'force-dynamic';

const SERVICE_FEE_RATE = 0.08;

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const bookings = await prisma.booking.findMany({
    where: { listing: { agentId: user.id } },
    orderBy: { checkIn: 'desc' },
    take: 50,
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
      totalPrice: true,
      status: true,
      guest: { select: { fullName: true } },
      listing: { select: { title: true } },
    },
  });

  const stays: ShortLetStay[] = bookings.map((b) => {
    const gross = Number(b.totalPrice ?? 0);
    const serviceFee = Math.round(gross * SERVICE_FEE_RATE);
    const nights = Math.max(
      1,
      Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86_400_000)
    );
    return {
      id: b.id,
      property: b.listing?.title ?? 'Property',
      guest: b.guest?.fullName ?? 'Guest',
      dates: `${new Date(b.checkIn).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} - ${new Date(b.checkOut).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}`,
      nights,
      gross,
      serviceFee,
      net: gross - serviceFee,
      status: b.status === 'completed' ? 'Settled' : b.status,
    };
  });

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentShortLetEarningsClient stays={stays} />

      </ErrorBoundary>
</DashboardShell>
  );
}
