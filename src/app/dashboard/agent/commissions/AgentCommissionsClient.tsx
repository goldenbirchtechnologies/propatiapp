'use client';

import { useState, useCallback } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Table2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FailureState } from '@/components/feedback/FailureState';
import { LoadingState } from '@/components/feedback/LoadingState';

// ─── Types ────────────────────────────────────────────────────────────────────
type CommissionStatus = 'paid' | 'pending' | 'cancelled';

interface Commission {
  id: string;
  deal: string;
  amount: number;
  rate: string;
  date: string;
  status: CommissionStatus;
  client: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface AgentCommissionsClientProps {
  initialCommissions: Commission[];
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  onRetry?: () => void;
}

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<CommissionStatus, { class: string; label: string }> = {
  paid: { class: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#262626]', label: 'Paid' },
  pending: { class: 'bg-[#262626] text-neutral-300 border border-[#262626]', label: 'Pending' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border border-[#262626]', label: 'Cancelled' },
};

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const SkeletonStat = () => (
  <div className="card p-5">
    <Skeleton className="h-3 w-20 mb-2" />
    <Skeleton className="h-8 w-24" />
  </div>
);

const SkeletonRow = () => (
  <div className="card">
    <div className="p-5 flex items-center gap-4">
      <Skeleton className="h-4 w-1/3 flex-shrink-0" />
      <Skeleton className="h-4 w-20 flex-shrink-0" />
      <Skeleton className="h-4 w-24 flex-shrink-0" />
      <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
      <Skeleton className="h-4 w-20 flex-shrink-0 hidden lg:block" />
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
function CommissionStatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0"
          style={{ background: 'bg-[#00ff66]/10', color: 'text-white' }}
        >
          {Icon}
        </div>
        <div>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            {label}
          </p>
          <p
            className="text-2xl font-headline-sm font-bold"
            style={{
              color: accent || 'text-white',
            }}
          >
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center">
      <DollarSign className="w-16 h-16 mx-auto mb-4" className="text-neutral-400", opacity: 0.4 }} />
      <h3 className="font-headline-sm font-bold text-lg mb-2" className="text-white" }}>
        No commissions yet
      </h3>
      <p className="text-xs font-label-md uppercase tracking-wider mb-6 max-w-sm mx-auto" className="text-neutral-400" }}>
        Your earnings will appear here when deals are closed and transactions are released for you.
      </p>
      <Button variant="outline" asChild>
        <a href="/dashboard/agent/pipeline">View Deal Pipeline</a>
      </Button>
    </div>
  );
}

// ─── Commission Row ───────────────────────────────────────────────────────────
function CommissionRow({ commission }: { commission: Commission }) {
  const sc = statusConfig[commission.status] || statusConfig.pending;

  const labelClass = cn(
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
    sc.class
  );

  return (
    <div className="card">
      <div className="p-5 flex flex-wrap items-center gap-4">
        {/* Deal */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" className="text-white" }}>
            {commission.deal}
          </p>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            Client: {commission.client}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold" className="text-white" }}>
            {formatCurrency(commission.amount)}
          </p>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            @ {commission.rate}
          </p>
        </div>

        {/* Status badge */}
        <span className={labelClass}>{sc.label}</span>

        {/* Date */}
        <div className="hidden lg:block flex-shrink-0" style={{ minWidth: 70 }}>
          <p
            className="text-xs font-label-md uppercase tracking-wider"
            className="text-neutral-400" }}
          >
            {new Date(commission.date).toLocaleDateString('en-NG', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Filter bar sub-component ─────────────────────────────────────────────────
function FilterBar({
  filter,
  setFilter,
  counts,
}: {
  filter: string;
  setFilter: (v: string) => void;
  counts: { all: number; paid: number; pending: number; cancelled: number };
}) {
  return (
    <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
          <Table2 className="w-3.5 h-3.5 inline mr-1" />
          Filter
        </span>
        {[
          { value: 'all', label: 'All' },
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium border transition-all',
              filter === f.value
                ? 'text-white border-[#262626] bg-surface-container-low'
                : 'border-transparent hover:bg-[#171717]/50'
            )}
          >
            {f.label}
            <Badge
              variant="secondary"
              className="ml-2 text-xs px-1.5 py-0 min-w-[20px]"
            >
              {counts[f.value as keyof typeof counts]}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function AgentCommissionsClient({
  initialCommissions,
  totalEarned,
  totalPaid,
  totalPending,
  onRetry,
}: AgentCommissionsClientProps) {
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const retry = useCallback(() => {
    setError(null);
    onRetry?.();
  }, [onRetry]);

  // Stats (static from server pre-fetch)
  const commissions = initialCommissions;
  const counts = {
    all: commissions.length,
    paid: commissions.filter((c) => c.status === 'paid').length,
    pending: commissions.filter((c) => c.status === 'pending').length,
    cancelled: commissions.filter((c) => c.status === 'cancelled').length,
  };

  const filtered =
    filter === 'all'
      ? commissions
      : commissions.filter((c) => c.status === filter);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CommissionStatCard label="Total Earned" value={0} icon={<DollarSign className="w-5 h-5" />} />
          <CommissionStatCard label="Paid Out" value={0} icon={<CheckCircle2 className="w-5 h-5" />} accent="var(--green)" />
          <CommissionStatCard label="Pending" value={0} icon={<Clock className="w-5 h-5" />} accent="var(--amber)" />
        </div>
        <FailureState
          title="Unable to load commissions"
          description={error.message}
          onRetry={retry}
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CommissionStatCard label="Total Earned" value={totalEarned} icon={<DollarSign className="w-5 h-5" />} />
        <CommissionStatCard label="Paid Out" value={totalPaid} icon={<CheckCircle2 className="w-5 h-5" />} />
        <CommissionStatCard label="Pending" value={totalPending} icon={<Clock className="w-5 h-5" />} />
      </div>

      {/* Export bar */}
      <div className="card p-4 flex items-center justify-between">
        <p className="text-sm font-medium" className="text-white" }}>
          Commission summary
        </p>
        <Button variant="outline" className="gap-2" asChild>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Filter */}
      <FilterBar filter={filter} setFilter={setFilter} counts={counts} />

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((c) => <CommissionRow key={c.id} commission={c} />)
        )}
      </div>
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div>
      <h1
        className="font-headline-sm font-bold"
        style={{ fontSize: 'font-headline-sm', color: 'text-white' }}
      >
        Commissions
      </h1>
      <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400", marginTop: 'mt-1' }}>
        Track earnings and payouts per deal
      </p>
    </div>
  );
}
