'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Result = { success?: boolean; cardLast4?: string; cardBrand?: string; refunded?: boolean; message?: string; error?: string };

export default function CardSetupCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setResult({ error: 'No card setup reference was returned by Paystack.' });
      return;
    }
    fetch(`/api/payments/methods/card/complete?reference=${encodeURIComponent(reference)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to verify card setup.');
        setResult(payload);
      })
      .catch((error) => setResult({ error: error instanceof Error ? error.message : 'Unable to verify card setup.' }));
  }, [searchParams]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm dark:border-white/[0.09] dark:bg-zinc-900">
        {!result && <><Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-white">Verifying your card</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Please wait while Paystack confirms the authorization.</p></>}
        {result?.success && <><CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-white">Card saved</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{result.cardBrand || 'Card'} ending in {result.cardLast4}. {result.refunded ? 'The ₦50 verification refund has been initiated.' : 'The ₦50 verification refund needs attention.'}</p><Button className="mt-6 bg-primary text-white hover:bg-primary/90" onClick={() => router.push('/dashboard/tenant/payments')}>Return to payments</Button></>}
        {result && !result.success && <><AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" aria-hidden="true" /><h1 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-white">Card setup failed</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{result.error}</p><Button variant="outline" className="mt-6" onClick={() => router.push('/dashboard/tenant/payments/methods/new?method=card')}>Try again</Button></>}
      </section>
    </main>
  );
}
