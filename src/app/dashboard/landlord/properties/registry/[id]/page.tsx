import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Building2, MapPin } from 'lucide-react';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import RegistrySpaceManager from './RegistrySpaceManager';

export default async function RegisteredPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  const { id } = await params;
  const [property, tenants] = await Promise.all([
    prisma.property.findFirst({ where: { id, ownerId: user.id }, include: { spaces: { orderBy: { identifier: 'asc' }, include: { photos: true, currentTenant: { select: { id: true, fullName: true, email: true } }, listings: { select: { id: true, status: true, listingType: true, price: true, pricePeriod: true } } } }, spaceCategories: true, photos: true } }),
    prisma.user.findMany({ where: { role: 'tenant' }, select: { id: true, fullName: true, email: true }, orderBy: { fullName: 'asc' }, take: 200 }),
  ]);
  if (!property) notFound();
  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <Link href="/dashboard/landlord/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} />Back to properties</Link>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Registered asset</p><h1 className="text-2xl font-semibold">{property.name}</h1></div></div><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={15} />{property.address}, {property.city}, {property.state}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{property.onboardingStatus}</span></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Category</p><p className="mt-1 font-medium capitalize">{property.category.replace('_', ' ')}</p><p className="text-xs text-muted-foreground">{property.subtype}</p></div><div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Space categories</p><p className="mt-1 font-medium">{property.spaceCategories.length}</p></div><div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Registered spaces</p><p className="mt-1 font-medium">{property.spaces.length}</p></div></div>
      </div>
      <RegistrySpaceManager propertyId={property.id} propertyPhotos={property.photos} spaces={property.spaces} tenants={tenants} />
    </main>
  </DashboardShell>;
}
