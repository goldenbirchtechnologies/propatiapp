import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordApplicationDetailClient from './LandlordApplicationDetailClient';

export default async function LandlordApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          state: true,
          price: true,
          pricePeriod: true,
          propertyType: true,
          listingType: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
          amenities: true,
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
          createdAt: true,
        },
      },
    },
  });

  if (!application || application.landlordId !== user.id) {
    redirect('/dashboard/landlord/applications');
  }

  const serialized = {
    ...application,
    price: application.listing.price.toString(),
    yearlyIncome: application.tenant.yearlyIncome
      ? application.tenant.yearlyIncome.toString()
      : null,
    createdAt: application.createdAt.toISOString(),
    listing: {
      ...application.listing,
      price: application.listing.price.toString(),
    },
    tenant: {
      ...application.tenant,
      yearlyIncome: application.tenant.yearlyIncome
        ? application.tenant.yearlyIncome.toString()
        : null,
      createdAt: application.tenant.createdAt.toISOString(),
    },
    agreement: null,
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <LandlordApplicationDetailClient application={serialized as any} />
    </DashboardShell>
  );
}
