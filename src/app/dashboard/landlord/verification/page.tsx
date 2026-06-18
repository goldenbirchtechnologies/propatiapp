import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Building2 as BuildingIcon, ShieldCheck as ShieldCheckIcon, Clock as ClockIcon, Plus as PlusIcon, Check as CheckIcon, X as XIcon, Loader as LoaderIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';

export default async function LandlordVerificationPage() {
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
              Property Verification
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Complete the 5-layer verification to get the Certified badge and attract more tenants
            </p>
          </div>
        </div>

        {/* Verification Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OverviewCard
            label="Total Properties"
            value={listings.length}
            icon={<BuildingIcon />}
          />
          <OverviewCard
            label="Verified"
            value={listings.filter(l => l.verification?.overallStatus === 'certified').length}
            icon={<ShieldCheckIcon />}
            trend="Fully certified"
            trendPositive
          />
          <OverviewCard
            label="In Progress"
            value={listings.filter(l => l.verification?.overallStatus === 'in_progress').length}
            icon={<ClockIcon />}
            trend="Complete to unlock benefits"
          />
        </div>

        {/* Properties with Verification Status */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Your Properties</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <VerificationCard key={listing.id} listing={listing} />
            ))}
            {listings.length === 0 && (
              <div className="col-span-full card p-12 text-center">
                <BuildingIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No properties to verify</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Add a property to start the verification process.</p>
                <Link href="/dashboard/landlord/listing/new" className="btn btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Property
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Verification Wizard Modal would go here - for now linking to verify page */}
      </div>
    </DashboardShell>
  );
}

function OverviewCard({ label, value, icon: Icon, trend, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trend?: string; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-3xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {Icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--muted)' }}>
            {trendPositive ? '✓' : ''}
          </span>
          <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--muted)' }}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function VerificationCard({ listing }: { listing: any }) {
  const verification = listing.verification;
  const overallStatus = verification?.overallStatus || 'not_started';
  const currentLayer = verification?.currentLayer || 1;
  
  const layerLabels = [
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts, utility bills' },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection' },
    { key: 'l5Status', label: 'Layer 5: Certified', desc: 'Final approval & badge' },
  ];

  const statusColors: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
    not_started: { class: 'tag-amber', label: 'Not Started', icon: <ClockIcon className="w-3 h-3 mr-1" /> },
    in_progress: { class: 'tag-blue', label: 'In Progress', icon: <LoaderIcon className="w-3 h-3 mr-1 animate-spin" /> },
    certified: { class: 'tag-green', label: 'Verified ✓', icon: <CheckIcon className="w-3 h-3 mr-1" /> },
    rejected: { class: 'tag-red', label: 'Rejected', icon: <XIcon className="w-3 h-3 mr-1" /> },
    pending: { class: 'tag-amber', label: 'Pending Review', icon: <ClockIcon className="w-3 h-3 mr-1" /> },
    approved: { class: 'tag-green', label: 'Approved', icon: <CheckIcon className="w-3 h-3 mr-1" /> },
  };

  const overallConfig = statusColors[overallStatus] || statusColors.not_started;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <BuildingIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>{listing.title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{listing.area}, {listing.state}</p>
          </div>
        </div>
        <span className={`tag ${overallConfig.class} flex items-center gap-1`}>
          {overallConfig.icon}
          {overallConfig.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
          <span>Progress</span>
          <span>{((verification ? Object.values({ l1: verification.l1Status, l2: verification.l2Status, l3: verification.l3Status, l4: verification.l4Status, l5: verification.l5Status || 'pending' }).filter(s => s === 'approved').length : 0) / 5) * 100}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((verification ? Object.values({ l1: verification.l1Status, l2: verification.l2Status, l3: verification.l3Status, l4: verification.l4Status, l5: verification.l5Status || 'pending' }).filter(s => s === 'approved').length : 0) / 5) * 100}%`,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            }}
          />
        </div>
      </div>

      {/* Layer Status */}
      <div className="space-y-2">
        {layerLabels.map((layer, index) => {
          const layerStatus = verification?.[layer.key as keyof typeof verification] || 'pending';
          const isApproved = layerStatus === 'approved';
          const isCurrent = index + 1 === currentLayer && overallStatus === 'in_progress';
          const config = statusColors[layerStatus] || statusColors.pending;
          
          return (
            <div
              key={layer.key}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: isApproved ? 'var(--green-bg)' : isCurrent ? 'var(--accent-bg)' : 'var(--border)',
                  color: isApproved ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {isApproved ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{layer.label}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{layer.desc}</p>
              </div>
              <span className={`tag ${config.class} flex items-center gap-1 whitespace-nowrap`}>
                {config.icon}
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {overallStatus === 'certified' ? (
          <Link
            href={`/dashboard/landlord/properties/${listing.id}`}
            className="btn btn-ghost w-full justify-center"
          >
            <BuildingIcon className="w-4 h-4 mr-2" /> Manage Property
          </Link>
        ) : (
          <Link
            href={`/dashboard/landlord/verify?listingId=${listing.id}`}
            className="btn btn-primary w-full justify-center"
          >
            {overallStatus === 'not_started' ? 'Start Verification' : 'Continue Verification'}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
}

