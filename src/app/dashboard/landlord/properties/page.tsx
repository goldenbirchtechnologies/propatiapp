import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              My Properties
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Manage your property listings and short-let access
            </p>
          </div>
          <Link href="/dashboard/landlord/listing/new" className="btn btn-primary">
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
          <div className="card overflow-hidden">
            {listings.length === 0 ? (
              <div className="card-body text-center py-16">
                <BuildingIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No properties yet</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Get started by adding your first property listing.</p>
                <Link href="/dashboard/landlord/listing/new" className="btn btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Property
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Verification</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Price</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Views</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Short-let</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {listing.images[0] ? (
                            <img
                              src={listing.images[0].url}
                              alt={listing.title}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                              <BuildingIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text)' }}>{listing.title}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{listing.area}, {listing.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="tag tag-blue">{listing.listingType}</span>
                        <span className="tag tag-teal ml-1">{listing.propertyType || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="p-4">
                        <VerificationBadge verification={listing.verification} />
                      </td>
                      <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>
                        ₦{Number(listing.price).toLocaleString()}/{listing.pricePeriod || 'month'}
                      </td>
                      <td className="p-4" style={{ color: 'var(--muted)' }}>{listing.viewsCount.toLocaleString()}</td>
                      <td className="p-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="sr-only" defaultChecked={!!listing.allowShortlet} />
                          <ToggleLeftIcon
                            className={`h-5 w-5 ${listing.allowShortlet ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span className="text-xs text-slate-600">{listing.allowShortlet ? 'Enabled' : 'Off'}</span>
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
    </DashboardShell>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {Icon}
        </div>
      </div>
      {trendPositive && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>↑ Active</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'tag-green', label: 'Active' },
    draft: { class: 'tag-amber', label: 'Draft' },
    suspended: { class: 'tag-red', label: 'Suspended' },
    deleted: { class: 'tag-gray', label: 'Deleted' },
  };
  const cfg = config[status] || { class: 'tag-gray', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function VerificationBadge({ verification }: { verification: { overallStatus: string; currentLayer: number } | null }) {
  if (!verification) return <span className="tag tag-amber">Not Started</span>;

  const config: Record<string, { class: string; label: string }> = {
    not_started: { class: 'tag-amber', label: 'Not Started' },
    in_progress: { class: 'tag-blue', label: `Layer ${verification.currentLayer}` },
    certified: { class: 'tag-green', label: 'Verified ✓' },
    rejected: { class: 'tag-red', label: 'Rejected' },
  };
  const cfg = config[verification.overallStatus] || config.not_started;
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}
