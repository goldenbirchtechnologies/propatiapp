import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentProfileClient from './AgentProfileClient';

export default async function Page() {
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
      agentBio: true,
      agentAreas: true,
      ninVerified: true,
      bvnEncrypted: true,
      phoneVerified: true,
      idVerified: true,
      profileCompleted: true,
      businessProfiles: {
        select: {
          id: true,
          companyName: true,
          cacNumber: true,
          rcNumber: true,
          verified: true,
        },
        take: 1,
      },
      licenses: {
        where: { status: 'approved' },
        select: {
          id: true,
          board: true,
          licenseType: true,
          registrationNo: true,
          issuingBody: true,
          validUntil: true,
          reviewedAt: true,
        },
        orderBy: { reviewedAt: 'desc' },
        take: 1,
      },
      managedListings: {
        select: { id: true },
      },
      agentAgreements: {
        where: { status: { in: ['fully_signed', 'tenant_signed', 'landlord_signed'] } },
        select: { id: true },
      },
    },
  });

  if (!profile) redirect('/sign-in');

  // BVN is stored encrypted; derive the boolean flag the profile UI renders.
  const profileWithBvn = { ...profile, bvnVerified: Boolean(profile.bvnEncrypted) };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentProfileClient user={profileWithBvn} />

      </ErrorBoundary>
    </DashboardShell>
  );
}
