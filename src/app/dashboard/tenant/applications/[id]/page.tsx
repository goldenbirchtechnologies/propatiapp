import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantApplicationDetailClient from './TenantApplicationDetailClient';

export default async function TenantApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          images: true,
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

  if (!application || application.tenantId !== user.id) {
    redirect('/dashboard/tenant/applications');
  }

  const serialized = {
    id: application.id,
    status: application.status,
    message: application.message,
    landlordNotes: application.landlordNotes,
    reviewedAt: application.reviewedAt?.toISOString() ?? null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    listing: {
      id: application.listing.id,
      title: application.listing.title,
      address: application.listing.address,
      area: application.listing.area,
      state: application.listing.state,
      price: Number(application.listing.price),
      pricePeriod: application.listing.pricePeriod,
      listingType: application.listing.listingType,
      description: application.listing.description || '',
      images: application.listing.images.map((img) => ({
        id: img.id,
        url: img.url,
        isCover: img.isCover,
      })),
    },
    landlord: {
      id: application.landlord.id,
      fullName: application.landlord.fullName,
      email: application.landlord.email,
      avatarUrl: application.landlord.avatarUrl,
    },
  };

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <TenantApplicationDetailClient application={serialized} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
