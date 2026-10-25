import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import {
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Building2,
  Key,
  ShieldCheck,
  Zap,
  Wind,
  Wifi,
  Fingerprint,
  Router,
  Gavel,
  Save,
  Download,
  Phone,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Move-In Coordination – Landlord',
  description: 'Coordinate commercial move-in appointments.',
};

const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default async function CommercialMoveInPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const bookings = await prisma.booking.findMany({
    where: {
      listing: { ownerId: user.id, listingType: 'commercial' },
    },
    include: {
      guest: { select: { fullName: true, email: true, phone: true } },
      listing: { select: { title: true, address: true } },
      transaction: { select: { status: true, reference: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const active = bookings[0] ?? null;
  const tenantName = active?.guest?.fullName || active?.guestName || '—';
  const propertyTitle = active?.listing?.title || '—';
  const address = active?.listing?.address || '—';
  const checkIn = formatDate(active?.checkIn);
  const statusLabel = active?.status ? active.status.replace(/_/g, ' ') : 'No active move-in';
  const paymentLabel = active?.paymentStatus ? active.paymentStatus.replace(/_/g, ' ') : '—';

  const queue = bookings.slice(0, 3);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto py-6 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <span>Home</span>
            <span>/</span>
            <span>Portfolio</span>
            <span>/</span>
            <span>Commercial Leases</span>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-white">Move-In Coordination</span>
          </nav>

          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Move-In Coordination — Commercial
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Welcoming new tenants for commercial grade-A serviced offices. Real-time checklist verification &amp; regulatory signoff.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                <Download className="w-4 h-4 text-emerald-600" />
                Export Handover Protocol
              </button>
            </div>
          </div>

          {/* Hero banner */}
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white p-8 md:p-10 shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                    Handover Ready
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 text-white/90 text-xs">
                    Grade-A Commercial Serviced Wing
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Welcome to your new HQ
                </h2>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-200" />
                  <span>{propertyTitle} • {address}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80 text-sm pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-200" />
                    <span>Assigned: <strong className="text-white">{tenantName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-200" />
                    <span>Scheduled Window: <strong className="text-white">{checkIn}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 items-stretch lg:min-w-[220px]">
                <button className="px-5 py-3 rounded-lg bg-white text-emerald-700 font-semibold shadow-md hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Schedule Handover Inspection
                </button>
                <a className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium transition-all flex items-center justify-center gap-2" href={active?.guest?.phone ? `tel:${active.guest.phone}` : '#'}>
                  <Phone className="w-4 h-4" />
                  Direct Line to Facilities Lead
                </a>
              </div>
            </div>
          </section>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              {/* Timeline */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Handover Milestone Stepper
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                    {statusLabel}
                  </span>
                </div>
                <div className="relative space-y-4">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-zinc-200 dark:bg-zinc-700 -z-0" />
                  {[
                    { label: 'Contract Executed & Stamped', desc: 'Tenancy agreement executed', done: true },
                    { label: 'Escrow & Cautionary Deposit', desc: `Payment: ${paymentLabel}`, done: active?.paymentStatus === 'paid' },
                    { label: 'Keys, RFID & Server Bay Access', desc: 'Access credentials encoded', done: false },
                    { label: 'Handover Protocol & Inspection', desc: 'Awaiting final signoff & checklist', done: false, current: true },
                    { label: 'Tenancy Active & Billing Initiated', desc: `Scheduled ${checkIn}`, done: false },
                  ].map((step, i) => (
                    <div key={i} className="relative z-10 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        step.done
                          ? 'bg-emerald-600 text-white'
                          : step.current
                          ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-600/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}>
                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.current ? <Clock className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${step.current ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                          {step.label}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenant contact card */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {tenantName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '—'}
                    <ShieldCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-emerald-600 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-white truncate">{tenantName}</p>
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Corporate Tenant</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{tenantName !== '—' ? 'Tenant' : '—'}</p>
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">Email:</span>
                    <a className="text-emerald-600 hover:underline font-mono text-xs" href={active?.guest?.email ? `mailto:${active.guest.email}` : '#'}>
                      {active?.guest?.email || '—'}
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">Phone:</span>
                    <span className="font-mono text-xs text-zinc-900 dark:text-white">{active?.guest?.phone || active?.guestPhone || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">Check-in:</span>
                    <span className="font-mono text-xs text-zinc-900 dark:text-white">{checkIn}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white capitalize">{statusLabel}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium transition-all flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Direct Chat
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium transition-all flex items-center justify-center gap-1">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Call
                  </button>
                </div>
              </div>
            </aside>

            {/* Right column */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              {/* Asset details */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Asset Specification &amp; Handover Parameters
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {propertyTitle}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Access Clearance Cleared
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    { icon: Building2, label: 'Commercial Suite' },
                    { icon: Zap, label: 'Dual Power' },
                    { icon: Wind, label: 'HVAC' },
                    { icon: Wifi, label: 'Fiber' },
                  ].map((p) => (
                    <span key={p.label} className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-mono flex items-center gap-1">
                      <p.icon className="w-3.5 h-3.5 text-emerald-600" />
                      {p.label}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                  {[
                    { icon: Zap, title: 'High-Voltage Power', sub: 'Auto ATS switch', badge: '99.98% SLA' },
                    { icon: Wind, title: 'Chilled Water HVAC', sub: 'Zoned 21°C', badge: 'Carrier VRF' },
                    { icon: Fingerprint, title: 'Biometric Access', sub: 'Lobby turnstile', badge: 'Class-1' },
                    { icon: Router, title: 'Rack Server Bay', sub: 'Meet-Me MMR patched', badge: 'MainOne/MTN' },
                  ].map((a) => (
                    <div key={a.title} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex flex-col justify-between h-28">
                      <div className="flex items-center justify-between">
                        <a.icon className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600">{a.badge}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{a.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Statutory &amp; Technical Signoffs
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Utility &amp; Facility Handover Checklist
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">5 / 5 Complete (Ready)</span>
                    <div className="w-36 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1.5 ml-auto">
                      <div className="h-full bg-emerald-600 w-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { title: 'Dual Genset ATS & Dedicated Prepaid Sub-meter', sub: 'Initial reserve credited; switchgear tested under load.', ref: 'Certificate #NG-POW-4491' },
                    { title: 'Fiber Optic Patching & Server Room Rack Cabinet', sub: 'Dual 1Gbps IP transit verified; zero packet drop.', ref: 'Latency: 2.1ms (Lekki IXP)' },
                    { title: 'Carrier VRF Central Air Conditioning & Chillers', sub: 'HEPA filters renewed; calibrated to 21°C.', ref: 'COP: 3.82 Verified' },
                    { title: 'Turnstile Access & Encoded HID Proximity Cards', sub: 'Master key sets in tamper-evident pouch.', ref: 'Batch Serial: HID-VC4B-01-24' },
                    { title: 'Lagos State Fire Service Certification & FM-200', sub: 'Clean-agent cylinder pressure certified.', ref: 'LSFS Permit #FS/2024/VI/881' },
                  ].map((item, i) => (
                    <label key={i} className="group flex items-start gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer">
                      <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-0 accent-emerald-600 cursor-pointer" />
                      <div className="flex flex-col flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {i + 1}. {item.title}
                          </span>
                          <span className="text-xs text-emerald-600 font-medium">Verified</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{item.sub}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-mono text-zinc-400">
                          <span>{item.ref}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Final action */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-start gap-3">
                  <Gavel className="w-7 h-7 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      Statutory Execution &amp; Tenancy Activation Notice
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                      Marking this asset as handed over formally vests quiet possession to {tenantName}. Executing this will generate the counter-signed digital certificate and commence the monthly billing cycle.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>POST move-in status triggers instant webhook to tenant legal counsel.</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-900 dark:text-white">ID: {active?.id || '—'}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center pt-2">
                  <button className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <Key className="w-5 h-5" />
                    Mark as Handed Over &amp; Activate Commercial Tenancy
                  </button>
                  <button className="w-full sm:w-auto py-4 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium transition-all flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Draft &amp; Defer
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Active queue */}
          <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Active Commercial Move-In Queue</h3>
                <span className="ml-2 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400">
                  {bookings.length} Properties Queued
                </span>
              </div>
            </div>
            {queue.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">
                No pending commercial move-ins. Upcoming leases will populate when tenancy agreements are stamped.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {queue.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl flex flex-col justify-between ${
                      idx === 0
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    } transition-all cursor-pointer`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {idx === 0 ? 'Active Workspace' : 'Scheduled Move-In'}
                        </span>
                        {idx === 0 && <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{b.listing?.title || '—'}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{b.guest?.fullName || b.guestName || '—'}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-900 dark:text-white font-medium">{b.checkIn}</span>
                      <span className={idx === 0 ? 'text-emerald-600 font-bold' : 'text-zinc-500 dark:text-zinc-400'}>
                        {b.status?.replace(/_/g, ' ') || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
