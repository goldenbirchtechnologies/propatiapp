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
    <main className="mx-auto w-full max-w-7xl space-y-6 bg-[#F8F9FA] p-6 sm:p-8">
      <Link href="/dashboard/landlord/properties" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-emerald-600"><ArrowLeft size={16} />Back to properties</Link>
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Building2 size={22} /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Registered asset</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">{property.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500"><MapPin size={15} className="text-zinc-400" />{property.address}, {property.city}, {property.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">{property.onboardingStatus}</span>
            <Link href="/dashboard/landlord/listing/new" className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Create listing</Link>
          </div>
        </div>
        <div className="grid border-t border-[#E5E7EB] bg-[#F9FAFB] sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b border-[#E5E7EB] px-6 py-4 lg:border-b-0 lg:border-r"><p className="text-xs text-zinc-500">Category</p><p className="mt-1 text-sm font-semibold capitalize text-zinc-900">{property.category.replace('_', ' ')}</p></div>
          <div className="border-b border-[#E5E7EB] px-6 py-4 sm:border-r lg:border-b-0"><p className="text-xs text-zinc-500">Type</p><p className="mt-1 text-sm font-semibold capitalize text-zinc-900">{property.subtype.replace('_', ' ')}</p></div>
          <div className="border-b border-[#E5E7EB] px-6 py-4 lg:border-b-0 lg:border-r"><p className="text-xs text-zinc-500">Space categories</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900">{property.spaceCategories.length}</p></div>
          <div className="px-6 py-4"><p className="text-xs text-zinc-500">Registered spaces</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900">{property.spaces.length}</p></div>
        </div>
      </section>
      <RegistrySpaceManager propertyId={property.id} spaces={property.spaces} tenants={tenants} />
    </main>
  </DashboardShell>;
}
