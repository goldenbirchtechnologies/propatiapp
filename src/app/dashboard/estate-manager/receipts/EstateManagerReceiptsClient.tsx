'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
  Search,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';

// ─── Real InvoiceStatus enum from prisma/schema.prisma ───
type ReceiptStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

interface Receipt {
  id: string;
  invoiceNumber: string;
  type: string;
  amount: number;
  status: ReceiptStatus | string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  pdfUrl: string | null;
  listing: { id: string; title: string; address: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string } | null;
  agreement: { id: string; type: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  rent: 'Rent Receipt',
  service: 'Service Charge',
  utility: 'Utility Receipt',
  agreement: 'Agreement Fee',
  other: 'Other Receipt',
};

// Map real InvoiceStatus to the design's paid / pending / failed buckets.
type Bucket = 'all' | 'paid' | 'pending' | 'failed';
function bucketOf(status: string): Bucket {
  if (status === 'paid') return 'paid';
  if (status === 'overdue') return 'failed';
  return 'pending'; // draft + sent + cancelled → unsettled/pending
}

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  paid: { label: 'Settled', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  sent: { label: 'Awaiting Payment', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  draft: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  overdue: { label: 'Overdue', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

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
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function EstateManagerReceiptsClient({ initialReceipts }: { initialReceipts: Receipt[] }) {
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState<Bucket>('all');
  const [tenantFilter, setTenantFilter] = useState('all');

  // Distinct tenants from real receipts for the filter dropdown
  const tenants = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of initialReceipts) {
      if (r.tenant?.id && r.tenant?.fullName) map.set(r.tenant.id, r.tenant.fullName);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [initialReceipts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialReceipts.filter((r) => {
      const matchesBucket = bucket === 'all' || bucketOf(r.status) === bucket;
      const matchesTenant = tenantFilter === 'all' || r.tenant?.id === tenantFilter;
      const matchesQuery =
        !q ||
        [r.invoiceNumber, r.tenant?.fullName, r.tenant?.email, r.listing?.title, r.agreement?.id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchesBucket && matchesTenant && matchesQuery;
    });
  }, [initialReceipts, query, bucket, tenantFilter]);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { all: initialReceipts.length, paid: 0, pending: 0, failed: 0 };
    for (const r of initialReceipts) c[bucketOf(r.status)] += 1;
    return c;
  }, [initialReceipts]);

  const kpis = useMemo(() => {
    let issued = 0, settled = 0, pending = 0, overdue = 0;
    for (const r of initialReceipts) {
      issued += r.amount;
      if (r.status === 'paid') settled += r.amount;
      else if (r.status === 'overdue') overdue += r.amount;
      else pending += r.amount;
    }
    return { issued, settled, pending, overdue };
  }, [initialReceipts]);

  const exportCsv = () => {
    const header = ['Receipt No', 'Class', 'Tenant', 'Property', 'Amount', 'Status', 'Issued', 'Settled'];
    const rows = filtered.map((r) => [
      r.invoiceNumber,
      TYPE_LABELS[r.type] ?? r.type,
      r.tenant?.fullName ?? '',
      r.listing?.title ?? '',
      r.amount,
      r.status,
      r.createdAt,
      r.paidAt ?? '',
    ]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default' }: {
    icon: typeof Receipt;
    label: string;
    value: string;
    sub: string;
    tone?: 'default' | 'emerald' | 'amber' | 'rose';
  }) => {
    const iconCls =
      tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : tone === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : tone === 'rose' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    return (
      <div className={`${CARD} relative overflow-hidden`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={LABEL}>{label}</span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className="h-[22px] w-[22px]" />
          </div>
        </div>
        <p className={`mt-4 ${MUTED}`}>{sub}</p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Settlement Records
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Receipts</h1>
          <p className={`mt-1 text-sm ${MUTED}`}>
            Payment vouchers and settled invoice records across your managed properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-[18px] w-[18px]" /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Receipt} label="Total Issued" value={compactNgn(kpis.issued)} sub={`${counts.all} receipts raised`} />
        <Kpi icon={CheckCircle2} label="Paid & Settled" value={compactNgn(kpis.settled)} sub={`${counts.paid} settled`} tone="emerald" />
        <Kpi icon={Hourglass} label="Pending" value={compactNgn(kpis.pending)} sub={`${counts.pending} awaiting payment`} tone="amber" />
        <Kpi icon={AlertTriangle} label="Overdue" value={compactNgn(kpis.overdue)} sub={`${counts.failed} overdue`} tone="rose" />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search receipt number, tenant, or property..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {tenants.length > 1 && (
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="all">All Tenants ({tenants.length})</option>
              {tenants.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {([
              ['all', 'All', counts.all],
              ['paid', 'Paid', counts.paid],
              ['pending', 'Pending', counts.pending],
              ['failed', 'Overdue', counts.failed],
            ] as const).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setBucket(key)}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  bucket === key
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {label} <span className="ml-1 font-mono text-xs opacity-75">{n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {initialReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Receipt className="h-9 w-9 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No receipts yet</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              Receipts appear here once invoices are raised and settled against listings you manage.
            </p>
            <Link
              href="/dashboard/estate-manager/billing"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              Go to Billing
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>Receipt &amp; Class</th>
                    <th className={TH}>Tenant</th>
                    <th className={TH}>Property &amp; Unit</th>
                    <th className={TH}>Timestamp</th>
                    <th className={`${TH} text-right`}>Amount</th>
                    <th className={`${TH} text-center`}>Status</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No receipts match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const meta = STATUS_META[r.status] ?? STATUS_META.draft;
                      const settled = r.status === 'paid';
                      return (
                        <tr key={r.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 items-center justify-center rounded ${settled ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                {settled ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Receipt className="h-[18px] w-[18px]" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">#{r.invoiceNumber}</span>
                                <span className={MUTED}>{TYPE_LABELS[r.type] ?? r.type}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">{r.tenant?.fullName ?? '—'}</span>
                              <span className={`truncate ${MUTED}`}>{r.tenant?.email ?? ''}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">{r.listing?.title ?? '—'}</span>
                              <span className={`truncate ${MUTED}`}>{r.listing?.address ?? ''}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                {settled ? formatDate(r.paidAt) : formatDate(r.dueDate ?? r.createdAt)}
                              </span>
                              <span className={MUTED}>
                                {settled ? `Settled ${formatTime(r.paidAt)} WAT` : `Due ${formatDate(r.dueDate)}`}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <span className="font-mono text-base font-bold text-zinc-900 dark:text-white">{ngn(r.amount)}</span>
                            {settled && <span className={`block ${LABEL} text-emerald-600 dark:text-emerald-400`}>incl. levy</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {r.pdfUrl ? (
                                <a
                                  href={r.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Download receipt PDF"
                                  className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <FileText className="h-[18px] w-[18px]" />
                                </a>
                              ) : settled ? (
                                <a
                                  href={`/api/invoices/${r.id}/receipt`}
                                  title="Generate receipt PDF"
                                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800"
                                >
                                  <RefreshCw className="h-[18px] w-[18px]" />
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
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">{initialReceipts.length}</span> receipts
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
