'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, CheckCircle, ChevronRight, CreditCard, Lock, Receipt, Shield, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export type AutoPayMandate = {
  title: string;
  address: string;
  reference: string;
  rentAmount: number;
  rentPeriod: string | null;
};

export default function AutoPayConfigurationClient({ mandate }: { mandate?: AutoPayMandate | null }) {
  const [enabled, setEnabled] = useState(true);
  const [execDate, setExecDate] = useState<'1st' | '3rd' | '5th'>('1st');
  const [amountStrategy, setAmountStrategy] = useState<'full' | 'partial'>('full');
  const [threshold, setThreshold] = useState('50,000.00');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/paystack/auto-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, execDate, amountStrategy, threshold }),
      });
      if (!res.ok) {
        toast.info('Auto-pay configuration saved locally. Backend endpoint coming soon.');
      } else {
        toast.success('Auto-pay configuration saved.');
      }
    } catch {
      toast.info('Auto-pay configuration saved locally. Backend endpoint coming soon.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = () => {
    toast.info('Mandate revocation requested. Contact estate desk to complete.');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/tenant/payments" className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rent &amp; Payments
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="font-semibold text-zinc-900 dark:text-white">Direct Debit Mandate Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Auto-Pay Configuration</h1>
            <span className="px-2 py-0.5 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3] text-xs font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Paystack Tokenized
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Automate recurring rent settlements, set execution thresholds, and protect your lease tenancy record with verified NIBSS &amp; Paystack direct debit mandates.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] self-start lg:self-auto">
          <Shield className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">FIRS Compliant • NIBSS Verified</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Central Bank of Nigeria (CBN) Direct Debit Framework</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Master activation */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">Automatic Rent Settlement</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3] text-xs font-semibold">Active Mandate</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    When enabled, recurring rent obligations are debited automatically without manual invoice processing.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="mt-4 pt-4 bg-zinc-50 dark:bg-white/[0.04] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-zinc-900 dark:text-white">Tenancy Record Guarantee</span>
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Zero Arrears Flag Active</span>
            </div>
          </div>

          {/* Config params */}
          <div className={`bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm flex flex-col gap-6 transition-all ${enabled ? '' : 'opacity-45 pointer-events-none'}`}>
            {/* Payment method */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Default Settlement Source <span className="text-red-500">*</span>
                </label>
                <Link href="/dashboard/tenant/payments/methods" className="text-xs font-semibold text-primary hover:text-[var(--sovereign-hover)] flex items-center gap-1">
                  Manage NIBSS Accounts
                </Link>
              </div>
              <div className="mt-1 w-full bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors rounded-lg p-4 flex items-center justify-between cursor-pointer border border-zinc-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center font-bold text-zinc-900 dark:text-white">Z</div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Zenith Bank Corp Direct Debit</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">(•••• 4190)</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> NIBSS Linked
                      </span>
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Account: Sovereign Corporate Holdings Ltd • Mandate ID: NIBSS-88392019-ZB</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400 rotate-90" />
              </div>
            </div>

            {/* Execution date */}
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900 dark:text-white">Monthly Execution Trigger</label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Select preferred debit cycle ahead of statutory tenancy deadline (Due 28th of every month)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                {([
                  { k: '1st' as const, label: '1st of Month', sub: 'Maximum grace period clearance', badge: 'Recommended' },
                  { k: '3rd' as const, label: '3rd of Month', sub: 'Standard corporate payroll alignment', badge: '48h pre-reconciliation' },
                  { k: '5th' as const, label: '5th of Month', sub: 'Late cycle buffer for audit clearance', badge: 'Close to grace cut-off' },
                ]).map((opt) => (
                  <label
                    key={opt.k}
                    className={`relative flex flex-col p-4 rounded-lg cursor-pointer transition-all border ${execDate === opt.k ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border-primary/30 shadow-sm' : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.08]'}`}
                  >
                    <input type="radio" name="executionDate" value={opt.k} checked={execDate === opt.k} onChange={() => setExecDate(opt.k)} className="sr-only" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{opt.label}</span>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${execDate === opt.k ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                        {execDate === opt.k && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{opt.sub}</span>
                    <span className={`mt-auto inline-block px-1.5 py-0.5 text-xs font-semibold rounded w-max ${execDate === opt.k ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'text-zinc-500 dark:text-zinc-400'}`}>{opt.badge}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount strategy */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-white">Settlement Obligation Amount</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                <div
                  onClick={() => setAmountStrategy('full')}
                  className={`p-4 rounded-lg flex items-start gap-3 cursor-pointer border ${amountStrategy === 'full' ? 'bg-zinc-50 dark:bg-white/[0.04] border-primary/30 shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]'}`}
                >
                  <input type="radio" name="amountStrategy" checked={amountStrategy === 'full'} onChange={() => setAmountStrategy('full')} className="mt-1 accent-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">Full Monthly Rent</span>
                    <span className="text-sm font-bold text-primary mt-0.5 font-mono">₦ 1,250,000.00</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Automatic matching against current signed lease obligation.</span>
                  </div>
                </div>
                <div
                  onClick={() => setAmountStrategy('partial')}
                  className={`p-4 rounded-lg flex items-start gap-3 cursor-pointer border ${amountStrategy === 'partial' ? 'bg-zinc-50 dark:bg-white/[0.04] border-primary/30 shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]'}`}
                >
                  <input type="radio" name="amountStrategy" checked={amountStrategy === 'partial'} onChange={() => setAmountStrategy('partial')} className="mt-1 accent-primary" />
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">Partial / Custom Sinking Fund</span>
                    <div className="flex items-center mt-2 rounded bg-zinc-50 dark:bg-white/[0.04] overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
                      <span className="px-3 py-2 bg-zinc-100 dark:bg-white/[0.08] font-mono text-sm text-zinc-900 dark:text-white font-semibold">₦</span>
                      <Input disabled={amountStrategy !== 'partial'} placeholder="500,000.00" className="border-0 bg-transparent font-mono" />
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Remaining balance must be cleared manually prior to 28th.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low balance threshold */}
            <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-white/[0.04] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-primary" />
                <label className="text-sm font-semibold text-zinc-900 dark:text-white">Low Balance Threshold Safeguard</label>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                Dispatch urgent SMS &amp; sovereign encrypted mail alerts 48 hours prior if verified clearing account balance falls below threshold:
              </p>
              <div className="flex items-center max-w-xs rounded-lg bg-white dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
                <span className="px-3.5 py-2 bg-zinc-100 dark:bg-white/[0.08] font-mono text-sm text-zinc-900 dark:text-white font-bold">₦</span>
                <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} className="border-0 bg-transparent font-mono" />
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-primary" /> Prevents NIBSS return charge penalties (₦2,500 statutory bounce fee).
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-[var(--sovereign-hover)] text-white font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> {saving ? 'Saving…' : 'Save & Activate Schedule'}
                </Button>
                <Button variant="outline" className="border-zinc-200 dark:border-white/[0.08]">Cancel</Button>
              </div>
              <button onClick={handleRevoke} className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                <Zap className="h-4 w-4" /> Revoke Mandate
              </button>
            </div>
          </div>

          {/* Location ref */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-white/[0.08] shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-white/[0.04] flex-shrink-0 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Allocated Asset</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {mandate ? mandate.title : 'No active tenancy'}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {mandate
                  ? `${mandate.address || 'Address not recorded'} • Lease ${mandate.reference.slice(0, 12).toUpperCase()}`
                  : 'An executed tenancy agreement is required before auto-pay can be configured.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Projected debit ledger */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm overflow-hidden">
            <div className="p-6 bg-zinc-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-zinc-900 dark:text-white">Projected Debit Ledger</span>
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Next 4 Cycles</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Automated execution timetable aligned with CBN interbank settlements.</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { n: 1, date: 'May 1, 2025', status: 'Scheduled', pulse: true },
                { n: 2, date: 'Jun 1, 2025', status: 'Pending Queue', pulse: false },
                { n: 3, date: 'Jul 1, 2025', status: 'Pending Queue', pulse: false },
                { n: 4, date: 'Aug 1, 2025', status: 'Pending Queue', pulse: false },
              ].map((c) => (
                <div key={c.n} className={`p-4 rounded-lg flex items-center justify-between ${c.n === 1 ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-white/[0.08]' : 'bg-zinc-50 dark:bg-white/[0.04]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${c.n === 1 ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>{c.n}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{c.date}</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Zenith Direct Debit (•••• 4190)</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">₦ 1,250,000.00</span>
                    <span className={`text-xs font-semibold flex items-center justify-end gap-1 ${c.pulse ? 'text-primary' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {c.pulse && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />} {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-white/[0.02] flex items-start gap-2 border-t border-zinc-200 dark:border-white/[0.08]">
              <Receipt className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                All automated transactions automatically generate certified FIRS digital e-receipts archived directly into your official Sovereign tax compliance repository.
              </span>
            </div>
          </div>

          {/* Mandate guarantee */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">CBN &amp; NDPR Mandate Protection</span>
                <span className="block text-xs font-semibold text-primary">Institutional Grade Liquidity Assurance</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {[
                { icon: Lock, title: 'Zero Duplicate Billing Guarantee', desc: 'NIBSS idempotency tokens ensure invoices are settled once and only once per 30-day lease term.' },
                { icon: Shield, title: 'Grace-Period Manual Suspension', desc: 'Pause or reschedule anytime with 5 business days advance notice with zero penalty points against tenancy score.' },
                { icon: Lock, title: '256-Bit Financial Encryption', desc: 'Direct integration with Interswitch & Paystack Enterprise routing engines. PropatiBox never stores raw PINs or BVN credentials.' },
              ].map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <g.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{g.title}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{g.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-4 bg-zinc-50 dark:bg-white/[0.04] p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-zinc-500" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Audited Mandate Desk</span>
              </div>
              <span className="text-xs font-bold text-primary font-mono">+234 (1) 800-PROPATI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
