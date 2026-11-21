'use client';

import { useEffect, useState } from 'react';
import { Copy, Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import { DCallout } from '@/components/onboarding/dossier/primitives';

type AccountState = {
  status: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  currency?: string | null;
};

export default function PaystackDedicatedAccountCard() {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadAccount() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/paystack/dedicated-account/status', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as
        | { data?: AccountState | null; error?: string }
        | null;
      if (!response.ok) throw new Error(payload?.error || 'Could not load your rent account.');
      setAccount(payload?.data ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your rent account.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  async function copyAccountNumber() {
    if (!account?.accountNumber) return;
    await navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return <p className="text-xs text-zinc-500">Checking your rent funding account…</p>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
        <span>{error}</span>
        <button type="button" onClick={() => void loadAccount()} className="inline-flex items-center gap-1 font-semibold">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!account) return null;

  if (!account.accountNumber) {
    return (
      <DCallout icon={<ShieldCheck className="h-4 w-4" />} title="Rent account setup in progress" tone="neutral">
        Your Dojah identity is approved. Paystack is still processing the dedicated account. We’ll
        show the account number here as soon as it is issued.
      </DCallout>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-zinc-950 dark:text-white">Your rent funding account</h2>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{account.status}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Transfer money to this account and it will be credited to your PropatiBox rent balance.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-mono text-xl font-semibold tracking-wide text-zinc-950 dark:text-white">{account.accountNumber}</p>
            <button type="button" onClick={copyAccountNumber} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{account.bankName || 'Paystack bank'} · {account.accountName || 'PropatiBox customer'}</p>
        </div>
      </div>
    </section>
  );
}
