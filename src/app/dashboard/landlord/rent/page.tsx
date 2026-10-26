import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordRentClient from './LandlordRentClient';

export default async function LandlordRentPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const schedules = await prisma.rentSchedule.findMany({
    where: {
      agreement: { landlordId: user.id },
      status: { in: ['upcoming', 'overdue'] },
    },
    orderBy: { dueDate: 'asc' },
    take: 25,
    select: {
      id: true,
      dueDate: true,
      amount: true,
      status: true,
      agreement: {
        select: {
          tenant: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      },
    },
  });

  const upcomingRent = schedules.map((s) => ({
    id: s.id,
    property: s.agreement.listing.title,
    tenant: s.agreement.tenant.fullName,
    amount: Number(s.amount),
    dueDate: s.dueDate,
    status: s.status,
  }));

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <LandlordRentClient userId={user.id} upcomingRent={upcomingRent} />

      </ErrorBoundary>
</DashboardShell>
  );
}
