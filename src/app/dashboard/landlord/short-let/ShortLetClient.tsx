'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ShieldOff,
  ClipboardList,
  Calendar,
  TrendingUp,
  BedDouble,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

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

const STATUS_TABS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'checked_in', label: 'Checked In' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['id'];

function formatCurrency(value: number) {
  return `NGN ${value.toLocaleString?.() ?? value}`;
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

export default function ShortLetClient({ initialBookings, listings }: ShortLetClientProps) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [loading, setLoading] = useState(false);
  const [actionIds, setActionIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

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

  const filtered = bookings.filter((b) => {
    if (selectedListingId !== 'all' && b.listingId !== selectedListingId) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const pendingApprovals = bookings.filter((b) => b.status === 'pending').length;
  const upcomingCheckIns = bookings.filter((b) => isUpcomingCheckIn(b.checkIn) && b.status !== 'cancelled').length;
  const monthlyRevenue = bookings
    .filter((b) => {
      const created = new Date(b.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear() && b.status !== 'cancelled';
    })
    .reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.totalPrice : 0), 0);

  const occupancyRate = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let availableDays = 0;
    let bookedDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasBooking = bookings.some((b) => {
        if (b.status === 'cancelled') return false;
        return b.checkIn <= dateStr && b.checkOut > dateStr;
      });
      availableDays += 1;
      if (hasBooking) bookedDays += 1;
    }
    return availableDays > 0 ? Math.round((bookedDays / availableDays) * 100) : 0;
  })();

  const mutate = async (id: string, body: { status?: string; paymentStatus?: string }) => {
    setLoading(true);
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
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Action failed' }));
    } finally {
      setLoading(false);
      setActionIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings?limit=100');
      const json = await res.json().catch(() => ({ bookings: [] }));
      if (res.ok && Array.isArray(json?.bookings)) {
        setBookings(
          json.bookings.map((b: {
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
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Operations</p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Short-let Bookings</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
            Manage guest reservations, review booking requests, and track short-stay earnings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={loading} onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Pending Approvals</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{pendingApprovals}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Booking requests awaiting host confirmation</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Upcoming Check-ins</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{upcomingCheckIns}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Stays starting within the next 7 days</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Monthly Revenue</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatCurrency(monthlyRevenue)}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Confirmed/completed payouts this month</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Occupancy Rate</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{occupancyRate}%</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Available days booked this month</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] space-y-5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-white">Property</label>
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] p-2.5 text-sm text-zinc-300 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
              >
                <option value="all">All properties</option>
                {sanitizedListings.length === 0 ? (
                  <option disabled>No properties available</option>
                ) : (
                  sanitizedListings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title.length > 48 ? `${l.title.slice(0, 48)}…` : l.title}</option>
                  ))
                )}
              </select>
              {sanitizedListings.length === 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 mt-1">No properties available</p>
              )}
            </div>
            <div className="flex items-end">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Guest Reservations</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={statusFilter === tab.id ? 'default' : 'secondary'}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {loading && !actionIds.length && <p className="text-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Loading bookings…</p>}
          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] p-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#27272a] border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400" />
              </div>
              <p className="font-semibold text-zinc-900 dark:text-white mb-1">No bookings yet</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">Direct guest reservation requests will appear here once booked.</p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => (window.location.href = '/dashboard/landlord/properties/new')}>
                  Add Property
                </Button>
                <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-300 hover:bg-zinc-50 dark:bg-[#18181b]" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
                  <th className="py-2 pr-4">Guest</th>
                  <th className="py-2 pr-4">Property / Unit</th>
                  <th className="py-2 pr-4">Dates</th>
                  <th className="py-2 pr-4">Nights</th>
                  <th className="py-2 pr-4">Payout</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id} className="border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08]/60">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{req.guestName}</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">{req.guestEmail || req.guestPhone || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{req.listingTitle}</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">{req.listingAddress || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
                      {formatDateRange(req.checkIn, req.checkOut, req.nights)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 text-xs"><BedDouble className="h-3 w-3" /> {req.nights}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(req.totalPrice)}</span>
                        <span className={`text-xs ${req.paymentStatus === 'paid' ? 'text-[#10b981]' : 'text-zinc-600 dark:text-zinc-600 dark:text-zinc-500'}`}>
                          {req.paymentStatus === 'paid' ? 'Paid' : 'Pending Payout'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="capitalize">{req.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={loading || actionIds.includes(req.id)}
                              onClick={() => mutate(req.id, { status: 'confirmed' })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={loading || actionIds.includes(req.id)}
                              onClick={() => mutate(req.id, { status: 'cancelled' })}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {req.status === 'confirmed' && (
                          <>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dashboard/landlord/bookings/${req.id}`}>View Details</Link>
                            </Button>
                            <Button size="sm" variant="secondary" asChild>
                              <Link href={`/dashboard/landlord/messages?guestId=${req.guestId}`}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={loading || actionIds.includes(req.id)}
                              onClick={() => mutate(req.id, { status: 'cancelled' })}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {errors[req.id] && <span className="text-xs text-red-600">{errors[req.id]}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}