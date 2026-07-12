'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Download, User, Phone, CalendarDays, CheckCircle2,
  Eye, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Photo {
  url: string;
  alt: string;
}

const steps = [
  { label: 'Submitted', done: true, time: 'Oct 24, 09:15' },
  { label: 'Assigned', done: true, time: 'Oct 24, 14:30' },
  { label: 'Visit Scheduled', done: false, time: 'Oct 28, 10:00', active: true },
  { label: 'In Progress', done: false, time: 'Pending' },
  { label: 'Resolved', done: false, time: 'Pending' },
];

const technician = {
  name: 'Chidi Nwosu',
  specialty: 'Plumbing Specialist',
  rating: '4.9 ★',
};

const photos: Photo[] = [
  { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD001SShWrCYBMlLSIR9oc5Ah6hgfg3o3EF7weRCOTxhc8qqXSX2fnFu9Sd13pupnXCxX4sNvvoIxhVUbGXcD5NdeBEh12F6Q9ZV6nb7Gj9EXRBimlyjlr2h219CBJ6byhpLGT6z80cjXDAT6iQpy9dPWF-NS2hUPSL_f4xImlR4x67PC_LRd8i9_OIRUcT0E629BcXA1ULBgnSrOeofvthGQVCiuHRalgsBl79fRU7vXYwwUGpsaAs', alt: 'Kitchen sink leak' },
  { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qjU_TdrG7ywQ--LGOWTJZC3giOuUuaHN6ots830auCVNwbA2KGBlRJhEPMus2f_p3xrcsJEOlaB3JLa0MueJoiQJqbuIXDaCletCsT8eJ-6vwuNDoVJbKjio4U292l3Sslv3hL3DjMyIAgMPVre5w5-dKSi8czBG6CooWlE8u7Ud48O_eJ_gkNwKFDj97cy-WIJrUXdWWDRttse4dJXGHgJDzfG4INzx-hagIrin92lmovkUQ2ba', alt: 'Water damage' },
];

export default function TenantMaintenanceTrackingClient({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <span className="font-mono text-muted-foreground">MAINTENANCE</span>
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="font-mono text-primary font-semibold">#{requestId.toUpperCase()}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Kitchen Plumbing Repair</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-semibold">Urgent</span>
            <span className="text-sm text-muted-foreground">Submitted Oct 24, 2024</span>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* Lifecycle Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Request Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-border -z-10" />
            <div className="absolute top-5 left-0 w-[55%] h-[2px] bg-orange-500 -z-10" />
            <div className="flex justify-between items-start gap-2">
              {steps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center text-center max-w-[120px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.done ? 'bg-orange-500 text-primary shadow-md' : step.active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-5 h-5" /> : step.active ? <CalendarDays className="w-5 h-5" /> : <span className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-semibold ${step.active || step.done ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{step.time}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician & Appointment + Report Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Technician Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-semibold text-primary">Technician</h3>
                <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                  <svg className="w-full h-full text-muted-foreground p-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <div>
                  <h4 className="text-headline-sm text-primary">{technician.name}</h4>
                  <p className="text-sm text-muted-foreground">{technician.specialty} • {technician.rating}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-4.72C3.512 14.042 3 12.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Message
                </Button>
                <Button variant="outline" size="icon" className="w-11 h-11">
                  <Phone className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-primary mb-4">Appointment</h3>
              <div className="bg-muted rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Scheduled Date</p>
                    <p className="text-sm font-bold text-primary">Monday, Oct 28, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Time Window</p>
                    <p className="text-sm font-bold text-primary">10:00 AM - 12:00 PM</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 flex items-start gap-1">
                <Eye className="w-4 h-4 mt-0.5" />
                Technician will arrive within the first 30 mins of the window.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Report Summary */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-semibold text-primary">Report Summary</h3>
                <button className="text-sm text-primary underline">Edit Details</button>
              </div>
              <div className="space-y-5">
                <div>
                  <h5 className="text-xs text-muted-foreground font-mono uppercase mb-1">Description</h5>
                  <p className="text-sm text-primary leading-relaxed">
                    Leaking pipe under the kitchen island sink. The leak started after running the dishwasher last night.
                    There is visible water damage to the wood base and a constant drip even when faucets are off.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs text-muted-foreground font-mono uppercase mb-1">Property</h5>
                    <p className="text-sm font-bold text-primary">Azure Heights, Unit 402</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted-foreground font-mono uppercase mb-1">Location</h5>
                    <p className="text-sm font-bold text-primary">Lagos, VI</p>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs text-muted-foreground font-mono uppercase mb-2">Attached Photos</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.alt} className="aspect-square rounded-xl overflow-hidden border border-border hover:border-orange-500 transition-all cursor-zoom-in group">
                        {/* eslint-disable-next-line next/no-img-element */}
                        <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                    <div className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border hover:bg-muted/80 transition-all cursor-pointer">
                      <Camera className="w-5 h-5 text-primary mb-1" />
                      <span className="text-xs font-mono text-muted-foreground">Add more</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule CTA */}
      <Card className="text-center">
        <CardContent className="p-8">
          <p className="text-primary font-heading font-semibold mb-1">Need to reschedule this visit?</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            You can change your appointment time up to 24 hours before the scheduled slot without any additional fees.
          </p>
          <Button variant="outline" className="border-2 border-primary font-bold hover:bg-primary hover:text-white transition-all">
            Reschedule Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
