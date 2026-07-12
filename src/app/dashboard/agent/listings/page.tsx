import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentListingsClient from './AgentListingsClient';

export default async function AgentListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const agentId = user.id;

  const listings = await prisma.listing.findMany({
    where: { agentId },
    include: { owner: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialListings = listings.map((listing) => ({ id: listing.id, title: listing.title, landlord: listing.owner.fullName, listingType: listing.listingType,
    propertyType: listing.propertyType ?? null,
    status: listing.status,
    views: listing.viewsCount,
    verified: listing.verificationTier !== 'basic',
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgentListingsClient initialListings={initialListings as any} />
    </DashboardShell>
  );
}
