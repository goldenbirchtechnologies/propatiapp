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
  console.log('LandlordApplicationsPage: rendering');
  const user = await getCurrentUserWithProfile();
  console.log('LandlordApplicationsPage: user', user ? { id: user.id, role: user.role } : null);

  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  let applications;
  try {
    console.log('LandlordApplicationsPage: fetching applications for user', user.id, 'role', user.role);
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <DashboardShell
        navigation={LANDLORD_NAVIGATION}
        userRole={user?.role}
        userName={user?.fullName}
        userAvatar={user?.avatarUrl || undefined}
      >
        <div className="rounded-lg border border-red-500/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-red-500 font-medium mb-1">Unable to load applications</p>
          <p className="text-sm text-zinc-500">Something went wrong while fetching your applications. Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 text-left text-xs text-red-500 bg-red-500/10 p-3 rounded overflow-auto">
              {message}
            </pre>
          )}
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
      screeningStatus: (() => { const v = (app as any).screeningStatus; if (!v) return {}; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return {}; } } return v; })(),
      guarantorData: (() => { const v = (app as any).guarantorData; if (!v) return {}; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return {}; } } return v; })(),
      applicantDocuments: (() => { const v = (app as any).applicantDocuments; if (Array.isArray(v)) return v; if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } } return []; })(),
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
