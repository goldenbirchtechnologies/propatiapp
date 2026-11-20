'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Video,
  XCircle,
} from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  createdAt: string;
  images: { url: string; isCover: boolean; sortOrder: number }[];
  verification: {
    id: string;
    l1Status: string;
    l2Status: string;
    l3Status: string;
    l4Status: string;
    overallStatus: string;
    adminNotes: string | null;
    frozenReason: string | null;
  } | null;
};

type Filter = 'all' | 'not_started' | 'in_progress' | 'verified' | 'action_required';
type Sort = 'recent' | 'oldest' | 'alphabetical' | 'progress';

const stages = [
  { key: 'l1Status', title: 'Property documents', detail: 'Title deed, survey plan, tax receipts and utility bills.', action: 'Upload Documents', href: 'step1/documents', icon: FileText },
  { key: 'l2Status', title: 'Identity verification', detail: 'Match NIN or BVN with the property document owner.', action: 'Verify Identity', href: 'step2/identity', icon: UserCheck },
  { key: 'l3Status', title: 'Live video verification', detail: 'Record a walkthrough at the property using its QR code.', action: 'Record Video', href: 'step3/video', icon: Video },
  { key: 'l4Status', title: 'Physical inspection', detail: 'Schedule an inspection with a verified inspection agent.', action: 'Schedule Inspection', href: 'step4/inspection', icon: MapPin },
] as const;

function completedStages(listing: Listing) {
  return stages.filter((stage) => listing.verification?.[stage.key as keyof NonNullable<Listing['verification']>] === 'approved').length;
}

function hasActionRequired(listing: Listing) {
  return listing.verification?.overallStatus === 'rejected' ||
    stages.some((stage) => listing.verification?.[stage.key as keyof NonNullable<Listing['verification']>] === 'rejected');
}

function getStageLabel(status: string | undefined, overallStatus: string) {
  if (status === 'approved') return 'Completed';
  if (status === 'rejected') return 'Rejected';
  if (overallStatus === 'frozen') return 'Blocked';
  if (overallStatus === 'in_progress') return 'In Progress';
  return 'Not Started';
}

function getStatusLabel(status: string) {
  if (status === 'certified') return 'Verified';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'rejected') return 'Action Required';
  if (status === 'frozen') return 'Blocked';
  return 'Not Started';
}

function statusClass(status: string) {
  if (status === 'approved' || status === 'certified') return 'border-primary/25 bg-primary/10 text-primary dark:text-[#63e6b2]';
  if (status === 'rejected' || status === 'frozen') return 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300';
  if (status === 'in_progress') return 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300';
  return 'border-border bg-muted/60 text-muted-foreground';
}

function stageHref(listingId: string, stageHref: string) {
  return `/dashboard/verification/${stageHref}?listingId=${encodeURIComponent(listingId)}`;
}

export default function LandlordPropertyVerificationClient({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [expanded, setExpanded] = useState<string | null>(listings[0]?.id ?? null);

  const stats = useMemo(() => ({
    total: listings.length,
    verified: listings.filter((listing) => listing.verification?.overallStatus === 'certified').length,
    inProgress: listings.filter((listing) => listing.verification?.overallStatus === 'in_progress').length,
    notStarted: listings.filter((listing) => !listing.verification || listing.verification.overallStatus === 'not_started').length,
  }), [listings]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings
      .filter((listing) => {
        const matchesQuery = !normalizedQuery || `${listing.title} ${listing.address} ${listing.area} ${listing.state}`.toLowerCase().includes(normalizedQuery);
        const overallStatus = listing.verification?.overallStatus ?? 'not_started';
        const matchesFilter = filter === 'all' ||
          (filter === 'not_started' && overallStatus === 'not_started') ||
          (filter === 'in_progress' && overallStatus === 'in_progress') ||
          (filter === 'verified' && overallStatus === 'certified') ||
          (filter === 'action_required' && hasActionRequired(listing));
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === 'alphabetical') return a.title.localeCompare(b.title);
        if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
        if (sort === 'progress') return completedStages(b) - completedStages(a);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [filter, listings, query, sort]);

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-7 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Landlord workspace / Verification</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Property Verification</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage property verification and certification across your portfolio.</p>
        </div>
        <Link href="/dashboard/verification/guide?type=property" className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Info className="h-4 w-4" />
          Verification requirements
        </Link>
      </header>

      <section aria-label="Verification summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Properties" value={stats.total} icon={Building2} />
        <SummaryCard label="Verified" value={stats.verified} icon={ShieldCheck} />
        <SummaryCard label="In Progress" value={stats.inProgress} icon={Clock3} />
        <SummaryCard label="Not Started" value={stats.notStarted} icon={SlidersHorizontal} />
      </section>

      <section aria-labelledby="properties-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="properties-heading" className="text-lg font-semibold text-foreground">Your Properties</h2>
            <p className="mt-1 text-sm text-muted-foreground">{listings.length} {listings.length === 1 ? 'property' : 'properties'} in your portfolio</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search properties</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search properties" className="h-9 w-full rounded-[var(--radius-btn)] border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </label>
            <label className="sr-only" htmlFor="verification-sort">Sort properties</label>
            <select id="verification-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-9 rounded-[var(--radius-btn)] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="progress">Verification Progress</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Property status filters">
          {([['all', 'All'], ['not_started', 'Not Started'], ['in_progress', 'In Progress'], ['verified', 'Verified'], ['action_required', 'Action Required']] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${filter === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {listings.length === 0 ? <EmptyState /> : filteredListings.length === 0 ? <NoResults /> : (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card">
            {filteredListings.map((listing) => <PropertyRow key={listing.id} listing={listing} expanded={expanded === listing.id} onToggle={() => setExpanded(expanded === listing.id ? null : listing.id)} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Building2 }) {
  return <div className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-4 sm:px-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span></div></div>;
}

function PropertyRow({ listing, expanded, onToggle }: { listing: Listing; expanded: boolean; onToggle: () => void }) {
  const verification = listing.verification;
  const overallStatus = verification?.overallStatus ?? 'not_started';
  const completed = completedStages(listing);
  const progress = Math.round((completed / 4) * 100);
  const primaryStage = stages.find((stage) => verification?.[stage.key as keyof NonNullable<Listing['verification']>] !== 'approved') ?? null;
  const actionHref = primaryStage ? stageHref(listing.id, primaryStage.href) : `/dashboard/landlord/properties/${listing.id}`;
  const actionLabel = primaryStage ? (completed === 0 ? 'Start Verification' : 'Continue Verification') : 'Manage Property';

  return <article className="border-b border-border last:border-b-0">
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {listing.images[0]?.url ? <img src={listing.images[0].url} alt="" className="h-12 w-14 shrink-0 rounded-[var(--radius-btn)] object-cover" /> : <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-muted text-muted-foreground"><Building2 className="h-5 w-5" /></div>}
        <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-foreground">{listing.title}</h3><p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{listing.area || listing.address}, {listing.state}</p></div>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:w-[360px]">
        <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(overallStatus)}`}>{getStatusLabel(overallStatus)}</span>
        <div className="min-w-0"><div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>{completed}/4 stages</span><span className="tabular-nums">{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></div>
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${listing.title}`} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
      </div>
    </div>
    {expanded && <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-foreground">Verification stages</p><p className="mt-0.5 text-xs text-muted-foreground">Only completed stages count toward the progress total.</p></div><Link href={actionHref} className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-btn)] bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-[var(--accent2,#00422b)] focus-visible:ring-2 focus-visible:ring-ring">{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-2 lg:grid-cols-2">{stages.map((stage, index) => <StageRow key={stage.key} listing={listing} stage={stage} index={index} />)}</div>{hasActionRequired(listing) && <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-btn)] border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-800 dark:text-red-200"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{verification?.frozenReason || verification?.adminNotes || 'Review the rejected stage and submit the requested information to continue.'}</span></div>}</div>}
  </article>;
}

function StageRow({ listing, stage, index }: { listing: Listing; stage: typeof stages[number]; index: number }) {
  const status = listing.verification?.[stage.key as keyof NonNullable<Listing['verification']>];
  const label = getStageLabel(status, listing.verification?.overallStatus ?? 'not_started');
  const complete = status === 'approved';
  const rejected = status === 'rejected';
  const Icon = stage.icon;
  return <div className="flex min-w-0 items-start gap-3 rounded-[var(--radius-btn)] border border-border bg-card px-3 py-3"><div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${complete ? 'border-primary/25 bg-primary/10 text-primary' : rejected ? 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300' : 'border-border bg-muted text-muted-foreground'}`}>{complete ? <Check className="h-3.5 w-3.5" /> : <span>{index + 1}</span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-foreground">{stage.title}</p><span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass(status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : listing.verification?.overallStatus ?? 'not_started')}`}>{label}</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{stage.detail}</p></div>{!complete && <Link href={stageHref(listing.id, stage.href)} aria-label={`${stage.action} for ${listing.title}`} className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"><Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{stage.action}</span></Link>}{complete && <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-label="Completed" />}</div>;
}

function EmptyState() { return <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-card px-6 py-14 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-3 text-sm font-semibold text-foreground">No properties to verify</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Add a property to begin your verification workflow and earn a verified property badge.</p><Link href="/dashboard/landlord/properties/new" className="mt-5 inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[var(--accent2,#00422b)] focus-visible:ring-2 focus-visible:ring-ring">Add Property<ArrowRight className="h-4 w-4" /></Link></div>; }
function NoResults() { return <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-card px-6 py-12 text-center"><Search className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium text-foreground">No properties match these filters</p><p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the status filter.</p></div>; }
