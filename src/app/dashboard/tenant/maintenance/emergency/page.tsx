import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, ShieldCheck, Clock, ArrowRight, Wrench, Droplets, Zap } from 'lucide-react';

export default async function TenantMaintenanceEmergencyPage() {
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
            <span className="text-red-600 dark:text-red-400">Emergency Hotline</span>
          </div>

          <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white"><Phone className="h-6 w-6" /></span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">24/7 Emergency Incident Hotline</h1>
                  <p className="mt-1 max-w-xl text-sm text-zinc-700 dark:text-zinc-300">For gas leaks, fire, flooding, total power loss, or security breach — call dispatch immediately. Do not wait for ticket triage.</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-500 text-white"><a href="tel:+23412908820"><Phone className="mr-2 h-5 w-5" /> Call +234 1 290 8820</a></Button>
                <Button asChild variant="outline" size="sm"><a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer">WhatsApp Duty Engineer</a></Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-900 px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300"><Clock className="h-3.5 w-3.5 text-red-500" /> Avg pickup 8 seconds</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-900 px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> LASRERA Certified Dispatch</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-900 px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> P1 — &lt; 2 hour SLA</span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Droplets className="h-5 w-5 text-blue-500" /> Flooding / Water</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Burst pipe, sewage backup, major leak affecting electrics — shut mains, call hotline, then log ticket.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/dashboard/tenant/maintenance/new">Log Emergency Ticket <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Zap className="h-5 w-5 text-amber-500" /> Power / Gas</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Total blackout, gas smell, sparking DB — evacuate, ventilate, call hotline before ticketing.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/dashboard/tenant/maintenance/new">Log Emergency Ticket <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Wrench className="h-5 w-5 text-zinc-500" /> Security / Access</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Break-in, intercom failure, elevator stall — call control room, then track via ticket.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/dashboard/tenant/maintenance">View My Tickets <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-zinc-900 dark:text-white">What happens when you call?</h3>
            <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <li className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">01</span><p className="mt-1 font-semibold text-zinc-900 dark:text-white">Triage</p><p className="text-zinc-600 dark:text-zinc-400">Control room logs P1, confirms address &amp; access, dispatches nearest MEP partner.</p></li>
              <li className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">02</span><p className="mt-1 font-semibold text-zinc-900 dark:text-white">Dispatch</p><p className="text-zinc-600 dark:text-zinc-400">Engineer en route within 30 mins; ticket auto-created and linked to your unit.</p></li>
              <li className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">03</span><p className="mt-1 font-semibold text-zinc-900 dark:text-white">Track</p><p className="text-zinc-600 dark:text-zinc-400">Follow progress in Maintenance → ticket detail → lifecycle &amp; photos.</p></li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"><Link href="/dashboard/tenant/maintenance/new">Create Emergency Ticket</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/dashboard/tenant/maintenance">Back to Maintenance</Link></Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
