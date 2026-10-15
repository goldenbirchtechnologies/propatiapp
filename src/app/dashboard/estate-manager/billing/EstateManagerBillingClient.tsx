'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Download,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Send,
  AlertCircle,
} from 'lucide-react';

// ─── Real InvoiceStatus / InvoiceType enums from prisma/schema.prisma ───
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type InvoiceType = 'rent' | 'service' | 'utility' | 'agreement' | 'other';

interface Bill {
  id: string;
  invoiceNumber: string;
  type: InvoiceType | string;
  amount: number;
  status: InvoiceStatus | string;
  dueDate: string | null;
  paidAt: string | null;
  listing: { id: string; title: string; address: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string } | null;
  agreement: { id: string; type: string; status: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  rent: 'Rent',
  service: 'Service Charge',
  utility: 'Utility',
  agreement: 'Agreement',
  other: 'Other',
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  sent: { label: 'Sent', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30', dot: 'bg-blue-500' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  overdue: { label: 'Overdue', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  draft: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

const CARD = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(value: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

// Map the design's filter buckets to the real InvoiceStatus enum.
// 'pending' covers draft + sent (unsettled); paid/overdue map directly.
function bucketOf(status: string): 'all' | 'paid' | 'pending' | 'overdue' {
  if (status === 'paid') return 'paid';
  if (status === 'overdue') return 'overdue';
  if (status === 'draft' || status === 'sent') return 'pending';
  return 'pending';
}

function initialsOf(name: string | null | undefined, email?: string): string {
  const src = name?.trim() || email?.split('@')[0] || '?';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EstateManagerBillingClient({ initialBills }: { initialBills: Bill[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialBills.filter((b) => {
      const matchesFilter = filter === 'all' || bucketOf(b.status) === filter;
      const matchesQuery =
        !q ||
        [b.invoiceNumber, b.listing?.title, b.tenant?.fullName, b.tenant?.email, b.agreement?.id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [initialBills, query, filter]);

  // Bucket counts from real data
  const counts = useMemo(() => {
    const c = { all: initialBills.length, paid: 0, pending: 0, overdue: 0 };
    for (const b of initialBills) c[bucketOf(b.status)] += 1;
    return c;
  }, [initialBills]);

  // Financial aggregates
  const totals = useMemo(() => {
    let invoiced = 0, settled = 0, outstanding = 0, overdueAmt = 0, dueThisWeek = 0;
    for (const b of initialBills) {
      invoiced += b.amount;
      if (b.status === 'paid') settled += b.amount;
      else outstanding += b.amount;
      if (b.status === 'overdue') overdueAmt += b.amount;
      const d = daysUntil(b.dueDate);
      if (b.status !== 'paid' && b.status !== 'cancelled' && d !== null && d >= 0 && d <= 7) dueThisWeek += 1;
    }
    return { invoiced, settled, outstanding, overdueAmt, dueThisWeek };
  }, [initialBills]);

  const collectionRate = totals.invoiced > 0 ? Math.round((totals.settled / totals.invoiced) * 1000) / 10 : 0;

  const exportCsv = () => {
    const header = ['Reference', 'Type', 'Listing', 'Tenant', 'Due Date', 'Amount', 'Status'];
    const rows = filtered.map((b) => [
      b.invoiceNumber,
      TYPE_LABELS[b.type] ?? b.type,
      b.listing?.title ?? '',
      b.tenant?.fullName ?? '',
      b.dueDate ?? '',
      b.amount,
      b.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'billing-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default' }: {
    icon: typeof Receipt;
    label: string;
    value: string | number;
    sub: string;
    tone?: 'default' | 'emerald' | 'amber';
  }) => {
    const iconCls =
      tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : tone === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    return (
      <div className={CARD}>
        <div className="flex items-start justify-between">
          <div>
            <span className={LABEL}>{label}</span>
            <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</div>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <p className={`mt-3 ${MUTED}`}>{sub}</p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 ${LABEL} text-emerald-600 dark:text-emerald-400`}>Financial Ledger</span>
            <span className={MUTED}>•</span>
            <span className={MUTED}>Portfolio Billing</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Billing</h1>
          <p className={`text-sm ${MUTED}`}>
            Invoices, payment schedules, and settlement reconciliation across your managed holdings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="group inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-[18px] w-[18px] text-zinc-400 transition-colors group-hover:text-emerald-600" />
            Export Ledger (CSV)
          </button>
          <Link
            href="/dashboard/estate-manager/agreements"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Plus className="h-[18px] w-[18px]" /> Generate Invoice
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Kpi icon={Receipt} label="Total Bills" value={counts.all} sub={`${compactNgn(totals.invoiced)} invoiced`} />
        <Kpi
          icon={CheckCircle2}
          label="Settled Collections"
          value={counts.paid}
          sub={`${compactNgn(totals.settled)} settled · ${collectionRate}% collection rate`}
          tone="emerald"
        />
        <Kpi
          icon={AlertCircle}
          label="Outstanding Balance"
          value={counts.pending + counts.overdue}
          sub={`${compactNgn(totals.outstanding)} pending · ${totals.dueThisWeek} due this week`}
          tone="amber"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, tenant name, or listing..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {([
            ['all', 'All', counts.all],
            ['paid', 'Paid', counts.paid],
            ['pending', 'Pending', counts.pending],
            ['overdue', 'Overdue', counts.overdue],
          ] as const).map(([key, label, n]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {label} <span className="ml-1 font-mono text-xs opacity-75">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {initialBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Receipt className="h-9 w-9 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No invoices yet</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              Invoices appear here once they are raised against agreements on listings you manage.
            </p>
            <Link
              href="/dashboard/estate-manager/agreements"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              View Agreements
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>Reference</th>
                    <th className={TH}>Listing &amp; Agreement</th>
                    <th className={TH}>Tenant Entity</th>
                    <th className={TH}>Due Date</th>
                    <th className={`${TH} text-right`}>Amount (₦)</th>
                    <th className={`${TH} text-center`}>Status</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No invoices match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => {
                      const meta = STATUS_META[b.status] ?? STATUS_META.draft;
                      const dLeft = daysUntil(b.dueDate);
                      const isPaid = b.status === 'paid';
                      return (
                        <tr key={b.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="whitespace-nowrap px-6 py-3.5">
                            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {b.invoiceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-semibold text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-white">
                                {TYPE_LABELS[b.type] ?? b.type} — {b.listing?.title ?? 'Property'}
                              </span>
                              <span className={MUTED}>
                                {b.agreement ? `Agreement ${b.agreement.id.slice(0, 8).toUpperCase()}` : 'No linked agreement'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                {initialsOf(b.tenant?.fullName, b.tenant?.email)}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                  {b.tenant?.fullName ?? 'Unassigned'}
                                </span>
                                <span className={`truncate ${MUTED}`}>{b.tenant?.email ?? '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5">
                            <span className="font-mono text-sm text-zinc-900 dark:text-white">{formatDate(b.dueDate)}</span>
                            {!isPaid && dLeft !== null && (
                              <span className={`block ${MUTED}`}>{dLeft >= 0 ? `${dLeft}d left` : `${Math.abs(dLeft)}d overdue`}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono text-sm font-bold text-zinc-900 dark:text-white">
                            {ngn(b.amount)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {b.agreement && (
                                <Link
                                  href={`/dashboard/estate-manager/agreements/${b.agreement.id}`}
                                  title="View agreement"
                                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                </Link>
                              )}
                              {isPaid ? (
                                <a
                                  href={`/api/invoices/${b.id}/receipt`}
                                  title="Download official receipt"
                                  className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <Download className="h-[18px] w-[18px]" />
                                </a>
                              ) : b.tenant?.email ? (
                                <a
                                  href={`mailto:${b.tenant.email}`}
                                  title="Send payment reminder"
                                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800"
                                >
                                  <Send className="h-[18px] w-[18px]" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{initialBills.length}</span> invoices
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
