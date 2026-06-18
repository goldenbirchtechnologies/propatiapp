import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function LandlordPropertiesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'LANDLORD') {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              My Properties
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Manage your property listings and verification status
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

// Icons
function BuildingIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
}
function CheckCircleIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function FileIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function ShieldCheckIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 15 9"/></svg>;
}
function EyeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function PlusIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function EditIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function ShieldIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}