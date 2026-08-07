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
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">Operations</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Short-let Bookings</h2>
          <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
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
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Pending Approvals</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{pendingApprovals}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Booking requests awaiting host confirmation</p>
        </Card>
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Upcoming Check-ins</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{upcomingCheckIns}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Stays starting within the next 7 days</p>
        </Card>
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Monthly Revenue</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Confirmed/completed payouts this month</p>
        </Card>
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Occupancy Rate</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{occupancyRate}%</p>
          <p className="mt-1 text-xs text-on-surface-variant">Available days booked this month</p>
        </Card>
      </div>

      <Card className="space-y-5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-primary">Property</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-surface-container-lowest p-2 text-sm"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
              >
                <option value="all">All properties</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-sm font-medium text-primary">Guest Reservations</p>
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
          {loading && !actionIds.length && <p className="text-sm text-on-surface-variant">Loading bookings…</p>}
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest/70 p-8 text-center shadow-sm">
              <ClipboardList className="w-9 h-9 mx-auto mb-3 text-primary" />
              <p className="font-semibold text-foreground mb-1">No bookings found</p>
              <p className="text-sm text-on-surface-variant">Direct guest reservation requests will appear here.</p>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="gap-2" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-xs uppercase tracking-wider text-muted-foreground">
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
                  <tr key={req.id} className="border-b border-outline-variant/60">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{req.guestName}</span>
                        <span className="text-xs text-on-surface-variant">{req.guestEmail || req.guestPhone || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{req.listingTitle}</span>
                        <span className="text-xs text-on-surface-variant">{req.listingAddress || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-on-surface-variant">
                      {formatDateRange(req.checkIn, req.checkOut, req.nights)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 text-xs"><BedDouble className="h-3 w-3" /> {req.nights}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{formatCurrency(req.totalPrice)}</span>
                        <span className={`text-xs ${req.paymentStatus === 'paid' ? 'text-success' : 'text-on-surface-variant'}`}>
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
        </div>
      </Card>
    </div>
  );
}
