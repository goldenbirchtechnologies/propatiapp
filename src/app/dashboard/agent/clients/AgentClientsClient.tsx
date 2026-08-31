'use client';

import { useState, useCallback } from 'react';
import { cn, formatNaira } from '@/lib/utils';
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
  MoreVertical,
  MessageSquare,
  FileText,
  Archive,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FailureState } from '@/components/feedback/FailureState';
import { LoadingState } from '@/components/feedback/LoadingState';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  type: 'Landlord' | 'Renter' | 'Buyer' | 'Seller';
  minBudget: number;
  maxBudget: number;
  lastContact: string;
  createdAt: string;
  dealsCount: number;
  managedValue: number;
  assignedAgent: string | null;
  linkedProperties: { title: string; address: string }[];
}

type ClientFilter = 'all' | 'Landlord' | 'Renter' | 'Buyer' | 'Seller';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AgentClientsClientProps {
  initialClients: Client[];
  onRetry?: () => void;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const SkeletonStat = () => (
  <div className="glass-card p-5">
    <Skeleton className="h-3 w-20 mb-2" />
    <Skeleton className="h-8 w-10" />
  </div>
);

const SkeletonRow = () => (
  <div className="glass-card p-5">
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
    <div className="glass-card p-5">
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
          <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className="text-2xl font-headline-sm font-bold text-white">
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
    <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
      <Users className="w-16 h-16 mx-auto mb-4 text-zinc-500" style={{ opacity: 0.4 }} />
      <h3 className="font-headline-sm font-bold text-lg mb-2 text-white">
        No clients yet
      </h3>
      <p className="text-xs font-label-sm uppercase tracking-wider mb-6 max-w-sm mx-auto text-zinc-500">
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
  const typeConfig: Record<string, { icon: React.ReactNode; className: string }> = {
    Landlord: {
      icon: <Building2 className="h-3 w-3" />,
      className: 'bg-[#00ff66]/10 text-[#00ff66] border border-white/[0.08]',
    },
    Seller: {
      icon: <Building2 className="h-3 w-3" />,
      className: 'bg-[#00ff66]/10 text-[#00ff66] border border-white/[0.08]',
    },
    Buyer: {
      icon: <ShoppingBag className="h-3 w-3" />,
      className: 'bg-blue-500/10 text-blue-400 border border-white/[0.08]',
    },
    Renter: {
      icon: <HomeIcon className="h-3 w-3" />,
      className: 'bg-zinc-800 text-zinc-300 border border-white/[0.08]',
    },
  };

  const config = typeConfig[client.type] || typeConfig.Renter;
  const lastContactDate = new Date(client.lastContact);
  const contactRelative = getRelativeTime(lastContactDate);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          }}
        >
          {client.avatarUrl ? (
            <img src={client.avatarUrl} alt={client.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            client.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {client.name}
            </p>
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', config.className)}>
              {config.icon}
              {client.type}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
            {client.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
            {client.assignedAgent && (
              <span className="flex items-center gap-1 truncate">
                Agent: {client.assignedAgent}
              </span>
            )}
            {client.linkedProperties.length > 0 && (
              <span className="flex items-center gap-1 truncate">
                {client.linkedProperties[0].title || client.linkedProperties[0].address || 'Linked property'}
                {client.linkedProperties.length > 1 && ` +${client.linkedProperties.length - 1}`}
              </span>
            )}
          </div>
        </div>

        {/* Contextual financial / portfolio info */}
        <div className="text-right hidden xl:block flex-shrink-0" style={{ minWidth: 140 }}>
          {client.type === 'Landlord' || client.type === 'Seller' ? (
            <>
              <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Portfolio</p>
              <p className="text-sm font-medium text-white">
                {client.dealsCount > 0 ? `${client.dealsCount} Managed Unit${client.dealsCount === 1 ? '' : 's'}` : 'No units'}
              </p>
              {client.managedValue > 0 && (
                <p className="text-xs text-zinc-500">{formatNaira(client.managedValue)} value</p>
              )}
            </>
          ) : client.dealsCount > 0 ? (
            <>
              <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Active Deals</p>
              <p className="text-sm font-medium text-white">{client.dealsCount}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Status</p>
              <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">Unset</Badge>
            </>
          )}
        </div>

        {/* Deals count */}
        <div className="text-right hidden lg:block flex-shrink-0" style={{ minWidth: 100 }}>
          <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Deals</p>
          <p className="text-sm font-medium text-white">{client.dealsCount}</p>
        </div>

        {/* Last contact */}
        <div className="text-right hidden 2xl:block flex-shrink-0" style={{ minWidth: 110 }}>
          <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Last Contact</p>
          <p className="text-sm text-white" title={lastContactDate.toISOString()}>
            {contactRelative}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs gap-1"
            asChild
            title="Message client"
          >
            <Link href={`/dashboard/agent/messages?recipientId=${client.id}`}>
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs gap-1"
            asChild
            title="View client details"
          >
            <Link href={`/dashboard/agent/pipeline?clientId=${client.id}`}>
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="More actions"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4 text-zinc-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`tel:${client.phone}`} className="gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`mailto:${client.email}`} className="gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/agent/clients/${client.id}`} className="gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-zinc-400">
                <Edit className="w-3.5 h-3.5" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-zinc-400">
                <Archive className="w-3.5 h-3.5" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function AgentClientsClient({
  initialClients,
  onRetry,
}: AgentClientsClientProps) {
  const [clients] = useState(initialClients);
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(() => {
    setError(null);
    onRetry?.();
  }, [onRetry]);

  // Derived stats
  const total = clients.length;
  const landlords = clients.filter((c) => c.type === 'Landlord').length;
  const sellers = clients.filter((c) => c.type === 'Seller').length;
  const renters = clients.filter((c) => c.type === 'Renter').length;
  const buyers = clients.filter((c) => c.type === 'Buyer').length;

  const activeTypes: ClientFilter[] = ['all'];
  if (landlords > 0) activeTypes.push('Landlord');
  if (sellers > 0) activeTypes.push('Seller');
  if (renters > 0) activeTypes.push('Renter');
  if (buyers > 0) activeTypes.push('Buyer');

  const [filter, setFilter] = useState<ClientFilter>('all');

  const filtered =
    filter === 'all' ? clients : clients.filter((c) => c.type === filter);

  const counts: Record<ClientFilter, number> = {
    all: total,
    Landlord: landlords,
    Seller: sellers,
    Renter: renters,
    Buyer: buyers,
  };

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
        <ClientStatCard label="Sellers" value={sellers} icon={<Building2 className="w-5 h-5" />} />
        <ClientStatCard label="Buyers" value={buyers} icon={<ShoppingBag className="w-5 h-5" />} />
        <ClientStatCard label="Renters" value={renters} icon={<HomeIcon className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">
            <Building2 className="w-3.5 h-3.5 inline mr-1" />
            Filter
          </span>
          {activeTypes.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-all capitalize',
                filter === f
                  ? 'text-white border-white/[0.08] bg-zinc-950/50'
                  : 'border-transparent hover:bg-[#171717]/50'
              )}
            >
              {f}
              {f !== 'all' && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs px-1.5 py-0 min-w-[20px]"
                >
                  {counts[f]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <EmptyClientsState onAdd={() => {}} />
        ) : filtered.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-500" style={{ opacity: 0.4 }} />
            <p className="text-sm font-medium text-white">
              No clients in this category
            </p>
            <p className="text-xs font-label-sm uppercase tracking-wider mt-1 text-zinc-500">
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
        <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500 mt-1">
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
