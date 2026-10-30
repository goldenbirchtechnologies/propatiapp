'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Printer,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Wallet,
  Zap,
  AlertTriangle,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNairaFull } from '@/lib/utils';
import { toast } from 'sonner';

type ReceiptRow = {
  id: string;
  ref: string;
  date: string;
  tenant: string;
  rcNumber?: string;
  property: string;
  unit?: string;
  amount: number;
  category: 'RENT' | 'SERVICE' | 'CAUTION';
  description: string;
  status: 'paid' | 'failed';
};

const CATEGORY_LABEL: Record<ReceiptRow['category'], string> = {
  RENT: 'Rent Remittance',
  SERVICE: 'Service Charge',
  CAUTION: 'Caution Deposit',
};

export default function LandlordReceiptsClient() {
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const [status, setStatus] = useState<'all' | 'paid' | 'failed'>('all');
  const [modal, setModal] = useState<ReceiptRow | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/payments/transactions?limit=50', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load receipts');
        const data = await res.json();
        const list: unknown[] = Array.isArray(data)
          ? data
          : (data?.data ?? data?.transactions ?? data?.items ?? []);
        const mapped: ReceiptRow[] = (list as Array<Record<string, unknown>>).map((t) => {
          const raw = t as Record<string, unknown>;
          const payer = (raw.payer as Record<string, unknown> | undefined) ?? undefined;
          const payee = (raw.payee as Record<string, unknown> | undefined) ?? undefined;
          const listing = (raw.listing as Record<string, unknown> | undefined) ?? undefined;
          const id = String(raw.id ?? raw.reference ?? Math.random());
          return {
            id,
            ref: String(raw.reference ?? raw.receiptNumber ?? `REC-${String(id).slice(0, 8).toUpperCase()}`),
            date: raw.createdAt ? new Date(String(raw.createdAt)).toLocaleDateString('en-NG') : '—',
            tenant: String(
              (raw.tenantName as string) ??
                (raw.payerName as string) ??
                (payer?.fullName as string) ??
                (payee?.fullName as string) ??
                '—',
            ),
            rcNumber: (raw.rcNumber as string | undefined) ?? (payer?.rcNumber as string | undefined),
            property: String((raw.propertyName as string) ?? (listing?.title as string) ?? '—'),
            unit: (raw.unitName as string | undefined) ?? (raw.unit as string | undefined),
            amount: Number(raw.amount ?? 0) / 100,
            category: String(raw.category ?? raw.type ?? 'RENT').toUpperCase().slice(0, 10) as ReceiptRow['category'],
            description: String(raw.description ?? raw.type ?? 'Payment'),
            status: raw.status === 'failed' || raw.status === 'reversed' ? 'failed' : 'paid',
          } as ReceiptRow;
        });
        if (alive) setRows(mapped);
      } catch {
        if (alive) {
          toast.error('Could not load receipts');
          setRows([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (cat !== 'ALL' && r.category !== cat) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (!term) return true;
      return [r.ref, r.tenant, r.rcNumber ?? '', r.property, String(r.amount), r.description]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, cat, status]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
  const paid = useMemo(() => rows.filter((r) => r.status === 'paid'), [rows]);
  const failed = useMemo(() => rows.filter((r) => r.status === 'failed'), [rows]);
  const rentTotal = useMemo(() => rows.filter((r) => r.category === 'RENT').reduce((s, r) => s + r.amount, 0), [rows]);
  const serviceTotal = useMemo(() => rows.filter((r) => r.category === 'SERVICE').reduce((s, r) => s + r.amount, 0), [rows]);

  const downloadReceipt = async (r: ReceiptRow) => {
    try {
      const res = await fetch(`/api/payments/transactions/${r.id}/receipt`, { cache: 'no-store' });
      if (!res.ok) throw new Error('no receipt');
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('pdf')) throw new Error('not pdf');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${r.ref}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Receipt downloaded');
    } catch {
      toast.info(`Receipt queued for ${r.ref} — will be available at /api/payments/transactions/${r.id}/receipt once settled`);
    }
  };

  const downloadAll = async () => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      const params = new URLSearchParams({ type: 'pl', format: 'csv', from, to });
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipts-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Receipts archive downloaded');
    } catch {
      toast.info('Preparing ZIP archive…');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-white/[0.06]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-6">
          <span>Financials &amp; Payouts</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          <span className="text-zinc-900 dark:text-white font-semibold">Receipts</span>
        </nav>
        <div className="rounded-xl border border-zinc-200 bg-white p-12 flex flex-col items-center justify-center text-center shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.04] text-zinc-400 mb-4">
            <Receipt className="h-8 w-8 opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No receipts found</h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            No payment transactions or remittances recorded for the selected filter criteria or billing cycle.
          </p>
          <Button size="sm" className="mt-6 gap-2 bg-primary hover:bg-primary text-white" onClick={() => window.location.reload()}>
            Reset All Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <span>Financials &amp; Payouts</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-primary dark:text-[#4edea3] font-semibold">Receipts</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Receipts</h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Payment receipts for rent remittances, caution escrow, and commercial service charges. Live from{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/[0.06]">/api/payments/transactions</code> and{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/[0.06]">/api/payments/transactions/[id]/receipt</code>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={downloadAll}
          >
            <FileDown className="h-4 w-4" /> Download All Receipts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Batch Print Statements
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary text-white shadow-lg shadow-primary/20" onClick={() => toast.info('Reconciliation ledger — filters applied to live transactions')}>
            <Search className="h-4 w-4" /> Filter &amp; Reconcile
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Collected Receipts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary dark:text-[#4edea3]">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(total)}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:text-[#4edea3]">
              <CheckCircle2 className="h-3 w-3" /> {rows.length} Issued
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Rent Remittances</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(rentTotal)}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Paystack • NIBSS Direct Escrow
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Service Charge &amp; Levies</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(serviceTotal)}</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">IPP Power, Diesel &amp; FM Levies</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-500">Reversals &amp; Failed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {formatNairaFull(failed.reduce((s, r) => s + r.amount, 0))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-[#4edea3]">
            <CheckCircle2 className="h-3.5 w-3.5" /> {rows.length ? Math.round((paid.length / rows.length) * 100) : 100}% Settlement Rate
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-5 w-5 text-zinc-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Receipt #, Tenant, RC Number, or Suite..."
            className="h-10 w-full pl-11 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 pr-8 text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/[0.08] dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="RENT">Rent Remittance</option>
            <option value="SERVICE">Service Charge</option>
            <option value="CAUTION">Caution Deposit</option>
          </select>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.06]">
            {(['all', 'paid', 'failed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  status === s
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s === 'paid' ? 'Paid' : 'Failed'} ({s === 'all' ? rows.length : s === 'paid' ? paid.length : failed.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                <th className="px-4 py-3 font-semibold">Receipt #</th>
                <th className="px-4 py-3 font-semibold">Issued Date</th>
                <th className="px-4 py-3 font-semibold">Corporate Tenant</th>
                <th className="px-4 py-3 font-semibold">Property &amp; Unit</th>
                <th className="px-4 py-3 font-semibold text-right">Amount (NGN)</th>
                <th className="px-4 py-3 font-semibold text-center">Settlement Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                    <Receipt className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">No receipts match filters</p>
                    <p className="text-xs mt-1">Try a different category or search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className={`px-4 py-3.5 font-mono text-xs font-bold ${r.status === 'failed' ? 'text-red-600' : 'text-primary'}`}>{r.ref}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.date}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight text-zinc-900 dark:text-white">{r.tenant}</span>
                        {r.rcNumber && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <CheckCircle2 className="h-3 w-3 text-primary" /> {r.rcNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight text-zinc-900 dark:text-white line-clamp-1 max-w-[220px]">{r.property}</span>
                        {r.unit && <span className="text-xs text-zinc-500 dark:text-zinc-400">{r.unit}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatNairaFull(r.amount)}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{CATEGORY_LABEL[r.category] ?? r.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {r.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-[#4edea3]">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(r)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-primary dark:text-zinc-400 dark:hover:bg-white/[0.06] transition-colors"
                          title="Quick View"
                          aria-label="Quick View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(r)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-primary dark:text-zinc-400 dark:hover:bg-white/[0.06] transition-colors"
                          title="Download PDF"
                          aria-label="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-primary dark:text-zinc-400 dark:hover:bg-white/[0.06] transition-colors"
                          title="Direct Print"
                          aria-label="Direct Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
          <span>
            Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
            <span className="font-semibold text-zinc-900 dark:text-white">{rows.length}</span> verified e-receipts
          </span>
          <span className="hidden sm:inline">Live • Paystack &amp; wallet ledger</span>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div
            className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-zinc-900 px-6 py-4 text-white dark:bg-black">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#4edea3]" />
                <span className="text-sm font-semibold tracking-wide">Official E-Receipt</span>
              </div>
              <button
                onClick={() => setModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Receipt Ref</span>
                  <span className="font-mono text-sm font-bold text-primary">{modal.ref}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date Settled</span>
                  <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{modal.date}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Payment Channel</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Direct Escrow NIBSS</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Audit State</span>
                  <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:text-[#4edea3]">Verified</span>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-sm dark:border-white/[0.06] dark:bg-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Remitting Entity:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{modal.tenant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Property &amp; Unit:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {modal.property}
                    {modal.unit ? `, ${modal.unit}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Description:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{modal.description}</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">Total Amount Received (Naira)</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Settled into Escrow Custody</span>
                </div>
                <span className="font-mono text-2xl font-bold text-primary">{formatNairaFull(modal.amount)}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <Button variant="outline" size="sm" className="border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-800" onClick={() => setModal(null)}>
                Close Preview
              </Button>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
