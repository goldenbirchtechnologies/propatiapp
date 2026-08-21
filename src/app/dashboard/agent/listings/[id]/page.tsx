import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentListingDetailClient from './AgentListingDetailClient';

export default async function AgentListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { fullName: true } },
      images: true,
      verification: { select: { overallStatus: true, currentLayer: true } },
    },
  });

  if (!listing || listing.agentId !== user.id) {
    redirect('/dashboard/agent/listings');
  }

  const initialListing = {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    status: listing.status as string,
    listingType: listing.listingType as string,
    propertyType: listing.propertyType as string | undefined,
    price: Number(listing.price),
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt.toISOString(),
    images: listing.images.map((img) => ({
      id: img.id,
      url: img.url,
      isCover: img.isCover,
    })),
    verification: listing.verification
      ? {
          overallStatus: listing.verification.overallStatus as string,
          currentLayer: listing.verification.currentLayer,
        }
      : null,
    owner: listing.owner,
  };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      <AgentListingDetailClient listing={initialListing} />
    
      </div></ErrorBoundary>
</DashboardShell>
  );
}
