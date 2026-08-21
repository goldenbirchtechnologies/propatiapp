'use client';

import { useState, useCallback } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Eye,
  Building2,
  UserPlus,
  CheckCircle2,
  ShoppingBag,
  Home as HomeIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FailureState } from '@/components/feedback/FailureState';
import { LoadingState } from '@/components/feedback/LoadingState';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  phone: string;
  type: string;
  minBudget: number;
  maxBudget: number;
  lastContact: string;
  createdAt: string;
}

type ClientFilter = 'all' | 'Buyer' | 'Renter';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AgentClientsClientProps {
  initialClients: Client[];
  onRetry?: () => void;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const SkeletonStat = () => (
  <div className="card p-5">
    <Skeleton className="h-3 w-20 mb-2" />
    <Skeleton className="h-8 w-10" />
  </div>
);

const SkeletonRow = () => (
  <div className="card p-5">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
      <Skeleton className="h-8 w-28 rounded-md flex-shrink-0" />
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
function ClientStatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0"
          style={{
            background: 'bg-[#00ff66]/10',
            color: 'text-white',
          }}
        >
          {Icon}
        </div>
        <div>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            {label}
          </p>
          <p className="text-2xl font-headline-sm font-bold" className="text-white" }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyClientsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center">
      <Users className="w-16 h-16 mx-auto mb-4" className="text-neutral-400", opacity: 0.4 }} />
      <h3 className="font-headline-sm font-bold text-lg mb-2" className="text-white" }}>
        No clients yet
      </h3>
      <p className="text-xs font-label-md uppercase tracking-wider mb-6 max-w-sm mx-auto" className="text-neutral-400" }}>
        Your client portfolio is empty. Start by adding buyers or sellers to track your deals and relationships.
      </p>
      <Button onClick={onAdd} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Add First Client
      </Button>
    </div>
  );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({ client }: { client: Client }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'bg-[#00ff66]/10', color: 'text-white' }}
        >
          <Users className="h-4 w-4" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" className="text-white" }}>
            {client.name}
          </p>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            {client.phone}
          </p>
        </div>

        {/* Type badge */}
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0',
            client.type === 'Buyer'
              ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#262626]'
              : 'bg-[#262626] text-neutral-300 border border-[#262626]'
          )}
        >
          {client.type}
        </span>

        {/* Budget */}
        <div className="text-right hidden md:block flex-shrink-0">
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Budget</p>
          <p className="text-sm font-medium" className="text-white" }}>
            {formatCurrency(client.minBudget)} – {formatCurrency(client.maxBudget)}
          </p>
        </div>

        {/* Last contact */}
        <div className="text-right hidden lg:block flex-shrink-0" style={{ minWidth: 90 }}>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Last Contact</p>
          <p className="text-sm" className="text-white" }}>
            {new Date(client.lastContact).toLocaleDateString('en-NG', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href={`tel:${client.phone}`}
            className="p-2 rounded-md hover:bg-[#171717]/50"
            title="Call"
          >
            <Phone className="w-4 h-4" className="text-neutral-400" }} />
          </Link>
          <Link
            href={`mailto:${client.name.replace(/\s+/g, '.').toLowerCase()}@example.com`}
            className="p-2 rounded-md hover:bg-[#171717]/50"
            title="Email"
          >
            <Mail className="w-4 h-4" className="text-neutral-400" }} />
          </Link>
          <Link
            href={`/dashboard/agent/pipeline?clientId=${client.id}`}
            className="p-2 rounded-md hover:bg-[#171717]/50"
            title="View Deal"
          >
            <Eye className="w-4 h-4" className="text-neutral-400" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function AgentClientsClient({
  initialClients,
  onRetry,
}: AgentClientsClientProps) {
  const [clients] = useState(initialClients);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<ClientFilter>('all');

  const retry = useCallback(() => {
    setError(null);
    onRetry?.();
  }, [onRetry]);

  // Derived stats
  const total = clients.length;
  const buyers = clients.filter((c) => c.type === 'Buyer').length;
  const renters = clients.filter((c) => c.type === 'Renter').length;

  const filtered =
    filter === 'all' ? clients : clients.filter((c) => c.type === filter);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ClientStatCard label="Total" value={0} icon={<Users className="w-5 h-5" />} />
          <ClientStatCard label="Buyers" value={0} icon={<ShoppingBag className="w-5 h-5" />} />
          <ClientStatCard label="Renters" value={0} icon={<HomeIcon className="w-5 h-5" />} />
          <ClientStatCard label="Active" value={0} icon={<CheckCircle2 className="w-5 h-5" />} />
        </div>
        <FailureState
          title="Unable to load clients"
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ClientStatCard label="Total Clients" value={total} icon={<Users className="w-5 h-5" />} />
        <ClientStatCard label="Buyers" value={buyers} icon={<ShoppingBag className="w-5 h-5" />} />
        <ClientStatCard label="Renters" value={renters} icon={<HomeIcon className="w-5 h-5" />} />
        <ClientStatCard label="Active" value={total} icon={<CheckCircle2 className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
            <Building2 className="w-3.5 h-3.5 inline mr-1" />
            Filter
          </span>
          {(['all', 'Buyer', 'Renter'] as ClientFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-all capitalize',
                filter === f
                  ? 'text-white border-[#262626] bg-surface-container-low'
                  : 'border-transparent hover:bg-[#171717]/50'
              )}
            >
              {f}
              {f !== 'all' && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs px-1.5 py-0 min-w-[20px]"
                >
                  {f === 'Buyer' ? buyers : renters}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {/* Skeleton is shown only on the very first load, controlled by parent page.tsx */}
        {clients.length === 0 ? (
          <EmptyClientsState onAdd={() => {}} />
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3" className="text-neutral-400", opacity: 0.4 }} />
            <p className="text-sm font-medium" className="text-white" }}>
              No clients in this category
            </p>
            <p className="text-xs font-label-md uppercase tracking-wider mt-1" className="text-neutral-400" }}>
              Try clearing the filter to see all clients.
            </p>
          </div>
        ) : (
          filtered.map((client) => <ClientRow key={client.id} client={client} />)
        )}
      </div>
    </div>
  );
}

// ─── Page Header sub-component ────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1
          className="font-headline-sm font-bold"
          style={{ fontSize: 'font-headline-sm', color: 'text-white' }}
        >
          My Clients
        </h1>
        <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400", marginTop: 'mt-1' }}>
          Manage lead relationships and budgets
        </p>
      </div>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Add Client
      </Button>
    </div>
  );
}
