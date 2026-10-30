'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type Invoice = {
  id: string;
  type: string;
  amount: number;
  currency?: string;
  status: string;
  dueDate?: string;
  createdAt?: string;
  listing?: { title?: string } | null;
};

export default function AutomatedMonthlyStatementClient() {
  const [enrolled, setEnrolled] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setInvoices(Array.isArray(data?.data) ? data.data : []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const handleDownload = (id: string) => {
    window.open(`/api/invoices/${id}/receipt`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/tenant/payments" className="text-zinc-600 dark:text-zinc-400 hover:text-primary">Payments</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        <span className="font-semibold text-zinc-900 dark:text-white">Statement Details</span>
      </nav>

      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-4">
          <FileText className="w-5 h-5 text-zinc-900 dark:text-white" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Statement Details</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors" onClick={() => window.print()}>
            <Printer className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => toast.info('Statement download started.')}>
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      </div>

      {/* A4 Report Layout */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm flex flex-col gap-6 overflow-hidden relative max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-zinc-200 dark:border-white/[0.08] pb-5 gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">PropatiBox</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Rental Statement</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Statement Period</p>
            <p className="font-semibold text-zinc-900 dark:text-white">{new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading statement...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-xs">
                  <th className="py-2 px-3 font-semibold">Description</th>
                  <th className="py-2 px-3 font-semibold">Property</th>
                  <th className="py-2 px-3 font-semibold">Due Date</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2 px-3 font-semibold text-center">Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-zinc-900 dark:text-white">{inv.type} — {inv.id.slice(-6).toUpperCase()}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{inv.listing?.title ?? 'Propati'}</td>
                    <td className="py-2 px-3 font-mono text-zinc-900 dark:text-white">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-NG') : '—'}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">₦ {Number(inv.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'paid' ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : inv.status === 'overdue' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => handleDownload(inv.id)} className="text-primary hover:text-[var(--sovereign-hover)] text-xs font-semibold">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-pay enrollment */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Auto-Pay Enrollment</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={enrolled} onChange={(e) => setEnrolled(e.target.checked)} />
            <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
        {enrolled && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-zinc-900 dark:text-white">Card Number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
              <Label htmlFor="agree" className="text-sm text-zinc-600 dark:text-zinc-400">I authorize recurring rent debits.</Label>
            </div>
            <Button
              disabled={!agreed}
              onClick={() => toast.success('Auto-pay enrollment saved.')}
              className="bg-primary hover:bg-[var(--sovereign-hover)] text-white"
            >
              Enroll
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}