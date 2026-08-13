import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LandlordApplicationDetailClient from './LandlordApplicationDetailClient';

export default async function LandlordApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const { id } = await params;

  let application: any = null;

  try {
    application = await prisma.application.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            area: true,
            state: true,
            price: true,
            pricePeriod: true,
            propertyType: true,
            listingType: true,
            images: { where: { isCover: true }, take: 5, select: { url: true } },
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
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    });
  } catch (error) {
    console.error('Error loading landlord application:', error);
    redirect('/dashboard/landlord/applications');
  }

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
    screeningStatus: (application as any).screeningStatus || {},
    guarantorData: (application as any).guarantorData || {},
    applicantDocuments: (application as any).applicantDocuments || [],
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