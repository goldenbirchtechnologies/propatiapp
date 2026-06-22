'use client';

import * as React from 'react';
import { useState } from 'react';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarStatus = 'available' | 'booked' | 'blocked';

const STATUS_COLORS: Record<CalendarStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  booked: 'bg-amber-100 text-amber-800',
  blocked: 'bg-slate-200 text-slate-700',
};

const LANDLORD_NAVIGATION = [
  { label: 'Overview', href: '/dashboard/landlord' },
  { label: 'Properties', href: '/dashboard/landlord/properties' },
  { label: 'Short-let Calendar', href: '/dashboard/landlord/short-let' },
  { label: 'Messages', href: '/dashboard/landlord/messages' },
  { label: 'Payments', href: '/dashboard/landlord/payments' },
  { label: 'Profile', href: '/dashboard/landlord/profile' },
];

export default function LandlordShortLetPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<CalendarStatus>('available');

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName="Landlord User"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Availability & pricing</h2>
            <p className="text-sm text-slate-600">Manage dates and rates for your short-let listings.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary"><RefreshCw className="mr-2 h-4 w-4" /> Sync availability</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> New listing</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Calendar</h3>
                <p className="text-sm text-slate-600">{new Date(today.getFullYear(), today.getMonth()).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(today.getFullYear(), today.getMonth(), day);
                const status: CalendarStatus = (day % 7 === 0) ? 'blocked' : (day % 5 === 0) ? 'booked' : 'available';
                const isSelected = selectedDate?.getDate() === day;
                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDate(date); setSelectedStatus(status); }}
                    className={`m-0.5 rounded-lg p-2 ${
                      isSelected ? 'ring-2 ring-slate-900' : ''
                    } ${STATUS_COLORS[status]}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Selected day</h3>
            <p className="mt-1 text-sm text-slate-600">
              {selectedDate ? selectedDate.toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' }) : 'No date selected'}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CalendarStatus)}
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Price (₦)</label>
                <Input type="number" defaultValue="35000" className="mt-1" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Quick set</span>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="cursor-pointer">Weekend</Badge>
                  <Badge variant="secondary" className="cursor-pointer">Holiday</Badge>
                  <Badge variant="secondary" className="cursor-pointer">Last minute</Badge>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full">Save changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
