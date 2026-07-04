'use client';

import { useState, useCallback } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Pen,
  ListFilter,
  Home,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FailureState } from '@/components/feedback/FailureState';
import { LoadingState } from '@/components/feedback/LoadingState';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Listing {
  id: string;
  title: string;
  area: string | null;
  state: string | null;
  images: { url: string; isCover: boolean }[];
}

interface Landlord {
  id: string;
  fullName: string | null;
}

interface Tenant {
  id: string;
  fullName: string | null;
}

interface Signature {
  userId: string;
  user: { fullName: string | null };
  signedAt: string;
}

export interface Agreement {
  id: string;
  listing: Listing;
  landlord: Landlord | null;
  tenant: Tenant | null;
  type: string;
  status: string;
  rentAmount: number;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  signatures: Signature[];
}

type TabValue = 'all' | 'active' | 'pending' | 'expired';

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { class: string; label: string; icon: React.ReactNode }
> = {
  draft: { class: 'tag-gray', label: 'Draft', icon: <FileText className="w-3 h-3 mr-1" /> },
  pending_landlord: {
    class: 'tag-blue',
    label: 'Pending Landlord',
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  pending_tenant: {
    class: 'tag-amber',
    label: 'Pending Your Signature',
    icon: <Pen className="w-3 h-3 mr-1" />,
  },
  tenant_signed: { class: 'tag-teal', label: 'You Signed', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
  landlord_signed: {
    class: 'tag-teal',
    label: 'Landlord Signed',
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
  fully_signed: {
    class: 'tag-green',
    label: 'Fully Signed ✓',
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
  terminated: { class: 'tag-red', label: 'Terminated', icon: <XCircle className="w-3 h-3 mr-1" /> },
  expired: { class: 'tag-gray', label: 'Expired', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface TenantAgreementsClientProps {
  initialAgreements: Agreement[];
  onRetry?: () => void;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card p-5">
    <div className="flex items-start gap-4">
      <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-20 w-20 flex-shrink-0" />
    </div>
  </div>
);

function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-8 w-10" />
        </div>
      ))}
    </div>
  );
}

const SkeletonFilter = () => (
  <div className="card p-4">
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-md" />
      ))}
    </div>
  </div>
);

// ─── Stat Card component ──────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ label, value, icon, color = 'var(--text)' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyAgreementState({ tab }: { tab: TabValue }) {
  const messages: Record<TabValue, string> = {
    all: "You don't have any agreements yet.",
    active: 'No active agreements.',
    pending: 'No agreements are pending your action.',
    expired: 'No expired agreements.',
  };

  return (
    <div className="card p-12 text-center">
      <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.4 }} />
      <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>
        No agreements found
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        {messages[tab] || messages.all}
      </p>
      <Button asChild>
        <Link href="/dashboard/tenant/search">Browse Listings</Link>
      </Button>
    </div>
  );
}

// ─── Agreement Card ───────────────────────────────────────────────────────────
function AgreementCard({ agreement }: { agreement: Agreement }) {
  const cfg = statusConfig[agreement.status] || statusConfig.draft;
  const coverImage =
    agreement.listing.images.find((img) => img.isCover) || agreement.listing.images[0];
  const isSignable = ['pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
    agreement.status
  );

  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  const labelClass = cn(
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
    cfg.class
  );

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--border)' }}
          >
            {coverImage ? (
              <img
                src={coverImage.url}
                alt={agreement.listing.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Home className="w-8 h-8" style={{ color: 'var(--muted)' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>
                  {agreement.listing?.title || 'Unknown Property'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {agreement.listing?.area}
                  {agreement.listing?.state ? `, ${agreement.listing.state}` : ''}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  ID: {agreement.id.slice(-8).toUpperCase()} · Created{' '}
                  {new Date(agreement.createdAt).toLocaleDateString('en-NG', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className={labelClass}>{cfg.icon ?? null}{cfg.label}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p style={{ color: 'var(--muted)' }}>Rent</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {formatter.format(agreement.rentAmount || 0)}
                  {agreement.rentPeriod ? `/${agreement.rentPeriod}` : ''}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Period</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {agreement.startDate
                    ? new Date(agreement.startDate).toLocaleDateString('en-NG', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}{' '}
                  –{' '}
                  {agreement.endDate
                    ? new Date(agreement.endDate).toLocaleDateString('en-NG', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Type</p>
                <p className="font-medium capitalize" style={{ color: 'var(--text)' }}>
                  {agreement.type}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Landlord</p>
                <p className="font-medium truncate" style={{ color: 'var(--text)' }}>
                  {agreement.landlord?.fullName || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions + Signatures row */}
      <div className="border-t px-5 py-3 flex flex-wrap items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/tenant/agreements/${agreement.id}`}
            className="btn btn-ghost btn-sm"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {agreement.status === 'fully_signed' && (
            <Link
              href={`/api/agreements/${agreement.id}/pdf`}
              className="btn btn-ghost btn-sm"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </Link>
          )}
          {isSignable && (
            <Link
              href={`/dashboard/tenant/agreements/${agreement.id}/sign`}
              className="btn btn-primary btn-sm"
            >
              <Pen className="w-4 h-4 mr-1" /> Sign Now
            </Link>
          )}
        </div>

        {/* Signature progress */}
        {agreement.signatures && agreement.signatures.length > 0 && (
          <div className="flex items-center gap-3">
            {['landlord', 'tenant'].map((role) => {
              const sig = agreement.signatures.find((s) => s.userId === role);
              return (
                <div key={role} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      sig
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {sig ? <CheckCircle2 className="w-3.5 h-3.5" /> : role[0].toUpperCase()}
                  </div>
                  <span className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
                    {role}
                  </span>
                  {sig && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      {new Date(sig.signedAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client Page (server component shell only) ─────────────────────────────
// The page-level "page.tsx" renders LoadingState / FailureState; this component
// receives data and re-renders on retry.
export default function TenantAgreementsClient({
  initialAgreements,
  onRetry,
}: TenantAgreementsClientProps) {
  // Retry handling is delegated to the parent page.tsx which resets state.
  // Here we derive state purely from initialAgreements (server-fetched).
  // A retry means the parent re-fetches and this component gets fresh data.
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [error, setError] = useState<Error | null>(null);

  const agreements = initialAgreements;

  const retry = useCallback(() => {
    setError(null);
    onRetry?.();
  }, [onRetry]);

  // Derive stats
  const total = agreements.length;
  const active = agreements.filter((a) => a.status === 'fully_signed').length;
  const pending = agreements.filter((a) =>
    ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
      a.status
    )
  ).length;
  const expired = agreements.filter((a) => a.status === 'expired').length;

  const statusTabs: { value: TabValue; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: total },
    { value: 'active', label: 'Active', count: active },
    { value: 'pending', label: 'Pending', count: pending },
    { value: 'expired', label: 'Expired', count: expired },
  ];

  const filteredAgreements =
    activeTab === 'all'
      ? agreements
      : agreements.filter((a) => {
          if (activeTab === 'active') return a.status === 'fully_signed';
          if (activeTab === 'pending')
            return ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
              a.status
            );
          if (activeTab === 'expired') return a.status === 'expired';
          return true;
        });

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            My Agreements
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            View and manage your rental agreements
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={0} icon={<FileText className="w-5 h-5" />} />
          <StatCard label="Active" value={0} icon={<CheckCircle2 className="w-5 h-5" />} />
          <StatCard label="Pending" value={0} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Expired" value={0} icon={<AlertTriangle className="w-5 h-5" />} />
        </div>
        <FailureState
          title="Unable to load agreements"
          description={error.message}
          onRetry={retry}
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          My Agreements
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          View and manage your rental agreements
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} icon={<FileText className="w-5 h-5" />} />
        <StatCard
          label="Active"
          value={active}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} />
        <StatCard
          label="Expired"
          value={expired}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <ListFilter className="w-4 h-4 self-center mr-1" style={{ color: 'var(--muted)' }} />
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
              activeTab === tab.value
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'border-transparent hover:bg-muted/50'
            )}
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs px-1.5 py-0 min-w-[20px]">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Agreement cards (or skeleton / empty / error already handled above) */}
      <div className="space-y-4">
        {filteredAgreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
        {filteredAgreements.length === 0 && <EmptyAgreementState tab={activeTab} />}
      </div>
    </div>
  );
}
