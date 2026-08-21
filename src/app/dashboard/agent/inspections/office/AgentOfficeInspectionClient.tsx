'use client'

import AppIcon from '@/components/icons/app-icon';

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
          <p className="mt-2 text-xs font-label-md uppercase tracking-wider text-neutral-400">
            Schedule your physical premises verification to achieve{' '}
            <span className="text-neutral-300 font-bold">Tier 2 Verified</span> status.
          </p>
        </div>

        {/* Status Tracker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-4 px-2">
              <span className="text-xs font-label-md uppercase tracking-wider flex items-center gap-1 text-[#00ff66]">
                <CheckCircle className="h-3 w-3" /> Submitted
              </span>
              <span className="text-xs font-label-md uppercase tracking-wider text-white">Scheduled</span>
              <span className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Visit</span>
              <span className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Report</span>
            </div>
            <div className="relative h-2 bg-[#171717] rounded-full overflow-hidden">
              <div className="absolute h-full w-[45%] bg-gradient-to-r from-[#00ff66] to-[#262626]" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-white" />
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
                          <AppIcon name="chevron_left" className="lucide" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <AppIcon name="chevron_right" className="lucide" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs font-label-md uppercase tracking-wider mb-2 text-neutral-400">
                      <AppIcon name="M" className="lucide" /><AppIcon name="T" className="lucide" /><AppIcon name="W" className="lucide" /><AppIcon name="T" className="lucide" /><AppIcon name="F" className="lucide" /><AppIcon name="S" className="lucide" /><AppIcon name="S" className="lucide" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {days.map((d) => (
                        <button
                          key={d.date}
                          disabled={d.disabled}
                          onClick={() => d.disabled ? undefined : setSelectedDate(d.date)}
                          className={cn(
                            'p-2 rounded-md transition-colors',
                            d.disabled ? 'text-neutral-400 cursor-not-allowed' : 'hover:bg-[#171717] cursor-pointer',
                            d.active ? 'bg-[#00ff66] text-white font-bold shadow-md' : ''
                          )}
                        >
                          {d.date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-4">
                    <label className="text-xs font-label-md uppercase tracking-wider font-bold block text-neutral-400">
                      Select Time Slot
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setSelectedSlot('morning')}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          selectedSlot === 'morning'
                            ? 'border-primary bg-[#00ff66]/10 text-white font-bold'
                            : 'border-[#262626] hover:border-primary/50 text-neutral-400'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <AppIcon name="wb_sunny" className="lucide" />
                          <AppIcon name="Morning: 09:00 - 12:00" className="lucide" />
                        </div>
                        {selectedSlot === 'morning' && (
                          <AppIcon name="check_circle" className="lucide" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedSlot('afternoon')}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          selectedSlot === 'afternoon'
                            ? 'border-primary bg-[#00ff66]/10 text-white font-bold'
                            : 'border-[#262626] hover:border-primary/50 text-neutral-400'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <AppIcon name="light_mode" className="lucide" />
                          <AppIcon name="Afternoon: 14:00 - 17:00" className="lucide" />
                        </div>
                        {selectedSlot === 'afternoon' && (
                          <AppIcon name="check_circle" className="lucide" />
                        )}
                      </button>
                    </div>
                    <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex items-start gap-3">
                      <Info className="h-5 w-5 text-neutral-300 shrink-0 mt-0.5" />
                      <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">
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
                    <AppIcon name="fact_check" className="lucide" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs font-label-md uppercase tracking-wider">
                        <AppIcon name="check" className="lucide" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden relative bg-[rgba(23,23,23,0.4)] backdrop-blur border border-[#262626] rounded-xl">
                <CardHeader>
                  <CardTitle className="text-headline-sm text-white">What to Expect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-label-md uppercase tracking-wider mb-4 text-neutral-400">
                    The 30-minute walkthrough includes:
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center font-bold shrink-0 text-sm">
                        1
                      </div>
                      <p className="text-xs font-label-md uppercase tracking-wider">Physical sighting of all original documentation.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center font-bold shrink-0 text-sm">
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
            <Card className="overflow-hidden bg-[rgba(23,23,23,0.4)] backdrop-blur border border-[#262626] rounded-xl">
              <div className="bg-[#00ff66] px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-headline-sm font-bold">Inspection Summary</h3>
                <span className="bg-[#262626] text-white px-3 py-1 rounded-full text-xs font-label-md uppercase tracking-wider font-bold">
                  Tier 2
                </span>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-[#171717] rounded-xl">
                    <div className="p-2 bg-surface-container-lowest rounded ">
                      <AppIcon name="calendar_month" className="lucide" />
                    </div>
                    <div>
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold text-neutral-400">Date</p>
                      <p className="font-headline-sm font-bold">Wednesday, Oct 9th, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-[#171717] rounded-xl">
                    <div className="p-2 bg-surface-container-lowest rounded ">
                      <AppIcon name="schedule" className="lucide" />
                    </div>
                    <div>
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold text-neutral-400">Time Window</p>
                      <p className="font-headline-sm font-bold">09:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-[#171717] rounded-xl">
                    <div className="p-2 bg-surface-container-lowest rounded ">
                      <AppIcon name="location_on" className="lucide" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-label-md uppercase tracking-wider font-bold text-neutral-400">Inspection Address</p>
                      <p className="font-headline-sm font-bold leading-tight">Plot 102, Adeola Odeku St, Victoria Island, Lagos, Nigeria.</p>
                      <button className="text-white text-xs font-label-md uppercase tracking-wider font-bold underline mt-2 hover:text-white/80">
                        Change Address
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#262626]">
                  <Button className="w-full py-4 text-headline-sm font-bold hover:shadow-lg active:scale-95 transition-all">
                    Confirm Schedule
                  </Button>
                  <p className="text-center text-xs font-label-md uppercase tracking-wider mt-4 text-neutral-400">
                    By confirming, you agree to our Verification Terms.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#00ff66] bg-[#00ff66]/5 bg-[rgba(23,23,23,0.4)] backdrop-blur rounded-xl">
              <CardContent className="p-6 flex items-start gap-3">
                <Verified className="h-5 w-5 text-[#00ff66] mt-0.5" />
                <div>
                  <h4 className="font-headline-sm font-bold text-[#00ff66] mb-1">Why verify?</h4>
                  <p className="text-xs font-label-md uppercase tracking-wider text-[#00ff66]/80 leading-relaxed">
                    Verified agents receive 3x more property inquiries and gain access to the &quot;Verified Prime&quot; filter on the PROPATI consumer portal.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-[rgba(23,23,23,0.4)] backdrop-blur border border-[#262626] rounded-xl">
              <div className="h-40 relative">
                <div className="absolute inset-0 bg-[#171717]" />
                <div className="absolute bottom-4 left-4 bg-surface-container-lowest px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-label-md uppercase tracking-wider font-bold text-white">Agent HQ Location</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
