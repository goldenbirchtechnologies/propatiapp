'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AccountBalanceWallet, Analytics, ArrowUpward, CalendarToday, CheckCircle, CreditCard, Download, Event, FileDownload, Notifications, PendingActions, PinDrop, Search, Visibility, Verified,
} from 'lucide-react';
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

function gatewayLabel(row: LedgerRow): string {
  const pd = row.paystackData;
  if (pd?.channel) return String(pd.channel);
  if (pd?.gateway) return String(pd.gateway);
  return 'Paystack';
}

function statusPill(status: string) {
  if (status === 'released' || status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
        <CheckCircle className="w-3 h-3" /> Cleared
      </span>
    );
  }
  if (status === 'pending' || status === 'in_escrow' || status === 'commission_held') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300">
      {status}
    </span>
  );
}

const TABS = ['all', 'Rent', 'Caution', 'Service Charge', 'pending'] as const;

export default function TenantPaymentsClient({ userId, metrics, ledger, alertInvoice }: Props) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const typeBadge = (type: string) => {
    if (type === 'Rent') return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (type === 'Caution') return 'bg-blue-50 dark:bg-blue-500/15 text-blue-800 dark:text-blue-400';
    return 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Institutional Financial Management</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Verified className="w-3 h-3 text-emerald-600" /> FIRS &amp; CAC Audited
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Payments &amp; Ledger</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1">
            Manage lease commitments, inspect official e-receipts with FIRS-compliant tax stamps, and execute instant verified settlements via Paystack.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2">
            <FileDownload className="w-4 h-4" /> Export Ledger
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Verified className="w-4 h-4" /> + Pay Now
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Paid</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white mt-1 font-mono">₦ {metrics.totalPaid.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-emerald-600">
              <AccountBalanceWallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.04] -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold"><ArrowUpward className="w-3 h-3" /> on schedule</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">lifetime</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending Action</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-white font-mono">{metrics.pendingCount} Invoice{metrics.pendingCount === 1 ? '' : 's'}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <PendingActions className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.04] -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
            <span className="text-xs font-mono text-zinc-900 dark:text-white font-semibold">{formatNaira(metrics.pendingCount ? 0 : 0)}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Pending</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Failed Debits</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-white font-mono">{metrics.failedCount}</span>
                <span className="text-xs text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Clean Record</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-emerald-600">
              <Verified className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.04] -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">NIBSS / Interswitch</span>
            <span className="text-xs text-emerald-600 font-medium">Zero chargebacks</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Avg. Settlement</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white mt-1 font-mono">₦ {metrics.avgSettlement.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <Analytics className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.04] -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{ledger.filter((l) => l.status === 'released').length} cleared transactions</span>
            <span className="text-xs text-emerald-600 font-mono">Mean</span>
          </div>
        </div>
      </div>

      {/* Priority alert */}
      {alertInvoice && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-white/[0.08] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Notifications className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900 dark:text-white">Upcoming Rent Installment — {alertInvoice.title}</span>
                  <span className="bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded text-xs">{alertInvoice.overdue ? 'OVERDUE' : 'Pending'}</span>
                  <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium">
                    {alertInvoice.daysUntilDue != null ? `Due in ${alertInvoice.daysUntilDue} days` : 'Due'}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Official lease term obligation. Pay electronically to preserve automated lease guarantee.
                </p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 font-mono text-zinc-900 dark:text-white">
                    <span className="text-zinc-500 dark:text-zinc-400 font-normal text-sm">Obligation:</span>
                    <span className="text-lg font-bold text-emerald-600">₦ {alertInvoice.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {alertInvoice.dueDate && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <Event className="w-4 h-4 text-zinc-400" />
                        <span>Final Settlement Due: <strong className="text-zinc-900 dark:text-white">{new Date(alertInvoice.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0">
              <Link href="/dashboard/tenant/payments/auto-pay" className="h-10 px-4 rounded-lg bg-zinc-50 dark:bg-white/[0.04] text-zinc-900 dark:text-white text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-white/[0.08]">
                <Verified className="w-4 h-4 text-emerald-600" /> Auto-Debit
              </Link>
              <Button size="sm" className="h-10 px-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CreditCard className="w-4 h-4" /> Pay via Paystack
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {TABS.map((t) => {
              const active = tab === t;
              const count = t === 'all' ? ledger.length : t === 'pending' ? ledger.filter((l) => ['pending', 'in_escrow', 'commission_held'].includes(l.status)).length : ledger.filter((l) => l.type === t).length;
              return (
                <button
                  key={t}
                  onClick={() => { setTab(t); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${active ? 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/[0.04]'}`}
                >
                  {t === 'pending' ? 'Pending' : t === 'all' ? 'All' : t}{' '}
                  <span className={`ml-1 text-xs font-mono px-1.5 py-0.5 rounded-full ${active ? 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-zinc-400 w-4 h-4" />
              <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search invoice, property..." className="h-9 pl-9 text-sm" />
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.04] px-3 py-1.5 rounded-lg shrink-0 border border-zinc-200 dark:border-white/[0.08]">
              <CalendarToday className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">FY 2025</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-semibold">Property &amp; Reference</th>
                <th className="py-3 px-4 font-semibold">Date Settled</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Payment Gateway</th>
                <th className="py-3 px-4 font-semibold text-right">Sum (NGN)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-sm">
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 dark:text-zinc-400">No transactions found.</td>
                </tr>
              )}
              {paged.map((row) => {
                const date = row.paidAt || row.createdAt;
                const listingTitle = row.listing?.title || 'Propati';
                return (
                  <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white">{listingTitle}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                          <PinDrop className="w-3 h-3 text-emerald-600" /> #{row.reference}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-zinc-900 dark:text-white">{date ? new Date(date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{date ? new Date(date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge(row.type)}`}>{row.type}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">{gatewayLabel(row)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-mono font-semibold ${row.status === 'released' ? 'text-emerald-600' : 'text-zinc-900 dark:text-white'}`}>₦ {row.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">{statusPill(row.status)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/api/payments/transactions/${row.id}/receipt`} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-colors" title="View E-Receipt">
                          <Visibility className="w-4 h-4" />
                        </Link>
                        <a href={`/api/payments/transactions/${row.id}/receipt`} download className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-white/[0.08]">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}