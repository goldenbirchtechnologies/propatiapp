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
import VerificationChecklistClient from './VerificationChecklistClient';

export const dynamic = 'force-dynamic';

export default async function VerificationChecklistPage({
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
    select: {
      id: true,
      currentLayer: true,
      overallStatus: true,
      l1Status: true,
      l2Status: true,
      l3Status: true,
      l4Status: true,
      l5Status: true,
      adminNotes: true,
      reviewedAt: true,
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
            Verification Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Overall progress for {listing.title}
          </p>
        </div>
        <VerificationChecklistClient
          listingId={listingId}
          verificationId={verification?.id || null}
          title={listing.title}
          currentLayer={verification?.currentLayer || 1}
          overallStatus={verification?.overallStatus || 'not_started'}
          layers={[
            { key: 'l1Status', label: 'Layer 1: Documents', status: verification?.l1Status || 'pending', desc: 'Upload title deed, survey plan, and tax receipts' },
            { key: 'l2Status', label: 'Layer 2: Identity', status: verification?.l2Status || 'pending', desc: 'Verify NIN/BVN against document owner' },
            { key: 'l3Status', label: 'Layer 3: Video', status: verification?.l3Status || 'pending', desc: 'Record property walkthrough with QR code' },
            { key: 'l4Status', label: 'Layer 4: Inspection', status: verification?.l4Status || 'pending', desc: 'Schedule and complete physical inspection' },
            { key: 'l5Status', label: 'Layer 5: Certification', status: verification?.l5Status || 'pending', desc: 'Final admin review and certification' },
          ]}
          adminNotes={verification?.adminNotes || null}
          reviewedAt={verification?.reviewedAt || null}
        />
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
