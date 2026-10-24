'use client';

import Link from 'next/link';
import { CheckCircle2, Clock, Wrench, AlertCircle, Phone, Camera, Download, Eye, User, CalendarDays, MapPin, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateLong } from '@/lib/utils';

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  photoUrls: string[];
  resolutionNote: string | null;
  listing: { id: string; title: string; address: string; area: string | null; state: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string | null; avatarUrl: string | null } | null;
  assignedTo: { id: string; fullName: string | null; avatarUrl: string | null } | null;
  org: { id: string; name: string } | null;
};

function shortId(id: string) { return `MNT-${id.slice(-8).toUpperCase()}`; }
function initials(name: string | null | undefined) { return (name ?? '—').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || '—'; }

const LIFECYCLE: { key: string; label: string }[] = [
  { key: 'open', label: 'Submitted' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

function lifecycleIndex(status: string): number {
  const order = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
  const idx = order.indexOf(status);
  return idx === -1 ? 0 : idx;
}

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'Emergency', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  high: { label: 'High', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
  medium: { label: 'Medium', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
  low: { label: 'Low', cls: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400' },
};

export default function TenantMaintenanceTrackingClient({ ticket }: { ticket: Ticket }) {
  const idx = lifecycleIndex(ticket.status);
  const pri = PRIORITY_META[ticket.priority] ?? PRIORITY_META.medium;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-500">
        <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">MAINTENANCE</Link>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <span className="font-semibold text-zinc-900 dark:text-white">#{shortId(ticket.id)}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{ticket.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${pri.cls}`}>{pri.label}</span>
            <span className="text-zinc-600 dark:text-zinc-400">Submitted {formatDateLong(ticket.createdAt)}</span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400"><MapPin className="h-3.5 w-3.5" /> {ticket.listing ? `${ticket.listing.title} • ${ticket.listing.address}` : '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <Button variant="outline" size="sm" onClick={() => window.print()}><Download className="mr-1 h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      {/* Lifecycle */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        <div className="border-b border-zinc-200 dark:border-white/[0.08] px-6 py-4">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Request Lifecycle</h3>
        </div>
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-0 top-5 h-0.5 w-full bg-zinc-200 dark:bg-white/[0.08]" />
            <div className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (idx / Math.max(1, LIFECYCLE.length - 1)) * 100)}%` }} />
            <div className="relative flex justify-between gap-2">
              {LIFECYCLE.map((step, i) => {
                const done = i < idx;
                const active = i === idx;
                return (
                  <div key={step.key} className="flex max-w-[120px] flex-col items-center text-center">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20' : 'bg-white dark:bg-zinc-900 text-zinc-500 ring-1 ring-zinc-200 dark:ring-white/[0.08]'}`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : active ? <CalendarDays className="h-5 w-5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                    <span className={`mt-2 text-xs font-semibold ${active || done ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{step.label}</span>
                    <span className="mt-0.5 text-[11px] text-zinc-500">{active ? 'Current' : done ? 'Done' : 'Pending'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Technician</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white"><CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED</span>
            </div>
            {ticket.assignedTo ? (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.06] font-bold text-zinc-700 dark:text-zinc-300">
                    {ticket.assignedTo.avatarUrl ? <img src={ticket.assignedTo.avatarUrl} alt={ticket.assignedTo.fullName ?? ''} className="h-full w-full object-cover" /> : initials(ticket.assignedTo.fullName)}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{ticket.assignedTo.fullName}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Assigned Specialist</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"><Link href="/dashboard/tenant/messages">Message</Link></Button>
                  <Button asChild variant="outline" size="icon" className="h-11 w-11"><a href="tel:+23412908820"><Phone className="h-4 w-4" /></a></Button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 text-center">
                <Wrench className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">Awaiting assignment</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Estate Desk will assign a certified partner shortly.</p>
                <Button asChild variant="outline" size="sm" className="mt-3"><a href="tel:+23412908820"><Phone className="mr-1 h-4 w-4" /> Call Desk</a></Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Appointment</h3>
            <div className="mt-4 space-y-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900"><CalendarDays className="h-5 w-5" /></span>
                <div><p className="font-mono text-[11px] tracking-widest text-zinc-500">REPORTED</p><p className="text-sm font-bold text-zinc-900 dark:text-white">{formatDateLong(ticket.createdAt)}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900"><Clock className="h-5 w-5" /></span>
                <div><p className="font-mono text-[11px] tracking-widest text-zinc-500">LAST UPDATED</p><p className="text-sm font-bold text-zinc-900 dark:text-white">{formatDateLong(ticket.updatedAt)}</p></div>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-5 w-5" /></span>
                  <div><p className="font-mono text-[11px] tracking-widest text-zinc-500">RESOLVED</p><p className="text-sm font-bold text-zinc-900 dark:text-white">{formatDateLong(ticket.resolvedAt)}</p></div>
                </div>
              )}
            </div>
            <p className="mt-4 flex gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><Eye className="h-4 w-4 shrink-0" /> Technician will arrive within the first 30 mins of the window.</p>
          </div>

          {ticket.org && (
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Building2 className="h-5 w-5 text-emerald-500" /> Estate</h3>
              <p className="mt-1 font-medium text-zinc-900 dark:text-white">{ticket.org.name}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Managing organisation</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Report Summary</h3>
              <Link href="/dashboard/tenant/maintenance" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">Back to requests</Link>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <p className="font-mono text-[11px] tracking-widest text-zinc-500">DESCRIPTION</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-white">{ticket.description || '—'}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="font-mono text-[11px] tracking-widest text-zinc-500">PROPERTY</p><p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">{ticket.listing ? `${ticket.listing.title} — ${ticket.listing.address}` : '—'}</p></div>
                <div><p className="font-mono text-[11px] tracking-widest text-zinc-500">LOCATION</p><p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">{ticket.listing?.area ? `${ticket.listing.area}${ticket.listing?.state ? `, ${ticket.listing.state}` : ''}` : '—'}</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-xs text-zinc-600 dark:text-zinc-400">Category</p><p className="font-semibold capitalize text-zinc-900 dark:text-white">{ticket.category}</p></div>
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-xs text-zinc-600 dark:text-zinc-400">Priority</p><p className="font-semibold capitalize text-zinc-900 dark:text-white">{ticket.priority}</p></div>
                <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-xs text-zinc-600 dark:text-zinc-400">Status</p><p><StatusBadge status={ticket.status} className="mt-1" /></p></div>
              </div>
              {ticket.resolutionNote && (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Resolution Note</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{ticket.resolutionNote}</p>
                </div>
              )}
              <div>
                <p className="font-mono text-[11px] tracking-widest text-zinc-500">ATTACHED PHOTOS</p>
                {ticket.photoUrls.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No photos attached.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {ticket.photoUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="group aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] hover:border-emerald-500">
                        <img src={url} alt={`Evidence ${idx + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                      </a>
                    ))}
                    <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400">
                      <Camera className="h-5 w-5" />
                      <span className="mt-1 font-mono text-xs">{ticket.photoUrls.length}/5</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-zinc-100 dark:border-white/[0.06] pt-4 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> LASRERA Certified Partner</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1"><User className="h-3.5 w-3.5" /> Tenant: {ticket.tenant?.fullName ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6 text-center">
        <p className="font-semibold text-zinc-900 dark:text-white">Need to reschedule this visit?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">You can change your appointment time up to 24 hours before the scheduled slot.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild variant="outline"><Link href="/dashboard/tenant/maintenance">Back to Maintenance</Link></Button>
          <Button asChild variant="outline"><a href="tel:+23412908820"><Phone className="mr-1 h-4 w-4" /> Call Desk</a></Button>
        </div>
      </div>
    </div>
  );
}
