import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { VerificationBadge as SharedVerificationBadge } from '@/components/ui/badges';
import { Building2 as BuildingIcon, CheckCircle as CheckCircleIcon, FileText as FileIcon, ShieldCheck as ShieldCheckIcon, Eye as EyeIcon, Plus as PlusIcon, Edit as EditIcon, Shield as ShieldIcon, ToggleLeft as ToggleLeftIcon } from 'lucide-react';

export default async function LandlordPropertiesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // Fetch user's listings with verification info
  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    include: {
      images: { where: { isCover: true }, take: 1 },
      verification: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary text-primary">
              My Properties
            </h1>
            <p className="text-on-surface-variant">
              Manage your property listings and short-let access
            </p>
          </div>
          <Link href="/dashboard/landlord/properties/new" className="btn btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Property
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Listings"
            value={listings.length}
            icon={<BuildingIcon />}
          />
          <StatCard
            label="Active"
            value={listings.filter(l => l.status === 'active').length}
            icon={<CheckCircleIcon />}
            trendPositive
          />
          <StatCard
            label="Draft"
            value={listings.filter(l => l.status === 'draft').length}
            icon={<FileIcon />}
          />
          <StatCard
            label="Verified"
            value={listings.filter(l => l.verification?.overallStatus === 'certified').length}
            icon={<ShieldCheckIcon />}
            trendPositive
          />
          <StatCard
            label="Total Views"
            value={listings.reduce((sum, l) => sum + l.viewsCount, 0)}
            icon={<EyeIcon />}
          />
        </div>

        {/* Properties Table */}
        <section>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {listings.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center shadow-sm hover:shadow-md transition-shadow">
                <BuildingIcon className="w-16 h-16 mx-auto mb-4 text-on-surface-variant" />
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2 text-primary">No properties yet</h3>
                <p className="text-on-surface-variant">Get started by adding your first property listing.</p>
                <Link href="/dashboard/landlord/properties/new" className="btn btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Property
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Property</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Type</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Status</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Verification</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Price</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Views</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Short-let</th>
                    <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-outline-variant">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {listing.images[0] ? (
                            <img
                              src={listing.images[0].url}
                              alt={listing.title}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-surface-elevated flex items-center justify-center">
                              <BuildingIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-primary">{listing.title}</p>
                            <p className="text-xs text-on-surface-variant">{listing.area}, {listing.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-primary/10 text-primary border-primary/20">{listing.listingType}</span>
                        <span className="tag tag-teal ml-1">{listing.propertyType || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="p-4">
                        <VerificationBadge verification={listing.verification} />
                      </td>
                      <td className="p-4 font-medium text-primary">
                        ₦{Number(listing.price).toLocaleString()}/{listing.pricePeriod || 'month'}
                      </td>
                      <td className="p-4 text-on-surface-variant">{listing.viewsCount.toLocaleString()}</td>
                      <td className="p-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="sr-only" defaultChecked={!!listing.allowShortlet} />
                          <ToggleLeftIcon
                            className={`h-5 w-5 ${listing.allowShortlet ? 'text-success' : 'text-on-surface-variant'}`}
                          />
                          <span className="text-xs text-on-surface-variant">{listing.allowShortlet ? 'Enabled' : 'Off'}</span>
                        </label>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/landlord/properties/${listing.id}/edit`}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <EditIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/landlord/verify?listingId=${listing.id}`}
                            className="btn btn-ghost btn-sm"
                            title="Verification"
                          >
                            <ShieldIcon className="w-4 h-4" />
                          </Link>
                          {listing.status === 'draft' && (
                            <Link
                              href={`/dashboard/landlord/properties/${listing.id}/publish`}
                              className="btn btn-primary btn-sm"
                              title="Publish"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">{label}</p>
          <p className="text-2xl font-headline-sm text-headline-sm font-bold text-primary text-primary">{value.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {Icon}
        </div>
      </div>
      {trendPositive && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium text-success">↑ Active</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Active' },
    draft: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Draft' },
    suspended: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Suspended' },
    deleted: { class: 'bg-surface-container text-on-surface-variant border-outline-variant', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'bg-surface-container text-on-surface-variant border-outline-variant', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: { overallStatus: string; currentLayer: number } | null }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-warning/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-warning/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          LAYER {verification.currentLayer}
        </span>
      );
      case 'certified':
        return <SharedVerificationBadge tier="certified" />;
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-on-surface-variant border border-outline-variant">
          {verification.overallStatus}
        </span>
      );
  }
}
