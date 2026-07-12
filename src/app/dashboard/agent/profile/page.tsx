'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { User, Camera, Save, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentProfilePage() {
  const [form, setForm] = useState({ fullName: 'Agent Name', email: 'agent@propati.ng', phone: '0803 456 7890', bio: 'Experienced property agent with 5+ years in Lagos market.', license: 'REA/2024/001', agency: 'Propati Estates' });

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={form.fullName} userAvatar={undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>My Profile</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>Professional information and settings</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>Full Name</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>Agency</label>
                <input type="text" value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>License No.</label>
                <input type="text" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className="inp-field w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: 'text-primary' }}>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="inp-field w-full" rows={3} />
              </div>
            </div>
          </div>
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full flex items-center justify-center" style={{ background: 'bg-primary/10', color: 'text-primary' }}><User className="w-10 h-10" /></div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full border border-outline-variant bg-surface-container-lowest" style={{ borderColor: 'border-outline-variant' }}><Camera className="w-4 h-4" /></button>
            </div>
            <p className="mt-4 font-medium" style={{ color: 'text-primary' }}>{form.fullName}</p>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Agent since 2026</p>
            <div className="flex items-center gap-1 mt-2"><Star className="w-4 h-4 text-warning fill-warning" /><span className="text-sm font-bold" style={{ color: 'text-primary' }}>4.8</span></div>
            <button className="btn btn-primary mt-4 w-full inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
