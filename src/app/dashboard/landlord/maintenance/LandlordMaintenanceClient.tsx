'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Wrench, Clock, CheckCircle2, Download, ShieldCheck, Droplets, Zap, Lock, Building2, Eye, Phone, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateLong } from '@/lib/utils';
import { apiEndpoints } from '@/lib/api';

type Ticket = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt?: string | null;
  photoUrls: string[];
  resolutionNote: string | null;
  assignedTo: { id: string; fullName: string | null } | null;
  raisedByUser?: { fullName: string | null } | null;
  listing: { id: string; title: string; address?: string; area?: string | null } | null;
};

function shortId(id: string) {
  return `MNT-${id.slice(0, 8).toUpperCase()}`;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  plumbing: { label: 'Plumbing & RO Water', icon: Droplets, color: 'text-blue-600' },
  electrical: { label: 'Microgrid & Power', icon: Zap, color: 'text-amber-600' },
  structural: { label: 'Structural & Glazing', icon: Building2, color: 'text-indigo-600' },
  security: { label: 'Access & Security', icon: Lock, color: 'text-purple-600' },
  cleaning: { label: 'Cleaning & Upkeep', icon: Wrench, color: 'text-zinc-600' },
  other: { label: 'General', icon: Wrench, color: 'text-zinc-600' },
};

const PRIORITY_META: Record<string, { label: string; dot: string; pill: string }> = {
  urgent: { label: 'Emergency', dot: 'bg-red-600', pill: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20' },
  high: { label: 'High', dot: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20' },
  medium: { label: 'Medium', dot: 'bg-blue-500', pill: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
  low: { label: 'Low', dot: 'bg-zinc-400', pill: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]' },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20' },
  assigned: { label: 'Assigned', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20' },
  resolved: { label: 'Resolved', cls: 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#6ffbbe] border-primary dark:border-primary/20' },
  closed: { label: 'Closed', cls: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]' },
};

function slaLabel(ticket: Ticket): string {
  const ageHrs = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  if (ticket.status === 'resolved' || ticket.status === 'closed') return 'Resolved';
  if (ticket.priority === 'urgent') return ageHrs < 2 ? `SLA: ${(2 - ageHrs).toFixed(1)} hrs remaining` : 'SLA breached';
  if (ticket.priority === 'high') return ageHrs < 6 ? `SLA: ${(6 - ageHrs).toFixed(1)} hrs remaining` : 'SLA breached';
  return 'Scheduled';
}

export default function LandlordMaintenanceClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primary: use apiEndpoints.maintenance.getTickets as instructed
      const res: any = await apiEndpoints.maintenance.getTickets();
      // Axios wraps in res.data; API returns { success, data }
      const raw = res?.data?.data ?? res?.data ?? res;
      const rows: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      const mapped: Ticket[] = rows.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? '',
        status: String(t.status),
        priority: String(t.priority),
        category: String(t.category ?? 'other'),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt ?? null,
        closedAt: t.closedAt ?? null,
        photoUrls: Array.isArray(t.photoUrls) ? t.photoUrls : [],
        resolutionNote: t.resolutionNote ?? null,
        assignedTo: t.assignedToUser ? { id: t.assignedToUser.id, fullName: t.assignedToUser.fullName } : t.assignedTo ? { id: t.assignedTo, fullName: null } : null,
        raisedByUser: t.raisedByUser ? { fullName: t.raisedByUser.fullName } : null,
        listing: t.listing ? { id: t.listing.id, title: t.listing.title, address: t.listing.address, area: t.listing.area ?? null } : null,
      }));
      setTickets(mapped);
    } catch (e) {
      // Fallback to direct fetch if apiEndpoints fails (e.g. token not ready)
      try {
        const r = await fetch('/api/maintenance', { cache: 'no-store' });
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        const j = await r.json();
        const rows: any[] = Array.isArray(j?.data) ? j.data : [];
        const mapped: Ticket[] = rows.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? '',
          status: String(t.status),
          priority: String(t.priority),
          category: String(t.category ?? 'other'),
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          resolvedAt: t.resolvedAt ?? null,
          closedAt: t.closedAt ?? null,
          photoUrls: Array.isArray(t.photoUrls) ? t.photoUrls : [],
          resolutionNote: t.resolutionNote ?? null,
          assignedTo: t.assignedToUser ? { id: t.assignedToUser.id, fullName: t.assignedToUser.fullName } : null,
          raisedByUser: t.raisedByUser ? { fullName: t.raisedByUser.fullName } : null,
          listing: t.listing ? { id: t.listing.id, title: t.listing.title, address: t.listing.address, area: t.listing.area ?? null } : null,
        }));
        setTickets(mapped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === 'open').length,
      assigned: tickets.filter((t) => t.status === 'assigned').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
      total: tickets.length,
    }),
    [tickets]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusTab !== 'all') {
        if (statusTab === 'in_progress') {
          if (!(t.status === 'in_progress' || t.status === 'assigned')) return false;
        } else if (t.status !== statusTab) return false;
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (!term) return true;
      const hay = [t.title, t.description ?? '', t.id, shortId(t.id), t.listing?.title ?? '', t.assignedTo?.fullName ?? '', t.raisedByUser?.fullName ?? ''].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [tickets, q, categoryFilter, priorityFilter, statusTab]);

  const exportCsv = () => {
    const rows = filtered.map((t) => [shortId(t.id), `"${t.title.replace(/"/g, '""')}"`, t.category, t.priority, t.status, t.createdAt].join(','));
    const csv = ['Ref,Title,Category,Priority,Status,Created', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landlord-maintenance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold">Could not load maintenance tickets</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={load}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + badges */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
          <span>Dashboard</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>Operations</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-primary dark:text-[#4edea3]">Maintenance Requests</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[var(--sovereign-hover)] dark:text-[#6ffbbe] border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4edea3] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            24/7 Facility Response Desk
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> SLA Guaranteed
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
            Service Charge Covered
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Maintenance Requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">View, track, and manage all facility repairs and MEP engineering requests across your registered properties.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]">
            <a href="tel:+23412908820">
              <Phone className="mr-1 h-4 w-4 text-primary" /> Call 24/7 Facility Desk
            </a>
          </Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary text-white shadow-lg shadow-primary/20">
            <Link href="/dashboard/landlord/maintenance">New Maintenance Request</Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">OPEN REQUESTS</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.open}</span>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Active</span>
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> {counts.open + counts.assigned} awaiting triage &amp; dispatch
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">IN PROGRESS</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.inProgress}</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Dispatched</span>
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
              <Wrench className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Building2 className="h-4 w-4 text-blue-600" /> Technicians on site / parts in procurement
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">RESOLVED &amp; CLOSED</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{counts.resolved + counts.closed}</span>
                <span className="text-sm font-medium text-primary dark:text-[#4edea3]">Completed</span>
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-[#4edea3] border border-primary/20">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-primary" /> Tenant sign-off &amp; warranty logged
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by issue title, ticket ref (#MNT-…), or contractor…" className="h-10 pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white placeholder:text-zinc-500" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 w-[200px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
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
              <SelectTrigger className="h-10 w-[180px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Priority: All</SelectItem>
                <SelectItem value="urgent">Emergency (P1)</SelectItem>
                <SelectItem value="high">High (P2)</SelectItem>
                <SelectItem value="medium">Medium (P3)</SelectItem>
                <SelectItem value="low">Low (P4)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-white/[0.06]" onClick={exportCsv} aria-label="Export CSV">
              <Download className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {(
            [
              ['all', `All ${counts.total}`],
              ['open', `Open ${counts.open}`],
              ['in_progress', `In Progress ${counts.inProgress}`],
              ['resolved', `Resolved ${counts.resolved}`],
              ['closed', `Closed ${counts.closed}`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setStatusTab(k as any)}
              className={`rounded-lg px-3.5 py-1.5 border transition-colors ${statusTab === k ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.08]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]">
                      <Wrench className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="mt-3 font-semibold text-zinc-900 dark:text-white">No maintenance requests found</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">No requests match your filters. Try clearing search or switching tabs. Requests from tenants and on-site managers will appear here.</p>
                    <Button variant="outline" size="sm" className="mt-4 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900" onClick={() => { setQ(''); setCategoryFilter('all'); setPriorityFilter('all'); setStatusTab('all'); }}>
                      Clear filters
                    </Button>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Button asChild size="sm" className="bg-primary hover:bg-primary text-white">
                        <Link href="/dashboard/landlord/maintenance">New Maintenance Request</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
                        <Link href="/dashboard/landlord/properties">View properties</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cat = CATEGORY_META[t.category] ?? CATEGORY_META.other;
                  const pri = PRIORITY_META[t.priority] ?? PRIORITY_META.medium;
                  const stat = STATUS_META[t.status] ?? STATUS_META.open;
                  const CatIcon = cat.icon;
                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5">
                        <Link href={`/dashboard/landlord/maintenance/${t.id}`} className="font-semibold text-zinc-900 dark:text-white hover:text-primary dark:hover:text-[#4edea3] hover:underline line-clamp-1">
                          {t.title}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">#{shortId(t.id)}</span>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span className="text-zinc-600 dark:text-zinc-400 line-clamp-1">{t.listing?.title ?? '—'}{t.listing?.area ? ` • ${t.listing.area}` : ''}</span>
                        </div>
                        {t.raisedByUser?.fullName && (
                          <div className="mt-1 text-[11px] text-zinc-500">Raised by {t.raisedByUser.fullName}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08]">
                          <CatIcon className={`h-4 w-4 ${cat.color}`} /> {cat.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${pri.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${pri.dot}`} /> {pri.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <p className="font-mono text-xs font-medium text-zinc-900 dark:text-white">{formatDateLong(t.createdAt)}</p>
                        <p className={`text-xs ${t.priority === 'urgent' || t.priority === 'high' ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{slaLabel(t)}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {t.assignedTo ? (
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#6ffbbe] text-xs font-semibold border border-primary/20">
                              {(t.assignedTo.fullName ?? '—').slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.assignedTo.fullName ?? 'Assigned'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${stat.cls}`}>{stat.label}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-primary dark:hover:text-[#4edea3]">
                            <Link href={`/dashboard/landlord/maintenance/${t.id}`} aria-label="View">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => window.dispatchEvent(new CustomEvent('propati:assign-ticket', { detail: t.id }))} aria-label="Assign">
                            <Building2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
