import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantSavedPropertiesClient, {
  SavedProperty,
} from './TenantSavedPropertiesClient';

export default async function TenantSavedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUser();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  // Load real saved listings from Prisma
  const rawSaved = await prisma.savedListing.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          images: { take: 1, orderBy: { isCover: 'desc' } },
          owner: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const initialSavedProperties: SavedProperty[] = rawSaved.map((sl: {
    id: string;
    listingId: string;
    createdAt: Date;
    listing: {
      id: string;
      title: string;
      address: string;
      area: string;
      state: string;
      price: unknown;
      pricePeriod: string | null;
      bedrooms: number | null;
      bathrooms: number | null;
      sizeSqm: unknown;
      listingType: string;
      propertyType: string | null;
      status: string;
      verificationTier: string;
      images: { url: string }[];
      owner: { fullName: string; avatarUrl: string | null };
    };
  }) => ({
    id: sl.id,
    listingId: sl.listingId,
    savedAt: sl.createdAt,
    notes: undefined,
    listing: {
      id: sl.listing.id,
      title: sl.listing.title,
      address: sl.listing.address,
      area: sl.listing.area,
      state: sl.listing.state,
      price: typeof sl.listing.price === 'number'
        ? sl.listing.price
        : typeof sl.listing.price === 'bigint'
          ? Number(sl.listing.price)
          : typeof sl.listing.price === 'object' && sl.listing.price !== null && 'toNumber' in (sl.listing.price as Record<string, unknown>)
            ? (sl.listing.price as { toNumber: () => number }).toNumber()
            : Number(sl.listing.price ?? 0),
      pricePeriod: sl.listing.pricePeriod || '',
      bedrooms: sl.listing.bedrooms || 0,
      bathrooms: sl.listing.bathrooms || 0,
      sqm: typeof sl.listing.sizeSqm === 'number'
        ? sl.listing.sizeSqm
        : typeof sl.listing.sizeSqm === 'bigint'
          ? Number(sl.listing.sizeSqm)
          : typeof sl.listing.sizeSqm === 'object' && sl.listing.sizeSqm !== null && 'toNumber' in (sl.listing.sizeSqm as Record<string, unknown>)
            ? (sl.listing.sizeSqm as { toNumber: () => number }).toNumber()
            : 0,
      listingType: sl.listing.listingType as SavedProperty['listing']['listingType'],
      propertyType: sl.listing.propertyType || '',
      status: sl.listing.status as SavedProperty['listing']['status'],
      images: sl.listing.images.map(img => img.url),
      verified: sl.listing.verificationTier !== 'basic',
      owner: {
        fullName: sl.listing.owner.fullName,
        avatarUrl: sl.listing.owner.avatarUrl || undefined,
      },
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
        <TenantSavedPropertiesClient initialSavedProperties={initialSavedProperties} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
