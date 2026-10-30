'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Calendar,
  BedDouble,
  MessageSquare,
  Eye,
  MoreVertical,
  RefreshCw,
  Building2,
  Wallet,
  TrendingUp,
  Clock,
  BadgeCheck,
  Receipt,
  CalendarDays,
  Ban,
  Plus,
  Sparkles,
} from 'lucide-react';

type BookingRow = {
  id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  basePrice: number;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  guestId?: string;
  specialRequests?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  createdAt: string;
  listingId: string;
  listingTitle: string;
  listingAddress?: string;
};

type ShortLetClientProps = {
  initialBookings: BookingRow[];
  listings: { id: string; title: string }[];
};

function formatCurrency(value: number) {
  return `₦${Number(value || 0).toLocaleString('en-NG')}`;
}

function formatDateRange(checkIn: string, checkOut: string, nights: number) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const fmt = (d: Date) => d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(inDate)} – ${fmt(outDate)} (${nights} night${nights === 1 ? '' : 's'})`;
}

function isUpcomingCheckIn(checkIn: string) {
  const today = new Date().toISOString().slice(0, 10);
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 7);
  const weekLaterStr = weekLater.toISOString().slice(0, 10);
  return checkIn >= today && checkIn <= weekLaterStr;
}

type TabId = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export default function ShortLetClient({ initialBookings, listings }: ShortLetClientProps) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TabId>('all');
  const [statusSelect, setStatusSelect] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionIds, setActionIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const sanitizedListings = listings.filter((l) => {
    const t = (l.title || '').trim();
    if (!t || t.length < 3) return false;
    const lower = t.toLowerCase();
    if (lower === 'test listing' || lower === 'test' || lower.startsWith('test listing ')) return false;
    if (/^(ghd|dfdf|asdf|qwerty|xxx|zzz)/i.test(t)) return false;
    if (t.length > 60 && !t.includes(' ')) return false;
    if (/([a-z])\1{4,}/i.test(t)) return false;
    return true;
  });

  // Derived KPIs — live, no hardcoding
  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.paymentStatus === 'paid' && b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0),
    [bookings]
  );
  const activeNights = useMemo(
    () => bookings.filter((b) => b.status === 'checked_in').reduce((s, b) => s + b.nights, 0),
    [bookings]
  );
  const upcomingCheckIns = useMemo(
    () => bookings.filter((b) => isUpcomingCheckIn(b.checkIn) && b.status !== 'cancelled' && b.status !== 'completed').length,
    [bookings]
  );
  const totalBookings = bookings.length;

  // Occupancy-ish: checked_in nights vs total upcoming+active nights
  const occupancyPct = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const bookedDays = new Set<string>();
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const s = d.toISOString().slice(0, 10);
        if (s >= now || b.status === 'checked_in') bookedDays.add(s);
      }
    });
    return bookings.length ? Math.min(100, Math.round((bookedDays.size / Math.max(bookings.length * 3, 1)) * 100)) : 0;
  }, [bookings]);

  const tabCounts = useMemo(() => {
    const upcoming = bookings.filter((b) => isUpcomingCheckIn(b.checkIn) && !['cancelled', 'completed', 'checked_in'].includes(b.status)).length;
    const active = bookings.filter((b) => b.status === 'checked_in').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    return { all: bookings.length, upcoming, active, completed, cancelled };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedListingId !== 'all' && b.listingId !== selectedListingId) return false;
      if (statusSelect !== 'all' && b.status !== statusSelect) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'upcoming' && !isUpcomingCheckIn(b.checkIn)) return false;
        if (statusFilter === 'upcoming' && ['cancelled', 'completed', 'checked_in'].includes(b.status)) return false;
        if (statusFilter === 'active' && b.status !== 'checked_in') return false;
        if (statusFilter === 'completed' && b.status !== 'completed') return false;
        if (statusFilter === 'cancelled' && b.status !== 'cancelled') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${b.guestName} ${b.guestEmail || ''} ${b.guestPhone || ''} ${b.listingTitle} ${b.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, selectedListingId, statusFilter, statusSelect, searchQuery]);

  const mutate = async (id: string, body: { status?: string; paymentStatus?: string }) => {
    setActionIds((prev) => [...prev, id]);
    setErrors((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.booking) throw new Error(json?.error || 'Action failed');
      setBookings((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.booking } : r)));
      showToast('Booking updated');
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Action failed' }));
    } finally {
      setActionIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings?limit=100', { cache: 'no-store' });
      const json = await res.json().catch(() => ({ bookings: [] }));
      if (res.ok && Array.isArray(json?.bookings)) {
        setBookings(
          json.bookings.map(
            (b: {
              id: string;
              status: string;
              paymentStatus: string;
              checkIn: string;
              checkOut: string;
              nights: number;
              totalPrice: unknown;
              basePrice: unknown;
              guestName?: string;
              guestPhone?: string;
              guestEmail?: string;
              specialRequests?: string;
              checkedInAt?: string;
              checkedOutAt?: string;
              cancelledAt?: string;
              createdAt: string;
              listing: { id: string; title: string; address?: string };
              guest?: { id: string; fullName: string; email?: string; phone?: string };
            }) => ({
              id: b.id,
              status: b.status,
              paymentStatus: b.paymentStatus,
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              nights: b.nights,
              totalPrice: Number(b.totalPrice || 0),
              basePrice: Number(b.basePrice || 0),
              guestName: b.guestName || b.guest?.fullName || 'Guest',
              guestPhone: b.guestPhone || b.guest?.phone,
              guestEmail: b.guestEmail || b.guest?.email,
              guestId: b.guest?.id,
              specialRequests: b.specialRequests,
              checkedInAt: b.checkedInAt,
              checkedOutAt: b.checkedOutAt,
              cancelledAt: b.cancelledAt,
              createdAt: b.createdAt,
              listingId: b.listing?.id,
              listingTitle: b.listing?.title || 'Property',
              listingAddress: b.listing?.address,
            })
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const header = ['Guest', 'Property', 'Check-in', 'Check-out', 'Nights', 'Total', 'Status'];
    const rows = filtered.map((b) => [b.guestName, b.listingTitle, b.checkIn, b.checkOut, String(b.nights), String(b.totalPrice), b.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlet-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Occupancy & escrow ledger exported');
  };

  // Calendar helpers
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const monthLabel = now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  const bookingsByDay = useMemo(() => {
    const map = new Map<number, BookingRow[]>();
    filtered.forEach((b) => {
      if (b.status === 'cancelled') return;
      const s = new Date(b.checkIn);
      const e = new Date(b.checkOut);
      for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map.has(day)) map.set(day, []);
          map.get(day)!.push(b);
        }
      }
    });
    return map;
  }, [filtered, year, month]);

  return (
    <div className="space-y-6">
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-zinc-800 dark:border-zinc-200 transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <Sparkles className="w-4 h-4 text-[#4edea3] dark:text-primary" />
        <span className="text-sm font-medium">{toast}</span>
      </div>

      {/* Breadcrumb + header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-primary dark:hover:text-[#4edea3]">
              Home
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">›</span>
            <Link href="/dashboard/landlord/portfolio" className="hover:text-primary dark:hover:text-[#4edea3]">
              Portfolio
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">›</span>
            <span className="text-zinc-900 dark:text-white">Short-let Bookings</span>
          </nav>
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Short-let Bookings</h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400 max-w-3xl">
            Manage high-yield luxury serviced apartments, guest reservations, check-ins, and escrow payouts across prime Lagos properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-white/[0.08]' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              <Receipt className="w-4 h-4 text-primary" /> Table View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-white/[0.08]' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              <CalendarDays className="w-4 h-4" /> Calendar View
            </button>
          </div>
          <button
            onClick={() => showToast('Date block / maintenance management — coming soon')}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-colors"
          >
            <Ban className="w-4 h-4" /> Block Dates
          </button>
          <Link
            href="/dashboard/landlord/properties/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Link>
        </div>
      </div>

      {/* KPI row — live */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Escrow Total Revenue</span>
            <div className="w-9 h-9 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white font-mono">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-primary">Escrow secured</span>
              <span className="text-zinc-500 dark:text-zinc-400">• {totalBookings} bookings</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Nights</span>
            <div className="w-9 h-9 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">{activeNights} Nights</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span className="font-bold text-zinc-900 dark:text-white">{occupancyPct}%</span> occupancy signal
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-zinc-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Upcoming Arrivals</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">{upcomingCheckIns} Check-ins</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Next 7 days
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-zinc-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Volume</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">{totalBookings} Bookings</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Across {sanitizedListings.length || '—'} properties</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {([
              { id: 'all', label: 'All', count: tabCounts.all },
              { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
              { id: 'active', label: 'Active', count: tabCounts.active },
              { id: 'completed', label: 'Completed', count: tabCounts.completed },
              { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === t.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.08]'}`}
              >
                {t.label} <span className={`ml-1 font-mono ${statusFilter === t.id ? 'opacity-80' : 'opacity-60'}`}>({t.count})</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest name, ref, email, phone..."
                className="h-10 pl-9 pr-3 w-[240px] rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Properties</option>
              {sanitizedListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title.length > 40 ? `${l.title.slice(0, 40)}…` : l.title}
                </option>
              ))}
            </select>
            <select
              value={statusSelect}
              onChange={(e) => setStatusSelect(e.target.value)}
              className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table / Calendar */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3 animate-pulse">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-zinc-100 dark:bg-white/[0.06] rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-zinc-400" />
              </div>
              <p className="font-semibold text-zinc-900 dark:text-white">No bookings found</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1">No reservations match your current filters.</p>
              <div className="mt-5 flex items-center gap-2">
                <Link href="/dashboard/landlord/properties/new" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold inline-flex items-center">
                  Add Property
                </Link>
                <button onClick={refresh} className="h-9 px-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Check-in / Check-out</th>
                    <th className="py-3 px-4">Nights</th>
                    <th className="py-3 px-4 text-right">Total (NGN)</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Booking Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.08] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200 shrink-0">
                            {req.guestName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{req.guestName}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{req.guestEmail || req.guestPhone || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{req.listingTitle}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{req.listingAddress || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-white">{formatDateRange(req.checkIn, req.checkOut, req.nights)}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          <BedDouble className="w-3.5 h-3.5" /> {req.nights}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-mono">{formatCurrency(req.totalPrice)}</div>
                        <div className={`text-[11px] font-semibold ${req.paymentStatus === 'paid' ? 'text-primary' : 'text-amber-600'}`}>
                          {req.paymentStatus === 'paid' ? 'Paid (Escrow)' : 'Pending Payment'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${req.paymentStatus === 'paid' ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] border-primary dark:border-primary/20' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${req.paymentStatus === 'paid' ? 'bg-primary' : 'bg-zinc-400'}`} /> {req.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${req.status === 'checked_in' ? 'bg-primary text-white border-primary' : req.status === 'confirmed' ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] border-primary dark:border-primary/20' : req.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : req.status === 'completed' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}
                        >
                          <BadgeCheck className="w-3 h-3" /> {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link href={`/dashboard/landlord/bookings/${req.id}`} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link href={req.guestId ? `/dashboard/landlord/messages?guestId=${req.guestId}` : '/dashboard/landlord/messages'} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors" title="Message">
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                          {req.status === 'pending' ? (
                            <>
                              <button onClick={() => mutate(req.id, { status: 'confirmed' })} disabled={actionIds.includes(req.id)} className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary text-white text-xs font-semibold disabled:opacity-50">Approve</button>
                              <button onClick={() => mutate(req.id, { status: 'cancelled' })} disabled={actionIds.includes(req.id)} className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-red-600 text-xs font-semibold disabled:opacity-50">Decline</button>
                            </>
                          ) : req.status === 'confirmed' ? (
                            <button onClick={() => mutate(req.id, { status: 'cancelled' })} disabled={actionIds.includes(req.id)} className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-red-600 text-xs font-semibold disabled:opacity-50">Cancel</button>
                          ) : null}
                          {errors[req.id] && <span className="text-xs text-red-600 ml-1">{errors[req.id]}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{monthLabel}</h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Lagos WAT</span>
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{filtered.length} bookings in view</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 py-2 bg-zinc-50 dark:bg-white/[0.04] rounded-lg mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[84px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.04] opacity-40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const items = bookingsByDay.get(day) || [];
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`min-h-[84px] p-2 rounded-xl border flex flex-col gap-1 ${isToday ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border-primary dark:border-primary/20' : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06]'}`}>
                  <span className={`text-xs font-bold ${isToday ? 'text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'text-zinc-700 dark:text-zinc-300'}`}>{day}{isToday && ' • Today'}</span>
                  <div className="space-y-1">
                    {items.slice(0, 2).map((b) => (
                      <div key={b.id} className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-[10px] font-semibold truncate text-zinc-700 dark:text-zinc-300">
                        {b.guestName.split(' ')[0]} • {b.listingTitle.slice(0, 14)}
                      </div>
                    ))}
                    {items.length > 2 && <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">+{items.length - 2} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/[0.08] pt-3">
            <span className="uppercase tracking-wider text-zinc-900 dark:text-white">Legend:</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> Checked In</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-zinc-900 dark:bg-white" /> Completed</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /> Pending</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Cancelled</span>
          </div>
        </div>
      )}
    </div>
  );
}
