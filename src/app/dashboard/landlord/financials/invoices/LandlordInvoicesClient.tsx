'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Eye,
  Mail,
  Send,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { apiEndpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
// amounts are already in naira (not kobo), so format directly

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount?: number | string;
  totalAmount?: number | string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  tenant?: { id: string; fullName: string; email?: string } | null;
  listing?: { id: string; title: string; address?: string } | null;
  notes?: string;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Paid & Escrowed', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  overdue: { label: 'Overdue', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  pending: { label: 'Pending', cls: 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]' },
  sent: { label: 'Sent / Delivered', cls: 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]' },
  draft: { label: 'Draft', cls: 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-white/[0.08]' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

function initials(name?: string) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LandlordInvoicesClient() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.invoices.list({ page: 1, limit: 50 });
      const data = (res?.data ?? res) as unknown;
      setInvoices(Array.isArray(data) ? (data as Invoice[]) : []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast({ title: 'Failed to load invoices', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesQuery =
        !q ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.tenant?.fullName?.toLowerCase().includes(q) ||
        inv.listing?.title?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [invoices, query, statusFilter]);

  const totals = useMemo(() => {
    const total = invoices.reduce((s, i) => s + Number(i.totalAmount ?? i.amount ?? 0), 0);
    const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.totalAmount ?? i.amount ?? 0), 0);
    const pending = invoices.filter((i) => i.status === 'pending' || i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + Number(i.totalAmount ?? i.amount ?? 0), 0);
    const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + Number(i.totalAmount ?? i.amount ?? 0), 0);
    return { total, paid, pending, overdue };
  }, [invoices]);

  const sendInvoice = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.invoices.send(id);
      toast({ title: 'Invoice sent' });
      await load();
    } catch (e) {
      toast({ title: 'Send failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const markPaid = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.invoices.markPaid(id);
      toast({ title: 'Marked as paid' });
      await load();
    } catch (e) {
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const downloadReceipt = (id: string) => {
    window.open(`/api/invoices/${id}/receipt`, '_blank');
  };

  const downloadPdf = (id: string) => {
    // endpoint not yet available; stub with toast
    toast({ title: 'PDF download not yet available', description: `Receipt endpoint: /api/invoices/${id}/receipt`, variant: 'destructive' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-white/[0.06] rounded w-24 mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-white/[0.06] rounded w-40 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-white/[0.06] rounded w-28" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] p-6 animate-pulse space-y-3">
          <div className="h-10 bg-zinc-200 dark:bg-white/[0.06] rounded w-full" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-zinc-200 dark:bg-white/[0.06] rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Financials &amp; Payouts</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-emerald-600 font-semibold">Invoices &amp; Billings</span>
          </nav>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Institutional Invoices</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Issue, track, and reconcile institutional lease billings, service charges, and escrow collections.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-400">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Escrow Node: Active
          </div>
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export not yet wired' })}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => toast({ title: 'Generate Invoice', description: 'Use create endpoint; modal not yet wired' })}>
            <Plus className="w-4 h-4 mr-1" /> Generate Invoice
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Total Invoiced</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{'₦' + totals.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{invoices.length} lease agreements</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Pending Processing</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{'₦' + totals.pending.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Awaiting payer</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Settled to Escrow</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{'₦' + totals.paid.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cleared settlements</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-red-500 font-semibold">Overdue Balances</span>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{'₦' + totals.overdue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-red-500 mt-1">{invoices.filter((i) => i.status === 'overdue').length} tenants past due</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by invoice reference, tenant, or property unit..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/[0.04] rounded-lg px-3 py-1.5 border border-zinc-200 dark:border-white/[0.08]">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid &amp; Escrowed</option>
                <option value="pending">Pending Payment</option>
                <option value="overdue">Overdue</option>
                <option value="sent">Sent / Delivered</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/[0.04] rounded-lg px-3 py-1.5 border border-zinc-200 dark:border-white/[0.08]">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <select className="bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none cursor-pointer">
                <option value="q4">Last 90 Days</option>
                <option value="m30">Past 30 Days</option>
                <option value="ytd">Year-to-date</option>
              </select>
            </div>
          </div>
        </div>
        {/* quick pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {[
            { key: 'all', label: `All Invoices (${invoices.length})` },
            { key: 'paid', label: `Paid & Cleared (${invoices.filter((i) => i.status === 'paid').length})` },
            { key: 'pending', label: `Pending (${invoices.filter((i) => i.status === 'pending').length})` },
            { key: 'overdue', label: `Overdue (${invoices.filter((i) => i.status === 'overdue').length})` },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setStatusFilter(p.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === p.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / empty */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400 mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">No invoices found</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-4">
            There are no billings matching the active search parameters or date filters for this landlord portfolio.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setQuery(''); setStatusFilter('all'); }}>
              Reset Filters
            </Button>
            <Button size="sm" onClick={() => toast({ title: 'Generate Invoice', description: 'Modal not yet wired' })}>
              <Plus className="w-4 h-4 mr-1" /> Generate New Invoice
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-zinc-50 dark:bg-white/[0.04] border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Direct Interbank &amp; NIBSS Auto-Reconciled
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing <span className="font-bold text-zinc-900 dark:text-white">{filtered.length}</span> of {invoices.length} institutional records
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/[0.08]">
                  <th className="py-3 px-6 font-semibold">Invoice Ref</th>
                  <th className="py-3 px-4 font-semibold">Tenant &amp; Corporate Entity</th>
                  <th className="py-3 px-4 font-semibold">Property / Unit</th>
                  <th className="py-3 px-4 font-semibold">Issue Date</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₦)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                {filtered.map((inv) => {
                  const cfg = statusConfig[inv.status || 'draft'] || statusConfig.draft;
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-6 font-mono text-sm font-bold text-emerald-600">
                        <Link href="#" className="hover:underline flex items-center gap-1">
                          {inv.invoiceNumber || inv.id.slice(0, 8)}
                          <FileText className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center text-xs">
                            {initials(inv.tenant?.fullName)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{inv.tenant?.fullName || 'Unknown tenant'}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{inv.tenant?.email || 'Corporate Tenant'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white leading-tight">{inv.listing?.title || '—'}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{inv.listing?.address || ''}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-NG') : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-NG') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-bold text-zinc-900 dark:text-white">
                        {'₦' + Number(inv.totalAmount ?? inv.amount ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
                            title="View Invoice"
                            onClick={() => toast({ title: 'View invoice', description: inv.invoiceNumber || inv.id })}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
                            title="Download PDF"
                            onClick={() => downloadPdf(inv.id)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
                            title="Send Receipt"
                            onClick={() => downloadReceipt(inv.id)}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && (
                            <>
                              <button
                                className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                                title="Send"
                                disabled={actionId === inv.id}
                                onClick={() => sendInvoice(inv.id)}
                              >
                                {actionId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionId === inv.id}
                                onClick={() => markPaid(inv.id)}
                              >
                                Mark Paid
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}