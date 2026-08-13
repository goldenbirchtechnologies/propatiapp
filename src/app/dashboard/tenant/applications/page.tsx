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

  let applications: Awaited<ReturnType<typeof prisma.application.findMany>> = [];

  try {
    applications = await prisma.application.findMany({
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
            images: { where: { isCover: true }, take: 1, select: { url: true } },
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
  } catch (error) {
    console.error('Error loading tenant applications:', error);
  }

  const serialized = applications.map((app) => ({
    ...app,
    listing: {
      ...app.listing,
      price: app.listing.price.toString(),
    },
  }));

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantApplicationsClient applications={serialized} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
