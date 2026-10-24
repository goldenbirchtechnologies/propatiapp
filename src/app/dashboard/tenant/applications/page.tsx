import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantApplicationsClient from './TenantApplicationsClient';

export default async function TenantApplicationsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  let applications: any[] = [];

  try {
    const rows = await prisma.application.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: 'desc' },
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
            listingType: true,
            images: { where: { isCover: true }, take: 1, select: { url: true, isCover: true } },
          },
        },
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    applications = rows.map((app) => ({
      id: app.id,
      status: app.status,
      stage: (app as any).stage ?? 'submitted',
      screeningStatus: (app as any).screeningStatus ?? {},
      guarantorData: (app as any).guarantorData ?? {},
      applicantDocuments: (app as any).applicantDocuments ?? [],
      message: app.message,
      landlordNotes: app.landlordNotes,
      rejectionReason: (app as any).rejectionReason ?? null,
      requestedInfoAt: (app as any).requestedInfoAt?.toISOString() ?? null,
      reviewedAt: app.reviewedAt?.toISOString() ?? null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      listing: {
        id: app.listing.id,
        title: app.listing.title,
        address: app.listing.address,
        area: app.listing.area,
        state: app.listing.state,
        price: app.listing.price.toString(),
        pricePeriod: app.listing.pricePeriod,
        listingType: app.listing.listingType,
        images: app.listing.images.map((img) => ({ url: img.url, isCover: img.isCover })),
      },
      landlord: {
        id: app.landlord.id,
        fullName: app.landlord.fullName,
        email: app.landlord.email,
        avatarUrl: app.landlord.avatarUrl,
      },
    }));
  } catch (error) {
    console.error('Error loading tenant applications:', error);
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantApplicationsClient applications={applications} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
