import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PortfolioDashboardClient from './PortfolioDashboardClient';

export const metadata = {
  title: 'Portfolio Command Centre – Landlord',
  description: 'Monitor registered assets, inventory, occupancy, listings, and portfolio actions.',
};

export default async function LandlordPortfolioPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [registeredProperties, legacyListings] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: user.id },
      select: {
        id: true, name: true, category: true, subtype: true, city: true, state: true,
        onboardingStatus: true, updatedAt: true,
        spaces: { select: { id: true, operationalStatus: true, listings: { select: { id: true, status: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.listing.findMany({
      where: { ownerId: user.id, unitId: null, propertyId: null },
      select: {
        id: true, title: true, area: true, state: true, status: true, propertyType: true,
        createdAt: true, units: { select: { id: true, occupancy: true, isListed: true, rent: true, pricePeriod: true, listings: { select: { id: true, status: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const assets = [
    ...registeredProperties.map((property) => ({
      id: property.id, kind: 'registered' as const, name: property.name,
      category: property.category, subtype: property.subtype, city: property.city, state: property.state,
      status: property.onboardingStatus, updatedAt: property.updatedAt.toISOString(),
      spaces: property.spaces.length,
      occupied: property.spaces.filter((space) => space.operationalStatus === 'occupied').length,
      listed: property.spaces.filter((space) => space.listings.some((listing) => listing.status === 'active')).length,
      activeListings: property.spaces.reduce((total, space) => total + space.listings.filter((listing) => listing.status === 'active').length, 0),
      href: `/dashboard/landlord/properties/registry/${property.id}`,
    })),
    ...legacyListings.map((listing) => ({
      id: listing.id, kind: 'legacy' as const, name: listing.title,
      category: listing.propertyType || 'legacy', subtype: 'Existing property', city: listing.area, state: listing.state,
      status: listing.status, updatedAt: listing.createdAt.toISOString(),
      spaces: listing.units.length,
      occupied: listing.units.filter((unit) => unit.occupancy === 'OCCUPIED').length,
      listed: listing.units.filter((unit) => unit.isListed || unit.listings.some((child) => child.status !== 'deleted')).length,
      activeListings: listing.units.reduce((total, unit) => total + unit.listings.filter((child) => child.status === 'active').length, 0),
      href: `/dashboard/landlord/properties/${listing.id}`,
    })),
  ];

  const metrics = {
    assets: assets.length,
    spaces: assets.reduce((total, asset) => total + asset.spaces, 0),
    occupied: assets.reduce((total, asset) => total + asset.occupied, 0),
    listed: assets.reduce((total, asset) => total + asset.listed, 0),
    activeListings: assets.reduce((total, asset) => total + asset.activeListings, 0),
    attention: assets.filter((asset) => asset.status === 'draft' || asset.status === 'submitted').length,
  };

  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
    <PortfolioDashboardClient assets={assets} metrics={metrics} />
  </DashboardShell>;
}
