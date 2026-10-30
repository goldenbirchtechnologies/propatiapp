'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Plus,
  Eye,
  UserCheck,
  Clock,
  FileEdit,
} from 'lucide-react';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';

// ─── Real AgreementStatus enum from prisma/schema.prisma ───
type AgreementStatus =
  | 'draft'
  | 'pending_landlord'
  | 'pending_tenant'
  | 'tenant_signed'
  | 'landlord_signed'
  | 'fully_signed'
  | 'terminated'
  | 'expired';

interface Agreement {
  id: string;
  type: string;
  status: AgreementStatus;
  rentAmount: number | null;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  listing: { id: string; title: string; area: string | null } | null;
  tenant: { id: string; fullName: string | null } | null;
  landlord: { id: string; fullName: string | null } | null;
}

// Pill order matches the design; counts computed live.
const FILTERS: Array<{ key: AgreementStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_landlord', label: 'Pending Landlord' },
  { key: 'pending_tenant', label: 'Pending Tenant' },
  { key: 'fully_signed', label: 'Fully Signed' },
  { key: 'terminated', label: 'Terminated' },
  { key: 'expired', label: 'Expired' },
];

const STATUS_META: Record<AgreementStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  pending_landlord: { label: 'Pending Landlord', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  pending_tenant: { label: 'Pending Tenant', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  tenant_signed: { label: 'Tenant Signed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  landlord_signed: { label: 'Landlord Signed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  fully_signed: { label: 'Fully Signed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  terminated: { label: 'Terminated', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  expired: { label: 'Expired', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

const TYPE_LABELS: Record<string, string> = {
  tenancy: 'Residential Tenancy Deed',
  commercial: 'Commercial Lease',
  short_let: 'Short-let Agreement',
  sale: 'Sale Agreement',
  renewal: 'Lease Renewal',
};

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

function ngn(amount: number | null): string {
  if (amount === null) return '—';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function termMonths(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const months = Math.round((e.getTime() - s.getTime()) / (30.44 * 86400000));
  return months > 0 ? `${months} Months` : null;
}

function initialsOf(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EstateManagerAgreementsClient({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const { organization } = useActiveOrganization();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AgreementStatus | 'all'>('all');

  // The server page fetches agreements for this estate manager's scope; the
  // client applies text search and status filtering over that set.
  const agreements = useMemo(() => initialAgreements, [initialAgreements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agreements.filter((a) => {
      const matchesStatus = filter === 'all' || a.status === filter;
      const matchesQuery =
        !q ||
        [a.listing?.title, a.listing?.area, a.tenant?.fullName, a.landlord?.fullName, a.type]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [agreements, query, filter]);

  // Stats from real records
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: agreements.length };
    for (const a of agreements) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [agreements]);

  const fullySigned = counts.fully_signed ?? 0;
  const awaiting =
    (counts.pending_landlord ?? 0) + (counts.pending_tenant ?? 0) +
    (counts.tenant_signed ?? 0) + (counts.landlord_signed ?? 0);
  const drafts = counts.draft ?? 0;

  const activePills = FILTERS.filter((f) => f.key === 'all' || (counts[f.key] ?? 0) > 0);

  const exportCsv = () => {
    const header = ['Reference', 'Type', 'Property', 'Tenant', 'Landlord', 'Start', 'End', 'Rent', 'Period', 'Status'];
    const rows = filtered.map((a) => [
      a.id.slice(0, 8).toUpperCase(),
      TYPE_LABELS[a.type] ?? a.type,
      a.listing?.title ?? '',
      a.tenant?.fullName ?? '',
      a.landlord?.fullName ?? '',
      a.startDate ?? '',
      a.endDate ?? '',
      a.rentAmount ?? '',
      a.rentPeriod ?? '',
      a.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agreements-${organization?.name ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default' }: {
    icon: typeof FileText;
    label: string;
    value: string | number;
    sub: string;
    tone?: 'default' | 'emerald' | 'amber';
  }) => {
    const iconCls =
      tone === 'emerald'
        ? 'bg-primary/10 text-primary dark:text-[#4edea3]'
        : tone === 'amber'
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    const valueCls = tone === 'emerald' ? 'text-primary dark:text-[#4edea3]' : tone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white';
    return (
      <div className={`${CARD} group transition-shadow hover:shadow-md`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={LABEL}>{label}</span>
            <div className={`mt-2 text-3xl font-bold tracking-tight ${valueCls}`}>{value}</div>
            <p className={`mt-1 ${MUTED}`}>{sub}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${iconCls}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Agreements</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {organization?.name ?? 'Live Ledgers'}
            </span>
          </div>
          <p className={`mt-1 text-sm ${MUTED}`}>
            Track, execute, and audit institutional portfolio tenancy deeds across Nigerian asset holdings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="group inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-[18px] w-[18px] text-zinc-400 transition-colors group-hover:text-primary" />
            Audit Export
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">CSV</span>
          </button>
          <Link
            href="/dashboard/estate-manager/units"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)]"
          >
            <Plus className="h-[18px] w-[18px]" />
            Create Agreement
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={FileText} label="Total Instruments" value={counts.all} sub={`Across ${organization?.name ?? 'your portfolio'}`} />
        <Kpi icon={UserCheck} label="Fully Executed" value={fullySigned} sub="Active executed leases" tone="emerald" />
        <Kpi icon={Clock} label="Awaiting Signature" value={awaiting} sub="Landlord or tenant action required" tone="amber" />
        <Kpi icon={FileEdit} label="Draft & Review" value={drafts} sub="In legal review / onboarding" />
      </div>

      {/* Search + filter pills */}
      <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, tenant, landlord, or property..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {activePills.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                filter === f.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label} ({counts[f.key] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {agreements.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <FileText className="h-9 w-9 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No agreements on file</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              Tenancy deeds will appear here once units under {organization?.name ?? 'your organization'} are leased
              and agreements are drafted.
            </p>
            <Link
              href="/dashboard/estate-manager/units"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)]"
            >
              <Plus className="h-[18px] w-[18px]" /> Add your first unit
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>Reference</th>
                    <th className={TH}>Contract Title &amp; Unit</th>
                    <th className={TH}>Contracting Parties</th>
                    <th className={TH}>Duration &amp; Term</th>
                    <th className={`${TH} text-right`}>Rent Consideration</th>
                    <th className={`${TH} text-center`}>Status</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No agreements match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => {
                      const meta = STATUS_META[a.status] ?? STATUS_META.draft;
                      const term = termMonths(a.startDate, a.endDate);
                      const downloadable = a.status === 'fully_signed' || a.status === 'tenant_signed' || a.status === 'landlord_signed';
                      return (
                        <tr key={a.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary dark:text-[#4edea3]">
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {a.id.slice(0, 8).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex min-w-0 flex-col">
                              <span className="text-sm font-semibold text-zinc-900 transition-colors group-hover:text-primary dark:text-white">
                                {TYPE_LABELS[a.type] ?? a.type}
                              </span>
                              <span className={`mt-0.5 truncate ${MUTED}`}>{a.listing?.title ?? 'No listing'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                {initialsOf(a.tenant?.fullName)}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                  {a.tenant?.fullName ?? 'Unassigned tenant'}
                                </span>
                                <span className={`truncate ${MUTED}`}>L: {a.landlord?.fullName ?? '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-zinc-900 dark:text-white">
                                {formatDate(a.startDate)} — {formatDate(a.endDate)}
                              </span>
                              {term && <span className={MUTED}>{term}</span>}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{ngn(a.rentAmount)}</span>
                            {a.rentPeriod && <span className={`block ${MUTED}`}>per {a.rentPeriod}</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/dashboard/estate-manager/agreements/${a.id}`}
                                title="View agreement dossier"
                                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                              >
                                <Eye className="h-[18px] w-[18px]" />
                              </Link>
                              {downloadable ? (
                                <a
                                  href={`/api/agreements/${a.id}/pdf`}
                                  title="Download counterpart PDF"
                                  className="rounded-lg p-1.5 text-primary transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <Download className="h-[18px] w-[18px]" />
                                </a>
                              ) : (
                                <span
                                  title="Pending execution — download disabled"
                                  className="cursor-not-allowed rounded-lg p-1.5 text-zinc-300 opacity-40 dark:text-zinc-600"
                                >
                                  <Download className="h-[18px] w-[18px]" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{agreements.length}</span> agreements
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
