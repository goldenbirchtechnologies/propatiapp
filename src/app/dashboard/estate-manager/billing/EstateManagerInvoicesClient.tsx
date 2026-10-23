'use client';

import { useMemo, useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
  Search,
  Download,
  FileText,
} from 'lucide-react';
import type { Prisma } from '@prisma/client';

type InvoiceWithRelations = Prisma.InvoiceGetPayload<
  { include: { listing: { select: { id: true; title: true; address: true } }; tenant: { select: { id: true; fullName: true; email: true } } } }
>;

const TYPE_LABELS: Record<string, string> = {
  rent: 'Rent Receipt',
  service: 'Service Charge',
  utility: 'Utility Receipt',
  agreement: 'Agreement Fee',
  other: 'Other Receipt',
};

function bucketOf(status: string): 'paid' | 'pending' | 'failed' {
  if (status === 'paid') return 'paid';
  if (status === 'overdue') return 'failed';
  return 'pending';
}

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  paid: { label: 'Settled', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  sent: { label: 'Awaiting Payment', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  draft: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  overdue: { label: 'Overdue', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900';
const CARD_DARK = 'rounded-xl bg-white shadow-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900';

function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}
function fmtDate(value: string | Date | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(value: string | Date | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function EstateManagerInvoicesClient({ initialInvoices }: { initialInvoices: InvoiceWithRelations[] }) {
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const properties = useMemo(() => {
    const map = new Map<string, string>();
    for (const inv of initialInvoices) {
      if (inv.listing?.id && inv.listing?.title) map.set(inv.listing.id, inv.listing.title);
    }
    return Array.from(map.entries());
  }, [initialInvoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialInvoices.filter((inv) => {
      const statusBucket = bucket === 'all' ? true : bucketOf(inv.status) === bucket;
      const propMatch = propertyFilter === 'all' || inv.listing?.id === propertyFilter;
      const matchesQuery =
        !q ||
        [inv.invoiceNumber, inv.type, inv.tenant?.fullName, inv.tenant?.email, inv.listing?.title, inv.listing?.address]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return statusBucket && propMatch && matchesQuery;
    });
  }, [initialInvoices, query, bucket, propertyFilter]);

  const counts = useMemo(() => {
    const c = { all: initialInvoices.length, paid: 0, pending: 0, failed: 0 };
    for (const inv of initialInvoices) c[bucketOf(inv.status)] += 1;
    return c;
  }, [initialInvoices]);

  const kpis = useMemo(() => {
    let issued = 0, settled = 0, pending = 0, overdue = 0;
    for (const inv of initialInvoices) {
      issued += Number(inv.amount);
      if (inv.status === 'paid') settled += Number(inv.amount);
      else if (inv.status === 'overdue') overdue += Number(inv.amount);
      else pending += Number(inv.amount);
    }
    return { issued, settled, pending, overdue };
  }, [initialInvoices]);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Receivables Tracking
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Invoices</h1>
          <p className={`mt-1 text-sm ${MUTED}`}>
            Rent and service charge invoices issued across your managed properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const csv = ['Receipt No,Class,Tenant,Property,Amount,Status,Due,Created'];
              for (const r of filtered) csv.push([r.invoiceNumber, r.type, r.tenant?.fullName ?? '', r.listing?.title ?? '', r.amount, r.status, r.dueDate?.toString() ?? '', r.createdAt.toString()].join(','));
              const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'invoices.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-[18px] w-[18px]" /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`${CARD} relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div><span className={LABEL}>Total Invoiced</span><div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{compactNgn(kpis.issued)}</div></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"><Receipt className="h-[22px] w-[22px]" /></div>
          </div>
          <p className={`mt-4 ${MUTED}`}>{counts.all} invoices raised</p>
        </div>
        <div className={`${CARD} relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div><span className={LABEL}>Paid & Settled</span><div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{compactNgn(kpis.settled)}</div></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-[22px] w-[22px]" /></div>
          </div>
          <p className={`mt-4 ${MUTED}`}>{counts.paid} settled</p>
        </div>
        <div className={`${CARD} relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div><span className={LABEL}>Pending</span><div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{compactNgn(kpis.pending)}</div></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:text-amber-400"><Hourglass className="h-[22px] w-[22px]" /></div>
          </div>
          <p className={`mt-4 ${MUTED}`}>{counts.pending} awaiting payment</p>
        </div>
        <div className={`${CARD} relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div><span className={LABEL}>Overdue</span><div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{compactNgn(kpis.overdue)}</div></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:text-rose-400"><AlertTriangle className="h-[22px] w-[22px]" /></div>
          </div>
          <p className={`mt-4 ${MUTED}`}>{counts.failed} overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice ref, tenant, or property..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {properties.length > 1 && (
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="all">All Properties ({properties.length})</option>
              {properties.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
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
      <div className={CARD_DARK}>
        {initialInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800"><Receipt className="h-9 w-9 opacity-50" /></div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No invoices yet</h3>
            <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
              Invoices appear here once rent or service charge invoices are issued against listings you manage.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <th className={TH}>INVOICE REF &amp; CLASS</th>
                    <th className={TH}>TENANT</th>
                    <th className={TH}>PROPERTY &amp; UNIT</th>
                    <th className={`${TH} text-right`}>AMOUNT (₦)</th>
                    <th className={TH}>DUE DATE</th>
                    <th className={TH}>STATUS</th>
                    <th className={`${TH} text-right`}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">No invoices match these filters.</td></tr>
                  ) : (
                    filtered.map((inv) => {
                      const meta = STATUS_META[inv.status] ?? STATUS_META.draft;
                      const isPaid = inv.status === 'paid';
                      return (
                        <tr key={inv.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">#{inv.invoiceNumber}</span>
                              <span className={`mt-0.5 inline-flex items-center gap-1 ${MUTED}`}>
                                <FileText className="h-3 w-3" /> {TYPE_LABELS[inv.type] ?? inv.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 font-label-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                {(inv.tenant?.fullName?.split(/\s+/).map((p) => p[0]?.toUpperCase()).join('').slice(0, 2)) || '—'}
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-zinc-900 dark:text-white">{inv.tenant?.fullName ?? '—'}</span>
                                <span className={MUTED}>{inv.tenant?.email ?? ''}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">{inv.listing?.title ?? '—'}</span>
                              <span className={MUTED}>{inv.listing?.address ?? ''}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-base font-bold text-zinc-900 dark:text-white">{ngn(Number(inv.amount))}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">{isPaid ? fmtDate(inv.paidAt) : fmtDate(inv.dueDate ?? inv.createdAt)}</span>
                              {isPaid && inv.paidAt && <span className={`mt-0.5 ${MUTED}`}>Cleared {fmtTime(inv.paidAt)} WAT</span>}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {inv.pdfUrl ? (
                                <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" title="Download PDF" className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                  <FileText className="h-[18px] w-[18px]" />
                                </a>
                              ) : (
                                <span title="Generate on demand" className="rounded-lg p-1.5 text-zinc-400">
                                  <FileText className="h-[18px] w-[18px]" />
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
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of <span className="font-semibold text-zinc-900 dark:text-white">{initialInvoices.length}</span> invoices</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
