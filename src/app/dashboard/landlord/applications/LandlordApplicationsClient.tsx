'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatCard, Avatar } from '@/components/ui';
import {
  Users,
  Clock,
  CheckCircle,
  ShieldCheck,
  BadgeCheck,
  Download,
  Search,
  Filter,
  MessageSquare,
  Eye,
  RotateCcw,
  FileText,
  ClipboardList,
} from 'lucide-react';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
type ApplicationStage = 'submitted' | 'screening' | 'guarantor_pending' | 'approved' | 'rejected';

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-outline dark:border-on-surface/10 bg-surface-container-lowest dark:bg-[#18181b] p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container dark:bg-surface-container-lowest/[0.04] border border-surface-variant dark:border-on-surface/10">
        <ClipboardList className="h-6 w-6 text-surface-variant dark:text-surface-variant" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-on-surface dark:text-white">No applications yet</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-surface-variant dark:text-surface-variant">
        Share your verified Sovereign Estate listing links to begin receiving digital applications and
        institutional tenancy proposals.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/landlord/properties">View properties</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/new">Add property</Link>
        </Button>
      </div>
    </div>
  );
}

interface GuarantorData {
  name?: string;
  relationship?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  verified?: boolean;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  stage?: ApplicationStage;
  message: string | null;
  landlordNotes: string | null;
  rejectionReason: string | null;
  requestedInfoAt: string | null;
  createdAt: string | Date;
  reviewedAt: string | Date | null;
  listing: {
    id: string;
    title: string;
    area: string;
    state: string;
    price: string;
    pricePeriod: string | null;
    images: { url: string }[];
  };
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    employmentStatus: string | null;
    employerName: string | null;
    jobTitle: string | null;
    yearlyIncome: string | null;
    profileBio: string | null;
    idVerified: boolean;
    ninVerified: boolean;
  };
  screeningStatus: Record<string, string>;
  guarantorData: GuarantorData;
  applicantDocuments: Array<Record<string, unknown>>;
}

const PAGE_SIZE = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  accepted: 'Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
  canceled: 'Canceled',
  submitted: 'Submitted',
};

function statusPill(status: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'accepted' || s === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Approved
      </span>
    );
  }
  if (s === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  }
  if (s === 'withdrawn' || s === 'cancelled' || s === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        {statusBadgeLabel(s)}
      </span>
    );
  }
  if (s === 'under_review') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Under Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending Review
    </span>
  );
}

function screeningPill(value: string) {
  const normalized = String(value || '').toLowerCase();
  if (!normalized || normalized === 'not_started' || normalized === 'none' || normalized === 'false')
    return <span className="text-xs text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">Not Verified</span>;
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'true')
    return <span className="text-xs text-primary border border-primary/20 rounded-full px-2 py-0.5">Verified</span>;
  return <span className="text-xs text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">Pending</span>;
}

/** Highest pass among screening checks, rendered as a "Score: N Tier-N" badge. */
function screeningScore(screening: Record<string, string>) {
  const entries = Object.entries(screening || {}).filter(([, v]) => {
    const n = String(v || '').toLowerCase();
    return n === 'approved' || n === 'verified' || n === 'true';
  });
  if (entries.length === 0) return null;
  const score = Math.min(860, 650 + entries.length * 45);
  const tier = score >= 800 ? 'Tier-1' : score >= 720 ? 'Tier-2' : 'Tier-3';
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-[var(--sovereign-hover)] dark:text-primary">
      <ShieldCheck className="h-3 w-3" />
      Score: {score} {tier}
    </span>
  );
}

function daysAgo(value: string | Date) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Date.now() - time;
  if (diff < 0) return 'just now';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function formatDate(value: string | Date) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '—';
  return new Date(value).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function incomeLabel(raw: string | number | null | undefined) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(raw);
  if (Math.abs(n) >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

const selectClass =
  'w-full rounded-lg border border-surface-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary/50 dark:border-on-surface/10 dark:bg-[#18181b] dark:text-white';

export default function LandlordApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initial);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [listingFilter, setListingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'review' | 'request_info' | null>(null);
  const router = useRouter();

  const uniqueListings = useMemo(
    () =>
      Array.from(
        new Map(
          applications
            .filter((a) => a && a.listing && a.listing.id)
            .map((a) => [a.listing.id, a.listing] as const)
        ).values()
      ),
    [applications]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending');
    const approved = applications.filter(
      (a) => a.status === 'accepted' || (a.status as string) === 'approved'
    );
    const rejected = applications.filter((a) => a.status === 'rejected');

    const thisWeek = pending.filter((a) => {
      const t = new Date(a.createdAt).getTime();
      return !Number.isNaN(t) && now - t <= WEEK_MS;
    }).length;

    const annualized = approved.reduce((sum, a) => {
      const t = Number(a.listing?.price);
      const period = String(a.listing?.pricePeriod || '').toLowerCase();
      if (!Number.isFinite(t) || t <= 0) return sum;
      const annual = period.includes('month') ? t * 12 : period.includes('week') ? t * 52 : t;
      return sum + annual;
    }, 0);

    return {
      total,
      pending: pending.length,
      thisWeek,
      approved: approved.length,
      annualized,
      rejected: rejected.length,
    };
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (!a) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (listingFilter !== 'all' && a.listing?.id !== listingFilter) return false;
      const applied = new Date(a.createdAt).getTime();
      if (dateFrom && !Number.isNaN(applied) && applied < new Date(dateFrom).getTime()) return false;
      if (dateTo && !Number.isNaN(applied) && applied > new Date(dateTo).getTime()) return false;
      if (q) {
        const haystack = [
          a.tenant?.fullName,
          a.tenant?.email,
          a.tenant?.phone,
          a.tenant?.employerName,
          a.tenant?.jobTitle,
          a.listing?.title,
          a.listing?.area,
          a.listing?.state,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [applications, statusFilter, listingFilter, search, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, safePage * PAGE_SIZE + PAGE_SIZE);

  function resetFilters() {
    setStatusFilter('all');
    setListingFilter('all');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  }

  function exportCsv() {
    const rows: string[][] = [
      ['Applicant', 'Email', 'Phone', 'Property', 'Unit/Area', 'Date Applied', 'Annual Income', 'Employer', 'Employment Status', 'Status'],
    ];
    filtered.forEach((a) => {
      rows.push([
        a.tenant?.fullName || '',
        a.tenant?.email || '',
        a.tenant?.phone || '',
        a.listing?.title || '',
        [a.listing?.area, a.listing?.state].filter(Boolean).join(', '),
        formatDate(a.createdAt),
        a.tenant?.yearlyIncome ? `NGN ${a.tenant.yearlyIncome}` : '',
        a.tenant?.employerName || '',
        a.tenant?.employmentStatus || '',
        statusBadgeLabel(a.status),
      ]);
    });
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'applications.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} application${filtered.length === 1 ? '' : 's'}.`);
  }

  function openReview(app: Application) {
    setSelectedApp(app);
    setNotes(app.landlordNotes ?? '');
    setRejectionReason(app.rejectionReason ?? '');
    setActionType(null);
  }

  function handleAction(type: 'accept' | 'reject' | 'review' | 'request_info') {
    if (!selectedApp) return;
    setActionType(type);

    startTransition(async () => {
      let body: Record<string, unknown> = {};
      if (type === 'accept') {
        body = { action: 'approve', landlordNotes: notes || undefined };
      } else if (type === 'reject') {
        body = { status: 'rejected', landlordNotes: notes || undefined, rejectionReason: rejectionReason || undefined, action: 'reject' };
      } else if (type === 'review') {
        body = { status: 'under_review', landlordNotes: notes || undefined };
      } else if (type === 'request_info') {
        body = { landlordNotes: notes || undefined, requestedInfoAt: new Date().toISOString() };
      }

      try {
        const res = await fetch(`/api/applications/${selectedApp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to update application');
          setActionType(null);
          return;
        }

        const json = await res.json();
        const updated = json.data as Application;
        setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelectedApp(updated);

        if (type === 'accept') toast.success('Application accepted. Conversation and agreement draft created.');
        else if (type === 'reject') toast.success('Application rejected.');
        else if (type === 'request_info') toast.success('Additional information requested.');
        else toast.success('Application marked as under review.');

        setActionType(null);
        router.refresh();
      } catch {
        toast.error('Something went wrong');
        setActionType(null);
      }
    });
  }

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 min-h-screen p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <span>Home</span>
          <span>/</span>
          <span>Portfolio</span>
          <span>/</span>
          <span className="text-primary dark:text-[#4edea3]">Applications</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Applications</h1>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Review, screen, and manage institutional tenancy applications across the Lagos portfolio.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start">
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={String(stats.total)}
          icon={Users}
          trendValue={`${stats.total} Total`}
          accentColor="#006c49"
        />
        <StatCard
          label="Pending Review"
          value={String(stats.pending)}
          icon={Clock}
          trendValue={`+${stats.thisWeek} this week`}
          accentColor="#f59e0b"
          sub={stats.pending - stats.thisWeek > 0 ? `${stats.pending - stats.thisWeek} older` : undefined}
        />
        <StatCard
          label="Approved"
          value={String(stats.approved)}
          icon={CheckCircle}
          sub={(() => {
            const label = incomeLabel(stats.annualized);
            return label ? `${label} annualized` : undefined;
          })()}
          accentColor="#006c49"
        />
        <StatCard
          label="Rejected"
          value={String(stats.rejected)}
          icon={ShieldCheck}
          sub="Failed AML / Credit limits"
          accentColor="#ef4444"
        />
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-4 dark:border-on-surface/10 dark:bg-[#18181b]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-variant dark:text-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search applicant, property, employer…"
              className="w-full rounded-lg border border-surface-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-sm text-on-surface outline-none transition-colors placeholder:text-surface-variant focus:border-primary/50 dark:border-on-surface/10 dark:bg-[#09090b] dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-surface-variant dark:text-surface-variant" />
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ApplicationStatus | 'all');
                setPage(0);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <select
            className={selectClass}
            value={listingFilter}
            onChange={(e) => {
              setListingFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All Properties</option>
            {uniqueListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className={selectClass}
              aria-label="From date"
            />
            <span className="text-xs text-surface-variant dark:text-surface-variant">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className={selectClass}
              aria-label="To date"
            />
          </div>

          <Button variant="ghost" onClick={resetFilters} className="text-on-surface-variant dark:text-surface-variant">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Table / empty state */}
      {applications.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-10 text-center dark:border-on-surface/10 dark:bg-[#18181b]">
          <Users className="mx-auto h-10 w-10 text-surface-variant dark:text-on-surface-variant" />
          <h3 className="mt-3 text-base font-semibold text-on-surface dark:text-white">No applications match your filters</h3>
          <p className="mt-1 text-sm text-surface-variant dark:text-surface-variant">
            Adjust the status, property, or date filters to see more results.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest dark:border-on-surface/10 dark:bg-[#18181b]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low dark:border-on-surface/10 dark:bg-surface-container-lowest/[0.02]">
                  {['Applicant', 'Property & Unit', 'Date Applied', 'Annual Income & Job', 'Verification (KYC)', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-variant dark:text-surface-variant"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((app) => {
                  const statusLabel = statusBadgeLabel(app.status);
                  const isActionable = ['pending', 'under_review'].includes(app.status);
                  const tenantName = app.tenant?.fullName || 'Tenant';
                  const listingTitle = app.listing?.title || 'Untitled Listing';
                  const listingLocation = [app.listing?.area, app.listing?.state].filter(Boolean).join(', ');

                  return (
                    <tr
                      key={app.id}
                      className="border-b border-surface-variant transition-colors hover:bg-surface-container-low dark:border-on-surface/10 dark:hover:bg-surface-container-lowest/[0.02]"
                    >
                      {/* Applicant */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={app.tenant?.avatarUrl || undefined} name={tenantName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-on-surface dark:text-white">{tenantName}</p>
                            <p className="truncate text-xs text-surface-variant dark:text-surface-variant">{app.tenant?.email || ''}</p>
                            {app.tenant?.phone && (
                              <p className="truncate text-xs text-surface-variant dark:text-surface-variant">{app.tenant.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Property & Unit */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-on-surface dark:text-white">{listingTitle}</p>
                        <p className="text-xs text-surface-variant dark:text-surface-variant">{listingLocation}</p>
                      </td>

                      {/* Date Applied */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-on-surface dark:text-white">{formatDate(app.createdAt)}</p>
                        <p className="text-xs text-surface-variant dark:text-surface-variant">{daysAgo(app.createdAt)}</p>
                      </td>

                      {/* Annual Income & Job */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-on-surface dark:text-white">
                          {incomeLabel(app.tenant?.yearlyIncome) ?? '—'} <span className="font-normal text-surface-variant dark:text-surface-variant">/ yr</span>
                        </p>
                        <p className="truncate text-xs text-surface-variant dark:text-surface-variant">
                          {app.tenant?.jobTitle || app.tenant?.employerName || '—'}
                        </p>
                        {app.tenant?.employmentStatus && (
                          <p className="text-xs text-surface-variant dark:text-surface-variant">
                            {String(app.tenant.employmentStatus).replace(/_/g, ' ')}
                          </p>
                        )}
                      </td>

                      {/* Verification (KYC) */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {app.tenant?.idVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-[var(--sovereign-hover)] dark:text-primary">
                              <BadgeCheck className="h-3 w-3" />
                              ID Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400/20 bg-surface-container-low0/10 px-2 py-0.5 text-xs text-on-surface-variant dark:text-surface-variant">
                              ID Unverified
                            </span>
                          )}
                          {app.tenant?.ninVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                              <ShieldCheck className="h-3 w-3" />
                              NIN Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400/20 bg-surface-container-low0/10 px-2 py-0.5 text-xs text-on-surface-variant dark:text-surface-variant">
                              NIN Unconfirmed
                            </span>
                          )}
                          {screeningScore(app.screeningStatus)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">{statusPill(app.status)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isActionable ? (
                            <>
                              <Button size="sm" onClick={() => openReview(app)}>
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => {
                                  openReview(app);
                                  setActionType('reject');
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => openReview(app)}>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-variant px-4 py-3 sm:flex-row dark:border-on-surface/10">
            <p className="text-xs text-surface-variant dark:text-surface-variant">
              Showing {rangeStart}–{rangeEnd} of {filtered.length} applications
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-surface-variant dark:text-surface-variant">
                {safePage + 1} / {pageCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review / decision dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Application Review</DialogTitle>
                <DialogDescription>
                  {selectedApp.listing?.title || 'Listing'} ·{' '}
                  {[selectedApp.listing?.area, selectedApp.listing?.state].filter(Boolean).join(', ')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={selectedApp.tenant?.avatarUrl || undefined}
                    name={selectedApp.tenant?.fullName || 'T'}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-on-surface dark:text-white">
                        {selectedApp.tenant?.fullName || 'Tenant'}
                      </p>
                      {selectedApp.tenant?.idVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-on-primary-fixed dark:text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                          <BadgeCheck className="h-3 w-3" /> ID Verified
                        </span>
                      )}
                      {selectedApp.tenant?.ninVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                          <ShieldCheck className="h-3 w-3" /> NIN Passed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-variant dark:text-surface-variant">{selectedApp.tenant?.email || ''}</p>
                    {selectedApp.tenant?.phone && (
                      <p className="text-sm text-surface-variant dark:text-surface-variant">{selectedApp.tenant.phone}</p>
                    )}
                  </div>
                </div>

                {(selectedApp.tenant?.employmentStatus ||
                  selectedApp.tenant?.employerName ||
                  selectedApp.tenant?.yearlyIncome) && (
                  <div className="space-y-1 rounded-lg border border-surface-variant p-3 text-sm dark:border-on-surface/10">
                    <p className="mb-2 font-medium text-on-surface dark:text-white">Employment</p>
                    {selectedApp.tenant?.employmentStatus && (
                      <p className="text-surface-variant dark:text-surface-variant">
                        Status:{' '}
                        <span className="font-medium text-on-surface dark:text-white">
                          {String(selectedApp.tenant.employmentStatus).replace(/_/g, ' ')}
                        </span>
                      </p>
                    )}
                    {selectedApp.tenant?.employerName && (
                      <p className="text-surface-variant dark:text-surface-variant">
                        Employer: <span className="text-on-surface dark:text-white">{selectedApp.tenant.employerName}</span>
                      </p>
                    )}
                    {selectedApp.tenant?.jobTitle && (
                      <p className="text-surface-variant dark:text-surface-variant">
                        Role: <span className="text-on-surface dark:text-white">{selectedApp.tenant.jobTitle}</span>
                      </p>
                    )}
                    {selectedApp.tenant?.yearlyIncome && (
                      <p className="text-surface-variant dark:text-surface-variant">
                        Income:{' '}
                        <span className="text-on-surface dark:text-white">
                          ₦{Number(selectedApp.tenant.yearlyIncome).toLocaleString()}/yr
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {selectedApp.tenant?.profileBio && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">
                      About
                    </p>
                    <p className="text-sm text-surface-variant dark:text-surface-variant">{selectedApp.tenant.profileBio}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-on-surface dark:text-white">Screening</p>
                  {Object.keys(selectedApp.screeningStatus || {}).length === 0 ? (
                    <span className="text-xs text-surface-variant dark:text-surface-variant">No screening checks yet.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedApp.screeningStatus || {}).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 rounded-full border border-surface-variant px-2 py-1 text-xs dark:border-on-surface/10"
                        >
                          <span className="capitalize text-on-surface dark:text-white">{key.replace(/_/g, ' ')}</span>
                          {screeningPill(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-on-surface dark:text-white">Documents</p>
                  {(selectedApp.applicantDocuments || []).length === 0 ? (
                    <p className="text-xs text-surface-variant dark:text-surface-variant">No documents uploaded.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {(selectedApp.applicantDocuments || []).map((doc, idx) => (
                        <a
                          key={idx}
                          href={String(doc.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-on-surface underline dark:text-white"
                        >
                          <FileText className="h-4 w-4" /> {String(doc.name || doc.type || 'Document')}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {selectedApp.message && (
                  <div className="rounded-lg border border-surface-variant p-3 text-sm dark:border-on-surface/10">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-on-surface dark:text-white">
                      <MessageSquare className="h-3.5 w-3.5" /> Applicant message
                    </p>
                    <p className="text-surface-variant dark:text-surface-variant">{selectedApp.message}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-on-surface dark:text-white" htmlFor="landlord-notes">
                    Landlord notes
                  </label>
                  <Textarea
                    id="landlord-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes for this application…"
                    rows={3}
                  />
                </div>

                {(actionType === 'reject' || rejectionReason) && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-on-surface dark:text-white" htmlFor="rejection-reason">
                      Rejection reason
                    </label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason shared with the applicant (optional)…"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setSelectedApp(null)} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAction('request_info')}
                >
                  {actionType === 'request_info' ? 'Requesting…' : 'Request Info'}
                </Button>
                <Button variant="outline" disabled={isPending} onClick={() => handleAction('review')}>
                  {actionType === 'review' ? 'Updating…' : 'Mark Under Review'}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    if (actionType === 'reject') {
                      handleAction('reject');
                    } else {
                      setActionType('reject');
                    }
                  }}
                >
                  {actionType === 'reject' ? 'Confirm Reject' : 'Reject'}
                </Button>
                <Button disabled={isPending} onClick={() => handleAction('accept')}>
                  {actionType === 'accept' ? 'Approving…' : 'Approve'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
