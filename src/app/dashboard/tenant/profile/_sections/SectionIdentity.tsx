'use client';

import { IdCard, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SectionPanel } from '../_components/parts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Read-only: this section reports verification, it does not collect it. The
 * ID flags come from the Dojah flow, never from a form — see the note in the
 * tenant-profile route about not accepting verification writes.
 */
export function SectionIdentity({
  idType,
  idVerified,
  ninVerified,
  incomeVerified,
}: {
  idType: string | null;
  idVerified: boolean;
  ninVerified: boolean;
  incomeVerified: boolean;
}) {
  return (
    <SectionPanel
      index={2}
      title="Identity verification"
      description="Your ID is checked by our verification partner. It cannot be edited here."
    >
      <div className="space-y-3">
        <StatusRow
          icon={<IdCard className="h-4 w-4" aria-hidden />}
          label={idType ? idType.toUpperCase() : 'Government ID'}
          ok={idVerified}
          hint="Verified with Dojah"
        />
        <StatusRow
          icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
          label="NIN"
          ok={ninVerified}
          hint="National Identity Number"
        />
        <StatusRow
          icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
          label="Income"
          ok={incomeVerified}
          hint="Payslip or bank statement"
          optional
        />
      </div>

      {!idVerified && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="font-medium text-amber-900 dark:text-amber-200">Your ID is not verified yet</p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90">
            Most landlords will not consider an application without a verified ID.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/verification">Start verification</Link>
          </Button>
        </div>
      )}
    </SectionPanel>
  );
}

function StatusRow({
  icon,
  label,
  ok,
  hint,
  optional,
}: {
  icon: React.ReactNode;
  label: string;
  ok: boolean;
  hint: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-white/[0.08]">
      <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      </div>
      {ok ? (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
          Verified
        </Badge>
      ) : optional ? (
        <Badge variant="secondary">Optional</Badge>
      ) : (
        <Badge className="gap-1 bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          <ShieldAlert className="h-3 w-3" aria-hidden /> Not verified
        </Badge>
      )}
    </div>
  );
}
