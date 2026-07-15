'use client'

import MaterialIcon from '@/components/icons/material-icon';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent" userAvatar={undefined}>
      <div className="space-y-8">
        <div>
          <h1 className="text-headline-sm font-bold">Office Site Inspection</h1>
          <p className="mt-2 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>
            Schedule your physical premises verification to achieve{' '}
            <span className="text-warning font-bold">Tier 2 Verified</span> status.
          </p>
        </div>

        {/* Status Tracker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-4 px-2">
              <span className="text-xs font-label-md uppercase tracking-wider flex items-center gap-1 text-success">
                <CheckCircle className="h-3 w-3" /> Submitted
              </span>
              <span className="text-xs font-label-md uppercase tracking-wider text-primary">Scheduled</span>
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Visit</span>
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Report</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div className="absolute h-full w-[45%] bg-gradient-to-r from-success to-warning" />
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
                  <CardTitle className="text-headline-sm">Select Preferred Date & Time</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-headline-sm font-bold">October 2024</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MaterialIcon name="chevron_left" className="material-symbols-outlined" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MaterialIcon name="chevron_right" className="material-symbols-outlined" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs font-label-md uppercase tracking-wider mb-2" style={{ color: 'text-on-surface-variant' }}>
                      <MaterialIcon name="M" className="material-symbols-outlined" /><MaterialIcon name="T" className="material-symbols-outlined" /><MaterialIcon name="W" className="material-symbols-outlined" /><MaterialIcon name="T" className="material-symbols-outlined" /><MaterialIcon name="F" className="material-symbols-outlined" /><MaterialIcon name="S" className="material-symbols-outlined" /><MaterialIcon name="S" className="material-symbols-outlined" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {days.map((d) => (
                        <button
                          key={d.date}
                          disabled={d.disabled}
                          onClick={() => d.disabled ? undefined : setSelectedDate(d.date)}
                          className={cn(
                            'p-2 rounded-md transition-colors',
                            d.disabled ? 'text-on-surface-variant cursor-not-allowed' : 'hover:bg-muted cursor-pointer',
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
                    <label className="text-xs font-label-md uppercase tracking-wider font-bold block" style={{ color: 'text-on-surface-variant' }}>
                      Select Time Slot
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setSelectedSlot('morning')}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                          selectedSlot === 'morning'
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-outline-variant hover:border-primary/50 text-on-surface-variant'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <MaterialIcon name="wb_sunny" className="material-symbols-outlined" />
                          <MaterialIcon name="Morning: 09:00 - 12:00" className="material-symbols-outlined" />
                        </div>
                        {selectedSlot === 'morning' && (
                          <MaterialIcon name="check_circle" className="material-symbols-outlined" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedSlot('afternoon')}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                          selectedSlot === 'afternoon'
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-outline-variant hover:border-primary/50 text-on-surface-variant'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <MaterialIcon name="light_mode" className="material-symbols-outlined" />
                          <MaterialIcon name="Afternoon: 14:00 - 17:00" className="material-symbols-outlined" />
                        </div>
                        {selectedSlot === 'afternoon' && (
                          <MaterialIcon name="check_circle" className="material-symbols-outlined" />
                        )}
                      </button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg border border-outline-variant flex items-start gap-3">
                      <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>
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
                  <CardTitle className="flex items-center gap-2 text-headline-sm">
                    <MaterialIcon name="fact_check" className="material-symbols-outlined" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs font-label-md uppercase tracking-wider">
                        <MaterialIcon name="check" className="material-symbols-outlined" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden relative">
                <CardHeader>
                  <CardTitle className="text-headline-sm text-primary">What to Expect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-label-md uppercase tracking-wider mb-4" style={{ color: 'text-on-surface-variant' }}>
                    The 30-minute walkthrough includes:
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-warning text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                        1
                      </div>
                      <p className="text-xs font-label-md uppercase tracking-wider">Physical sighting of all original documentation.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-warning text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                        2
                      </div>
                      <p className="text-xs font-label-md uppercase tracking-wider">Verification of office operational capacity and staff.</p>
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
                <h3 className="text-white font-headline-sm font-bold">Inspection Summary</h3>
                <span className="bg-warning text-primary px-3 py-1 rounded-full text-xs font-label-md uppercase tracking-wider font-bold">
                  Tier 2
                </span>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                      <MaterialIcon name="calendar_month" className="material-symbols-outlined" />
                    </div>
                    <div>
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold" style={{ color: 'text-on-surface-variant' }}>Date</p>
                      <p className="font-headline-sm font-bold">Wednesday, Oct 9th, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                      <MaterialIcon name="schedule" className="material-symbols-outlined" />
                    </div>
                    <div>
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold" style={{ color: 'text-on-surface-variant' }}>Time Window</p>
                      <p className="font-headline-sm font-bold">09:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-muted rounded-lg">
                    <div className="p-2 bg-surface-container-lowest rounded shadow-sm">
                      <MaterialIcon name="location_on" className="material-symbols-outlined" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold" style={{ color: 'text-on-surface-variant' }}>Inspection Address</p>
                      <p className="font-headline-sm font-bold leading-tight">Plot 102, Adeola Odeku St, Victoria Island, Lagos, Nigeria.</p>
                      <button className="text-primary text-xs font-label-md uppercase tracking-wider font-bold underline mt-2 hover:text-primary/80">
                        Change Address
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant">
                  <Button className="w-full py-4 text-headline-sm font-bold hover:shadow-lg active:scale-95 transition-all">
                    Confirm Schedule
                  </Button>
                  <p className="text-center text-xs font-label-md uppercase tracking-wider mt-4" style={{ color: 'text-on-surface-variant' }}>
                    By confirming, you agree to our Verification Terms.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-success/20 bg-success/5">
              <CardContent className="p-6 flex items-start gap-3">
                <Verified className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-headline-sm font-bold text-success mb-1">Why verify?</h4>
                  <p className="text-xs font-label-md uppercase tracking-wider text-success/80 leading-relaxed">
                    Verified agents receive 3x more property inquiries and gain access to the &quot;Verified Prime&quot; filter on the PROPATI consumer portal.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-40 relative">
                <div className="absolute inset-0 bg-muted" />
                <div className="absolute bottom-4 left-4 bg-surface-container-lowest px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-label-md uppercase tracking-wider font-bold text-primary">Agent HQ Location</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
