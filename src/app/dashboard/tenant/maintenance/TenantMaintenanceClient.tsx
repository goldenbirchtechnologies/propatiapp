'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Wrench, AlertCircle, Clock, CheckCircle2, Loader2, Phone, Download, ShieldCheck, Droplets, Zap, Lock, Building2, MoreVertical, Eye, Wind } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateLong } from '@/lib/utils';

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  photoUrls: string[];
  resolutionNote: string | null;
  assignedTo: { id: string; fullName: string | null } | null;
  listing: { id: string; title: string; address: string; area: string | null } | null;
};

function shortId(id: string) { return `MNT-${id.slice(0,8).toUpperCase()}`; }
function initials(name: string | null | undefined) { return (name ?? '—').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || '—'; }

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  plumbing: { label: 'Plumbing & RO Water', icon: Droplets, color: 'text-blue-600' },
  electrical: { label: 'Microgrid & Power', icon: Zap, color: 'text-amber-600' },
  structural: { label: 'Structural & Glazing', icon: Building2, color: 'text-indigo-600' },
  security: { label: 'Access & Security', icon: Lock, color: 'text-purple-600' },
  cleaning: { label: 'Cleaning & Upkeep', icon: Wrench, color: 'text-zinc-600' },
  other: { label: 'General', icon: Wrench, color: 'text-zinc-600' },
};

const PRIORITY_META: Record<string, { label: string; dot: string; pill: string }> = {
  urgent: { label: 'Emergency', dot: 'bg-red-600', pill: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300' },
  high: { label: 'High', dot: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  medium: { label: 'Medium', dot: 'bg-blue-500', pill: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  low: { label: 'Low', dot: 'bg-zinc-400', pill: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400' },
};

function slaLabel(ticket: Ticket): string {
  const ageHrs = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  if (ticket.status === 'resolved' || ticket.status === 'closed') return `Resolved`;
  if (ticket.priority === 'urgent') return ageHrs < 2 ? `SLA: ${(2 - ageHrs).toFixed(1)} hrs remaining` : 'SLA breached';
  if (ticket.priority === 'high') return ageHrs < 6 ? `SLA: ${(6 - ageHrs).toFixed(1)} hrs remaining` : 'SLA breached';
  return `Scheduled`;
}

export default function TenantMaintenanceClient({ tickets }: { tickets: Ticket[] }) {
  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all'|'open'|'in_progress'|'resolved'|'closed'>('all');

  const counts = useMemo(() => ({
    open: tickets.filter(t=>t.status==='open').length,
    inProgress: tickets.filter(t=>t.status==='in_progress' || t.status==='assigned').length,
    resolved: tickets.filter(t=>t.status==='resolved').length,
    closed: tickets.filter(t=>t.status==='closed').length,
    total: tickets.length,
  }), [tickets]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tickets.filter(t => {
      const byStatus = statusTab==='all' ? true : statusTab==='resolved' ? (t.status==='resolved' || t.status==='closed') : t.status===statusTab;
      if (!byStatus) return false;
      if (categoryFilter!=='all' && t.category!==categoryFilter) return false;
      if (priorityFilter!=='all' && t.priority!==priorityFilter) return false;
      if (!term) return true;
      const hay = [t.title, t.description, t.id, shortId(t.id), t.listing?.title ?? '', t.assignedTo?.fullName ?? ''].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [tickets, q, categoryFilter, priorityFilter, statusTab]);

  const exportCsv = () => {
    const rows = filtered.map(t => [shortId(t.id), `"${t.title.replace(/"/g,'""')}"`, t.category, t.priority, t.status, t.createdAt].join(','));
    const csv = ['Ref,Title,Category,Priority,Status,Created', ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='maintenance.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + badges */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
          <span>Dashboard</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>Facility &amp; Services</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-emerald-600 dark:text-emerald-400">Maintenance Requests</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span> 24/7 Facility Response Desk</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SLA Guaranteed</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400">Service Charge Covered</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Maintenance Requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">View, track, and manage all facility repairs and MEP engineering requests across your registered properties.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm"><a href="tel:+23412908820"><Phone className="mr-1 h-4 w-4 text-emerald-600" /> Call 24/7 Facility Desk</a></Button>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"><Link href="/dashboard/tenant/maintenance/new">New Maintenance Request</Link></Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">OPEN REQUESTS</p><p className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.open}</span><span className="text-sm font-medium text-amber-600 dark:text-amber-400">Active</span></p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"><Clock className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"><Wrench className="h-4 w-4 text-amber-600" /> {counts.open + counts.inProgress} under engineering triage</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">IN PROGRESS</p><p className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.inProgress}</span><span className="text-sm font-medium text-blue-600 dark:text-blue-400">Dispatched</span></p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"><Wrench className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"><Building2 className="h-4 w-4 text-blue-600" /> Technicians on site / parts in procurement</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">RESOLVED &amp; CLOSED</p><p className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.resolved + counts.closed}</span><span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</span></p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Tenant satisfaction sign-off</p>
        </div>
      </div>

      {/* Search + filters + tabs */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by issue title, ticket ref (#MNT-…), or contractor…" className="h-10 pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 w-[200px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Category: All</SelectItem>
                <SelectItem value="plumbing">Plumbing &amp; RO Water</SelectItem>
                <SelectItem value="electrical">Microgrid &amp; Power</SelectItem>
                <SelectItem value="structural">Structural &amp; Glazing</SelectItem>
                <SelectItem value="security">Biometric &amp; Access</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10 w-[180px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Priority: All</SelectItem>
                <SelectItem value="urgent">Emergency (P1)</SelectItem>
                <SelectItem value="high">High (P2)</SelectItem>
                <SelectItem value="medium">Medium (P3)</SelectItem>
                <SelectItem value="low">Low (P4)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={exportCsv} aria-label="Export"><Download className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {([
            ['all', `All ${counts.total}`],
            ['open', `Open ${counts.open}`],
            ['in_progress', `In Progress ${counts.inProgress}`],
            ['resolved', `Resolved ${counts.resolved}`],
            ['closed', `Closed ${counts.closed}`],
          ] as const).map(([k,label])=> (
            <button key={k} onClick={()=>setStatusTab(k as any)} className={`rounded-lg px-3.5 py-1.5 ${statusTab===k ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] font-semibold tracking-widest text-zinc-500">
                <th className="px-4 py-3">Request &amp; Property</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Reported &amp; SLA</th>
                <th className="px-4 py-3">Assigned Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.length===0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Wrench className="mx-auto h-10 w-10 text-zinc-400" />
                    <p className="mt-3 font-semibold text-zinc-900 dark:text-white">No maintenance requests found</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">No requests match your filters. Try clearing search or switching tabs.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={()=>{ setQ(''); setCategoryFilter('all'); setPriorityFilter('all'); setStatusTab('all'); }}>Clear filters</Button>
                    <div className="mt-4">
                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"><Link href="/dashboard/tenant/maintenance/new">New Maintenance Request</Link></Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(t => {
                const cat = CATEGORY_META[t.category] ?? CATEGORY_META.other;
                const pri = PRIORITY_META[t.priority] ?? PRIORITY_META.medium;
                const CatIcon = cat.icon;
                return (
                  <tr key={t.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/tenant/maintenance/${t.id}`} className="font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">{t.title}</Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">#{shortId(t.id)}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-600 dark:text-zinc-400">{t.listing?.title ?? '—'}{t.listing?.area ? ` • ${t.listing.area}` : ''}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        <CatIcon className={`h-4 w-4 ${cat.color}`} /> {cat.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${pri.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pri.dot}`} /> {pri.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <p className="font-mono text-xs font-medium text-zinc-900 dark:text-white">{formatDateLong(t.createdAt)}</p>
                      <p className={`text-xs ${t.priority==='urgent' || t.priority==='high' ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{slaLabel(t)}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {t.assignedTo ? (
                        <span className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.08] text-xs font-bold text-zinc-700 dark:text-zinc-300">{initials(t.assignedTo.fullName)}</span>
                          <span className="min-w-0"><span className="block text-xs font-semibold leading-none text-zinc-900 dark:text-white">{t.assignedTo.fullName}</span><span className="text-[11px] text-zinc-600 dark:text-zinc-400">Assigned partner</span></span>
                        </span>
                      ) : <span className="text-xs text-zinc-500">Unassigned</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link href={`/dashboard/tenant/maintenance/${t.id}`} aria-label="View"><Eye className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More"><MoreVertical className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row">
          <span>Showing {filtered.length} of {tickets.length} maintenance requests</span>
          <span className="hidden sm:inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> ISO-9001 Facility Standards</span>
        </div>
      </div>

      {/* SLA + Hotline */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5 lg:col-span-7">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Estate Service Level Agreement (SLA) &amp; Escalation Matrix</h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Pursuant to Tenant Covenant &amp; CAC Bylaws Section 14 — guaranteed resolution turnaround tiers.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-red-700 dark:text-red-300">EMERGENCY (P1)</span><span className="h-2 w-2 rounded-full bg-red-600" /></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">&lt; 2 Hours</p><p className="text-xs leading-tight text-zinc-600 dark:text-zinc-400">Total power blackout, gas alert, fire sensor, elevator stall.</p></div>
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-amber-700 dark:text-amber-300">HIGH (P2)</span><span className="h-2 w-2 rounded-full bg-amber-500" /></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">&lt; 6 Hours</p><p className="text-xs leading-tight text-zinc-600 dark:text-zinc-400">HVAC failure, primary pump trip, water pressure loss.</p></div>
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-widest text-emerald-700 dark:text-emerald-300">ROUTINE (P3/P4)</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div><p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">&lt; 24 Hours</p><p className="text-xs leading-tight text-zinc-600 dark:text-zinc-400">General plumbing, carpentry, access card sync.</p></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-white/[0.06] pt-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified under ISO-9001 Facility Standards</span>
            <Link href="/dashboard/tenant/maintenance/protocol" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Read Full Service Accord →</Link>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5 lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Phone className="h-5 w-5 text-emerald-500" /> 24/7 Estate Control Room</h2>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Direct emergency dispatch for security, power grid, or flooding response.</p>
            </div>
            <span className="rounded bg-red-500 px-2 py-0.5 text-[11px] font-bold tracking-widest text-white">Priority Line</span>
          </div>
          <div className="mt-4 space-y-2">
            <a href="tel:+23412908820" className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
              <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 shadow-sm text-emerald-600 dark:text-emerald-400"><Phone className="h-5 w-5" /></span><span><span className="block text-sm font-semibold text-zinc-900 dark:text-white">+234 1 290 8820 Ext. 1</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Master Control Console (Lagos HQ)</span></span></span>
              <span className="text-zinc-400">›</span>
            </a>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
              <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 shadow-sm text-emerald-600 dark:text-emerald-400"><Phone className="h-5 w-5" /></span><span><span className="block text-sm font-semibold text-zinc-900 dark:text-white">WhatsApp Facility Dispatch</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Direct MEP Engineer on Duty</span></span></span>
              <span className="text-zinc-400">›</span>
            </a>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Average call pickup latency: <strong className="text-zinc-900 dark:text-white">8 seconds</strong></p>
        </div>
      </div>
    </div>
  );
}
