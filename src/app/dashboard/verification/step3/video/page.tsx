import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  TENANT_NAVIGATION,
  AGENT_NAVIGATION,
  LANDLORD_NAVIGATION,
  ADMIN_NAVIGATION,
  ESTATE_MANAGER_NAVIGATION,
  ACCOUNTANT_NAVIGATION,
} from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import VerificationStep3VideoClient from './VerificationStep3VideoClient';
import { PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function VerificationStep3VideoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const sp = await searchParams;
  const listingId = sp.listingId as string | undefined;

  if (!listingId) {
    redirect('/dashboard/landlord/verify');
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, address: true, ownerId: true, verificationTier: true },
  });

  if (!listing) {
    redirect('/dashboard/landlord/verify');
  }

  if (listing.ownerId !== user.id && user.role !== 'admin') {
    redirect('/dashboard/landlord/verify');
  }

  const verification = await prisma.verification.findUnique({
    where: { listingId },
    select: {
      id: true,
      l3VideoUrl: true,
      l3QrCode: true,
      l3Status: true,
      currentLayer: true,
      overallStatus: true,
      l2Status: true,
    },
  });

  const navigation =
    user.role.toLowerCase() === 'landlord'
      ? LANDLORD_NAVIGATION
      : user.role.toLowerCase() === 'agent'
        ? AGENT_NAVIGATION
        : user.role.toLowerCase() === 'admin'
          ? ADMIN_NAVIGATION
          : user.role.toLowerCase() === 'estate_manager'
            ? ESTATE_MANAGER_NAVIGATION
            : user.role.toLowerCase() === 'accountant'
              ? ACCOUNTANT_NAVIGATION
              : TENANT_NAVIGATION;

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName || 'User'}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          <PageHeader
            title="Step 3: Video"
            description={`Video walkthrough for ${listing.title}`}
            breadcrumb={['Verification', 'Step 3']}
          />
          <VerificationStep3VideoClient
            listingId={listingId}
            verificationId={verification?.id || null}
            l3Status={verification?.l3Status || null}
            currentLayer={verification?.currentLayer || 1}
            overallStatus={verification?.overallStatus || null}
            l2Status={verification?.l2Status || null}
          />
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
