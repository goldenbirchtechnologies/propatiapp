import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { userManagesListing } from '@/lib/org-scope';
import EstateManagerApplicationDetailClient from './EstateManagerApplicationDetailClient';

export default async function EstateManagerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || (user.role !== 'estate_manager' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const { id } = await params;

  let application: any = null;
  let dbError = false;

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
    console.error('Error loading estate-manager application:', error);
    dbError = true;
  }

  let manages = false;
  if (!dbError && application) {
    manages =
      user.role === 'admin' ||
      application.landlordId === user.id ||
      (await userManagesListing(user.id, application.listingId));
  }

  // redirect() must be called outside any try/catch block — it signals by
  // throwing NEXT_REDIRECT; a catch swallows it and produces an opaque
  // Server Components render error in production (see AGENTS.md).
  if (dbError || !application || !manages) {
    redirect('/dashboard/estate-manager/applications');
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
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <EstateManagerApplicationDetailClient application={serialized as any} />
    </DashboardShell>
  );
}
