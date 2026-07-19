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
import VerificationStep1DocumentsClient from './VerificationStep1DocumentsClient';

export const dynamic = 'force-dynamic';

export default async function VerificationStep1DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
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
    include: {
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: 'desc' },
      },
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

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Verification Step 1
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload required documents for {listing.title}
          </p>
        </div>
        <VerificationStep1DocumentsClient
          listingId={listingId}
          verificationId={verification?.id || null}
          documents={verification?.documents || []}
          currentStatus={verification?.l1Status || null}
          overallStatus={verification?.overallStatus || null}
        />
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
