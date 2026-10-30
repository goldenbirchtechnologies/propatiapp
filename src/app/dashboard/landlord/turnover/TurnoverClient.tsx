'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Building2,
  Calendar,
  Clock,
  BadgeCheck,
  Wrench,
  Sparkles,
  MoreVertical,
  PlayCircle,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Edit3,
  UserPlus,
  Receipt,
  ChevronDown,
  MapPin,
  User,
} from 'lucide-react';

type TurnoverStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
type TurnoverPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskRow = {
  id: string;
  listing?: { title: string; address?: string } | null;
  assignedToUser?: { fullName: string } | null;
  priority: TurnoverPriority;
  status: TurnoverStatus;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  actualStart?: string | null;
  actualEnd?: string | null;
  notes?: string | null;
  checklist?: unknown;
  createdAt?: string | null;
  title?: string | null;
  description?: string | null;
};

interface TurnoverClientProps {
  initialTasks: TaskRow[];
}

function getChecklistItems(checklist: unknown): string[] {
  if (Array.isArray(checklist)) return checklist.filter((x): x is string => typeof x === 'string');
  if (checklist && typeof checklist === 'object') {
    const obj = checklist as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items.filter((x): x is string => typeof x === 'string');
  }
  return [];
}

function formatDue(s: string | null | undefined): string {
  if (!s) return 'No due date';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true });
  const date = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  if (sameDay) return `Due: Today, ${time} WAT`;
  if (isTomorrow) return `Due: Tomorrow, ${time} WAT`;
  return `Due: ${date}, ${time} WAT`;
}

export default function TurnoverClient({ initialTasks }: TurnoverClientProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('earliest');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'done'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const propertyOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      const title = t.listing?.title;
      if (title) map.set(title, title);
    });
    return Array.from(map.entries());
  }, [tasks]);

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'completed').length;

  const handleStatusChange = (id: string, next: TurnoverStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    setOpenMenuId(null);
    if (next === 'in_progress') showToast('Task started — vendor notified');
    else if (next === 'completed') showToast('Turnover certified — ready for check-in');
    else if (next === 'pending') showToast('Task reopened');
    else showToast('Task updated');
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenMenuId(null);
    showToast('Task removed from log');
  };

  const handleExport = () => {
    const header = ['Task', 'Property', 'Status', 'Priority', 'Due'];
    const rows = filteredSorted.map((t) => [
      t.title || t.notes?.slice(0, 40) || t.id,
      t.listing?.title || '—',
      t.status,
      t.priority,
      t.scheduledStart || '—',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnover-checklist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Checklist exported (CSV)');
  };

  const filteredSorted = useMemo(() => {
    let list = [...tasks];
    if (filterStatus !== 'all') {
      if (filterStatus === 'done') list = list.filter((t) => t.status === 'completed');
      else list = list.filter((t) => t.status === filterStatus);
    }
    if (propertyFilter !== 'all') {
      list = list.filter((t) => t.listing?.title === propertyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const hay = `${t.title || ''} ${t.notes || ''} ${t.listing?.title || ''} ${t.assignedToUser?.fullName || ''} ${t.id}`.toLowerCase();
        return hay.includes(q);
      });
    }
    list.sort((a, b) => {
      if (sortValue === 'earliest') {
        const da = a.scheduledStart ? new Date(a.scheduledStart).getTime() : 0;
        const db = b.scheduledStart ? new Date(b.scheduledStart).getTime() : 0;
        return da - db;
      }
      if (sortValue === 'latest') {
        const da = a.scheduledStart ? new Date(a.scheduledStart).getTime() : 0;
        const db = b.scheduledStart ? new Date(b.scheduledStart).getTime() : 0;
        return db - da;
      }
      if (sortValue === 'title') return (a.title || a.notes || '').localeCompare(b.title || b.notes || '');
      return 0;
    });
    return list;
  }, [tasks, filterStatus, propertyFilter, searchQuery, sortValue]);

  return (
    <div className="space-y-6">
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-zinc-800 dark:border-zinc-200 transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <Sparkles className="w-4 h-4 text-[#4edea3] dark:text-primary" />
        <span className="text-sm font-medium">{toast}</span>
      </div>

      {/* Breadcrumb + header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-primary dark:hover:text-[#4edea3]">Home</Link>
            <span className="text-zinc-300 dark:text-zinc-600">›</span>
            <span>Operations</span>
            <span className="text-zinc-300 dark:text-zinc-600">›</span>
            <span className="text-primary">Turnover Tasks</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Turnover Tasks</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Sync • WAT
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Cleaning, vendor turnover handovers, and statutory readiness checks.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Checklist
          </button>
          <button
            onClick={() => showToast('New turnover task — use property maintenance to create')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Wrench className="w-4 h-4" /> + New Turnover Task
          </button>
        </div>
      </div>

      {/* KPI 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Awaiting Dispatch</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{pendingCount}</span>
                <span className="text-sm font-medium text-amber-600">Pending</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Awaiting vendor start &amp; keycard handover
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Turnovers</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{inProgressCount}</span>
                <span className="text-sm font-medium text-blue-600">In Progress</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Cleaning, HVAC testing &amp; inspection active
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Cleared Readiness</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{doneCount}</span>
                <span className="text-sm font-medium text-primary">Completed</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
              <BadgeCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-primary" /> Certified ready for guest/tenant move-in
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-4 space-y-3">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, cleaning items, vendors..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Properties</option>
                {propertyOptions.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label.length > 36 ? `${label.slice(0, 36)}…` : label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <div className="relative">
              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="earliest">Sort: Due Date (Earliest first)</option>
                <option value="latest">Sort: Due Date (Latest first)</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-200 dark:border-white/[0.08]">
          {([
            { id: 'all', label: 'All', count: tasks.length },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'in_progress', label: 'In Progress', count: inProgressCount },
            { id: 'done', label: 'Done', count: doneCount },
          ] as const).map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterStatus(p.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterStatus === p.id ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.08]'}`}
            >
              {p.label} <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${filterStatus === p.id ? 'bg-white/20 text-white' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>{p.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks list */}
      {filteredSorted.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-400 mb-4">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">No turnover tasks yet</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">All units are primed for occupancy. Initialize a post-checkout turnover or schedule maintenance inspection.</p>
          <button onClick={() => showToast('Create turnover task from property maintenance')} className="mt-4 h-9 px-4 rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold inline-flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Create First Task
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredSorted.map((task) => {
            const checklistItems = getChecklistItems(task.checklist);
            const title = task.title || task.notes?.slice(0, 80) || `Turnover • ${task.listing?.title || 'Unassigned property'}`;
            const description = task.notes || 'Turnover handover — cleaning, inspection and readiness checks.';
            const isPending = task.status === 'pending';
            const isProgress = task.status === 'in_progress';
            const isDone = task.status === 'completed';
            const borderCls = isPending ? 'border-l-amber-500' : isProgress ? 'border-l-blue-500' : isDone ? 'border-l-primary' : 'border-l-zinc-300 dark:border-l-white/20';
            const dueLabel = formatDue(task.scheduledStart || task.createdAt);
            const isTodayDue = dueLabel.includes('Today');
            return (
              <div key={task.id} className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 border-l-4 ${borderCls} hover:shadow-sm transition-shadow`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                        </span>
                      )}
                      {isProgress && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> In Progress
                        </span>
                      )}
                      {isDone && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 text-[var(--sovereign-hover)] dark:text-[#4edea3] text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {task.status === 'assigned' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-semibold">Assigned</span>
                      )}
                      {task.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">Cancelled</span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${task.priority === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : task.priority === 'high' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]'}`}>{task.priority}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
                    {checklistItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {checklistItems.slice(0, 6).map((item, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] px-2.5 py-1 rounded-lg">
                            <BadgeCheck className="w-3.5 h-3.5 text-primary" /> {item}
                          </span>
                        ))}
                        {checklistItems.length > 6 && <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1">+{checklistItems.length - 6} more</span>}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${isTodayDue ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                        <Calendar className="w-4 h-4" /> {dueLabel}
                      </span>
                      <span className="text-zinc-300 dark:text-white/20">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-primary" /> <span className="font-medium text-zinc-900 dark:text-white">{task.listing?.title || 'Unassigned property'}</span>
                        {task.listing?.address && <span className="hidden sm:inline">({task.listing.address})</span>}
                      </span>
                      <span className="text-zinc-300 dark:text-white/20">•</span>
                      {task.assignedToUser?.fullName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300">
                          <span className="w-5 h-5 rounded-full bg-[var(--sovereign-container-bg)] dark:bg-primary/15 border border-primary dark:border-primary/20 flex items-center justify-center text-[10px] font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                            {task.assignedToUser.fullName.slice(0, 2).toUpperCase()}
                          </span>
                          {task.assignedToUser.fullName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                          <User className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center lg:flex-col lg:items-end justify-between gap-2 shrink-0 pt-1">
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button onClick={() => handleStatusChange(task.id, 'in_progress')} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                          <PlayCircle className="w-4 h-4" /> Start Task
                        </button>
                      )}
                      {isProgress && (
                        <button onClick={() => handleStatusChange(task.id, 'completed')} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary hover:bg-primary text-white text-xs font-semibold shadow-sm transition-colors">
                          <CheckCircle2 className="w-4 h-4" /> Mark Complete
                        </button>
                      )}
                      {isDone && (
                        <button onClick={() => handleStatusChange(task.id, 'pending')} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                          <RotateCcw className="w-4 h-4" /> Reopen Task
                        </button>
                      )}
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)} className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === task.id && (
                          <div className="absolute right-0 top-11 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-xl p-1 z-20">
                            <button onClick={() => showToast('Edit task — coming soon')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.06] text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Task</button>
                            <button onClick={() => showToast('Reassign vendor — coming soon')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.06] text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Reassign Vendor</button>
                            <button onClick={() => showToast('Checklist detail — coming soon')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.06] text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Receipt className="w-4 h-4" /> View Checklist</button>
                            <div className="h-px bg-zinc-200 dark:bg-white/[0.08] my-1" />
                            <button onClick={() => handleDelete(task.id)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-sm text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Task</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">ID: {task.id.slice(0, 12)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
