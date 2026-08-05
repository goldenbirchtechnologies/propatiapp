import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TurnoverClient from './TurnoverClient';

export const metadata = {
  title: 'Turnover Tasks – Landlord',
  description: 'Track cleaning and maintenance handover tasks.',
};

export default async function LandlordTurnoverPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const tasks = await prisma.turnoverTask.findMany({
    where: {
      listing: { ownerId: user.id },
    },
    include: {
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <TurnoverClient initialTasks={tasks} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
