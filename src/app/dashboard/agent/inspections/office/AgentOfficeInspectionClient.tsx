'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CheckCircle,
  Info,
  Verified,

} from 'lucide-react';

const days = [
  { date: 28, disabled: true },
  { date: 29, disabled: true },
  { date: 30, disabled: true },
  { date: 1, disabled: false },
  { date: 2, disabled: false },
  { date: 3, disabled: true },
  { date: 4, disabled: true },
  { date: 5, disabled: false },
  { date: 6, disabled: false },
  { date: 7, disabled: false },
  { date: 8, disabled: false },
  { date: 9, disabled: false, active: true },
  { date: 10, disabled: true },
  { date: 11, disabled: true },
  { date: 12, disabled: false },
  { date: 13, disabled: false },
  { date: 14, disabled: false },
  { date: 15, disabled: false },
  { date: 16, disabled: false },
  { date: 17, disabled: true },
  { date: 18, disabled: true },
];

const requirements = [
  'Original CAC business registration docs.',
  'Valid, signed lease or ownership title.',
  'Visible external office signage present.',
  'Primary Agent must be physically available.',
];

export default function AgentOfficeInspectionClient() {
  const [selectedDate, setSelectedDate] = useState(9);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon'>('morning');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Office Site Inspection</h1>
        <p className="mt-2 text-muted-foreground">
          Schedule your physical premises verification to achieve{' '}
          <span className="text-amber-600 font-bold">Tier 2 Verified</span> status.
        </p>
      </div>

      {/* Status Tracker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between mb-4 px-2">
            <span className="text-xs font-bold flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> Submitted
            </span>
            <span className="text-xs font-bold text-primary">Scheduled</span>
            <span className="text-xs font-bold text-muted-foreground">Visit</span>
            <span className="text-xs font-bold text-muted-foreground">Report</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div className="absolute h-full w-[45%] bg-gradient-to-r from-green-500 to-amber-500" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle>Select Preferred Date & Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">October 2024</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground mb-2">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {days.map((d) => (
                      <button
                        key={d.date}
                        disabled={d.disabled}
                        onClick={() => d.disabled ? undefined : setSelectedDate(d.date)}
                        className={cn(
                          'p-2 rounded-md transition-colors',
                          d.disabled ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-muted cursor-pointer',
                          d.active ? 'bg-primary text-white font-bold shadow-md' : ''
                        )}
                      >
                        {d.date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">
                    Select Time Slot
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedSlot('morning')}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                        selectedSlot === 'morning'
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">wb_sunny</span>
                        <span>Morning: 09:00 - 12:00</span>
                      </div>
                      {selectedSlot === 'morning' && (
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedSlot('afternoon')}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                        selectedSlot === 'afternoon'
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">light_mode</span>
                        <span>Afternoon: 14:00 - 17:00</span>
                      </div>
                      {selectedSlot === 'afternoon' && (
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      )}
                    </button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg border border-border flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Verification officers usually arrive within the first hour of the selected slot.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preparation Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="material-symbols-outlined text-green-600">fact_check</span>
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-600 text-[20px] mt-0.5">check</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden relative">
              <CardHeader>
                <CardTitle className="text-lg text-primary">What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The 30-minute walkthrough includes:
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                      1
                    </div>
                    <p className="text-sm">Physical sighting of all original documentation.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                      2
                    </div>
                    <p className="text-sm">Verification of office operational capacity and staff.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <aside className="lg:col-span-5 space-y-6">
          <Card className="overflow-hidden shadow-lg">
            <div className="bg-primary px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold font-headline-sm">Inspection Summary</h3>
              <span className="bg-amber-500 text-primary px-3 py-1 rounded-full text-xs font-bold">
                Tier 2
              </span>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-bold">Date</p>
                    <p className="font-bold">Wednesday, Oct 9th, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-bold">Time Window</p>
                    <p className="font-bold">09:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase text-muted-foreground font-bold">Inspection Address</p>
                    <p className="font-bold leading-tight">Plot 102, Adeola Odeku St, Victoria Island, Lagos, Nigeria.</p>
                    <button className="text-primary text-xs font-bold underline mt-2 hover:text-primary/80">
                      Change Address
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button className="w-full py-4 text-lg font-bold hover:shadow-lg active:scale-95 transition-all">
                  Confirm Schedule
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  By confirming, you agree to our Verification Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-green-50/50">
            <CardContent className="p-6 flex items-start gap-3">
              <Verified className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-800 mb-1">Why verify?</h4>
                <p className="text-sm text-green-700/80 leading-relaxed">
                  Verified agents receive 3x more property inquiries and gain access to the &quot;Verified Prime&quot; filter on the PROPATI consumer portal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-40 relative">
              <div className="absolute inset-0 bg-muted" />
              <div className="absolute bottom-4 left-4 bg-surface-container-lowest px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                <span className="text-xs font-bold text-primary">Agent HQ Location</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
