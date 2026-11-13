'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Copy, KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MfaEnrolmentClientProps {
  enrolled: boolean;
  enabledAt: string | null;
  recoveryCodesRemaining: number;
}

interface SetupPayload {
  qrCode: string;
  manualEntryKey: string;
  recoveryCodes: string[];
}

/**
 * Authenticator-app enrolment: start → scan → confirm a code.
 *
 * The secret only ever exists in the response to `setup` and, encrypted, in the
 * database; this component keeps it in memory for the length of the flow and
 * drops it on success.
 */
export default function MfaEnrolmentClient({
  enrolled: initiallyEnrolled,
  enabledAt,
  recoveryCodesRemaining,
}: MfaEnrolmentClientProps) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(initiallyEnrolled);
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const startSetup = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/users/mfa/setup', { method: 'POST' });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || 'Could not start enrolment.');
      setSetup(body.data as SetupPayload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start enrolment');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/users/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || 'That code was not accepted.');
      setEnrolled(true);
      setSetup(null);
      setCode('');
      toast.success('Two-factor authentication is on');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not verify the code');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/users/mfa', { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not turn off two-factor authentication.');
      setEnrolled(false);
      toast.success('Two-factor authentication is off');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not turn off MFA');
    } finally {
      setBusy(false);
    }
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/admin/profile/security" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-primary dark:text-zinc-400">
        <ArrowLeft className="h-4 w-4" /> Back to security
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">Two-factor authentication</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Require a 6-digit code from an authenticator app in addition to your sign-in.
        </p>
      </div>

      {enrolled && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#006c49]" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Enabled</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {enabledAt ? `Since ${new Date(enabledAt).toLocaleDateString('en-NG')}` : 'Active on this account'}
                {` · ${recoveryCodesRemaining} recovery code${recoveryCodesRemaining === 1 ? '' : 's'} left`}
              </p>
            </div>
          </div>
          {recoveryCodesRemaining <= 2 && (
            <p className="text-xs text-warning">
              You are running low on recovery codes. Turn the factor off and on again to issue a fresh set.
            </p>
          )}
          <Button variant="outline" onClick={disable} disabled={busy} className="gap-2">
            Turn off two-factor authentication
          </Button>
        </div>
      )}

      {!enrolled && !setup && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-zinc-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You will need an authenticator app — Google Authenticator, Authy or 1Password all work.
            </p>
          </div>
          <Button onClick={startSetup} disabled={busy} className="gap-2">
            <KeyRound className="h-4 w-4" /> {busy ? 'Preparing…' : 'Start setup'}
          </Button>
        </div>
      )}

      {setup && (
        <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950/50">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">1. Scan this code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qrCode} alt="Authenticator QR code" className="mt-3 h-44 w-44 rounded-lg bg-white p-2" />
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-white/[0.06]">{setup.manualEntryKey}</code>
              <button onClick={() => copy(setup.manualEntryKey)} className="text-xs font-semibold text-primary hover:underline">
                Copy
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Type this in by hand if your app cannot scan the image.</p>
          </div>

          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">2. Save your recovery codes</p>
            <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
              Each one signs you in once if you lose your phone. They are shown only this time.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {setup.recoveryCodes.map((recoveryCode) => (
                <code key={recoveryCode} className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-white/[0.06]">
                  {recoveryCode}
                </code>
              ))}
            </div>
            <button onClick={() => copy(setup.recoveryCodes.join('\n'))} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <Copy className="h-3 w-3" /> Copy all
            </button>
          </div>

          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">3. Enter the code the app shows</p>
            <div className="mt-2 flex items-center gap-3">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                className="w-32 font-mono tracking-widest"
              />
              <Button onClick={confirmCode} disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Turn on'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
