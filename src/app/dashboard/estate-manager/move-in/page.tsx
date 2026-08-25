'use client';


import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Inbox, Zap, CalendarClock, FileText, Phone, MessageSquare, ClipboardList, Info, Wifi } from 'lucide-react';

export default function EstateManagerMoveInPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <ErrorBoundary>
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Move-in Coordination</h1>
            <p className="text-zinc-400">Unable to load move-in details.</p>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
            </div>
          </section>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Move-in Coordination Hub</h1>
          <p className="text-zinc-400 mt-1">
            Handover and onboarding workflow for commercial tenants.
          </p>
        </div>

        {/* Hero Banner */}
        <div className="rounded-xl bg-emerald-500 text-white p-8 md:p-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-bg-secondary/20 text-bg-secondary px-3 py-1 rounded-full border border-bg-secondary/30 mb-4 text-sm font-medium">
              <ClipboardList className="w-4 h-4" />
              Handover Ready
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Welcome to your new HQ</h2>
            <p className="text-white-fixed text-lg mb-6">
              Congratulations on securing your premium commercial space at{' '}
              <span className="text-bg-secondary font-bold">The Pinnacle Plaza, Suite 402</span>.
              Everything is ready for your official move-in.
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-bg-secondary text-white rounded-lg font-bold hover:scale-105 transition-transform">
                View Digital Key
              </button>
              <button className="px-5 py-2.5 border border-text-white text-white rounded-lg font-bold hover:bg-text-white/10 transition-colors">
                Download Welcome Pack
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Status */}
          <div className="lg:col-span-4 card p-5 rounded-xl border border-white/[0.08] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-heading font-bold text-white">Payment Status</h3>
                <span className="p-2 rounded-lg bg-tertiary-fixed/20 text-tertiary">
                  <Inbox className="w-5 h-5" />
                </span>
              </div>
              <div className="bg-tertiary-container text-on-tertiary p-4 rounded-lg border-l-4 border-text-zinc-400 mb-4">
                <p className="text-xs font-medium opacity-70 uppercase mb-1">Escrow Clearance</p>
                <div className="flex items-center gap-3">
                  <p className="font-heading text-xl font-bold">₦12,450,000.00</p>
                  <span className="bg-text-zinc-400 text-white px-2 py-0.5 rounded text-[10px] font-bold">CLEARED</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Security Deposit</span>
                  <span className="font-bold text-white">Verified</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Service Charge (Yr 1)</span>
                  <span className="font-bold text-white">Settled</span>
                </div>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Key Handover Schedule */}
          <div className="lg:col-span-8 card p-5 rounded-xl border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-white">Key Handover Schedule</h3>
              <span className="text-xs font-bold text-secondary bg-secondary-fixed/30 px-3 py-1 rounded-full">
                Coming Up: 48 Hours
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/[0.08]">
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center text-zinc-400 text-sm">
                    Property Image
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-white/[0.08]">
                  <div className="p-2 bg-bg-secondary text-white rounded-full">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase">Thursday, Oct 12th</p>
                    <p className="font-bold text-white">10:00 AM — 11:30 AM</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-400 mb-2">Preparation Checklist</p>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-bg-secondary flex items-center justify-center">
                    <ClipboardList className="w-3 h-3 text-bg-secondary" />
                  </div>
                  <span className="text-sm font-medium text-white">Print Handover Protocol Form</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-bg-secondary flex items-center justify-center">
                    <ClipboardList className="w-3 h-3 text-bg-secondary" />
                  </div>
                  <span className="text-sm font-medium text-white">Assign IT Representative for Biometric Access</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/[0.08] flex items-center justify-center" />
                  <span className="text-sm text-zinc-400">Final Inventory Signature</span>
                </div>
                <button className="w-full mt-4 py-2 border-2 border-secondary text-secondary rounded-lg font-bold hover:bg-secondary hover:text-white transition-all">
                  Reschedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Utility & HVAC Onboarding */}
        <div className="rounded-xl border border-white/[0.08] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-white/[0.08]">
            <h3 className="font-heading font-bold text-white">Utility &amp; HVAC Onboarding</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, label: 'Electrical', status: 'CONNECTED', color: 'text-tertiary' },
              { icon: 'ac_unit', label: 'HVAC System', status: 'TESTING REQUIRED', color: 'text-secondary', isBuiltIn: true },
              { icon: Wifi, label: 'Fibre Optic', status: 'READY', color: 'text-tertiary' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 bg-surface border border-white/[0.08] rounded-xl text-center hover:border-bg-secondary transition-colors">
                <span className={` text-3xl ${item.color} mb-3`} style={item.isBuiltIn ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.label === 'HVAC System' ? 'ac_unit' : item.label === 'Electrical' ? 'bolt' : 'wifi'}
                </span>
                <p className="text-sm font-bold text-white mb-1">{item.label}</p>
                <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg flex items-center gap-3 border-t border-white/[0.08]">
            <Info className="w-5 h-5 text-zinc-400 shrink-0" />
            <p className="text-sm text-zinc-400">
              Temperature controls for Suite 402 can be managed via the{' '}
              <a href="#" className="text-secondary font-bold underline">PROPATI Smart Facility App</a> starting from handover day.
            </p>
          </div>
        </div>

        {/* Facility Contacts */}
        <div className="rounded-xl bg-emerald-500-container text-text-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-heading font-bold text-bg-secondary">Facility Contacts</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { name: 'Chidi Okafor', role: 'Head of Facilities', action: 'call' },
              { name: 'Sarah Alabi', role: 'Security &amp; Access', action: 'chat' },
            ].map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-emerald-500/40 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-white font-bold">
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">{contact.name}</p>
                    <p className="text-xs text-zinc-400">{contact.role}</p>
                  </div>
                </div>
                <button className="p-2 text-bg-secondary hover:bg-bg-secondary hover:text-white rounded-full transition-colors">
                  {contact.action === 'call' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </button>
              </div>
            ))}
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-zinc-400 uppercase opacity-60">24/7 Concierge Hotline</p>
              <p className="font-heading font-bold text-bg-secondary">0-800-PROPATI-SOS</p>
            </div>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}


