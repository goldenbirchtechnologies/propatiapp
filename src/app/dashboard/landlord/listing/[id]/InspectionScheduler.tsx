'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  CalendarClock,
  Clock,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Check,
  X,
  Loader2,
} from 'lucide-react';

interface UnitOption {
  id: string;
  label: string;
  price: number;
  available: boolean;
}

interface ListingData {
  id: string;
  title: string;
  price: number;
  pricePeriod: string | null;
  cautionDeposit: number | null;
  serviceCharge: number | null;
  address: string;
  area: string;
  state: string;
  units: UnitOption[];
}

type Props = {
  listing: ListingData;
};

const TIME_SLOTS = ['10:00 AM', '12:00 PM', '02:00 PM', '04:30 PM', '06:00 PM'];

export default function InspectionScheduler({ listing }: Props) {
  const router = useRouter();
  const units = listing.units && listing.units.length > 0 ? listing.units : [
    { id: '402', label: 'Unit 402 - 3-Bed Luxury Penthouse (Available)', price: 18500000, available: true },
    { id: '202', label: 'Unit 202 - 2-Bed Garden Suite (Maintenance)', price: 11500000, available: false },
    { id: '301', label: 'Unit 301 - 3-Bed Executive Flat (Leased)', price: 14000000, available: false },
    { id: '401', label: 'Unit 401 - 4-Bed Penthouse Duplex (Leased)', price: 22000000, available: false },
  ];

  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.id || '');
  const [inspectionDate, setInspectionDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeUnit = units.find((u) => u.id === selectedUnit);
  const canBook = !!activeUnit && activeUnit.available && !!inspectionDate && !!timeSlot;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const handleConfirm = () => {
    if (!canBook) {
      toast({ title: 'Incomplete', description: 'Select an available unit, date, and time slot.', variant: 'destructive' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (!activeUnit) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/listings/' + listing.id + '/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: activeUnit.id,
          inspectionDate,
          timeSlot,
          listingId: listing.id,
        }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to schedule inspection');
      }
      toast({ title: 'Inspection Scheduled', description: 'A confirmation has been sent. The agent will be notified.' });
      setConfirmOpen(false);
      setInspectionDate('');
      setTimeSlot('');
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to schedule inspection', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-900 space-y-5">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-primary dark:text-[#4edea3]" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Schedule Inspection / Reserve Unit</h3>
      </div>

      {/* Unit Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Target Real Estate Asset</label>
        <div className="relative">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full h-11 rounded-lg bg-white dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md appearance-none cursor-pointer border border-zinc-200 dark:border-zinc-700 pr-9"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id} disabled={!u.available}>
                {u.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Inspection Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Inspection Date</label>
        <input
          type="date"
          value={inspectionDate}
          onChange={(e) => setInspectionDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full h-11 rounded-lg bg-white dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md border border-zinc-200 dark:border-zinc-700"
        />
      </div>

      {/* Time Slot */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Time Slot</label>
        <div className="grid grid-cols-5 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setTimeSlot(slot)}
              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                timeSlot === slot
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-primary'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {canBook && activeUnit && (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock size={14} className="text-primary dark:text-[#4edea3]" />
            <span>Selected Inspection:</span>
            <span className="font-semibold text-zinc-900 dark:text-white">{inspectionDate} at {timeSlot}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} className="text-primary dark:text-[#4edea3]" />
            <span className="truncate">{listing.area}, {listing.state}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck size={14} className="text-primary dark:text-[#4edea3]" />
            <span>Paystack Escrow Custody - Funds release gated by NIN verification</span>
          </div>
        </div>
      )}

      <Button onClick={handleConfirm} disabled={!canBook || submitting} className="w-full bg-primary hover:bg-[var(--sovereign-hover)] text-white">
        {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Reserve Inspection Slot'}
      </Button>

      {/* Confirm Modal */}
      {confirmOpen && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock size={22} className="text-primary dark:text-[#4edea3]" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Confirm Inspection</h3>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Unit</span><span className="font-semibold text-zinc-900 dark:text-white">{activeUnit.label}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Date</span><span className="font-semibold text-zinc-900 dark:text-white">{inspectionDate}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Time</span><span className="font-semibold text-zinc-900 dark:text-white">{timeSlot}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Location</span><span className="font-semibold text-zinc-900 dark:text-white">{listing.area}, {listing.state}</span></div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Listing Price</span>
                <span className="font-bold text-primary dark:text-[#4edea3]">{formatCurrency(activeUnit.price)}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1 text-zinc-700 dark:text-zinc-300">Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary hover:bg-[var(--sovereign-hover)] text-white">
                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <><Check size={16} className="mr-1" /> Confirm</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
