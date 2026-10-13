'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Mail,
  Phone,
  CheckCircle2,
  Circle,
  Lock,
  Printer,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';

// ─── Real enums from prisma/schema.prisma ───
const STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'] as const;
const STATUS_LABELS: Record<string, string> = {
  open: 'Open / Reported',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const PRIORITY_PILL: Record<string, string> = {
  low: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  medium: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  high: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
};

const STATUS_PILL: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  assigned: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  in_progress: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  closed: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  resolutionNote: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photoUrls: string[];
  listing: { id: string; title: string; address: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string; phone: string | null } | null;
  raisedByUser: { id: string; fullName: string | null; email: string } | null;
  assignedToUser: { id: string; fullName: string | null; email: string; avatarUrl: string | null } | null;
}

// ─── Style primitives ───
const CARD = 'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const CARD_HEAD = 'flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-800/40';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const SUBPANEL = 'rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40';
const CARD_TITLE = 'text-base font-semibold text-zinc-900 dark:text-white';

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function titleize(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string | null | undefined, email?: string): string {
  const src = name?.trim() || email?.split('@')[0] || '?';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MaintenanceTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id as string;
  const { orgId } = useActiveOrganizationId();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async () => {
    if (!orgId || !ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${orgId}/tickets/${ticketId}`, { cache: 'no-store' });
      if (res.status === 404) {
        setError('Ticket not found.');
        return;
      }
      if (res.status === 403) {
        setError('You do not have access to this ticket.');
        return;
      }
      if (!res.ok) throw new Error(`Failed to load ticket (${res.status})`);
      const json = await res.json();
      setTicket(json?.data ?? null);
    } catch (e) {
      setError((e as Error).message ?? 'Could not load ticket');
    } finally {
      setLoading(false);
    }
  }, [orgId, ticketId]);

  useEffect(() => {
    if (orgId) load();
    else setLoading(false);
  }, [orgId, load]);

  // Close the status menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const updateStatus = async (status: string) => {
    if (!orgId || !ticketId) return;
    setMenuOpen(false);
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/orgs/${orgId}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUpdateError(body?.error || `Could not update status (${res.status}).`);
        return;
      }
      await load();
    } catch {
      setUpdateError('Network error. Status not updated.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-96 animate-pulse rounded-xl bg-zinc-200 lg:col-span-8 dark:bg-zinc-800" />
            <div className="h-64 animate-pulse rounded-xl bg-zinc-200 lg:col-span-4 dark:bg-zinc-800" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            {error ?? 'Ticket unavailable'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
            <Link
              href="/dashboard/estate-manager/maintenance"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to tickets
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Lifecycle derived from the real status value — no fabricated timestamps.
  const statusOrder = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
  const currentIndex = Math.max(0, statusOrder.indexOf(ticket.status));
  const stepTimestamps: Record<string, string | null> = {
    open: ticket.createdAt,
    assigned: ticket.status === 'open' ? null : ticket.updatedAt,
    in_progress: ['in_progress', 'resolved', 'closed'].includes(ticket.status) ? ticket.updatedAt : null,
    resolved: ticket.resolvedAt,
    closed: ticket.closedAt,
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-[1240px] p-6 lg:p-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <nav className="flex items-center gap-2">
            <Link href="/dashboard/estate-manager" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400">
              Home
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <Link href="/dashboard/estate-manager/maintenance" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400">
              Maintenance
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="max-w-[280px] truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-900 sm:max-w-md dark:text-white">
              {ticket.title}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 font-mono text-[11px] text-zinc-700 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
              {ticket.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {titleize(ticket.status)}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className={`${CARD} relative mb-8 overflow-hidden p-6 sm:p-8`}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400"
              >
                <ArrowLeft className="h-[18px] w-[18px] transition-transform group-hover:-translate-x-1" />
                Back to Tickets
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                {ticket.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-zinc-900 dark:text-white">{ticket.listing?.title ?? 'Unassigned property'}</span>
                {ticket.listing?.address && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span>{ticket.listing.address}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${PRIORITY_PILL[ticket.priority] ?? PRIORITY_PILL.medium}`}>
                  {titleize(ticket.priority)}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[ticket.status] ?? STATUS_PILL.open}`}>
                  {ticket.status === 'in_progress' && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {STATUS_LABELS[ticket.status] ?? titleize(ticket.status)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status menu — real PATCH */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                    disabled={updating}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {updating ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Wrench className="h-[18px] w-[18px]" />}
                    Update Status
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                      <p className={`px-3 py-2 ${LABEL}`}>Change ticket state</p>
                      {STATUSES.filter((s) => s !== ticket.status).map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); updateStatus(s); }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          {STATUS_LABELS[s]}
                          {STATUSES.indexOf(s) > currentIndex ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.print()}
                  title="Print work order"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  <Printer className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {updateError && (
            <div className="relative z-10 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}
        </div>

        {/* Two-column */}
        <div className="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className={`${CARD} overflow-hidden`}>
              <div className={CARD_HEAD}>
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className={CARD_TITLE}>Ticket Details &amp; Request Info</h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {titleize(ticket.category)}
                </span>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className={SUBPANEL}>
                    <p className={LABEL}>Category</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{titleize(ticket.category)}</p>
                  </div>
                  <div className={SUBPANEL}>
                    <p className={LABEL}>Priority</p>
                    <p className={`mt-0.5 text-sm font-semibold ${ticket.priority === 'urgent' ? 'text-rose-600 dark:text-rose-400' : ticket.priority === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                      {titleize(ticket.priority)}
                    </p>
                  </div>
                  <div className={SUBPANEL}>
                    <p className={LABEL}>Status</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{titleize(ticket.status)}</p>
                  </div>
                  <div className={SUBPANEL}>
                    <p className={LABEL}>Last Updated</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{formatDateTime(ticket.updatedAt)}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className={LABEL}>Incident Narrative &amp; Diagnostic Notes</h3>
                  <p className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                    {ticket.description ?? 'No description provided.'}
                  </p>
                </div>

                {ticket.resolutionNote && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Resolution Note</h3>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-emerald-800 dark:text-emerald-300">{ticket.resolutionNote}</p>
                  </div>
                )}

                {/* Tenant strip */}
                <div className={`${SUBPANEL} flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {initials(ticket.tenant?.fullName, ticket.tenant?.email)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {ticket.tenant?.fullName ?? 'Unassigned tenant'}
                      </p>
                      <p className={MUTED}>
                        {ticket.raisedByUser?.fullName
                          ? `Reported by ${ticket.raisedByUser.fullName}`
                          : 'Reported via portal'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.tenant?.phone && (
                      <a
                        href={`tel:${ticket.tenant.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        <Phone className="h-4 w-4" /> Call
                      </a>
                    )}
                    {ticket.tenant?.email && (
                      <a
                        href={`mailto:${ticket.tenant.email}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={`${SUBPANEL} flex items-start gap-3`}>
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className={LABEL}>Reported</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDateTime(ticket.createdAt)}</p>
                    </div>
                  </div>
                  {ticket.resolvedAt && (
                    <div className={`${SUBPANEL} flex items-start gap-3`}>
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className={LABEL}>Resolved</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDateTime(ticket.resolvedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence photos — real photoUrls */}
                <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className={LABEL}>Inspection Evidence &amp; Field Photos ({ticket.photoUrls.length})</h3>
                  </div>
                  {ticket.photoUrls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-700">
                      <ImageIcon className="mb-2 h-7 w-7 text-zinc-400" />
                      <p className={MUTED}>No photos attached to this ticket.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {ticket.photoUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-800"
                        >
                          <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 text-white">
                            <p className="text-sm font-medium">Evidence {i + 1}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            {/* Assignee */}
            <div className={`${CARD} overflow-hidden`}>
              <div className="px-6 py-5" style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className={CARD_TITLE}>Assigned Technician</h2>
                  </div>
                </div>
              </div>
              <div className="space-y-6 p-6">
                {ticket.assignedToUser ? (
                  <>
                    <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/40">
                      {ticket.assignedToUser.avatarUrl ? (
                        <img
                          src={ticket.assignedToUser.avatarUrl}
                          alt={ticket.assignedToUser.fullName ?? 'Assignee'}
                          className="mb-3 h-16 w-16 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white shadow-md">
                          {initials(ticket.assignedToUser.fullName, ticket.assignedToUser.email)}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {ticket.assignedToUser.fullName ?? 'Team member'}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Maintenance Staff</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/40">
                        <Mail className="h-5 w-5 shrink-0 text-zinc-400" />
                        <div className="min-w-0">
                          <p className={LABEL}>Email</p>
                          <a href={`mailto:${ticket.assignedToUser.email}`} className="block truncate text-xs text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300">
                            {ticket.assignedToUser.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center rounded-xl bg-zinc-50 py-8 text-center dark:bg-zinc-800/40">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-400 dark:bg-zinc-700">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">No Technician Assigned</p>
                    <p className={`mt-1 max-w-[220px] ${MUTED}`}>
                      This ticket is queued in dispatch. Assign a maintenance member from the ticket list.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Lifecycle checklist */}
            <div className={`${CARD} p-6`}>
              <h3 className={`${LABEL} mb-4`}>Ticket Lifecycle</h3>
              <ul className="space-y-3">
                {statusOrder.map((s, i) => {
                  const done = i < currentIndex || (i === currentIndex && ticket.status === s);
                  const isCurrent = i === currentIndex;
                  return (
                    <li key={s} className="flex items-center gap-2.5 text-sm">
                      {done || isCurrent ? (
                        <CheckCircle2 className={`h-[18px] w-[18px] shrink-0 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`} />
                      ) : (
                        <Circle className="h-[18px] w-[18px] shrink-0 text-zinc-300 dark:text-zinc-600" />
                      )}
                      <span className={done || isCurrent ? 'font-medium text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}>
                        {STATUS_LABELS[s]}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                          Current
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Lifecycle timeline */}
        <div className={`${CARD} mb-8 overflow-hidden`}>
          <div className={CARD_HEAD}>
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className={CARD_TITLE}>Ticket Lifecycle &amp; Audit Trail</h2>
            </div>
          </div>
          <div className="p-6 sm:p-10">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-5 right-6 top-5 -z-0 hidden h-1 bg-zinc-200 md:block dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4">
                {statusOrder.map((s, i) => {
                  const done = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const ts = stepTimestamps[s];
                  return (
                    <div key={s} className="flex flex-row items-start gap-4 md:flex-col md:items-center md:gap-3 md:text-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
                          done
                            ? 'border-2 border-emerald-500 bg-white text-emerald-600 dark:bg-zinc-900'
                            : isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                              : 'border-2 border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900'
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : isCurrent ? <Wrench className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${done ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {done ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                        </p>
                        <h4 className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{STATUS_LABELS[s]}</h4>
                        <p className={`mt-0.5 ${MUTED}`}>{ts ? formatDateTime(ts) : 'Pending'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
