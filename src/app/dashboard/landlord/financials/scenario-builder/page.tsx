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

export default async function LandlordScenarioBuilderPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  const totalRevenueKobo = await prisma.transaction.aggregate({
    where: {
      payeeId: user.id,
      status: 'released',
      createdAt: { gte: yearStart, lte: yearEnd },
    },
    _sum: { amount: true },
  });

  const baseRevenue = parseKoboToNaira(Number(totalRevenueKobo._sum?.amount ?? 0));

  // Seed the model from the landlord's own rent roll so the baseline is their
  // portfolio, not a hardcoded eighteen units at ₦1.25m.
  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    select: { price: true, pricePeriod: true },
  });

  // Rent is annualised per unit; anything priced per night is left out rather
  // than guessed into a monthly figure.
  const annualRents = listings
    .filter((l) => !l.pricePeriod || l.pricePeriod === 'year' || l.pricePeriod === 'month')
    .map((l) => {
      const amount = Number(l.price);
      return l.pricePeriod === 'month' ? amount * 12 : amount;
    });

  const portfolios = {
    units: listings.length,
    avgMonthlyRent: annualRents.length
      ? Math.round(annualRents.reduce((s, r) => s + r, 0) / annualRents.length / 12)
      : 0,
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <ScenarioBuilderClient baseRevenue={baseRevenue} portfolios={portfolios} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
