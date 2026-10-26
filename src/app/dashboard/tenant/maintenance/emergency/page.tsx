import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import {
  Phone, AlertTriangle, ShieldCheck, Clock, ArrowRight, Wrench, Droplets, Zap, Lock,
  Building2, Eye, Wind, Download, Camera, User, CalendarDays, MapPin,
  CheckCircle2, Shield, Timer, Siren, Radar, Cog, Bolt, Stethoscope,
  Flame, Ambulance, Gavel, CheckCircle,
  FileText, MessageCircle, PhoneCall,
} from 'lucide-react';

export default async function TenantMaintenanceEmergencyPage() {
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
          {/* Breadcrumb & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <nav className="flex items-center gap-1 text-[11px] font-mono tracking-widest text-zinc-500">
              <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">DASHBOARD</Link>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">FACILITY &amp; SERVICES</Link>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">MAINTENANCE</Link>
              <span className="text-zinc-300 dark:text-zinc-700">›</span>
              <span className="font-bold text-red-600 dark:text-red-400">EMERGENCY HOTLINE</span>
            </nav>
            <div className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 shadow-sm">
              <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">LASRERA Rapid Unit: Sector 4 (Victoria Island / Ikoyi)</span>
            </div>
          </div>

          {/* Urgent Alert Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-600 p-4 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white">Critical Incident Hotline • 24/7 Priority Dispatch Active</p>
                  <p className="text-xs text-red-100 opacity-90">Emergency response squad is on live standby. All calls are routed with priority line allocation.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Timer className="h-4 w-4 text-emerald-300" />
                <span className="font-mono text-xs font-semibold tracking-tight text-white">Active SLA: &lt; 15 Minutes Arrival</span>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-xl border-2 border-red-500/40 bg-white dark:bg-zinc-900 p-6 shadow-md lg:p-8">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left: phone + actions */}
              <div className="flex flex-col gap-4 lg:col-span-7">
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                  <Siren className="h-4 w-4" /> 24/7/365 Zero-Wait Immediate Dispatch • LASRERA Certified
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">24/7 Sovereign &amp; PropatiBox Emergency Desk</h1>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Dedicated life safety, major facility failure, and MEP (Mechanical, Electrical, Droplets) rapid containment response unit.</p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-zinc-50 dark:bg-white/[0.04] p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Toll-Free National Emergency Line</span>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold tracking-wider text-red-600 dark:text-red-400 leading-none">0800-PROPATI</span>
                    <span className="font-mono text-sm font-medium text-zinc-600 dark:text-zinc-400">(0800 776 7284)</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    <PhoneCall className="h-4 w-4 text-red-500" />
                    <span>Direct Lagos MEP Desk: <strong className="text-zinc-900 dark:text-white">+234 (0) 800 776 7284</strong></span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 8 Lines Available
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <a href="tel:+2348007767284" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-transform active:scale-95 hover:bg-red-700">
                    <Phone className="h-5 w-5" /> Call Now (0800-PROPATI)
                  </a>
                  <a href="https://wa.me/2348007767284?text=EMERGENCY%20INCIDENT%20REPORT%20-%20Immediate%20Dispatch%20Required" target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-500/30 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                    <MessageCircle className="h-5 w-5 text-emerald-500" /> WhatsApp Emergency Desk
                  </a>
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Guaranteed <strong>&lt; 15 Min First Response Benchmark</strong> • On-Site Estate MEP Emergency Squad</span>
                </div>
              </div>

              {/* Right: telemetry */}
              <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <Radar className="h-5 w-5 text-red-500" /> Emergency Dispatch Telemetry
                  </span>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Active Sector</span>
                </div>
                <div className="relative h-44 w-full overflow-hidden rounded-lg shadow-inner bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Sovereign On-Site Command Hub</p>
                        <p className="text-xs text-zinc-300">Zone 4: Ikoyi / VI Corridor</p>
                      </div>
                      <span className="rounded bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">UNIT 04 READY</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900 p-3">
                    <Cog className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-[11px] text-zinc-500">Lead MEP Tech</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">Engr. K. Balogun</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900 p-3">
                    <Flame className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-[11px] text-zinc-500">Safety Cert</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">LASG Fire-Cleared</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Triage Decision Matrix */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* P1 scope */}
            <div className="flex flex-col gap-4 rounded-xl border-l-4 border-l-red-500 bg-white dark:bg-zinc-900 p-6 shadow-sm lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">What Qualifies as a P1 Emergency?</h2>
                </div>
                <span className="rounded-full bg-red-50 dark:bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:text-red-300">Priority 1 Dispatch</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">P1 status triggers immediate physical squad mobilization within 15 minutes. Qualifying conditions include:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: 'propane', title: 'Gas Leaks & Odors', desc: 'Detected piped or cylinder gas concentration in common or private units.' },
                  { icon: 'flood', title: 'Uncontainable Flooding', desc: 'Burst municipal mains, riser failure, or sewage backup penetrating living zones.' },
                  { icon: 'bolt', title: 'Electrical Arcing & Sparking', desc: 'High-voltage panel blowout, burning breaker smell, or exposed live busbars.' },
                  { icon: 'elevator', title: 'Elevator Entrapment', desc: 'Persons trapped inside lifts or mechanical failure between floor levels.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300">
                      {item.title === 'Gas Leaks & Odors' && <AlertTriangle className="h-4 w-4" />}
                      {item.title === 'Uncontainable Flooding' && <Droplets className="h-4 w-4" />}
                      {item.title === 'Electrical Arcing & Sparking' && <Zap className="h-4 w-4" />}
                      {item.title === 'Elevator Entrapment' && <Building2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-emergency redirect */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border-l-4 border-l-emerald-500 bg-zinc-50 dark:bg-white/[0.04] p-6 shadow-sm lg:col-span-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Non-Emergency Maintenance?</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Emergency phone channels must stay free for life-safety threats. Non-P1 items include minor drip plumbing, single AC cooling deficit, cosmetic wear, light bulb replacements, and non-blocking gate remotes.
                </p>
                <div className="rounded-lg bg-white dark:bg-zinc-900 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <Clock className="h-4 w-4 text-emerald-500" /> Standard Resolution SLA: 24 - 48 Hours
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Tracked with timestamped landlord compliance logs under Lagos Tenancy Law.</p>
                </div>
              </div>
              <Link href="/dashboard/tenant/maintenance/new" className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500">
                File Standard Maintenance Ticket <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mandatory Tenant Emergency Protocol */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Mandatory Tenant Emergency Protocol</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Follow these four institutional compliance steps in chronological order during an incident.</p>
              </div>
              <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 font-mono text-xs text-zinc-500">SEC-DOC // REF: SE-SOP-EMERG-04</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { n: '01', title: 'Immediate Danger: PhoneCall 999', color: 'bg-red-600', desc: 'If there is uncontrolled fire, gas explosion threat, or medical collapse, call Nigerian Emergency Services (112 / 999) or Lagos State Fire Service before contacting estate facility managers.', footer: ['State Emergency Service', '112 / 999'], tc: 'text-red-600 dark:text-red-400' },
                { n: '02', title: 'Call Emergency Hotline', color: 'bg-emerald-600', desc: 'Dial 0800-PROPATI to notify the Sovereign Central Command. Inform dispatch of your exact Block, Unit number, and immediate containment hazards.', footer: ['Sovereign Central Command', '0800-776-7284'], tc: 'text-emerald-600 dark:text-emerald-400' },
                { n: '03', title: 'File Formal Incident Ticket', color: 'bg-emerald-500', desc: 'Once physical hazards are contained, generate an audit ticket in this compliance portal to initiate insurance underwriting and landlord statutory claims.', footer: ['Statutory Compliance', 'LASRERA Mandated'], tc: 'text-emerald-600 dark:text-emerald-400' },
                { n: '04', title: 'Attach Visual Telemetry', color: 'bg-zinc-400', desc: 'Upload timestamped damage photographs and equipment tags to the maintenance vault. Do NOT enter hazardous zones to capture media.', footer: ['Digital Forensic Vault', 'CAC Linked'], tc: 'text-zinc-500' },
              ].map((s) => (
                <div key={s.n} className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${s.color} text-sm font-semibold text-white`}>{s.n}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${s.tc}`}>{
                      s.n === '01' ? 'Life Safety' : s.n === '02' ? 'Facility Alert' : s.n === '03' ? 'Incident Audit' : 'Evidence Log'
                    }</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{s.title}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{s.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-2 text-[11px] font-semibold">
                    <span className={s.tc}>{s.footer[0]}</span>
                    <span className="font-mono text-zinc-900 dark:text-white">{s.footer[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Emergency Dispatches & Evacuation Details */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Unit Emergency Profile */}
            <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 shadow-sm lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Registered Unit Emergency Profile</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Pre-verified property coordinates linked to tenant {user.fullName}</p>
                </div>
                <span className="rounded bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Verified Occupancy</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Designated Property</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Ikoyi Crest Luxury Towers</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Apt 4B, 4th Floor, Tower East</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Primary Isolation Valves</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Corridor Service Shaft #04</span>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Auto Gas Cut-Off Active</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Assembly Point</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Car Park Court Yard (North)</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Clear Evacuation Route</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><MapPin className="h-7 w-7" /></span>
                  <div>
                    <h5 className="text-sm font-semibold text-zinc-900 dark:text-white">Unit 4B Digital Evacuation &amp; Utility Map</h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Includes master water riser isolation, gas cylinder locker, and breaker panel locators.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Download Safety Map PDF</Button>
              </div>
            </div>

            {/* Standby Squad Roster */}
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 shadow-sm lg:col-span-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Standby Squad Roster</h3>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Shift: Alpha Rapid Response (Night / 24H)</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-2">
                  <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-red-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Droplets &amp; Riser</span></div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">ON SITE (5m)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-2">
                  <div className="flex items-center gap-2"><Bolt className="h-5 w-5 text-red-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">High-Voltage Electrical</span></div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">ON SITE (5m)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-2">
                  <div className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-red-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">First Aid / Paramedic</span></div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">STANDBY (8m)</span>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-2 text-xs text-zinc-600 dark:text-zinc-400">
                <Shield className="h-4 w-4 text-emerald-500" /> Insured by Sovereign General Insurance Nig. Ltd
              </div>
            </div>
          </div>

          {/* Bottom nav / action bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/[0.08] pt-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dashboard/tenant/maintenance" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white">
                <ArrowRight className="h-4 w-4 rotate-180" /> Back to Maintenance Overview
              </Link>
              <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">•</span>
              <Link href="/dashboard/tenant/maintenance/protocol" className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                <FileText className="h-4 w-4" /> View Sovereign SLA &amp; Maintenance FileText Standards
              </Link>
            </div>
            <Link href="/dashboard/tenant/maintenance/new" className="flex items-center gap-2 rounded-lg bg-zinc-100 dark:bg-white/[0.06] px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-white transition-colors hover:bg-zinc-200 dark:hover:bg-white/[0.1]">
              <PlusCircle className="h-4 w-4" /> File Standard Maintenance Request
            </Link>
          </div>

          {/* Legal disclaimer footer */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 text-xs text-zinc-600 dark:text-zinc-400 md:flex-row md:items-center">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <p>
                <strong className="text-zinc-900 dark:text-white">Legal Incident Recording:</strong> PhoneCalls placed to 0800-PROPATI are recorded and encrypted for quality, safety verification, and compliance with the <em>Lagos State Real Estate Regulatory Authority (LASRERA)</em> and the <em>Nigeria Data Protection Act (NDPA 2023)</em>.
              </p>
            </div>
            <div className="shrink-0 font-mono text-[11px] text-zinc-500">
              <span>SOVEREIGN DISPATCH ENGINE v4.2</span>
              <span className="mx-2">•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          {/* Emergency contacts sidebar content appended as section? Actually Stitch has contacts in protocol page. For emergency page, contacts are in hero. Done. */}
        </div>
      </ErrorBoundary>
    </TenantRailShell>
  );
}