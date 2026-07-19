import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordApplicationsClient from './LandlordApplicationsClient';

export default async function LandlordApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const applications = await prisma.application.findMany({
    where: { landlordId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          area: true,
          state: true,
          price: true,
          pricePeriod: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
        },
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          employmentStatus: true,
          employerName: true,
          jobTitle: true,
          yearlyIncome: true,
          profileBio: true,
          idVerified: true,
          ninVerified: true,
        },
      },
    },
  });

  const serialized = applications.map((app) => ({
    ...app,
    listing: {
      ...app.listing,
      price: app.listing.price.toString(),
    },
    tenant: {
      ...app.tenant,
      yearlyIncome: app.tenant.yearlyIncome ? app.tenant.yearlyIncome.toString() : null,
    },
  }));

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <LandlordApplicationsClient applications={serialized} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
