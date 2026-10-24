import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, AlertTriangle, Wrench, FileText, ArrowRight, Phone, CheckCircle2 } from 'lucide-react';

export default async function TenantMaintenanceProtocolPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
            <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">Maintenance</Link>
            <span className="text-zinc-300 dark:text-zinc-700">›</span>
            <span className="text-zinc-900 dark:text-white">Protocol &amp; Standards</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Maintenance Protocol &amp; Standards</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">SLA, coverage, escalation, and tenant responsibilities under the Lagos Tenancy Covenant — how every request is triaged, dispatched, and closed.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-red-700 dark:text-red-300">EMERGENCY (P1)</span><span className="h-2 w-2 rounded-full bg-red-600" /></div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 2 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total power blackout, gas alert, fire sensor, elevator stall.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Call hotline first — then ticket auto-creates</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Engineer en route within 30 mins</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-amber-700 dark:text-amber-300">HIGH (P2)</span><span className="h-2 w-2 rounded-full bg-amber-500" /></div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 6 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">HVAC failure, primary pump trip, water pressure loss.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Same-day dispatch, parts pre-staged</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Photo evidence required</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-emerald-700 dark:text-emerald-300">ROUTINE (P3/P4)</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 24 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">General plumbing, carpentry, access card sync, cosmetic.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Scheduled next-day window</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Tenant confirms resolution</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6 lg:col-span-8">
              <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><FileText className="h-5 w-5 text-emerald-500" /> Tenant Responsibilities</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                  <p className="font-semibold text-zinc-900 dark:text-white">Access</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">Ensure a representative is present or grant unattended clearance via the ticket. Missed access may reschedule and count toward SLA.</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                  <p className="font-semibold text-zinc-900 dark:text-white">Evidence</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">Attach clear photos/video and precise symptoms. P1/P2 tickets without evidence may be deprioritized per Sec 14.</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                  <p className="font-semibold text-zinc-900 dark:text-white">Coverage</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">Service charge covers diagnostics + parts up to ₦150,000 per incident. Exclusions (tenant damage) are quoted before work.</p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                  <p className="font-semibold text-zinc-900 dark:text-white">Sign-off</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">Confirm resolution in the ticket detail. Unconfirmed resolved tickets auto-close after 72 hours.</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6 lg:col-span-4">
              <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Escalation</h2>
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06] font-mono text-xs font-bold">1</span><span><strong className="text-zinc-900 dark:text-white">Facility Desk</strong> — Log or call; triage within 30 mins.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06] font-mono text-xs font-bold">2</span><span><strong className="text-zinc-900 dark:text-white">MEP Partner</strong> — Assigned specialist contacts you directly.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06] font-mono text-xs font-bold">3</span><span><strong className="text-zinc-900 dark:text-white">Estate Manager</strong> — SLA breach auto-escalates to org management.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06] font-mono text-xs font-bold">4</span><span><strong className="text-zinc-900 dark:text-white">LASRERA</strong> — Unresolved disputes route via Disputes channel.</span></li>
              </ol>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"><Link href="/dashboard/tenant/maintenance/new">New Request <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline" size="sm"><Link href="/dashboard/tenant/maintenance/emergency"><Phone className="mr-1 h-4 w-4" /> Emergency Hotline</Link></Button>
                <Button asChild variant="ghost" size="sm"><Link href="/dashboard/tenant/maintenance">Back to Maintenance</Link></Button>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><Clock className="h-3.5 w-3.5" /> Protocol version 4.2 — ISO 41001</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
