import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { parseKoboToNaira } from '@/lib/utils';
import ScenarioBuilderClient from './ScenarioBuilderClient';

export const metadata = {
  title: 'Scenario Builder – Landlord',
  description: 'Model what-if scenarios for your portfolio.',
};

export default async function LandlordRevenueScenarioBuilderPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  const totalRevenueKobo = await prisma.transaction.aggregate({
    where: {
      payeeId: user.id,
      status: { in: ['released', 'success'] },
      createdAt: { gte: yearStart, lte: yearEnd },
    },
    _sum: { amount: true },
  });

  const baseRevenue = parseKoboToNaira(Number(totalRevenueKobo._sum?.amount ?? 0));

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <ScenarioBuilderClient baseRevenue={baseRevenue} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
