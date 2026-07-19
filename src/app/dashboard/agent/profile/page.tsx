import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentProfileClient from './AgentProfileClient';

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  // Fetch the user with all needed fields from Prisma
  const profile = await prisma.user.findUnique({
    where: { clerkId: user.clerkId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      fullName: true,
      avatarUrl: true,
      createdAt: true,
      agentTier: true,
      agentApproved: true,
      profileBio: true,
      ninVerified: true,
      phoneVerified: true,
      idVerified: true,
    },
  });

  if (!profile) redirect('/login');

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentProfileClient user={profile} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
