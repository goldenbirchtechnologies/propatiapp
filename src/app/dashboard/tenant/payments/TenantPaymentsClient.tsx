'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CreditCard, Download, Search, X } from 'lucide-react';
import { PageHeader, StatCard, StatusBadge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/utils';

type LedgerRow = {
  id: string;
  reference: string;
  listing: { id: string; title: string; area: string; address: string; listingType: string } | null;
  type: string;
  status: string;
  amount: number;
  currency: string;
  paystackData: any;
  createdAt: string | null;
  paidAt: string | null;
};

type Metrics = { totalPaid: number; pendingCount: number; failedCount: number; avgSettlement: number };
type AlertInvoice = { id: string; title: string; amount: number; currency: string; dueDate: string | null; daysUntilDue: number | null; overdue: boolean } | null;

interface Props {
  userId: string;
  metrics: Metrics;
  ledger: LedgerRow[];
  alertInvoice: AlertInvoice;
}

function LedgerStatusBadge({ status }: { status: string }) {
  if (status === 'released' || status === 'success') {
    return <StatusBadge status="Paid" />;
  }
  if (status === 'in_escrow' || status === 'commission_held') {
    return <StatusBadge status="In Escrow" />;
  }
  return <StatusBadge status={status} />;
}

function gatewayLabel(row: LedgerRow): string {
  const pd = row.paystackData;
  if (pd?.channel) return String(pd.channel);
  if (pd?.gateway) return String(pd.gateway);
  return 'Paystack';
}

export default function TenantPaymentsClient({ userId, metrics, ledger, alertInvoice }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'rent' | 'caution' | 'service_charge' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [payRow, setPayRow] = useState<LedgerRow | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [receiptRow, setReceiptRow] = useState<LedgerRow | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ledger.filter((r) => {
      if (tab !== 'all') {
        if (tab === 'pending') {
          if (!['pending', 'in_escrow', 'commission_held'].includes(r.status)) return false;
        } else if (r.type !== tab) return false;
      }
      if (needle) {
        const hay = `${r.reference} ${r.listing?.title ?? ''} ${r.listing?.area ?? ''} ${r.type} ${r.status}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [ledger, tab, q]);

  useEffect(() => {
    setPage(1);
  }, [q, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(() => {
    const rent = ledger.filter((r) => r.type === 'rent').length;
    const caution = ledger.filter((r) => r.type === 'caution').length;
    const service = ledger.filter((r) => r.type === 'service' || r.type === 'service_charge').length;
    const pending = ledger.filter((r) => ['pending', 'in_escrow', 'commission_held'].includes(r.status)).length;
    return { all: ledger.length, rent, caution, service, pending };
  }, [ledger]);

  const handlePay = async () => {
    if (!payRow) return;
    const amountNaira = payAmount ? Number(payAmount.replace(/,/g, '')) : payRow.amount;
    if (!amountNaira || Number.isNaN(amountNaira) || amountNaira <= 0) {
      setPayError('Enter a valid amount.');
      return;
    }
    setPayBusy(true);
    setPayError(null);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: payRow.listing?.id ?? undefined,
          type: payRow.type,
          amount: amountNaira,
          email: undefined,
          metadata: { ledgerRowId: payRow.id, alertInvoiceId: alertInvoice?.id ?? null },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? 'Payment initialization failed.');
      const authUrl = json?.authorizationUrl ?? json?.data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl as string;
        return;
      }
      // Fallback: redirect to verification step if no URL
      router.push(`/dashboard/tenant/payments/success?reference=${encodeURIComponent(payRow.reference ?? payRow.id)}`);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Payment failed.');
    } finally {
      setPayBusy(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/payments/export?format=csv', { method: 'GET' });
      if (!res.ok) {
        // Mock fallback when env unset: build CSV from current ledger
        const headers = ['Date', 'Property', 'Type', 'Amount (NGN)', 'Status', 'Reference'];
        const rows = filtered.map((r) => [
          r.paidAt ?? r.createdAt ?? '',
          r.listing?.title ?? '',
          r.type,
          String(r.amount),
          r.status,
          r.reference,
        ]);
        const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payments & Ledger"
        description={alertInvoice ? 'Pay rent, confirm invoices, and keep a FIRS-ready receipt trail.' : 'Manage rent, caution, and service-charge payments. Paystack-secured when funded.'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="border-zinc-200 dark:border-white/[0.08]">
              <Download className="h-4 w-4 mr-2" /> Export Ledger
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const row = filtered.find((r) => ['pending', 'in_escrow', 'commission_held'].includes(r.status)) ?? filtered[0] ?? null;
                if (row) {
                  setPayRow(row);
                  setPayAmount(String(row.amount));
                  setPayError(null);
                } else {
                  router.push('/dashboard/tenant/payments/methods/new');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" /> Pay Now
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Paid (2025)" value={formatNaira(metrics.totalPaid)} sub="Released" icon={CreditCard} trend="up" />
        <StatCard
          label="Pending Action"
          value={metrics.pendingCount > 0 ? `${metrics.pendingCount} invoice(s)` : 'None due'}
          sub={metrics.pendingCount > 0 ? 'Awaiting settlement' : 'Clear — no action'}
          icon={AlertCircle}
        />
        <StatCard label="Failed Debits" value={metrics.failedCount === 0 ? '0 · Clean' : String(metrics.failedCount)} sub={metrics.failedCount === 0 ? 'Zero chargebacks' : 'Requires review'} icon={CreditCard} />
        <StatCard label="Avg Settlement" value={formatNaira(metrics.avgSettlement)} sub={`Mean of ${ledger.filter((r) => r.status === 'released').length} cleared`} icon={CreditCard} />
      </div>

      {alertInvoice && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Upcoming Rent Installment — {alertInvoice.title}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {alertInvoice.overdue ? 'Overdue' : `Due in ${alertInvoice.daysUntilDue ?? '?'} days`} · Obligation {formatNaira(alertInvoice.amount)} {alertInvoice.currency ?? 'NGN'}
                {alertInvoice.dueDate ? ` · ${new Date(alertInvoice.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-amber-500/30" onClick={() => router.push('/dashboard/tenant/payments/auto-pay')}>
              Auto-Pay
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                const row = filtered.find((r) => r.status !== 'released') ?? { id: alertInvoice.id, reference: alertInvoice.id, type: 'rent' as const, amount: alertInvoice.amount } as LedgerRow;
                setPayRow(row);
                setPayAmount(String(alertInvoice.amount));
                setPayError(null);
              }}
            >
              Pay via Paystack
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-wrap gap-1.5">
            {([
              { k: 'all' as const, label: 'All', count: counts.all },
              { k: 'rent' as const, label: 'Rent', count: counts.rent },
              { k: 'caution' as const, label: 'Caution', count: counts.caution },
              { k: 'service_charge' as const, label: 'Service Charge', count: counts.service },
              { k: 'pending' as const, label: 'Pending', count: counts.pending },
            ] as const).map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${tab === t.k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300'}`}
              >
                {t.label} {t.count}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ledger…" className="h-9 pl-8 w-56 bg-white dark:bg-zinc-950" />
            </div>
            <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">FY {new Date().getFullYear()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/30 dark:bg-white/[0.02]">
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Property & Reference</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Gateway</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Amount</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {ledger.length === 0 ? 'No transactions yet. Your ledger appears here once rent or invoices are raised.' : 'No results for the current filter.'}
                  </td>
                </tr>
              ) : (
                paged.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-200 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">{r.listing?.title ?? '—'}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">{r.reference}</div>
                      <div className="text-xs text-zinc-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-zinc-700 dark:text-zinc-300">{r.type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{gatewayLabel(r)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">{formatNaira(r.amount)}</td>
                    <td className="px-4 py-3">
                      <LedgerStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {['pending', 'in_escrow', 'commission_held'].includes(r.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setPayRow(r);
                              setPayAmount(String(r.amount));
                              setPayError(null);
                            }}
                          >
                            Pay
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 dark:text-emerald-400" onClick={() => setReceiptRow(r)}>
                          Receipt
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Showing {(page - 1) * pageSize + (paged.length ? 1 : 0)} to {(page - 1) * pageSize + paged.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-800 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 7)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${n === page ? 'bg-emerald-600 text-white' : 'border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                >
                  {n}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02] border-t border-zinc-200 dark:border-white/[0.08] flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Institutional Payment Safeguard — 256-bit TLS · NIBSS · PCIDSS L1 · CAC RC-1849204
        </div>
      </div>

      {payRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPayRow(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Paystack — Secure Commercial Settlement</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {payRow.listing?.title ?? payRow.reference} · {payRow.type.replace(/_/g, ' ')}
                </p>
              </div>
              <button type="button" onClick={() => setPayRow(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-4 py-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Amount (NGN)</div>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono font-semibold text-zinc-900 dark:text-white"
              />
            </div>
            {payError && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{payError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPayRow(null)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePay} disabled={payBusy}>
                {payBusy ? 'Authorizing…' : 'Authorize Settlement'}
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">Zero surcharges on Paystack when funded — card & bank transfer only on this tenant surface.</p>
          </div>
        </div>
      )}

      {receiptRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setReceiptRow(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Official E-Receipt</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{receiptRow.reference}</p>
              </div>
              <button type="button" onClick={() => setReceiptRow(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Property</span>
                <span className="font-medium text-zinc-900 dark:text-white">{receiptRow.listing?.title ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-white">{formatNaira(receiptRow.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                <span className="text-xs">
                  <LedgerStatusBadge status={receiptRow.status} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Type</span>
                <span className="text-xs capitalize text-zinc-900 dark:text-white">{receiptRow.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Date</span>
                <span className="text-xs text-zinc-900 dark:text-white">{receiptRow.paidAt ?? receiptRow.createdAt ? new Date((receiptRow.paidAt ?? receiptRow.createdAt)!).toLocaleString('en-NG') : '—'}</span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/api/receipts/${receiptRow.id}`} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </Link>
              </Button>
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-zinc-500">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
