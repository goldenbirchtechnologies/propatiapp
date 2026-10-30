


import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Building2 as BuildingIcon, ShieldCheck as ShieldCheckIcon, Clock as ClockIcon, Plus as PlusIcon, Check as CheckIcon, X as XIcon, Loader as LoaderIcon, ArrowRight as ArrowRightIcon, UserCheck, Video, MapPin, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LandlordVerificationPage() {
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

      <ErrorBoundary>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold">
              Property Verification
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Complete the verification to get the Certified badge and attract more tenants
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
          <h2 className="text-zinc-900 dark:text-white">Your Properties</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <VerificationCard key={listing.id} listing={listing} />
            ))}
            {listings.length === 0 && (
              <div className="col-span-full bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08] p-12 text-center">
                <BuildingIcon className="w-5 h-5" />
                <h3 className="text-zinc-900 dark:text-white">No properties to verify</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Add a property to start the verification process.</p>
                <Link href="/dashboard/landlord/properties/new" className="btn btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Property
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Verification Wizard Modal would go here - for now linking to verify page */}
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function OverviewCard({ label, value, icon: Icon, trend, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trend?: string; trendPositive?: boolean }) {
  return (
    <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-600 dark:text-zinc-400">{label}</p>
          <p className="text-zinc-900 dark:text-white">{value}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
          {Icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={`text-xs font-medium ${trendPositive ? 'text-[#006c49]' : 'text-zinc-600 dark:text-zinc-400'}`}>
            {trendPositive ? '✓' : ''}
          </span>
          <span className={`text-xs ${trendPositive ? 'text-[#006c49]' : 'text-zinc-600 dark:text-zinc-400'}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function VerificationCard({ listing }: { listing: unknown }) {
  const verification = listing.verification;
  const overallStatus = verification?.overallStatus || 'not_started';
  // currentLayer unused

  const layerLabels = [
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts, utility bills', icon: FileText, cta: "Upload Documents", },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner', icon: UserCheck, cta: 'Verify Identity' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code', icon: Video, cta: 'Record Video' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection', icon: MapPin, cta: 'Schedule Inspection' },
  ];


  const statusColors: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
    not_started: { class: 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Not Started', icon: null },
    in_progress: { class: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: 'In Review', icon: <LoaderIcon className="w-3 h-3 mr-1 animate-spin" /> },
    certified: { class: 'bg-primary/15 text-[#4edea3] border-primary/20', label: 'Verified', icon: <CheckIcon className="w-3 h-3 mr-1" /> },
    rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected', icon: <XIcon className="w-3 h-3 mr-1" /> },
    pending: { class: 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Not Started', icon: null },
    approved: { class: 'bg-primary/15 text-[#4edea3] border-primary/20', label: 'Verified', icon: <CheckIcon className="w-3 h-3 mr-1" /> },
  };

  const overallConfig = statusColors[overallStatus] || statusColors.not_started;

  const approvedCount = verification
    ? [verification.l1Status, verification.l2Status, verification.l3Status, verification.l4Status].filter((s) => s === 'approved').length
    : 0;
  const progress = Math.round((approvedCount / 4) * 100);
  const isCertified = overallStatus === 'certified';

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950">
      {isCertified ? (
        <div className="flex items-center gap-2 bg-primary/15 px-4 py-2.5 text-sm font-medium text-[#4edea3]">
          <ShieldCheckIcon className="h-4 w-4 shrink-0" />
          Certified — this property is fully verified
        </div>
      ) : (
        <div className="border-b border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">{approvedCount} of 4 Steps Completed</span>
            <span className="text-zinc-600 dark:text-zinc-400">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white dark:bg-zinc-900">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <BuildingIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{listing.title}</h3>
              <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{listing.area}, {listing.state}</p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${overallConfig.class}`}>
            {overallConfig.icon}
            {overallConfig.label}
          </span>
        </div>

      {/* Layer Status — 4 steps + inline CTAs */}
      <div className="space-y-2">
        {layerLabels.map((layer, _index) => {
          const layerStatus = verification?.[layer.key as keyof typeof verification] || 'pending';
          const isApproved = layerStatus === 'approved';
          const config = statusColors[layerStatus] || statusColors.pending;
          const Icon = layer.icon as React.ComponentType<{ className?: string }>;

          return (
            <div
              key={layer.key}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isApproved ? 'border-primary/30 bg-primary/15 text-[#4edea3]' : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}>
                  {isApproved ? <CheckIcon className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{layer.label}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{layer.desc}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.class}`}>
                  {config.icon}
                  {config.label}
                </span>
                {!isApproved && !isCertified && (
                  <Link href={`/dashboard/landlord/verify?listingId=${listing.id}`} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-white hover:bg-primary">
                    {layer.cta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-4 border-t border-zinc-200 dark:border-white/[0.08] pt-4">
        {overallStatus === 'certified' ? (
          <Link
            href={`/dashboard/landlord/properties/${listing.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-800"
          >
            <BuildingIcon className="h-4 w-4" /> Manage Property
          </Link>
        ) : (
          <Link
            href={`/dashboard/landlord/verify?listingId=${listing.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-primary"
          >
            {overallStatus === 'not_started' ? 'Start Verification' : 'Continue Verification'}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      </div>
    </div>
  );
}
