'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  UserPlus,
  Users,
  Handshake,
  Building2,
  MessageSquare,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Copy,
  BadgeCheck,
  Inbox,
  TrendingUp,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  AgentBreadcrumb,
  AgentCard,
  AgentCardHeader,
  AgentEmptyState,
  AgentStatCard,
  AgentTableWrap,
  AgentTd,
  AgentTh,
  FilterPill,
  PrimaryAction,
  SecondaryAction,
  ToneBadge,
  ToolbarSearch,
  ToolbarSelect,
} from '../_lib/agent-ui';
import {
  formatDate,
  formatNairaCompact,
  formatNairaValue,
  formatRelative,
  humanise,
  initials,
} from '../_lib/agent-deal-format';

export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  type: string;
  bio: string | null;
  ninVerified: boolean;
  bvnVerified: boolean;
  dealsCount: number;
  activeDeals: number;
  closedDeals: number;
  managedValue: number;
  lastContact: string;
  clientSince: string;
  properties: { id: string; title: string; address: string; price: number }[];
  agreementIds: string[];
};

export type ClientStats = {
  total: number;
  corporate: number;
  private: number;
  activeDeals: number;
  managedValue: number;
};

const TYPE_TONE: Record<string, string> = {
  Seller: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25',
  Buyer: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
  Landlord: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
  Renter: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/25',
};

export default function AgentClientsClient({
  initialClients,
  stats,
}: {
  initialClients: ClientRecord[];
  stats: ClientStats;
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dealFilter, setDealFilter] = useState('all');
  const [sort, setSort] = useState('value_desc');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    initialClients.forEach((c) => map.set(c.type, (map.get(c.type) ?? 0) + 1));
    return map;
  }, [initialClients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = initialClients.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (dealFilter === 'active' && c.activeDeals === 0) return false;
      if (dealFilter === 'closed' && c.closedDeals === 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q)
      );
    });
    return [...rows].sort((a, b) => {
      if (sort === 'value_desc') return b.managedValue - a.managedValue;
      if (sort === 'activity_desc') {
        return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime();
      }
      if (sort === 'deals_desc') return b.dealsCount - a.dealsCount;
      return a.name.localeCompare(b.name);
    });
  }, [initialClients, search, typeFilter, dealFilter, sort]);

  const exportClientBook = () => {
    const header = [
      'Client',
      'Type',
      'Email',
      'Phone',
      'Active Deals',
      'Closed Deals',
      'Managed Value',
      'Last Touchpoint',
    ];
    const rows = filtered.map((c) => [
      c.name,
      c.type,
      c.email,
      c.phone ?? '',
      String(c.activeDeals),
      String(c.closedDeals),
      String(c.managedValue),
      formatDate(c.lastContact),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propati-agent-client-book-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <AgentBreadcrumb
            items={[
              { label: 'Sales & CRM', href: '/dashboard/agent' },
              { label: 'Clients' },
              { label: 'Institutional Stakeholder & Client Directory', current: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Institutional Client Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-mono-numeric text-[12px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {stats.total} Total Portfolios
            </span>
          </div>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Stakeholders, vendors and counterparties connected to your mandates, with their
            relationship history, managed portfolio and compliance posture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SecondaryAction icon={<Download className="h-4 w-4" />} onClick={exportClientBook}>
            Export Client Book
          </SecondaryAction>
          <Link
            href="/dashboard/agent/clients/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Client</span>
          </Link>
        </div>
      </div>

      {/* ── Metric cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgentStatCard
          label="Total Clients"
          value={String(stats.total)}
          icon={<Users className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center justify-between gap-2">
              <span>
                {stats.corporate} vendor{stats.corporate === 1 ? '' : 's'} · {stats.private} private
              </span>
              <Building2 className="h-4 w-4 text-zinc-500" />
            </span>
          }
        />
        <AgentStatCard
          label="Active Deals"
          value={`${stats.activeDeals} Deals`}
          icon={<Handshake className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center justify-between gap-2">
              <span>Across the client book</span>
              <TrendingUp className="h-4 w-4 text-zinc-500" />
            </span>
          }
        />
        <AgentStatCard
          label="Managed Asset Value"
          value={formatNairaCompact(stats.managedValue)}
          icon={<ShieldCheck className="h-5 w-5" />}
          sublabel={
            <span className="flex items-center justify-between gap-2">
              <span>Cumulative under mandate</span>
              <BadgeCheck className="h-4 w-4 text-zinc-500" />
            </span>
          }
        />
        <AgentStatCard
          label="Cadence & Engagement"
          value={`${stats.total > 0 ? Math.round((stats.total > 0 ? 1 : 0) * 100) : 0}% Active`}
          icon={<Activity className="h-5 w-5" />}
          accent="amber"
          sublabel={
            <span className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {filtered.length} in view
              </span>
              <Activity className="h-4 w-4 text-amber-500" />
            </span>
          }
        />
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <AgentCard className="space-y-3 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="lg:flex-1">
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search clients by legal entity name, email, or phone…"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
            <ToolbarSelect
              ariaLabel="Client type filter"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'Client Type: All' },
                { value: 'Seller', label: 'Vendor / Seller' },
                { value: 'Landlord', label: 'Landlord / Lessor' },
                { value: 'Buyer', label: 'Buyer / Acquirer' },
                { value: 'Renter', label: 'Tenant / Lessee' },
              ]}
            />
            <ToolbarSelect
              ariaLabel="Deal status filter"
              value={dealFilter}
              onChange={setDealFilter}
              options={[
                { value: 'all', label: 'Deal Status: All' },
                { value: 'active', label: 'Active In-Flight Deal' },
                { value: 'closed', label: 'Conveyed & Retained' },
              ]}
            />
            <ToolbarSelect
              ariaLabel="Sort order"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'value_desc', label: 'Sort: Highest Managed Value' },
                { value: 'activity_desc', label: 'Most Recent Activity' },
                { value: 'deals_desc', label: 'Most Active Deals' },
                { value: 'alpha', label: 'Alphabetical (A-Z)' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Active Criteria:
          </span>
          <FilterPill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} count={initialClients.length}>
            All Types
          </FilterPill>
          {Array.from(typeCounts).map(([type, count]) => (
            <FilterPill
              key={type}
              active={typeFilter === type}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
              count={count}
            >
              {type}
            </FilterPill>
          ))}
          <FilterPill
            active={dealFilter === 'active'}
            onClick={() => setDealFilter(dealFilter === 'active' ? 'all' : 'active')}
            count={initialClients.filter((c) => c.activeDeals > 0).length}
          >
            Active Deals (&gt;0)
          </FilterPill>
          {(typeFilter !== 'all' || dealFilter !== 'all' || search) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setDealFilter('all');
                setSearch('');
              }}
              className="ml-auto text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </AgentCard>

      {/* ── Stakeholder table ───────────────────────────────────────────── */}
      <AgentTableWrap>
        <AgentCardHeader
          title="Institutional Stakeholder Table"
          subtitle={`${filtered.length} of ${initialClients.length} client${initialClients.length === 1 ? '' : 's'} in the directory`}
          icon={<Users className="h-5 w-5" />}
        />
        {initialClients.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No clients yet"
            description="Your client portfolio is empty. Start by adding buyers or sellers to track your deals and relationships."
            action={
              <Link
                href="/dashboard/agent/clients/new"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-900"
              >
                <UserPlus className="h-4 w-4" />
                Add First Client
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <AgentEmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No clients in this category"
            description="Try clearing the filter to see all clients."
          />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <tr>
                <AgentTh className="min-w-[280px]">Client / Stakeholder</AgentTh>
                <AgentTh className="min-w-[220px]">Contact &amp; Location</AgentTh>
                <AgentTh className="min-w-[190px]">Relationship Mandate</AgentTh>
                <AgentTh className="min-w-[170px]">Deals &amp; Pipeline</AgentTh>
                <AgentTh className="min-w-[170px] text-right">Managed Portfolio</AgentTh>
                <AgentTh className="min-w-[190px]">Touchpoint &amp; Status</AgentTh>
                <AgentTh className="w-24 pr-4 text-right">Actions</AgentTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.map((client) => {
                const tone = TYPE_TONE[client.type] ?? TYPE_TONE.Renter;
                const verified = client.ninVerified || client.bvnVerified;
                return (
                  <tr
                    key={client.id}
                    className="group align-top transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <AgentTd className="align-top">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-emerald-700 dark:bg-zinc-800 dark:text-emerald-400">
                          {client.avatarUrl ? (
                            <img
                              src={client.avatarUrl}
                              alt={client.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            initials(client.name)
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/dashboard/agent/clients/${client.id}`}
                              className="truncate font-semibold text-zinc-900 transition-colors hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
                            >
                              {client.name}
                            </Link>
                            {verified ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-600/10 px-1.5 py-0.5 font-mono-numeric text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                <BadgeCheck className="h-3 w-3" /> KYC
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                            <ToneBadge className={tone}>{client.type}</ToneBadge>
                            <span>·</span>
                            <span className="text-zinc-500">{humanise(client.role)}</span>
                          </div>
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="align-top">
                      <div className="space-y-1">
                        {client.phone ? (
                          <div className="flex items-center gap-1.5 font-mono-numeric text-zinc-900 dark:text-white">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{client.phone}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="max-w-[160px] truncate">{client.email}</span>
                          <button
                            type="button"
                            title="Copy email"
                            onClick={() => navigator.clipboard?.writeText(client.email)}
                            className="shrink-0 text-zinc-500 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="inline-flex items-center gap-1 pt-0.5 text-[11px] font-medium text-zinc-500">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Client since {formatDate(client.clientSince)}
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="align-top">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded bg-emerald-600/10 px-2.5 py-1 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {client.activeDeals > 0
                            ? 'Accepted Agent Mandate'
                            : 'Dormant / Completed Mandate'}
                        </div>
                        <div className="pl-1 text-xs text-zinc-500">
                          {client.properties[0]
                            ? `${client.properties[0].title}${client.properties.length > 1 ? ` +${client.properties.length - 1} more` : ''}`
                            : 'No linked properties'}
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {client.activeDeals} Active
                          </span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            {client.closedDeals} Closed
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          {client.type === 'Seller' || client.type === 'Landlord'
                            ? 'Vendor representation'
                            : 'Acquisition mandate'}
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="text-right align-top">
                      <div className="space-y-1">
                        <div className="font-mono-numeric text-base font-bold text-zinc-900 dark:text-white">
                          {formatNairaValue(client.managedValue)}
                        </div>
                        <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {client.managedValue > 0 ? 'NGN Escrow Protected' : 'No escrow value'}
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                            {formatRelative(client.lastContact)}
                          </span>
                        </div>
                        <div className="pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                          {client.activeDeals > 0
                            ? `${client.activeDeals} matter${client.activeDeals === 1 ? '' : 's'} in flight`
                            : 'No open matters'}
                        </div>
                        <div className="pl-4 text-[11px] text-zinc-500">
                          Via Portal Encrypted Messaging
                        </div>
                      </div>
                    </AgentTd>
                    <AgentTd className="pr-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1 pt-1">
                        <Link
                          href={`/dashboard/agent/messages?recipientId=${client.id}`}
                          title="Start direct message"
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/agent/clients/${client.id}`}
                          title="Client dossier"
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="More actions"
                            onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === client.id ? (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                className="fixed inset-0 z-10 cursor-default"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-zinc-900">
                                {client.phone ? (
                                  <a
                                    href={`tel:${client.phone}`}
                                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                  >
                                    <Phone className="h-3.5 w-3.5" /> Call
                                  </a>
                                ) : null}
                                <a
                                  href={`mailto:${client.email}`}
                                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  <Mail className="h-3.5 w-3.5" /> Email
                                </a>
                                <Link
                                  href={`/dashboard/agent/clients/${client.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Dossier &amp; actions
                                </Link>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </AgentTd>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AgentTableWrap>
    </div>
  );
}
