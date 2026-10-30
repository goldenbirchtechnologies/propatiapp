'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  User,
  Wallet,
  Landmark,
  FileText,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

// Nigerian LIRS-aligned split used by the disbursement preview. These are the
// statutory rates the product applies to a gross rent disbursement.
const EM_RETAINER_RATE = 0.05; // estate manager management fee
const WHT_RATE = 0.025; // withholding tax remittance

const CARD = 'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] hover:shadow-md disabled:opacity-50 active:scale-[0.98]';

function ngn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DisbursementsForm() {
  const search = useSearchParams();

  // Prefill from ?reference / ?landlordId / ?amount (design behaviour)
  const [transactionId, setTransactionId] = useState(() => search.get('reference') ?? search.get('transactionId') ?? '');
  const [landlordId, setLandlordId] = useState(() => search.get('landlordId') ?? '');
  const [amount, setAmount] = useState(() => search.get('amount') ?? '');
  const [narrative, setNarrative] = useState('');

  const [wallet, setWallet] = useState<{ balance: number; locked: boolean } | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const res = await fetch('/api/wallet/balance', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const d = json?.data ?? {};
        setWallet({ balance: Number(d.balance ?? 0), locked: !!d.locked });
      }
    } catch {
      // wallet badge just won't show; non-fatal
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const gross = Number(amount) || 0;
  const emFee = gross * EM_RETAINER_RATE;
  const wht = gross * WHT_RATE;
  const net = gross - emFee - wht;

  const maxAmount = wallet?.balance ?? 0;
  const valid = gross > 0 && !!landlordId.trim() && !!transactionId.trim() && gross <= maxAmount && !wallet?.locked;

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!valid) return;
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch('/api/wallet/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: transactionId.trim(),
            landlordId: landlordId.trim(),
            amount: gross,
            description: narrative.trim() || `Disbursement for ${transactionId.trim()}`,
            retainerRate: EM_RETAINER_RATE,
            whtRate: WHT_RATE,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `Disbursement failed (${res.status})`);
        setSuccess(`Disbursed ${ngn(gross)} to the landlord wallet. Net settlement ${ngn(net)}.`);
        setAmount('');
        setNarrative('');
        loadWallet();
      } catch (err) {
        setError((err as Error).message ?? 'Disbursement failed');
      } finally {
        setSubmitting(false);
      }
    },
    [valid, transactionId, landlordId, gross, narrative, net, loadWallet]
  );

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
      <main className="mx-auto w-full max-w-[1240px] space-y-8 p-6 lg:p-10">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${MUTED}`}>
          <Link href="/dashboard/estate-manager" className="transition-colors hover:text-primary">Home</Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Link href="/dashboard/estate-manager/collections" className="transition-colors hover:text-primary">Rent &amp; Payments</Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="text-primary dark:text-[#4edea3]">Disbursements</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">
              <span>Custody Wallet</span>
              <span className="text-zinc-400">•</span>
              <span>Escrow Release</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Landlord Escrow Disbursement</h1>
            <p className={`text-sm ${MUTED}`}>
              Move collected rent from your custody wallet to a verified landlord wallet, with the management retainer and
              withholding tax split applied.
            </p>
          </div>
          <Link href="/dashboard/estate-manager/collections" className={BTN_PRIMARY}>
            <FileText className="h-4 w-4" /> Collections Ledger
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-primary bg-[var(--sovereign-container-bg)] px-4 py-3 text-sm text-[var(--sovereign-hover)] dark:border-primary/50 dark:bg-primary/30 dark:text-[#4edea3]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Form */}
          <div className={`${CARD} lg:col-span-8 overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Disburse to Landlord</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Escrow Release
                  </span>
                </div>
                <p className={MUTED}>Authenticated estate-manager session</p>
              </div>
              {/* Custody pool balance — real wallet balance */}
              <div className="rounded-lg bg-white px-3.5 py-2 text-right shadow-sm dark:bg-zinc-900">
                <span className={`block ${LABEL}`}>Custody Wallet Available</span>
                {loadingWallet ? (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin text-zinc-400" />
                ) : (
                  <span className="font-mono text-base font-semibold text-primary dark:text-[#4edea3]">
                    {wallet ? ngn(wallet.balance) : '—'}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6 p-6">
              {/* Reference */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={LABEL} htmlFor="reference">Listing Reference / Transaction ID</label>
                  <span className={MUTED}>Pre-filled from ?reference</span>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    id="reference"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction or listing reference"
                    className={`${INPUT} pl-10`}
                    required
                  />
                </div>
              </div>

              {/* Landlord */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={LABEL} htmlFor="landlordId">Landlord Beneficiary Account</label>
                  <span className={MUTED}>Pre-filled from ?landlordId</span>
                </div>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    id="landlordId"
                    value={landlordId}
                    onChange={(e) => setLandlordId(e.target.value)}
                    placeholder="Landlord user ID"
                    className={`${INPUT} pl-10`}
                    required
                  />
                </div>
                <p className={MUTED}>Funds settle to this landlord's platform wallet.</p>
              </div>

              {/* Amount + split preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={LABEL} htmlFor="amount">Disbursement Amount (Gross Mandate)</label>
                  {!loadingWallet && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(maxAmount))}
                      disabled={maxAmount <= 0}
                      className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary hover:bg-primary/10 disabled:opacity-40 dark:text-[#4edea3]"
                    >
                      Full Balance
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-0 inset-y-0 flex w-12 items-center justify-center rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 font-mono text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800">
                    ₦
                  </span>
                  <input
                    id="amount"
                    type="number"
                    min={0}
                    max={maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`${INPUT} pl-14 font-mono`}
                    required
                  />
                </div>

                {/* Split breakdown — live */}
                <div className="space-y-2.5 rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Gross Mandate Amount</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-white">{ngn(gross)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      EM Management Retainer
                      <span className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-700">{(EM_RETAINER_RATE * 100).toFixed(1)}%</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">- {ngn(emFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      Withholding Tax (WHT)
                      <span className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-700">{(WHT_RATE * 100).toFixed(1)}%</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">- {ngn(wht)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm dark:bg-zinc-900">
                    <span className="font-bold text-primary dark:text-[#4edea3]">Net Settlement to Landlord</span>
                    <span className="font-mono font-bold text-primary dark:text-[#4edea3]">{ngn(net)}</span>
                  </div>
                </div>
                {!loadingWallet && gross > maxAmount && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3 w-3" /> Amount exceeds your custody wallet balance ({ngn(maxAmount)}).
                  </p>
                )}
              </div>

              {/* Narrative */}
              <div className="space-y-1.5">
                <label className={LABEL} htmlFor="narrative">Payment Narrative / Remittance Memo</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    id="narrative"
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="e.g., Q3 net rent distribution"
                    className={`${INPUT} pl-10`}
                  />
                </div>
                <p className={MUTED}>Appears on the landlord's wallet transaction record.</p>
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Wallet-Backed Settlement</p>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400/80">
                    Disbursements move funds directly from your custody wallet to the landlord wallet and cannot exceed
                    your available balance. This action is recorded as a wallet transaction.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-4 sm:flex-row dark:border-zinc-800">
                <Link
                  href="/dashboard/estate-manager/collections"
                  className="order-2 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 sm:order-1 dark:text-zinc-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Cancel &amp; Return
                </Link>
                <button type="submit" disabled={!valid || submitting} className={`${BTN_PRIMARY} order-1 w-full sm:order-2 sm:w-auto`}>
                  {submitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Lock className="h-[18px] w-[18px]" />}
                  {submitting ? 'Processing…' : 'Disburse to Landlord'}
                </button>
              </div>
            </form>
          </div>

          {/* Context sidebar — real wallet + links */}
          <div className="space-y-6 lg:col-span-4">
            <div className={`${CARD} p-5`}>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Custody Wallet</h3>
                  <p className={MUTED}>Your settlement source</p>
                </div>
              </div>
              <div className="space-y-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className={MUTED}>Available Balance</span>
                  {loadingWallet ? <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" /> : <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{wallet ? ngn(wallet.balance) : '—'}</span>}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={MUTED}>Wallet Status</span>
                  <span className={`font-semibold ${wallet?.locked ? 'text-rose-600 dark:text-rose-400' : 'text-primary dark:text-[#4edea3]'}`}>
                    {wallet ? (wallet.locked ? 'Locked' : 'Active') : '—'}
                  </span>
                </div>
                <button onClick={loadWallet} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
            </div>

            <div className={`${CARD} p-5`}>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Settlement Rates</h3>
                  <p className={MUTED}>Applied to every mandate</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className={MUTED}>EM Management Retainer</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">{(EM_RETAINER_RATE * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={MUTED}>Withholding Tax (WHT)</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">{(WHT_RATE * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
                  <span className={MUTED}>Net to Landlord</span>
                  <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
                    {((1 - EM_RETAINER_RATE - WHT_RATE) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

export default function DisbursementsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>}>
      <DisbursementsForm />
    </Suspense>
  );
}
