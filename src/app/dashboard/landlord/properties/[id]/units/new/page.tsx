import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnitAddClient from './UnitAddClient';

export const metadata: Metadata = { title: 'Add Space | PROPTI', description: 'Add a space to a registered property' };

export default async function LandlordAddUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  const { id } = await params;
  const property = await prisma.property.findFirst({ where: { id, ownerId: user.id }, select: { id: true, name: true, spaces: { select: { identifier: true } } } });
  if (!property) redirect('/dashboard/landlord/properties');
  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}><ErrorBoundary><UnitAddClient propertyId={property.id} propertyName={property.name} existingIdentifiers={property.spaces.map((space) => space.identifier)} /></ErrorBoundary></DashboardShell>;
}
