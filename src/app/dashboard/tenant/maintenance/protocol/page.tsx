import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck, Clock, AlertTriangle, Wrench, FileText, ArrowRight, Phone, CheckCircle2,
  PlusCircle, Cog, BadgeCheck, Verified, Scale, PhoneCall, MessageCircle,
  Shield, Flame, Ambulance, Gauge, Gavel, CheckCircle,
  Timer, Lock, Image as ImageIcon, MapPin, QrCode,
} from 'lucide-react';

export default async function TenantMaintenanceProtocolPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Breadcrumb & Compliance Notification Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <nav className="flex items-center gap-1 text-[11px] font-mono tracking-widest text-zinc-500">
              <span>DASHBOARD</span>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <span>FACILITY &amp; SERVICES</span>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <span>MAINTENANCE</span>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <span className="font-semibold text-primary dark:text-[#4edea3]">PROTOCOL &amp; SLA</span>
            </nav>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                SLA Registry: NG-LAG-2024-MEP
              </span>
              <span className="rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">
                Revision 4.2 active
              </span>
            </div>
          </div>

          {/* Page Header Card */}
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--sovereign-container-bg)] dark:bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">
                    <Verified className="h-3.5 w-3.5" /> ISO 41001 Certified Facility Management
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                    <FileText className="h-3.5 w-3.5 text-primary" /> LASRERA Compliant
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                    <Lock className="h-3.5 w-3.5 text-primary" /> Paystack Escrow Protected
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
                  Maintenance Protocol &amp; Facility Standards
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  This page explains how maintenance requests, diagnostic triage, verified partner assignments, and dispute resolution are handled across Sovereign Estate &amp; PropatiBox managed properties in accordance with Lagos State tenancy laws and ISO-grade MEP governance.
                </p>
              </div>
              <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
                <Button asChild className="bg-primary hover:bg-primary text-white">
                  <Link href="/dashboard/tenant/maintenance/new"><PlusCircle className="mr-2 h-4 w-4" /> Submit Request</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/tenant/maintenance"><Clock className="mr-2 h-4 w-4" /> Active Tickets</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* SLA Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest text-red-700 dark:text-red-300">EMERGENCY (P1)</span>
                <span className="h-2 w-2 rounded-full bg-red-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 2 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total power blackout, gas alert, fire sensor, elevator stall.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Call hotline first — then ticket auto-creates</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Engineer en route within 30 mins</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest text-amber-700 dark:text-amber-300">HIGH (P2)</span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 6 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">HVAC failure, primary pump trip, water pressure loss.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Same-day dispatch, parts pre-staged</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Photo evidence required</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">ROUTINE (P3/P4)</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">&lt; 24 Hours</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">General plumbing, carpentry, access card sync, cosmetic.</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Scheduled next-day window</li>
                <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" /> Tenant confirms resolution</li>
              </ul>
            </div>
          </div>

          {/* Main 12-col layout */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* LEFT MAIN (8) */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              {/* 4-Stage Resolution Cycle */}
              <section className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">Standard Operating Procedure</span>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">4-Stage Dispute-Proof Resolution Cycle</h2>
                  </div>
                  <span className="rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">
                    Enforced by Tenancy Covenant
                  </span>
                </div>
                <div className="relative flex flex-col gap-4">
                  <div className="absolute left-6 top-8 bottom-8 hidden w-0.5 bg-zinc-200 dark:bg-white/[0.08] sm:block" />
                  {/* Stage 1 */}
                  <div className="relative flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] sm:flex-row sm:items-start">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white">1. Diagnostic Intake &amp; Ticket Generation</span>
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">STEP 01</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-primary dark:text-[#4edea3]">
                          <Timer className="h-3.5 w-3.5" /> Self-Serve: 2-3 mins
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Tenants initiate requests via the encrypted intake portal (<code className="rounded bg-zinc-100 dark:bg-white/[0.06] px-1 py-0.5 font-mono text-xs text-primary dark:text-[#4edea3]">/dashboard/tenant/maintenance/new</code>). Submissions mandate specific unit spatial tagging (e.g., Master En-suite, Distribution Box B), categorical triage, and minimum 2 timestamped photographic or video captures for technical telemetry verification.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400"><ImageIcon className="h-3.5 w-3.5 text-primary" /> Timestamped Metadata</span>
                        <span className="inline-flex items-center gap-1 rounded bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400"><MapPin className="h-3.5 w-3.5 text-primary" /> GPS Spatial Mapping</span>
                        <span className="inline-flex items-center gap-1 rounded bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400"><QrCode className="h-3.5 w-3.5 text-primary" /> Asset Barcode Matching</span>
                      </div>
                    </div>
                  </div>
                  {/* Stage 2 */}
                  <div className="relative flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] sm:flex-row sm:items-start">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/80 text-white shadow-sm">
                      <Cog className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white">2. Central MEP Cog &amp; Warranty Triage</span>
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">STEP 02</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-primary dark:text-[#4edea3]">
                          <Clock className="h-3.5 w-3.5" /> SLA: 15m (Crit) / 1-2h (Routine)
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        The centralized Sovereign Estate MEP engineering desk cross-references telemetry against the tenant&apos;s executed lease agreement (Clause 7.3 Warranty Schedule). Remote diagnostic sensors evaluate electrical line stability and HVAC pressure loops before approving on-site dispatch or identifying tenant-directed adjustments.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded bg-[var(--sovereign-container-bg)] dark:bg-primary/10 px-2 py-1 font-mono text-[11px] text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">Clause 7.3 Verification</span>
                        <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400">SCADA Telemetry Triage</span>
                        <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400">Escrow Reserve Authorization</span>
                      </div>
                    </div>
                  </div>
                  {/* Stage 3 */}
                  <div className="relative flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] sm:flex-row sm:items-start">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-200 dark:bg-white/[0.08] text-zinc-900 dark:text-white shadow-sm">
                      <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white">3. Certified Contractor Dispatch &amp; Gate Clearance</span>
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">STEP 03</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                          <Clock className="h-3.5 w-3.5" /> Target: &lt; 24h
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        An accredited technical contractor (Daikin Air Conditioning Nigeria, Julius Berger MEP Services, or SmartAccess NG) is commissioned. The system automatically provisions a one-time cryptographic gate pass for estate biometric security clearance, transmitted to the tenant&apos;s registered device.
                      </p>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="text-sm text-zinc-900 dark:text-white">Digital Gate Clearance: OTP &amp; CAC Contractor ID Required</span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-primary dark:text-[#4edea3]">ACTIVE PROTOCOL</span>
                      </div>
                    </div>
                  </div>
                  {/* Stage 4 */}
                  <div className="relative flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] sm:flex-row sm:items-start">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#6ffbbe] shadow-sm">
                      <Verified className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white">4. On-Site Rectification &amp; Digital Sign-Off</span>
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">STEP 04</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-primary dark:text-[#4edea3]">
                          <Shield className="h-3.5 w-3.5" /> 90-Day Rectification Warranty
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Upon physical completion, the technician enters test results into the tablet workflow. The tenant executes a biometric or PIN sign-off verifying quality. The ticket automatically closes, releasing escrow tranches to the vendor and appending permanent records to the property&apos;s LASRERA compliance ledger.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--sovereign-container-bg)] dark:bg-primary/10 px-2 py-1 font-mono text-[11px] text-[var(--sovereign-hover)] dark:text-[#6ffbbe]"><CheckCircle className="h-3.5 w-3.5" /> Statutory Audit Log Linked</span>
                        <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">Escrow Tranche 2/2 Released</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Institutional Facility FileText Breakdown */}
              <section className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">Legal &amp; Tenancy Allocation</span>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Service Charge vs. Tenant Liability Matrix</h2>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">Pursuant to Lagos State Tenancy Law 2011 and Sovereign Estate Master Covenants Section 14</p>
                  </div>
                  <Scale className="h-7 w-7 text-primary" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Covered via Estate Service Charge</h3>
                      </div>
                      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">Subsidized fully via annual facility levies without ad-hoc tenant charges.</p>
                      <ul className="flex flex-col gap-2 text-sm text-zinc-900 dark:text-white">
                        {[
                          ['Central HVAC Loops & Chilling Stations:', 'Estate compressor plants, cooling towers, and distribution mains.'],
                          ['Backup Microgrid & Solar-Hybrid:', 'Heavy Caterpillar/Perkins generation sets and synchronizing panels.'],
                          ['Structural Envelope & Roofing:', 'Waterproofing membranes, façade glass panels, and external expansion joints.'],
                          ['Mainline Droplets & Waste Treatment:', 'Sewage treatment plants (STP), borehole pressure tanks, and fire mains.'],
                          ['Vertical Transport (KONE Elevators):', 'Routine shaft servicing, governor brake checks, and ARD batteries.'],
                        ].map(([strong, rest]) => (
                          <li key={strong} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span><strong>{strong}</strong> {rest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Cost Incidence to Tenant:</span>
                      <span className="font-mono text-sm font-bold text-primary dark:text-[#4edea3]">₦0.00 Direct</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Tenant Care &amp; Private Liability</h3>
                      </div>
                      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">Direct tenant responsibility. Can be contracted to certified estate artisans at regulated capped rates.</p>
                      <ul className="flex flex-col gap-2 text-xs text-zinc-900 dark:text-white">
                        {[
                          ['Internal Consumables:', 'Decorative lighting bulbs, LED strips, air conditioning remote replacement, and filters.'],
                          ['Cosmetic & Surface Wear:', 'Internal wall scuffs, paint touch-ups, private picture hanging punctures, or floor scratches.'],
                          ['Appliance Wear & Damage:', 'Faults arising from tenant-installed personal appliances or unauthorized wiring modifications.'],
                          ['Sanitary Blockages (Internal):', 'Blockages due to foreign objects in toilet traps, sinks, or grease traps.'],
                          ['Negligence / Accidental Impact:', 'Shattered internal glazing, broken sanitary ware, or water valve overflow damage.'],
                        ].map(([strong, rest]) => (
                          <li key={strong} className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <span><strong>{strong}</strong> {rest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Cost Model:</span>
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">Regulated Schedule Rate</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Banner */}
              <section className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.04] p-6 shadow-sm">
                <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div className="max-w-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-[#4edea3]">Fast-Track Facility Support</span>
                    <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">Need Repairs or MEP Assessment in Your Unit?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Dispatch an accredited technician in under 24 hours. Emergency plumbing, electrical faults, and HVAC breakdown tickets trigger immediate priority triage.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Button asChild className="bg-primary hover:bg-primary text-white">
                      <Link href="/dashboard/tenant/maintenance/new"><Wrench className="mr-2 h-4 w-4" /> Submit a Maintenance Request</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/tenant/maintenance">View Active Requests</Link>
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR (4) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {/* Emergency Directory */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-ping rounded-full bg-red-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">24/7 Emergency Directory</h3>
                  </div>
                  <span className="rounded bg-red-50 dark:bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-300">HIGH PRIORITY</span>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  For structural fire, gas leaks, electrical fires, or primary flood emergencies, call the rapid command desk immediately.
                </p>
                <div className="mb-3 flex flex-col gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                  <span className="text-[11px] font-semibold uppercase text-zinc-500">Estate Operations Command</span>
                  <a href="tel:08007767284" className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <PhonePhoneCall className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">0800-PROPATI</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Toll-Free National (0800-7767284)</p>
                      </div>
                    </div>
                    <PhoneCall className="h-4 w-4 text-zinc-400" />
                  </a>
                  <a href="tel:+23412908820" className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                      <div>
                        <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">+234 1 290 8820 Ext. 1</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Direct Lagos Operations Desk</p>
                      </div>
                    </div>
                    <PhoneCall className="h-4 w-4 text-zinc-400" />
                  </a>
                  <a href="https://wa.me/2348030008820" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">+234 803 000 8820</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Duty MEP Engineer (WhatsApp Live)</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </a>
                </div>
                <div className="mb-3 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase text-zinc-500">Statutory Lagos State Emergency Services</span>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-red-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Lagos Emergency Response / Police</span></div>
                    <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">999 / 112</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-red-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Lagos Fire &amp; Rescue Service</span></div>
                    <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">01-790-0000</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2"><Ambulance className="h-4 w-4 text-primary" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Lagos Ambulance (LASAMBUS)</span></div>
                    <span className="font-mono text-sm font-bold text-primary dark:text-[#4edea3]">112 / 767</span>
                  </div>
                </div>
                <Link href="/dashboard/tenant/maintenance/emergency" className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500">
                  <AlertTriangle className="h-4 w-4" /> Open Emergency Hotline Screen
                </Link>
              </div>

              {/* SLA Matrix */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Standard SLA Matrix</h3>
                  <span className="font-mono text-[11px] text-zinc-500">ISO 41001</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-700 dark:text-red-300">PRIORITY 1 (CRITICAL)</span>
                      <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">&lt; 2 Hours</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">Gas leak, main water flooding, total power blackout</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Immediate engineer mobilization &amp; facility isolation protocol.</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300">PRIORITY 2 (URGENT)</span>
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">&lt; 6 Hours</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">Single unit AC outage, booster pump failure</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Verified contractor dispatch within same business cycle.</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400">PRIORITY 3 &amp; 4 (ROUTINE)</span>
                      <span className="font-mono text-sm font-bold text-primary dark:text-[#4edea3]">&lt; 24 Hours</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">Droplets drippage, joinery, lock servicing</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Scheduled during regular operating hours (08:00 – 18:00).</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Gauge className="h-4 w-4 shrink-0 text-primary" />
                  Performance breaches trigger automatic 5% service charge fee credits to tenant ledger account.
                </div>
              </div>

              {/* Compliance Seal */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10">
                    <Gavel className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">LASRERA Compliance Seal</p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Lagos Real Estate Regulatory Authority</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  All technical maintenance personnel dispatched to Sovereign Estate units are licensed, background-checked, and registered under LASRERA Permit <strong className="font-mono text-zinc-900 dark:text-white">LSR/EST/2021/044</strong>.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-3 font-mono text-[11px] text-zinc-500">
                  <span>RC NO: 1849204</span>
                  <span className="flex items-center gap-1 font-semibold text-primary dark:text-[#4edea3]"><ShieldCheck className="h-3.5 w-3.5" /> VALIDATED</span>
                </div>
              </div>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><Clock className="h-3.5 w-3.5" /> Protocol version 4.2 — ISO 41001</p>
        </div>
      </ErrorBoundary>
    </TenantRailShell>
  );
}