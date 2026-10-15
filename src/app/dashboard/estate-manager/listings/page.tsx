import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { managedListingWhere } from '@/lib/org-scope';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Listings',
  description: 'Marketplace listings across managed portfolios.',
};

function formatNaira(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value || 0);
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default async function EstateManagerListingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || (user.role !== 'estate_manager' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: await managedListingWhere(user.id),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      address: true,
      listingType: true,
      status: true,
      price: true,
      ownerId: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
      units: { select: { id: true, occupancy: true } },
      _count: { select: { applications: true } },
    },
  });

  const active = listings.filter((l) => l.status === 'active').length;
  const vacantUnits = listings.flatMap((l) => l.units).filter((u) => u.occupancy === 'VACANT').length;
  const totalApplications = listings.reduce((sum, l) => sum + l._count.applications, 0);

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          <PageHeader
            title="Listings"
            description="Marketplace listings you own or manage across portfolios."
            actions={
              <Link
                href="/dashboard/estate-manager/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={14} /> New Listing
              </Link>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Listings" value={String(listings.length)} icon={Building2} />
            <StatCard label="Active" value={String(active)} icon={Building2} />
            <StatCard label="Applications" value={String(totalApplications)} icon={Building2} href="/dashboard/estate-manager/applications" />
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-12 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No listings yet</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 mb-5">
                Publish a marketplace listing from a vacant unit to start receiving applications.
              </p>
              <Link
                href="/dashboard/estate-manager/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={14} /> Create Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 overflow-hidden"
                >
                  <div className="relative h-36 bg-zinc-100 dark:bg-zinc-800">
                    {listing.images?.[0]?.url ? (
                      <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">{listing.title}</p>
                      <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white capitalize">
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{listing.address}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 capitalize">
                        {listing.listingType.replace('_', ' ')} · {listing.units.length} units · {listing._count.applications} applications
                      </span>
                      <span className="text-zinc-900 dark:text-white font-medium">{formatNaira(listing.price)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        View live <ArrowRight size={12} />
                      </Link>
                      <Link
                        href="/dashboard/estate-manager/applications"
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                      >
                        Applications <ArrowRight size={12} />
                      </Link>
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-500">
                      {listing.ownerId === user.id ? 'Owned by you' : 'Managed via organization'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-zinc-500">{vacantUnits} vacant units across these listings.</p>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
