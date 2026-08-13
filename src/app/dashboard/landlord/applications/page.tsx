import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordApplicationsClient from './LandlordApplicationsClient';

export const dynamic = 'force-dynamic';

type ApplicationStage = 'submitted' | 'screening' | 'guarantor_pending' | 'approved' | 'rejected';

export const metadata = {
  title: 'Applications',
  description: 'Review, screen, and manage tenancy applications.',
};

export default async function LandlordApplicationsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  let applications;
  try {
    applications = await prisma.application.findMany({
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
  } catch (error) {
    console.error('LandlordApplicationsPage server data load error:', error);
    return (
      <DashboardShell
        navigation={LANDLORD_NAVIGATION}
        userRole={user?.role}
        userName={user?.fullName}
        userAvatar={user?.avatarUrl || undefined}
      >
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-destructive font-medium mb-1">Unable to load applications</p>
          <p className="text-sm text-muted-foreground">Something went wrong while fetching your applications. Please try again later.</p>
        </div>
      </DashboardShell>
    );
  }

  const serialized = applications
    .filter((app) => app && app.listing && app.tenant)
    .map((app) => ({
      id: app.id,
      status: app.status,
      stage: (app.stage as ApplicationStage | null | undefined) ?? undefined,
      message: app.message ?? null,
      landlordNotes: app.landlordNotes ?? null,
      rejectionReason: app.rejectionReason ?? null,
      requestedInfoAt: app.requestedInfoAt ? app.requestedInfoAt.toISOString() : null,
      createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
      listing: {
        id: app.listing?.id || '',
        title: app.listing?.title || 'Untitled Listing',
        area: app.listing?.area || '',
        state: app.listing?.state || '',
        price: app.listing?.price ? app.listing.price.toString() : '0',
        pricePeriod: app.listing?.pricePeriod || null,
        images: app.listing?.images || [],
      },
      tenant: {
        id: app.tenant?.id || '',
        fullName: app.tenant?.fullName || 'Tenant',
        email: app.tenant?.email || '',
        phone: app.tenant?.phone || null,
        avatarUrl: app.tenant?.avatarUrl || null,
        employmentStatus: app.tenant?.employmentStatus || null,
        employerName: app.tenant?.employerName || null,
        jobTitle: app.tenant?.jobTitle || null,
        yearlyIncome: app.tenant?.yearlyIncome ? app.tenant.yearlyIncome.toString() : null,
        profileBio: app.tenant?.profileBio || null,
        idVerified: Boolean(app.tenant?.idVerified),
        ninVerified: Boolean(app.tenant?.ninVerified),
      },
      screeningStatus: (app as any).screeningStatus || {},
      guarantorData: (app as any).guarantorData || {},
      applicantDocuments: Array.isArray((app as any).applicantDocuments) ? (app as any).applicantDocuments : [],
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
