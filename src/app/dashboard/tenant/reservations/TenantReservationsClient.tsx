'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, MapPin, XCircle } from 'lucide-react';
import { formatDateLong } from '@/lib/utils';

export type TenantReservation = {
  id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
  basePrice: number;
  specialRequests?: string | null;
  createdAt: string;
  listing: { id: string; title: string; address: string; image: string | null };
};

type Filter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const statusCopy: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting host', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  completed: { label: 'Completed', className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-700 dark:text-red-300' },
};

function money(value: number) {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function statusIcon(status: string) {
  if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4" />;
  if (status === 'cancelled') return <XCircle className="h-4 w-4" />;
  return <Clock3 className="h-4 w-4" />;
}

export default function TenantReservationsClient({ initialReservations }: { initialReservations: TenantReservation[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState<Filter>('all');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(
    () => filter === 'all' ? reservations : reservations.filter((reservation) => reservation.status === filter),
    [filter, reservations]
  );

  async function cancelReservation(id: string) {
    if (!window.confirm('Cancel this reservation request?')) return;
    setCancelling(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not cancel reservation');
      setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status: 'cancelled' } : reservation));
      setMessage('Reservation cancelled.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not cancel reservation');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Stay management</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">Shortlet reservations</h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">Keep track of upcoming stays, host responses, and reservation details in one place.</p>
        </div>
        <Link href="/listings?category=short-let" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
          <CalendarDays className="h-4 w-4" /> Find a shortlet
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-white/[0.08]">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as Filter[]).map((item) => {
          const count = item === 'all' ? reservations.length : reservations.filter((reservation) => reservation.status === item).length;
          return <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition ${filter === item ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}>{item} <span className="ml-1 opacity-70">{count}</span></button>;
        })}
      </div>

      {message && <p role="status" className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200">{message}</p>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-white/[0.12] dark:bg-zinc-900">
          <CalendarDays className="mx-auto h-8 w-8 text-zinc-400" />
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">No reservations here yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">Your submitted shortlet requests will appear here, including the dates, price, and host response.</p>
          <Link href="/listings?category=short-let" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">Browse shortlets</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((reservation) => {
            const status = statusCopy[reservation.status] || statusCopy.pending;
            const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';
            return <article key={reservation.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:h-28 sm:w-40">
                  {reservation.listing.image ? <img src={reservation.listing.image} alt={reservation.listing.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-zinc-400"><CalendarDays className="h-8 w-8" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-base font-semibold text-zinc-900 dark:text-white">{reservation.listing.title}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"><MapPin className="h-3.5 w-3.5" />{reservation.listing.address}</p></div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{statusIcon(reservation.status)}{status.label}</span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div><p className="text-xs text-zinc-500 dark:text-zinc-400">Stay dates</p><p className="mt-1 font-medium text-zinc-900 dark:text-white">{formatDateLong(reservation.checkIn)} to {formatDateLong(reservation.checkOut)}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{reservation.nights} night{reservation.nights === 1 ? '' : 's'}</p></div>
                    <div><p className="text-xs text-zinc-500 dark:text-zinc-400">Guests</p><p className="mt-1 font-medium text-zinc-900 dark:text-white">{reservation.adults + reservation.children} guest{reservation.adults + reservation.children === 1 ? '' : 's'}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Payment: {reservation.paymentStatus}</p></div>
                    <div><p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p><p className="mt-1 font-semibold text-primary">{money(reservation.totalPrice)}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Requested {formatDateLong(reservation.createdAt)}</p></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 dark:border-white/[0.06] sm:px-5">
                <Link href={`/listings/${reservation.listing.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">View listing <ExternalLink className="h-3.5 w-3.5" /></Link>
                {canCancel && <button type="button" disabled={cancelling === reservation.id} onClick={() => cancelReservation(reservation.id)} className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50">{cancelling === reservation.id ? 'Cancelling...' : 'Cancel reservation'}</button>}
              </div>
            </article>;
          })}
        </div>
      )}
    </div>
  );
}
