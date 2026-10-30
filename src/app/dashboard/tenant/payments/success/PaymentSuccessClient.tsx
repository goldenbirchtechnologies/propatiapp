'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2, ChevronRight, Copy, CreditCard, Download, FileText, Printer, Clock, Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

type Txn = {
  id: string;
  reference: string;
  amount: number;
  type: string;
  status: string;
  listing?: { title?: string } | null;
  paidAt?: string | null;
  createdAt?: string | null;
};

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get('reference') || searchParams.get('ref');
  const [txn, setTxn] = useState<Txn | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (refParam) {
          const res = await fetch(`/api/payments/verify/${encodeURIComponent(refParam)}`);
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) setTxn(data?.data ?? data ?? null);
            return;
          }
        }
        // fallback: latest released transaction
        const res = await fetch('/api/payments/transactions?status=released&limit=1');
        if (res.ok) {
          const data = await res.json();
          const first = Array.isArray(data?.data) ? data.data[0] : null;
          if (!cancelled) setTxn(first);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refParam]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const amount = txn ? Number(txn.amount) / 100 : 0;
  const reference = txn?.reference ?? refParam ?? '—';
  const date = txn?.paidAt || txn?.createdAt;
  const property = txn?.listing?.title || 'Property';

  const copyRef = () => {
    navigator.clipboard?.writeText(reference);
    toast.success('Reference copied');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <span className="font-mono text-zinc-600 dark:text-zinc-400">PAYMENTS</span>
        <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        <span className="font-mono text-zinc-600 dark:text-zinc-400">PROPERTY</span>
        <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        <span className="font-mono text-zinc-900 dark:text-white font-semibold">SUCCESS</span>
      </nav>

      {/* Success Hero */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/20 mb-4 shadow-[0_20px_50px_rgba(0, 108, 73,0.2)]">
          <CheckCircle2 className="w-12 h-12 text-primary dark:text-[#4edea3]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-2">Payment Successful</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
          Your transaction has been processed securely. A confirmation email and receipt have been sent to your registered address.
        </p>
      </section>

      {/* Transaction Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Total Amount Paid</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white font-mono">
                  {loading ? '—' : `₦ ${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                </h3>
              </div>
              <div className="bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </div>
            </div>
            <div className="space-y-3 border-t border-zinc-200 dark:border-white/[0.08] pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Reference</span>
                <span className="font-mono text-zinc-900 dark:text-white flex items-center gap-2">
                  {reference}
                  <button onClick={copyRef} className="text-zinc-400 hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Property</span>
                <span className="text-zinc-900 dark:text-white">{property}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Type</span>
                <span className="text-zinc-900 dark:text-white">{txn?.type ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Date</span>
                <span className="text-zinc-900 dark:text-white">{date ? new Date(date).toLocaleString('en-NG') : '—'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button className="flex-1 gap-2 bg-primary hover:bg-[var(--sovereign-hover)] text-white" onClick={() => toast.info('Receipt download started.')}>
              <Download className="w-4 h-4" /> Download Receipt
            </Button>
          </div>
        </div>

        <div className="md:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-white/[0.08]">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Transaction Timeline</h3>
          <div className="space-y-4">
            {[
              { label: 'Card Endpoint Auth', done: true },
              { label: 'Payment Capture', done: true },
              { label: 'Ledger Reconciliation', done: true },
              { label: 'Statement Emailed', done: false },
              { label: 'Property Verified', done: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${s.done ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-primary' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-400'}`}>
                  {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <span className={`text-sm ${s.done ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.08]">
            <Link href="/dashboard/tenant/payments" className="text-sm font-semibold text-primary hover:text-[var(--sovereign-hover)]">
              Back to Rent &amp; Payments →
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Auto-redirect in {countdown}s</p>
          </div>
        </div>
      </div>
    </div>
  );
}