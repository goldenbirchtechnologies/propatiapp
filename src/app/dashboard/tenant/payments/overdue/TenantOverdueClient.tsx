'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ArrowLeft, Bolt, Calendar, Download, FileText, Handshake, Percent, Receipt, Shield, Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';
import { toast } from 'sonner';

type Row = { id: string; title: string; amount: number; currency: string; dueDate: string | null; status: string; reference: string };

export default function TenantOverdueClient({ rows, totalOverdue }: { rows: Row[]; totalOverdue: number }) {
  const overdueCount = rows.length;
  const earliest = useMemo(() => rows.map((r) => r.dueDate).filter(Boolean).sort()[0], [rows]);

  const handlePayPlan = () => toast.info('Payment plan request submitted. Estate desk will review.');
  const handleSupport = () => toast.info('Support ticket opened.');

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/tenant/payments" className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rent &amp; Payments
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="font-semibold text-zinc-900 dark:text-white">Overdue Payments</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Overdue Payment Notice</h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Legal Notice Active
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            You have outstanding payment(s) linked to your current agreements. Resolve promptly to avoid penalties and protect your tenancy record.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 self-start lg:self-auto">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Compliance at Risk</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">FIRS &amp; CAC Audited</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Overdue Balance</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 font-mono">₦ {totalOverdue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{overdueCount} overdue invoice{overdueCount === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Earliest Due Date</h3>
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{earliest ? new Date(earliest).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Oldest outstanding</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Notice Reference</h3>
            <FileText className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{overdueCount > 0 ? 'OD-' + rows[0].id.slice(-6).toUpperCase() : '—'}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Awaiting issuance</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePayPlan} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Bolt className="h-4 w-4" /> Request Payment Plan
        </Button>
        <Button variant="outline" onClick={handleSupport} className="gap-2">
          <Headphones className="h-4 w-4" /> Contact Support
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Downloading overdue statement...')}>
          <Download className="h-4 w-4" /> Download Statement
        </Button>
      </div>

      {/* Overdue invoices table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Overdue Invoices</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{rows.length} item{rows.length === 1 ? '' : 's'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-semibold">Property &amp; Reference</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (NGN)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-sm">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 dark:text-zinc-400">No overdue payments. You're all caught up.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-white">{r.title}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{r.reference}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-zinc-900 dark:text-white">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-mono font-semibold text-red-500">₦ {r.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                      <AlertTriangle className="w-3 h-3" /> Overdue
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                        <Bolt className="w-3.5 h-3.5" /> Pay Now
                      </Button>
                      <a href={`/api/invoices/${r.id}/receipt`} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Next Steps</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Review your current agreements and outstanding invoices.</li>
          <li>Use Rent &amp; Payments to make a partial or full payment.</li>
          <li>Contact your landlord or agent if you need a payment plan.</li>
        </ul>
      </div>
    </div>
  );
}