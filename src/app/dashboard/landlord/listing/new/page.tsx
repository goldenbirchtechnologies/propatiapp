import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ShieldAlert } from 'lucide-react';
import AddListingClient from './AddListingClient';

export const metadata = {
  title: 'List to Marketplace – Landlord',
  description: 'Create a marketplace listing from your vacant units.',
};

export default async function LandlordAddListingPage() {
  // Auth check outside try/catch — redirect() throws NEXT_REDIRECT which must
  // not be swallowed by a catch block (see AGENTS.md critical rules).
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // POST /api/listings gates only publishing (status: 'active') on a completed
  // dossier; a draft is accepted at any point. The marketplace form stays open
  // and the banner above it says what publishing is waiting on.
  const snapshot = await getOnboardingSnapshot(user.id);
  const onboardingBlocked = Boolean(
    snapshot?.required && snapshot.status !== 'completed'
  );

  let listings: any[] = [];
  let vacantUnits: any[] = [];

  try {
    listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        address: true,
        area: true,
        state: true,
        listingType: true,
        propertyType: true,
        units: {
          where: { occupancy: 'VACANT' },
          select: {
            id: true,
            unitNumber: true,
            buildingName: true,
            type: true,
            bedrooms: true,
            bathrooms: true,
            sizeSqm: true,
            rent: true,
            cautionDeposit: true,
            serviceCharge: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    vacantUnits = listings.flatMap((listing) =>
      listing.units.map((unit) => ({
        id: unit.id,
        listingId: listing.id,
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName,
        type: unit.type,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sizeSqm: unit.sizeSqm ? unit.sizeSqm.toString() : null,
        rent: unit.rent.toString(),
        cautionDeposit: unit.cautionDeposit?.toString() ?? null,
        serviceCharge: unit.serviceCharge?.toString() ?? null,
        listingTitle: listing.title,
        listingType: listing.listingType,
        propertyType: listing.propertyType,
        address: listing.address,
        area: listing.area,
        state: listing.state,
      }))
    );
  } catch (error) {
    console.error('LandlordAddListingPage server render failed', error);
    // Fall through with empty arrays — the client component handles the empty state
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        {onboardingBlocked ? (
          <div className="px-6 pt-6">
            <div className="mx-auto max-w-7xl rounded-xl border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-500/10">
              <div className="mb-1 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Saved as a draft</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Finish your onboarding dossier to publish this listing to the
                marketplace. Until then it is saved as a draft only you can see.
              </p>
              <Link
                href="/dashboard/landlord?onboarding=1"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
              >
                Resume onboarding
              </Link>
            </div>
          </div>
        ) : null}
        <AddListingClient
          listings={listings}
          vacantUnits={vacantUnits}
          publishBlocked={onboardingBlocked}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
